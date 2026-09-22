"""Free/self-hosted ComfyUI inference adapter.

Uses ComfyUI's HTTP API and a user-supplied API-format workflow template.
No API key, paid provider, or RepDB asset is required. The workflow remains
replaceable so Athletico is not coupled to custom-node implementation details.

Template placeholders (string values anywhere in JSON):
  __PROMPT__, __NEGATIVE_PROMPT__, __POSE_IMAGE__, __CHARACTER_IMAGE__,
  __SEED__, __WIDTH__, __HEIGHT__, __OUTPUT_PREFIX__

The adapter uploads the character and generated pose-control PNGs to ComfyUI,
queues the workflow, polls history, downloads the first produced image and
returns it to the existing Athletico QC/provenance pipeline.
"""
import copy
import json
import random
import time
from io import BytesIO
from pathlib import Path
from typing import Dict
import requests
from PIL import Image
from .generator import BaseInferenceEngine, PermanentInferenceError, TransientInferenceError

TRANSIENT_HTTP={408,425,429,500,502,503,504}

class ComfyUIInferenceAdapter(BaseInferenceEngine):
    def __init__(self,base_url="http://127.0.0.1:8188",workflow_path="src/visuals/comfyui-athletico-workflow.json",
                 character_path="src/visuals/ATHLETICO_MASTER_CHARACTER_V1.png",timeout=1800,poll_seconds=1.0):
        self.base_url=base_url.rstrip("/");self.workflow_path=Path(workflow_path);self.character_path=Path(character_path)
        self.timeout=timeout;self.poll_seconds=poll_seconds;self.workflow=None;self.character_name=None;self.last_metadata:Dict={}

    def initialize_pipeline(self):
        if not self.workflow_path.exists():raise PermanentInferenceError("ComfyUI API workflow missing: "+str(self.workflow_path))
        if not self.character_path.exists():raise PermanentInferenceError("Athletico master character missing: "+str(self.character_path))
        try:self.workflow=json.loads(self.workflow_path.read_text(encoding="utf-8"))
        except Exception as exc:raise PermanentInferenceError("invalid ComfyUI workflow JSON") from exc
        self._get("/system_stats")
        self.character_name=self._upload_file(self.character_path,"athletico-reference")

    def _get(self,path,params=None):
        try:r=requests.get(self.base_url+path,params=params,timeout=self.timeout)
        except (requests.Timeout,requests.ConnectionError) as exc:raise TransientInferenceError("ComfyUI connection failed: "+str(exc)) from exc
        if r.status_code in TRANSIENT_HTTP:raise TransientInferenceError("ComfyUI transient HTTP "+str(r.status_code))
        if r.status_code>=400:raise PermanentInferenceError("ComfyUI HTTP "+str(r.status_code)+": "+r.text[:500])
        return r

    def _post(self,path,**kwargs):
        try:r=requests.post(self.base_url+path,timeout=self.timeout,**kwargs)
        except (requests.Timeout,requests.ConnectionError) as exc:raise TransientInferenceError("ComfyUI connection failed: "+str(exc)) from exc
        if r.status_code in TRANSIENT_HTTP:raise TransientInferenceError("ComfyUI transient HTTP "+str(r.status_code))
        if r.status_code>=400:raise PermanentInferenceError("ComfyUI rejected request HTTP "+str(r.status_code)+": "+r.text[:1000])
        return r

    def _upload_file(self,path,subfolder):
        with Path(path).open("rb") as fh:
            r=self._post("/upload/image",files={"image":(Path(path).name,fh,"image/png")},
                         data={"overwrite":"true","type":"input","subfolder":subfolder})
        row=r.json();name=row.get("name")
        if not name:raise PermanentInferenceError("ComfyUI upload returned no image name")
        folder=row.get("subfolder") or subfolder
        return (folder.rstrip("/")+"/"+name) if folder else name

    def _upload_pose(self,data_uri,phase):
        if not str(data_uri).startswith("data:image/png;base64,"):raise PermanentInferenceError("local backend requires PNG pose-control data URI")
        import base64
        raw=base64.b64decode(data_uri.split(",",1)[1],validate=True)
        name="pose-"+phase+".png"
        r=self._post("/upload/image",files={"image":(name,raw,"image/png")},
                     data={"overwrite":"true","type":"input","subfolder":"athletico-pose"})
        row=r.json();return (row.get("subfolder") or "athletico-pose").rstrip("/")+"/"+row.get("name",name)

    def _subst(self,obj,mapping):
        if isinstance(obj,dict):return {k:self._subst(v,mapping) for k,v in obj.items()}
        if isinstance(obj,list):return [self._subst(v,mapping) for v in obj]
        if isinstance(obj,str):
            if obj in mapping:return mapping[obj]
            out=obj
            for k,v in mapping.items():out=out.replace(k,str(v))
            return out
        return obj

    def generate_frame(self,task):
        frame=task["frame"];control=frame.get("control_reference")
        if not control:raise PermanentInferenceError("ComfyUI production frame requires materialized control_reference")
        if "repdb" in str(control).lower():raise PermanentInferenceError("RepDB conditioning is forbidden")
        pose_name=self._upload_pose(control,task["phase"])
        seed=int(frame.get("seed") or random.SystemRandom().randrange(1,2**63-1))
        mapping={"__PROMPT__":task["prompt"],
          "__NEGATIVE_PROMPT__":"text, logo, watermark, extra limbs, missing limbs, fused fingers, anatomical distortion, impossible joints, malformed equipment",
          "__POSE_IMAGE__":pose_name,"__CHARACTER_IMAGE__":self.character_name,"__SEED__":seed,
          "__WIDTH__":int(task.get("width",1344)),"__HEIGHT__":int(task.get("height",768)),
          "__OUTPUT_PREFIX__":"athletico_"+task["exercise_id"].replace(":","_")+"_"+task["phase"]}
        workflow=self._subst(copy.deepcopy(self.workflow),mapping)
        started=time.monotonic();row=self._post("/prompt",json={"prompt":workflow}).json();prompt_id=row.get("prompt_id")
        if not prompt_id:raise PermanentInferenceError("ComfyUI returned no prompt_id: "+str(row)[:1000])
        deadline=time.monotonic()+self.timeout;output=None
        while time.monotonic()<deadline:
            history=self._get("/history/"+prompt_id).json().get(prompt_id,{})
            status=history.get("status",{})
            if status.get("status_str")=="error":raise PermanentInferenceError("ComfyUI workflow execution failed")
            outputs=history.get("outputs") or {}
            for node in outputs.values():
                images=node.get("images") or []
                if images:output=images[0];break
            if output:break
            time.sleep(self.poll_seconds)
        if not output:raise TransientInferenceError("ComfyUI generation timed out")
        raw=self._get("/view",{"filename":output["filename"],"subfolder":output.get("subfolder",""),"type":output.get("type","output")}).content
        try:image=Image.open(BytesIO(raw)).convert("RGB")
        except Exception as exc:raise PermanentInferenceError("ComfyUI output could not be decoded") from exc
        self.last_metadata={"model_id":"comfyui-self-hosted","seed":seed,"character_reference_id":self.character_name,
          "character_mode":"ip_adapter","pose_reference_id":frame.get("pose_reference"),
          "control_reference_id":"generated:"+str(frame.get("pose_template") or task["phase"]),
          "controlnet_model_id":"workflow-defined","ip_adapter_model_id":"workflow-defined",
          "generation_time_s":round(time.monotonic()-started,3),"total_cost_usd":0.0,"provider":"comfyui-local"}
        return image

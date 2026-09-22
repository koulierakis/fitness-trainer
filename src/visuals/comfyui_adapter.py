"""Zero-API-cost ComfyUI inference adapter for Athletico.

ComfyUI runs locally/self-hosted. This adapter never invokes paid Partner/API
nodes; it submits an API-format workflow to the local /prompt endpoint.
"""
import copy, json, time, uuid
from io import BytesIO
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image
from .generator import BaseInferenceEngine, PermanentInferenceError, TransientInferenceError

TRANSIENT_HTTP={408,425,429,500,502,503,504}

class ComfyUIInferenceAdapter(BaseInferenceEngine):
    def __init__(self,base_url="http://127.0.0.1:8188",workflow_path="src/visuals/comfyui-athletico-workflow.json",
                 character_file="src/visuals/ATHLETICO_MASTER_CHARACTER_V1.png",timeout=300,max_retries=2):
        self.base_url=base_url.rstrip("/");self.workflow_path=Path(workflow_path);self.character_file=Path(character_file)
        self.timeout=timeout;self.max_retries=max_retries;self.last_metadata={};self.workflow=None

    def initialize_pipeline(self):
        if not self.workflow_path.exists():raise PermanentInferenceError("ComfyUI API workflow missing: "+str(self.workflow_path))
        if not self.character_file.exists():raise PermanentInferenceError("Athletico master character missing: "+str(self.character_file))
        self.workflow=json.loads(self.workflow_path.read_text(encoding="utf-8"))
        self._get("/system_stats")
        object_info=self._get("/object_info")
        required={n.get("class_type") for n in self.workflow.values() if isinstance(n,dict)}
        missing=sorted(x for x in required if x and x not in object_info)
        if missing:raise PermanentInferenceError("ComfyUI workflow requires unavailable nodes: "+", ".join(missing))

    def _request(self,method,path,**kwargs):
        for attempt in range(self.max_retries+1):
            try:r=requests.request(method,self.base_url+path,timeout=self.timeout,**kwargs)
            except (requests.Timeout,requests.ConnectionError) as exc:
                if attempt>=self.max_retries:raise TransientInferenceError("ComfyUI connection failed: "+str(exc)) from exc
                time.sleep(2**attempt);continue
            if r.status_code in TRANSIENT_HTTP:
                if attempt>=self.max_retries:raise TransientInferenceError("ComfyUI transient HTTP "+str(r.status_code))
                time.sleep(2**attempt);continue
            if r.status_code>=400:raise PermanentInferenceError("ComfyUI rejected request HTTP "+str(r.status_code)+": "+r.text[:500])
            return r
        raise TransientInferenceError("ComfyUI retry budget exhausted")

    def _get(self,path):return self._request("GET",path).json()

    def _upload_bytes(self,name,data,mime="image/png"):
        r=self._request("POST","/upload/image",files={"image":(name,data,mime)},data={"overwrite":"true","type":"input"}).json()
        return (str(r.get("subfolder") or "")+"/"+str(r.get("name") or name)).lstrip("/")

    def _upload_character(self):
        return self._upload_bytes("ATHLETICO_MASTER_CHARACTER_V1.png",self.character_file.read_bytes())

    def _upload_control(self,task):
        ref=task["frame"].get("control_reference")
        if not ref or not str(ref).startswith("data:image/"):raise PermanentInferenceError("ComfyUI backend requires materialized pose control data URI")
        import base64
        try:data=base64.b64decode(str(ref).split(",",1)[1],validate=True)
        except Exception as exc:raise PermanentInferenceError("invalid pose control data URI") from exc
        return self._upload_bytes(task["exercise_id"].replace(":","_")+"_"+task["phase"]+"_pose.png",data)

    def _bind(self,wf,title,value):
        found=0
        for node in wf.values():
            if isinstance(node,dict) and str(node.get("_meta",{}).get("title","")).strip()==title:
                node.setdefault("inputs",{}).update(value);found+=1
        if found!=1:raise PermanentInferenceError("workflow must contain exactly one node titled "+title)

    def _history_image(self,prompt_id):
        deadline=time.monotonic()+self.timeout
        while time.monotonic()<deadline:
            h=self._get("/history/"+prompt_id).get(prompt_id)
            if h:
                status=h.get("status",{})
                if status.get("status_str")=="error":raise PermanentInferenceError("ComfyUI workflow execution failed")
                for out in h.get("outputs",{}).values():
                    imgs=out.get("images") or []
                    if imgs:
                        x=imgs[0];path="/view?filename="+quote(x["filename"])+"&type="+quote(x.get("type","output"))+"&subfolder="+quote(x.get("subfolder",""))
                        return self._request("GET",path).content
            time.sleep(.5)
        raise TransientInferenceError("ComfyUI generation timed out")

    def generate_frame(self,task):
        if self.workflow is None:raise PermanentInferenceError("ComfyUI adapter is not initialized")
        started=time.monotonic();wf=copy.deepcopy(self.workflow)
        char_name=self._upload_character();pose_name=self._upload_control(task)
        self._bind(wf,"ATHLETICO_PROMPT",{"text":task["prompt"]})
        self._bind(wf,"ATHLETICO_CHARACTER",{"image":char_name})
        self._bind(wf,"ATHLETICO_POSE",{"image":pose_name})
        seed=int.from_bytes(uuid.uuid4().bytes[:8],"big")%(2**63-1)
        self._bind(wf,"ATHLETICO_SEED",{"seed":seed})
        response=self._request("POST","/prompt",json={"prompt":wf,"client_id":"athletico-production"}).json()
        prompt_id=response.get("prompt_id")
        if not prompt_id:raise PermanentInferenceError("ComfyUI response missing prompt_id: "+str(response)[:500])
        raw=self._history_image(prompt_id)
        try:image=Image.open(BytesIO(raw)).convert("RGB")
        except Exception as exc:raise PermanentInferenceError("ComfyUI output could not be decoded") from exc
        self.last_metadata={"model_id":"local-comfyui","seed":seed,"character_reference_id":"ATHLETICO_MASTER_CHARACTER_V1",
          "character_mode":"ip_adapter","pose_reference_id":task["frame"].get("pose_template"),
          "control_reference_id":"generated-openpose-style:"+task["exercise_id"]+":"+task["phase"],
          "controlnet_model_id":"local-controlnet-openpose","ip_adapter_model_id":"local-ipadapter",
          "generation_time_s":round(time.monotonic()-started,3),"total_cost_usd":0.0,"comfyui_prompt_id":prompt_id}
        return image

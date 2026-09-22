"""Runware production adapter for Athletico visual generation.

Production invariants:
- RUNWARE_API_KEY is read only from the environment.
- No biomechanics-critical frame is generated without pose/control conditioning.
- Model/adapter/control AIR IDs are configuration, not assumed universal.
- Only transient HTTP/network failures are retried.
"""
import os
import time
import uuid
from io import BytesIO
from typing import Dict, Optional
import requests
from PIL import Image
from .generator import BaseInferenceEngine, PermanentInferenceError, TransientInferenceError

RUNWARE_API_URL = "https://api.runware.ai/v1"
OPENPOSE_PREPROCESSOR = "runware:controlnet-preprocess@openpose"
TRANSIENT_HTTP = {408, 425, 429, 500, 502, 503, 504}

class RunwareInferenceAdapter(BaseInferenceEngine):
    def __init__(self, model: str, controlnet_model: str, ip_adapter_model: Optional[str] = None,
                 character_lora_model: Optional[str] = None, max_retries: int = 4,
                 timeout: int = 180, steps: int = 28):
        self.model=model; self.controlnet_model=controlnet_model
        self.ip_adapter_model=ip_adapter_model; self.character_lora_model=character_lora_model
        self.max_retries=max_retries; self.timeout=timeout; self.steps=steps
        self.api_key=None; self.last_metadata: Dict={}

    def initialize_pipeline(self):
        self.api_key=os.environ.get("RUNWARE_API_KEY")
        if not self.api_key: raise RuntimeError("RUNWARE_API_KEY is required for paid generation")
        if not self.model or not self.controlnet_model:
            raise ValueError("Runware base model and compatible ControlNet AIR IDs are required")

    def _headers(self):
        return {"Authorization": "Bearer "+self.api_key, "Content-Type":"application/json"}

    def _post(self,payload):
        for attempt in range(self.max_retries+1):
            started=time.monotonic()
            try:
                response=requests.post(RUNWARE_API_URL,headers=self._headers(),json=[payload],timeout=self.timeout)
            except (requests.Timeout,requests.ConnectionError) as exc:
                if attempt>=self.max_retries: raise TransientInferenceError(str(exc)) from exc
                time.sleep(min(2**attempt,16)); continue
            if response.status_code in TRANSIENT_HTTP:
                if attempt>=self.max_retries: raise TransientInferenceError("Runware transient HTTP "+str(response.status_code))
                time.sleep(min(2**attempt,16)); continue
            if response.status_code>=400:
                raise PermanentInferenceError("Runware rejected request with HTTP "+str(response.status_code))
            try: body=response.json()
            except ValueError as exc: raise PermanentInferenceError("Runware returned invalid JSON") from exc
            if body.get("errors"): raise PermanentInferenceError("Runware API validation error: "+str(body["errors"]))
            row=(body.get("data") or [None])[0]
            if not row: raise PermanentInferenceError("Runware returned no result data")
            self.last_metadata={"model_id":self.model,"task_uuid":payload.get("taskUUID"),
                "image_uuid":row.get("imageUUID"),"seed":row.get("seed"),
                "runware_cost_usd":float(row.get("cost") or 0),
                "generation_time_s":round(time.monotonic()-started,3)}
            return row
        raise TransientInferenceError("Runware retry budget exhausted")

    def preprocess_openpose(self,pose_reference: str,include_hands_face: bool=True):
        if not pose_reference: raise PermanentInferenceError("pose_reference is required")
        task={"taskType":"controlNetPreprocess","taskUUID":str(uuid.uuid4()),
              "model":OPENPOSE_PREPROCESSOR,"inputs":{"image":pose_reference},
              "settings":{"includeHandsAndFaceOpenPose":include_hands_face},
              "outputType":["URL"],"includeCost":True,"deliveryMethod":"sync"}
        row=self._post(task)
        guide=row.get("guideImageUUID") or row.get("guideImageURL")
        if not guide: raise PermanentInferenceError("OpenPose preprocessing returned no guide image")
        return guide,{"openpose_preprocessor":OPENPOSE_PREPROCESSOR,"pose_reference_id":pose_reference,
                      "control_reference_id":row.get("guideImageUUID") or guide,
                      "openpose_cost_usd":float(row.get("cost") or 0)}

    def generate_frame(self,task):
        frame=task["frame"]; prompt=frame.get("prompt") or frame.get("generation_prompt") or ""
        if not prompt.strip(): raise PermanentInferenceError("empty generation prompt")
        pose_reference=frame.get("pose_reference"); control_reference=frame.get("control_reference")
        if not pose_reference and not control_reference:
            raise PermanentInferenceError("production frame requires pose_reference or pre-generated control_reference")
        openpose_meta={}
        if control_reference:
            guide=control_reference
            openpose_meta={"pose_reference_id":pose_reference,"control_reference_id":control_reference}
        else:
            guide,openpose_meta=self.preprocess_openpose(pose_reference)
        character_reference=frame.get("character_reference") or task["exercise"].get("character_reference")
        character_lora=frame.get("character_lora") or task["exercise"].get("character_lora")
        if not character_reference and not character_lora:
            raise PermanentInferenceError("production frame requires character_reference or character_lora")
        request={"taskType":"imageInference","taskUUID":str(uuid.uuid4()),"model":self.model,
                 "positivePrompt":prompt,
                 "negativePrompt":"text, logo, watermark, extra limbs, missing limbs, fused fingers, anatomical distortion, impossible joints, malformed equipment",
                 "width":1024,"height":1024,"steps":self.steps,"numberResults":1,
                 "outputType":["URL"],"outputFormat":"WEBP","includeCost":True,"deliveryMethod":"sync",
                 "controlNet":[{"model":self.controlnet_model,"guideImage":guide,"weight":1.0,
                                "startStepPercentage":0,"endStepPercentage":70,"controlMode":"controlnet"}]}
        if character_lora:
            lora_model=self.character_lora_model or (character_lora if isinstance(character_lora,str) else None)
            if not lora_model: raise PermanentInferenceError("character LoRA AIR ID is missing")
            request["lora"]=[{"model":lora_model,"weight":0.8}]
            character_mode="lora"; character_reference_id=lora_model
        else:
            if not self.ip_adapter_model:
                raise PermanentInferenceError("IP-Adapter AIR ID must be configured for character-reference generation")
            request["ipAdapters"]=[{"model":self.ip_adapter_model,"guideImages":[character_reference],"weight":0.8}]
            character_mode="ip_adapter"; character_reference_id=character_reference
        row=self._post(request); image_url=row.get("imageURL")
        if not image_url: raise PermanentInferenceError("Runware response missing imageURL")
        try:
            download=requests.get(image_url,timeout=self.timeout); download.raise_for_status()
        except (requests.Timeout,requests.ConnectionError) as exc:
            raise TransientInferenceError("image download failed: "+str(exc)) from exc
        except requests.HTTPError as exc:
            status=exc.response.status_code if exc.response is not None else 0
            if status in TRANSIENT_HTTP: raise TransientInferenceError("image download HTTP "+str(status)) from exc
            raise PermanentInferenceError("image download HTTP "+str(status)) from exc
        try: image=Image.open(BytesIO(download.content)).convert("RGB")
        except Exception as exc: raise PermanentInferenceError("Runware image payload could not be decoded") from exc
        generation_meta=dict(self.last_metadata)
        total_cost=float(generation_meta.get("runware_cost_usd") or 0)+float(openpose_meta.get("openpose_cost_usd") or 0)
        self.last_metadata={**generation_meta,**openpose_meta,"character_reference_id":character_reference_id,
            "character_mode":character_mode,"controlnet_model_id":self.controlnet_model,
            "ip_adapter_model_id":self.ip_adapter_model if character_mode=="ip_adapter" else None,
            "character_lora_model_id":character_reference_id if character_mode=="lora" else None,
            "total_cost_usd":total_cost}
        return image

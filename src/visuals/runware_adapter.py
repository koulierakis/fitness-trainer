"""Runware production adapter for Athletico visual generation.

Requires RUNWARE_API_KEY. Uses Runware imageInference with includeCost.
Character and pose controls are passed only when present in the manifest task.
"""
import os, time, uuid, requests
from io import BytesIO
from PIL import Image
from .generator import BaseInferenceEngine

TRANSIENT={408,425,429,500,502,503,504}

class RunwareInferenceAdapter(BaseInferenceEngine):
    def __init__(self, model, max_retries=4, timeout=180):
        self.model=model; self.max_retries=max_retries; self.timeout=timeout
        self.api_key=os.getenv("RUNWARE_API_KEY")
        self.last_metadata={}

    def initialize_pipeline(self):
        if not self.api_key: raise RuntimeError("RUNWARE_API_KEY is required")

    def _post(self,payload):
        url="https://api.runware.ai/v1"
        headers={"Authorization":f"Bearer {self.api_key}","Content-Type":"application/json"}
        for attempt in range(self.max_retries+1):
            started=time.monotonic()
            try:
                r=requests.post(url,headers=headers,json=[payload],timeout=self.timeout)
                if r.status_code in TRANSIENT and attempt<self.max_retries:
                    time.sleep(min(2**attempt,16)); continue
                r.raise_for_status(); body=r.json()
                if body.get("errors"): raise RuntimeError(str(body["errors"]))
                row=(body.get("data") or [None])[0]
                if not row: raise RuntimeError("Runware returned no image data")
                self.last_metadata={"model":self.model,"task_uuid":payload["taskUUID"],"image_uuid":row.get("imageUUID"),"seed":row.get("seed"),"cost_usd":row.get("cost"),"elapsed_s":round(time.monotonic()-started,3)}
                return row
            except (requests.Timeout,requests.ConnectionError):
                if attempt>=self.max_retries: raise
                time.sleep(min(2**attempt,16))
        raise RuntimeError("Runware retry budget exhausted")

    def generate_frame(self,prompt,character_path,control_path,control_type):
        task={"taskType":"imageInference","taskUUID":str(uuid.uuid4()),"model":self.model,"positivePrompt":prompt,"width":1024,"height":1024,"numberResults":1,"outputType":["URL"],"outputFormat":"WEBP","includeCost":True}
        # The manifest must provide real guide references. Never silently generate a
        # biomechanics-critical production frame from text alone.
        if not control_path: raise ValueError("pose_reference/OpenPose guide is required for production")
        task["controlNet"]=[{"model":control_type,"guideImage":control_path,"weight":1.0}]
        if character_path:
            task["ipAdapters"]=[{"model":"runware:55@4","guideImages":[character_path],"weight":0.8}]
        row=self._post(task)
        image_url=row.get("imageURL")
        if not image_url: raise RuntimeError("Runware response missing imageURL")
        img=requests.get(image_url,timeout=self.timeout); img.raise_for_status()
        return Image.open(BytesIO(img.content)).convert("RGB")

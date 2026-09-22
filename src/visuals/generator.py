import abc
import hashlib
import json
import os
import time
from pathlib import Path
from typing import Dict, List, Tuple
from PIL import Image, ImageStat

class TransientInferenceError(RuntimeError): pass
class PermanentInferenceError(RuntimeError): pass
class CostLimitExceeded(PermanentInferenceError): pass

class VisualQualityControl:
    @staticmethod
    def validate_image_integrity(file_path: str, target_res: Tuple[int,int]=(1344,768)):
        p=Path(file_path)
        if not p.exists(): return False,"missing"
        if p.stat().st_size<10*1024: return False,"file-too-small"
        try:
            with Image.open(p) as img: img.verify()
            with Image.open(p) as img:
                img.load()
                if img.size!=target_res:return False,"resolution:"+str(img.size)
                if img.format!="WEBP":return False,"format:"+str(img.format)
                stat=ImageStat.Stat(img.convert("L"))
                if stat.var[0]<2.0:return False,"near-blank-frame"
            return True,"PASSED"
        except Exception as exc:return False,"decode:"+str(exc)

class BaseInferenceEngine(abc.ABC):
    is_mock=False
    @abc.abstractmethod
    def initialize_pipeline(self): ...
    @abc.abstractmethod
    def generate_frame(self,task: Dict): ...

class AthleticoProductionGenerator:
    def __init__(self,engine:BaseInferenceEngine,output_dir="./public/exercise-visuals",resume=False,max_cost_usd=None):
        self.engine=engine;self.output_dir=Path(output_dir);self.output_dir.mkdir(parents=True,exist_ok=True)
        self.failure_queue_path=self.output_dir/"failure_queue.json"
        self.provenance_log_path=self.output_dir/"generation_provenance.json"
        self.resume=resume;self.max_cost_usd=max_cost_usd;self.session_cost_usd=0.0

    def _load(self,p):
        try:return json.loads(Path(p).read_text(encoding="utf-8")) if Path(p).exists() else []
        except (json.JSONDecodeError,OSError):return []

    def _write(self,p,data):
        tmp=Path(str(p)+".tmp");tmp.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding="utf-8");os.replace(tmp,p)

    def log_failure(self,task,reason,stage,retryable=False):
        failures=self._load(self.failure_queue_path);name=task["target_filename"]
        failures=[f for f in failures if f.get("target_filename")!=name]
        failures.append({"athletico_exercise_id":task["exercise_id"],"phase":task["phase"],"target_filename":name,
                         "stage_failed":stage,"reason":reason,"retryable":retryable,
                         "timestamp":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())})
        self._write(self.failure_queue_path,failures)

    def log_success(self,task,qc_status):
        if getattr(self.engine,"is_mock",False):raise RuntimeError("TEST-ONLY mock backend cannot write production provenance")
        meta=dict(getattr(self.engine,"last_metadata",{}) or {});rows=self._load(self.provenance_log_path);name=task["target_filename"]
        rows=[r for r in rows if r.get("target_filename")!=name];prompt=task["prompt"]
        rows.append({"athletico_exercise_id":task["exercise_id"],"phase":task["phase"],"target_filename":name,
          "model_id":meta.get("model_id"),"seed":meta.get("seed"),"full_prompt":prompt,
          "prompt_sha256":hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
          "character_reference_id":meta.get("character_reference_id"),"character_mode":meta.get("character_mode"),
          "pose_reference_id":meta.get("pose_reference_id"),"control_reference_id":meta.get("control_reference_id"),
          "openpose_preprocessor_id":meta.get("openpose_preprocessor_id"),
          "controlnet_model_id":meta.get("controlnet_model_id"),"ip_adapter_model_id":meta.get("ip_adapter_model_id"),
          "character_lora_model_id":meta.get("character_lora_model_id"),"runware_task_uuid":meta.get("task_uuid"),
          "runware_image_uuid":meta.get("image_uuid"),"generation_time_s":meta.get("generation_time_s"),
          "runware_cost_usd":meta.get("total_cost_usd",meta.get("runware_cost_usd",0)),
          "timestamp":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"qc_result":qc_status,"status":"production"})
        self._write(self.provenance_log_path,rows)

    def execute_batch(self,tasks:List[Dict]):
        if getattr(self.engine,"is_mock",False):raise RuntimeError("TEST-ONLY mock backend cannot execute production batches")
        self.engine.initialize_pipeline()
        for i,task in enumerate(tasks,1):
            final=self.output_dir/task["target_filename"];final.parent.mkdir(parents=True,exist_ok=True)
            expected=(int(task.get("width",1344)),int(task.get("height",768)))
            ok,_=VisualQualityControl.validate_image_integrity(str(final),expected)
            if ok and self.resume:
                print("[-] "+str(i)+"/"+str(len(tasks))+" existing valid asset skipped: "+str(final));continue
            if ok and not self.resume:raise PermanentInferenceError("refusing to overwrite existing production asset without --resume: "+str(final))
            try:
                image=self.engine.generate_frame(task);meta=dict(getattr(self.engine,"last_metadata",{}) or {})
                frame_cost=float(meta.get("total_cost_usd",meta.get("runware_cost_usd",0)) or 0)
                if self.max_cost_usd is not None and self.session_cost_usd+frame_cost>self.max_cost_usd:
                    raise CostLimitExceeded("cost ceiling $%.4f would be exceeded"%self.max_cost_usd)
                tmp=final.with_suffix(".tmp.webp");image.convert("RGB").save(tmp,"WEBP",quality=90,method=6)
                ok,msg=VisualQualityControl.validate_image_integrity(str(tmp),expected)
                if not ok:
                    tmp.unlink(missing_ok=True);self.log_failure(task,msg,"AUTOMATED_QC",False);continue
                os.replace(tmp,final);self.session_cost_usd+=frame_cost;self.log_success(task,msg)
                print("[+] "+str(i)+"/"+str(len(tasks))+" "+str(final))
            except TransientInferenceError as exc:
                self.log_failure(task,str(exc),"TRANSIENT_INFERENCE",True);print("[!] transient failure: "+str(exc))
            except (PermanentInferenceError,ValueError) as exc:
                self.log_failure(task,str(exc),"PERMANENT_VALIDATION",False);print("[!] permanent failure: "+str(exc))

import abc
import json
import os
import time
from pathlib import Path
from typing import Dict, List, Tuple
from PIL import Image, ImageStat

class VisualQualityControl:
    @staticmethod
    def validate_image_integrity(file_path: str, target_res: Tuple[int,int]=(1024,1024)):
        p=Path(file_path)
        if not p.exists(): return False,"missing"
        if p.stat().st_size < 10*1024: return False,"file-too-small"
        try:
            with Image.open(p) as img: img.verify()
            with Image.open(p) as img:
                img.load()
                if img.size != target_res: return False,f"resolution:{img.size}"
                if img.format != "WEBP": return False,f"format:{img.format}"
                stat=ImageStat.Stat(img.convert("L"))
                if stat.var[0] < 2.0: return False,"near-blank-frame"
            return True,"PASSED"
        except Exception as e: return False,f"decode:{e}"

class BaseInferenceEngine(abc.ABC):
    @abc.abstractmethod
    def initialize_pipeline(self): ...
    @abc.abstractmethod
    def generate_frame(self, prompt:str, character_path:str, control_path:str, control_type:str): ...

class AthleticoProductionGenerator:
    def __init__(self,engine:BaseInferenceEngine,output_dir="./public/exercise-visuals"):
        self.engine=engine; self.output_dir=Path(output_dir)
        self.output_dir.mkdir(parents=True,exist_ok=True)
        self.failure_queue_path=self.output_dir/"failure_queue.json"
        self.provenance_log_path=self.output_dir/"generation_provenance.json"

    def _load(self,p):
        try: return json.loads(Path(p).read_text(encoding="utf-8")) if Path(p).exists() else []
        except (json.JSONDecodeError,OSError): return []

    def _write(self,p,data):
        tmp=Path(str(p)+".tmp"); tmp.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding="utf-8"); os.replace(tmp,p)

    def log_failure(self,task,reason,stage):
        failures=self._load(self.failure_queue_path)
        name=task["target_filename"]
        failures=[f for f in failures if f.get("target_filename")!=name]
        failures.append({"athletico_exercise_id":task["exercise_id"],"phase":task["phase"],"target_filename":name,"stage_failed":stage,"reason":reason,"timestamp":time.strftime("%Y-%m-%dT%H:%M:%S")})
        self._write(self.failure_queue_path,failures)

    def log_success(self,task):
        rows=self._load(self.provenance_log_path); name=task["target_filename"]
        rows=[r for r in rows if r.get("target_filename")!=name]
        rows.append({"athletico_exercise_id":task["exercise_id"],"phase":task["phase"],"target_filename":name,"qc_status":"PASSED","completed_at":time.strftime("%Y-%m-%dT%H:%M:%S")})
        self._write(self.provenance_log_path,rows)

    def execute_batch(self,tasks:List[Dict]):
        self.engine.initialize_pipeline()
        for i,task in enumerate(tasks,1):
            final=self.output_dir/task["target_filename"]; final.parent.mkdir(parents=True,exist_ok=True)
            ok,_=VisualQualityControl.validate_image_integrity(str(final))
            if ok: print(f"[-] {i}/{len(tasks)} {final}"); continue
            try:
                img=self.engine.generate_frame(task["prompt"],task.get("character_path",""),task.get("control_path",""),task.get("control_type",""))
                tmp=final.with_suffix(".tmp.webp"); img.convert("RGB").save(tmp,"WEBP",quality=90,method=6); os.replace(tmp,final)
                ok,msg=VisualQualityControl.validate_image_integrity(str(final))
                if not ok: final.unlink(missing_ok=True); self.log_failure(task,msg,"AUTOMATED_QC"); continue
                self.log_success(task); print(f"[+] {i}/{len(tasks)} {final}")
            except Exception as e:
                self.log_failure(task,str(e),"INFERENCE_CRASH"); print(f"[!] {i}/{len(tasks)} {e}")

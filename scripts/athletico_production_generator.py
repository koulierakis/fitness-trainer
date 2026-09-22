#!/usr/bin/env python3
"""Provider-agnostic Athletico production orchestration.

This module intentionally contains no fake inference. A real adapter must return a PIL Image.
"""
import abc,json,time
from pathlib import Path
from PIL import Image
from scripts.qc_visual_assets import check

class BaseInferenceEngine(abc.ABC):
    @abc.abstractmethod
    def initialize_pipeline(self): ...
    @abc.abstractmethod
    def generate_frame(self,task)->Image.Image: ...

class AthleticoProductionGenerator:
    def __init__(self,engine,root="public",failures="outputs/failure_queue.json",provenance="outputs/generation_provenance.json"):
        self.engine=engine;self.root=Path(root);self.failures=Path(failures);self.provenance=Path(provenance)
    def _append(self,path,row):
        path.parent.mkdir(parents=True,exist_ok=True)
        try:data=json.loads(path.read_text(encoding="utf-8")) if path.exists() else []
        except json.JSONDecodeError:data=[]
        data=[x for x in data if not (x.get("exercise_id")==row.get("exercise_id") and x.get("phase")==row.get("phase"))]
        data.append(row);path.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding="utf-8")
    def run(self,manifest):
        data=json.loads(Path(manifest).read_text(encoding="utf-8"));self.engine.initialize_pipeline()
        for exid,ex in data["exercises"].items():
            for phase in ("start","execution","return"):
                frame=ex["frames"][phase];asset=frame["asset"];rel=asset.lstrip("/")
                if rel.startswith("public/"):rel=rel[7:]
                out=self.root/rel;out.parent.mkdir(parents=True,exist_ok=True)
                ok,_=check(out)
                if ok:continue
                task={"exercise_id":exid,"phase":phase,"exercise":ex,"frame":frame}
                try:
                    image=self.engine.generate_frame(task)
                    if not isinstance(image,Image.Image):raise TypeError("adapter must return PIL.Image.Image")
                    tmp=out.with_suffix(".tmp.webp");image.convert("RGB").save(tmp,"WEBP",quality=90,method=6)
                    ok,msg=check(tmp)
                    if not ok:raise RuntimeError(f"QC:{msg}")
                    tmp.replace(out)
                    self._append(self.provenance,{"exercise_id":exid,"phase":phase,"asset":asset,"status":"PASSED","timestamp":time.strftime("%Y-%m-%dT%H:%M:%S")})
                except Exception as e:
                    self._append(self.failures,{"exercise_id":exid,"phase":phase,"asset":asset,"stage":"GENERATION_OR_QC","reason":str(e),"timestamp":time.strftime("%Y-%m-%dT%H:%M:%S")})

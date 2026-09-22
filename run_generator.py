import argparse
import json
from pathlib import Path
from PIL import Image
from src.visuals.generator import AthleticoProductionGenerator,BaseInferenceEngine

class MockEngine(BaseInferenceEngine):
    def initialize_pipeline(self): print("[DRY RUN] mock engine")
    def generate_frame(self,prompt,character_path,control_path,control_type): return Image.new("RGB",(1024,1024),(40,180,99))

def manifest_tasks(path):
    data=json.loads(Path(path).read_text(encoding="utf-8"))
    exercises=data.get("exercises",data)
    tasks=[]
    for exercise_id,spec in exercises.items():
        for phase,frame in spec.get("frames",{}).items():
            asset=frame.get("asset","").lstrip("/")
            prefix="exercise-visuals/"
            target=asset[len(prefix):] if asset.startswith(prefix) else asset
            prompt=frame.get("prompt") or frame.get("generation_prompt") or spec.get("prompt") or ""
            tasks.append({"exercise_id":exercise_id,"phase":phase.upper(),"target_filename":target,"prompt":prompt,"character_path":"","control_path":"","control_type":""})
    return tasks

def main():
    p=argparse.ArgumentParser(); p.add_argument("--manifest",default="src/visuals/exercise-visual-manifest.json"); p.add_argument("--output-dir",default="public/exercise-visuals"); p.add_argument("--dry-run",action="store_true")
    a=p.parse_args()
    if not a.dry_run: raise SystemExit("Real inference adapter is not configured yet. Use --dry-run; do not create fake production assets.")
    AthleticoProductionGenerator(MockEngine(),a.output_dir).execute_batch(manifest_tasks(a.manifest))
if __name__=="__main__": main()

import argparse
import json
import os
from pathlib import Path
from src.visuals.generator import AthleticoProductionGenerator
from src.visuals.runware_adapter import RunwareInferenceAdapter, OPENPOSE_PREPROCESSOR
from src.visuals.pose_control import pose_data_uri

PHASES=("start","execution","return")

def _target(asset,exercise_id,phase):
    rel=str(asset or "").lstrip("/")
    for prefix in ("public/exercise-visuals/","exercise-visuals/"):
        if rel.startswith(prefix):rel=rel[len(prefix):]
    return rel or f"{exercise_id}/{phase}.webp"

def manifest_tasks(path,exercise_ids=None):
    raw=Path(path).read_text(encoding="utf-8").strip()
    if not raw:return []
    data=json.loads(raw);exercises=data.get("exercises",data)
    if not isinstance(exercises,dict):raise ValueError("manifest exercises must be an object keyed by stable ID")
    selected=set(exercise_ids or []);tasks=[]
    for exercise_id,spec in exercises.items():
        if selected and exercise_id not in selected:continue
        for phase in PHASES:
            frame=spec.get("frames",{}).get(phase,{})
            prompt=frame.get("prompt") or frame.get("generation_prompt") or spec.get("prompt") or ""
            tasks.append({"exercise_id":exercise_id,"phase":phase,"target_filename":_target(frame.get("asset"),exercise_id,phase),
                          "prompt":prompt,"frame":frame,"exercise":spec,
                          "width":int(frame.get("width") or spec.get("width") or 1344),
                          "height":int(frame.get("height") or spec.get("height") or 768)})
    return tasks

def validate_tasks(tasks):
    errors=[]
    for t in tasks:
        f=t["frame"];tag=t["exercise_id"]+":"+t["phase"]
        if not t["target_filename"].lower().endswith(".webp"):errors.append(tag+": invalid output path")
        if not t["prompt"].strip():errors.append(tag+": missing prompt")
        if not (f.get("pose_reference") or f.get("control_reference") or f.get("pose_template")):errors.append(tag+": missing pose/control reference")
        if not (f.get("character_reference") or f.get("character_lora") or t["exercise"].get("character_reference") or t["exercise"].get("character_lora")):
            errors.append(tag+": missing character reference/LoRA")
        refs=[str(f.get(k) or "") for k in ("pose_reference","control_reference","character_reference")]
        if any("repdb" in x.lower() for x in refs):errors.append(tag+": RepDB conditioning is forbidden")
    return errors

def main():
    p=argparse.ArgumentParser();p.add_argument("--manifest",default="src/visuals/exercise-visual-manifest.json")
    p.add_argument("--output-dir",default="public/exercise-visuals");p.add_argument("--dry-run",action="store_true")
    p.add_argument("--limit",type=int,default=None,help="Maximum exercises, not frames");p.add_argument("--resume",action="store_true")
    p.add_argument("--exercise",action="append",default=[],help="Stable exercise ID; repeatable");p.add_argument("--max-cost-usd",type=float)
    p.add_argument("--pilot-file",default="src/visuals/runware-pilot.json")
    p.add_argument("--model",default=os.getenv("RUNWARE_MODEL"));p.add_argument("--controlnet-model",default=os.getenv("RUNWARE_CONTROLNET_MODEL"))
    p.add_argument("--ip-adapter-model",default=os.getenv("RUNWARE_IP_ADAPTER_MODEL"))
    p.add_argument("--character-lora-model",default=os.getenv("RUNWARE_CHARACTER_LORA_MODEL"));a=p.parse_args()

    requested=list(a.exercise)
    if not requested and a.pilot_file and Path(a.pilot_file).exists():
        requested.extend(json.loads(Path(a.pilot_file).read_text(encoding="utf-8")).get("exercise_ids",[]))
    tasks=manifest_tasks(a.manifest,requested)
    if a.limit is not None:
        ids=list(dict.fromkeys(t["exercise_id"] for t in tasks));keep=set(ids[:a.limit]);tasks=[t for t in tasks if t["exercise_id"] in keep]
    errors=validate_tasks(tasks);ids=list(dict.fromkeys(t["exercise_id"] for t in tasks))
    if not tasks:errors.append("manifest contains no selectable exercise/frame records")
    if requested:
        absent=[x for x in requested if x not in ids]
        errors.extend("selected exercise missing from manifest: "+x for x in absent)
    config_errors=[]
    if not a.model:config_errors.append("RUNWARE_MODEL not selected/validated")
    if not a.controlnet_model:config_errors.append("RUNWARE_CONTROLNET_MODEL not selected/validated against base model")
    if not (a.ip_adapter_model or a.character_lora_model):config_errors.append("character adapter/LoRA not selected/validated against base model")
    report={"mode":"dry-run" if a.dry_run else "production","selected_exercises":ids,"exercise_count":len(ids),"frame_count":len(tasks),
      "output_paths":[t["target_filename"] for t in tasks],"missing_or_invalid_inputs":errors,"configuration_blockers":config_errors,
      "base_model":a.model,"controlnet_model":a.controlnet_model,"openpose_preprocessor":OPENPOSE_PREPROCESSOR,
      "ip_adapter_model":a.ip_adapter_model,"character_lora_model":a.character_lora_model,
      "max_cost_usd":a.max_cost_usd,"estimated_pilot_cost_usd":"unknown until compatible base model/adapter are selected; hard ceiling is --max-cost-usd",
      "api_key_present":bool(os.environ.get("RUNWARE_API_KEY"))}
    if a.dry_run:
        print(json.dumps(report,indent=2,ensure_ascii=False));return 1 if (errors or config_errors) else 0
    if errors or config_errors:raise SystemExit("Production blocked. Run --dry-run; all pose/character inputs and compatible AIR IDs are mandatory.")
    if not os.environ.get("RUNWARE_API_KEY"):raise SystemExit("RUNWARE_API_KEY is required for production generation")
    engine=RunwareInferenceAdapter(a.model,a.controlnet_model,a.ip_adapter_model,a.character_lora_model)
    AthleticoProductionGenerator(engine,a.output_dir,resume=a.resume,max_cost_usd=a.max_cost_usd).execute_batch(tasks)

if __name__=="__main__":main()

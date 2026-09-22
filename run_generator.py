import argparse
import json
import os
from pathlib import Path
from src.visuals.generator import AthleticoProductionGenerator
from src.visuals.runware_adapter import RunwareInferenceAdapter

PHASES=("start","execution","return")
DEFAULT_MODEL="runware:101@1"

def _target_from_asset(asset):
    rel=str(asset or "").lstrip("/")
    for prefix in ("public/exercise-visuals/","exercise-visuals/"):
        if rel.startswith(prefix):return rel[len(prefix):]
    return rel

def manifest_tasks(path,exercise_ids=None):
    data=json.loads(Path(path).read_text(encoding="utf-8"));exercises=data.get("exercises",data)
    tasks=[];selected=set(exercise_ids or [])
    for exercise_id,spec in exercises.items():
        if selected and exercise_id not in selected:continue
        for phase in PHASES:
            frame=spec.get("frames",{}).get(phase,{})
            prompt=frame.get("prompt") or frame.get("generation_prompt") or spec.get("prompt") or ""
            tasks.append({"exercise_id":exercise_id,"phase":phase,"target_filename":_target_from_asset(frame.get("asset")),
                          "prompt":prompt,"frame":frame,"exercise":spec})
    return tasks

def validate_tasks(tasks):
    errors=[]
    for task in tasks:
        frame=task["frame"]
        if not task["target_filename"].lower().endswith(".webp"):errors.append(task["exercise_id"]+":"+task["phase"]+": invalid output path")
        if not task["prompt"].strip():errors.append(task["exercise_id"]+":"+task["phase"]+": missing prompt")
        if not (frame.get("pose_reference") or frame.get("control_reference")):
            errors.append(task["exercise_id"]+":"+task["phase"]+": missing pose/control reference")
        if not (frame.get("character_reference") or frame.get("character_lora") or task["exercise"].get("character_reference") or task["exercise"].get("character_lora")):
            errors.append(task["exercise_id"]+":"+task["phase"]+": missing character reference/LoRA")
        refs=[str(frame.get("pose_reference") or ""),str(frame.get("control_reference") or ""),str(frame.get("character_reference") or "")]
        if any("repdb" in ref.lower() for ref in refs):errors.append(task["exercise_id"]+":"+task["phase"]+": RepDB conditioning is forbidden")
    return errors

def main():
    p=argparse.ArgumentParser();p.add_argument("--manifest",default="src/visuals/exercise-visual-manifest.json")
    p.add_argument("--output-dir",default="public/exercise-visuals");p.add_argument("--dry-run",action="store_true")
    p.add_argument("--limit",type=int,default=None,help="Maximum exercises, not frames");p.add_argument("--resume",action="store_true")
    p.add_argument("--exercise",action="append",default=[],help="Stable exercise ID; repeatable");p.add_argument("--max-cost-usd",type=float,default=None)
    p.add_argument("--pilot-file",default=None,help="JSON file containing exercise_ids")
    p.add_argument("--model",default=os.getenv("RUNWARE_MODEL",DEFAULT_MODEL))
    p.add_argument("--controlnet-model",default=os.getenv("RUNWARE_CONTROLNET_MODEL"))
    p.add_argument("--ip-adapter-model",default=os.getenv("RUNWARE_IP_ADAPTER_MODEL"))
    p.add_argument("--character-lora-model",default=os.getenv("RUNWARE_CHARACTER_LORA_MODEL"));args=p.parse_args()

    requested=list(args.exercise)
    if args.pilot_file:
        pilot=json.loads(Path(args.pilot_file).read_text(encoding="utf-8"));requested.extend(pilot.get("exercise_ids",[]))
    tasks=manifest_tasks(args.manifest,requested)
    if args.limit is not None:
        ids=[]
        for task in tasks:
            if task["exercise_id"] not in ids:ids.append(task["exercise_id"])
        keep=set(ids[:args.limit]);tasks=[task for task in tasks if task["exercise_id"] in keep]

    errors=validate_tasks(tasks);selected_ids=list(dict.fromkeys(task["exercise_id"] for task in tasks))
    report={"mode":"dry-run" if args.dry_run else "production","selected_exercises":selected_ids,
      "exercise_count":len(selected_ids),"frame_count":len(tasks),"output_paths":[task["target_filename"] for task in tasks],
      "missing_or_invalid_inputs":errors,"base_model":args.model,"controlnet_model":args.controlnet_model,
      "ip_adapter_model":args.ip_adapter_model,"character_lora_model":args.character_lora_model,
      "max_cost_usd":args.max_cost_usd,"api_key_present":bool(os.environ.get("RUNWARE_API_KEY"))}
    if args.dry_run:
        print(json.dumps(report,indent=2,ensure_ascii=False));return 1 if errors else 0
    if errors:raise SystemExit("Production blocked: every frame requires valid pose/control and character conditioning. Run --dry-run for details.")
    if not os.environ.get("RUNWARE_API_KEY"):raise SystemExit("RUNWARE_API_KEY is required for production generation")
    if not args.controlnet_model:raise SystemExit("RUNWARE_CONTROLNET_MODEL must be explicitly configured")
    if not (args.ip_adapter_model or args.character_lora_model):
        raise SystemExit("Configure a compatible RUNWARE_IP_ADAPTER_MODEL or RUNWARE_CHARACTER_LORA_MODEL")
    engine=RunwareInferenceAdapter(model=args.model,controlnet_model=args.controlnet_model,
      ip_adapter_model=args.ip_adapter_model,character_lora_model=args.character_lora_model)
    AthleticoProductionGenerator(engine,args.output_dir,resume=args.resume,max_cost_usd=args.max_cost_usd).execute_batch(tasks)

if __name__=="__main__":main()

#!/usr/bin/env python3
import argparse,json,sys
from pathlib import Path
PHASES=("start","execution","return")
def nonempty(v):return v is not None and (not isinstance(v,str) or bool(v.strip()))
def validate(path,production=False):
    data=json.loads(Path(path).read_text(encoding="utf-8"));exercises=data.get("exercises") if isinstance(data,dict) else None
    errors=[];warnings=[];assets=set()
    if not isinstance(exercises,dict) or not exercises:return ["root.exercises must be a non-empty object"],warnings,0
    for ex_id,ex in exercises.items():
        p="exercises."+ex_id;frames=ex.get("frames")
        if not isinstance(frames,dict):errors.append(p+".frames: missing/object required");continue
        if ex.get("equipment",ex.get("equipment_required")) is None:warnings.append(p+": equipment metadata missing")
        for phase in PHASES:
            fp=p+".frames."+phase;frame=frames.get(phase)
            if not isinstance(frame,dict):errors.append(fp+": missing");continue
            for field in ("asset","prompt"):
                if not nonempty(frame.get(field)):errors.append(fp+"."+field+": required")
            asset=frame.get("asset")
            if nonempty(asset):
                if asset in assets:errors.append(fp+".asset: duplicate asset path")
                assets.add(asset)
                if not str(asset).lower().endswith(".webp"):errors.append(fp+".asset: must end in .webp")
            refs=[str(frame.get("pose_reference") or ""),str(frame.get("control_reference") or ""),str(frame.get("character_reference") or "")]
            if any("repdb" in x.lower() for x in refs):errors.append(fp+": RepDB conditioning/reference is forbidden")
            if production and not (frame.get("pose_reference") or frame.get("control_reference")):errors.append(fp+": production requires pose_reference or control_reference")
            if production and not (frame.get("character_reference") or frame.get("character_lora") or ex.get("character_reference") or ex.get("character_lora")):
                errors.append(fp+": production requires character reference or character LoRA")
            if frame.get("constraints",ex.get("constraints")) is None:warnings.append(fp+": biomechanics constraints missing")
    return errors,warnings,len(exercises)
def main():
    ap=argparse.ArgumentParser();ap.add_argument("manifest",nargs="?",default="src/visuals/exercise-visual-manifest.json")
    ap.add_argument("--strict",action="store_true");ap.add_argument("--production",action="store_true");a=ap.parse_args()
    try:errors,warnings,count=validate(a.manifest,a.production)
    except Exception as exc:print("ERROR: invalid manifest:",exc);return 2
    print("Athletico manifest validation:",count,"exercises");print("Errors:",len(errors),"| Warnings:",len(warnings))
    for x in errors:print("ERROR:",x)
    for x in warnings:print("WARN:",x)
    if errors or (a.strict and warnings):return 1
    print("PASS: manifest is structurally safe for generation.");return 0
if __name__=="__main__":sys.exit(main())

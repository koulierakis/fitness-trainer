#!/usr/bin/env python3
"""Validate Athletico visual manifest before production generation."""
import argparse, json, os, sys
from pathlib import Path

PHASES=("start","execution","return")
ALLOWED_CAMERAS={"front","profile_left","profile_right","profile_3_4_left","profile_3_4_right","rear","rear_3_4_left","rear_3_4_right"}
REQUIRED_FRAME_FIELDS=("asset","prompt")

def nonempty(v): return v is not None and (not isinstance(v,str) or bool(v.strip()))

def validate(path: Path):
    data=json.loads(path.read_text(encoding="utf-8"))
    exercises=data.get("exercises") if isinstance(data,dict) else None
    errors=[]; warnings=[]; assets=set()
    if not isinstance(exercises,dict) or not exercises:
        return ["root.exercises must be a non-empty object"], warnings, 0
    for ex_id, ex in exercises.items():
        p=f"exercises.{ex_id}"
        if not nonempty(ex_id): errors.append(f"{p}: empty exercise id")
        for key in ("name","canonical_name"):
            if key in ex and not nonempty(ex[key]): errors.append(f"{p}.{key}: empty")
        equipment=ex.get("equipment", ex.get("equipment_required"))
        if equipment is None: warnings.append(f"{p}: equipment metadata missing")
        camera=ex.get("camera", ex.get("camera_angle"))
        if isinstance(camera,dict): camera=camera.get("angle") or camera.get("view")
        if camera is None: warnings.append(f"{p}: camera metadata missing")
        elif isinstance(camera,str) and camera not in ALLOWED_CAMERAS:
            warnings.append(f"{p}: non-standard camera angle '{camera}'")
        frames=ex.get("frames")
        if not isinstance(frames,dict): errors.append(f"{p}.frames: missing/object required"); continue
        for phase in PHASES:
            fp=f"{p}.frames.{phase}"; frame=frames.get(phase)
            if not isinstance(frame,dict): errors.append(f"{fp}: missing"); continue
            for field in REQUIRED_FRAME_FIELDS:
                if not nonempty(frame.get(field)): errors.append(f"{fp}.{field}: required")
            asset=frame.get("asset")
            if nonempty(asset):
                if asset in assets: errors.append(f"{fp}.asset: duplicate asset path '{asset}'")
                assets.add(asset)
                if not str(asset).lower().endswith(".webp"): errors.append(f"{fp}.asset: must end in .webp")
            constraints=frame.get("constraints", ex.get("constraints"))
            if constraints is None: warnings.append(f"{fp}: biomechanics constraints missing")
    return errors,warnings,len(exercises)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("manifest",nargs="?",default="src/visuals/exercise-visual-manifest.json")
    ap.add_argument("--strict",action="store_true",help="Treat warnings as failures")
    args=ap.parse_args()
    path=Path(args.manifest)
    if not path.exists(): print(f"ERROR: manifest not found: {path}"); return 2
    try: errors,warnings,count=validate(path)
    except Exception as e: print(f"ERROR: invalid JSON: {e}"); return 2
    print(f"Athletico manifest validation: {count} exercises")
    print(f"Errors: {len(errors)} | Warnings: {len(warnings)}")
    for x in errors: print("ERROR:",x)
    for x in warnings: print("WARN:",x)
    if errors or (args.strict and warnings): return 1
    print("PASS: manifest is structurally safe for generation.")
    return 0
if __name__=="__main__": sys.exit(main())

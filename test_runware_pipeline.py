import json
from pathlib import Path
from run_generator import manifest_tasks, validate_tasks

def test_empty_manifest_is_safe(tmp_path):
    p=tmp_path/"manifest.json";p.write_text("",encoding="utf-8")
    assert manifest_tasks(p)==[]

def test_requires_pose_and_character(tmp_path):
    p=tmp_path/"manifest.json"
    p.write_text(json.dumps({"exercises":{"ath:test":{"frames":{
      "start":{"prompt":"start","asset":"ath:test/start.webp"},
      "execution":{"prompt":"execute","asset":"ath:test/execution.webp"},
      "return":{"prompt":"return","asset":"ath:test/return.webp"}}}}}),encoding="utf-8")
    tasks=manifest_tasks(p);errors=validate_tasks(tasks)
    assert len(tasks)==3
    assert sum("missing pose/control reference" in e for e in errors)==3
    assert sum("missing character reference/LoRA" in e for e in errors)==3

def test_local_backend_uses_external_master_character(tmp_path):
    p=tmp_path/"manifest.json"
    f={"prompt":"x","pose_template":"standing_front"}
    p.write_text(json.dumps({"exercises":{"ath:test":{"frames":{"start":f,"execution":f,"return":f}}}}),encoding="utf-8")
    tasks=manifest_tasks(p)
    assert len(tasks)==3
    assert all(t["frame"]["control_reference"].startswith("data:image/png;base64,") for t in tasks)
    assert validate_tasks(tasks,require_character=False)==[]

def test_repdb_conditioning_is_forbidden(tmp_path):
    p=tmp_path/"manifest.json"
    frame={"prompt":"x","asset":"ath:test/start.webp","pose_reference":"https://repdb.example/x.jpg","character_reference":"character-uuid"}
    p.write_text(json.dumps({"exercises":{"ath:test":{"frames":{"start":frame,"execution":frame,"return":frame}}}}),encoding="utf-8")
    assert sum("RepDB conditioning is forbidden" in e for e in validate_tasks(manifest_tasks(p)))==3

def test_default_output_mapping_uses_stable_id(tmp_path):
    p=tmp_path/"manifest.json"
    f={"prompt":"x","pose_reference":"pose-uuid","character_reference":"character-uuid"}
    p.write_text(json.dumps({"exercises":{"ath:test":{"frames":{"start":f,"execution":f,"return":f}}}}),encoding="utf-8")
    tasks=manifest_tasks(p)
    assert [t["target_filename"] for t in tasks]==["ath:test/start.webp","ath:test/execution.webp","ath:test/return.webp"]


def test_local_backend_does_not_require_character_reference_in_manifest(tmp_path):
    p=tmp_path/"manifest.json"
    f={"prompt":"x","pose_template":"standing_front"}
    p.write_text(json.dumps({"exercises":{"ath:test":{"frames":{"start":f,"execution":f,"return":f}}}}),encoding="utf-8")
    tasks=manifest_tasks(p)
    errors=validate_tasks(tasks,require_character=False)
    assert not [e for e in errors if "character reference/LoRA" in e]
    assert not [e for e in errors if "pose/control" in e]


def test_pilot_manifest_is_exactly_10_exercises_30_frames():
    tasks=manifest_tasks("src/visuals/exercise-visual-manifest.json")
    ids=list(dict.fromkeys(t["exercise_id"] for t in tasks))
    assert len(ids)==10
    assert len(tasks)==30
    assert not [e for e in validate_tasks(tasks,require_character=False) if "pose/control" in e]

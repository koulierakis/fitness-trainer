import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image
from run_generator import manifest_tasks, validate_tasks
from src.visuals.generator import AthleticoProductionGenerator, BaseInferenceEngine
from src.visuals.runware_adapter import RunwareInferenceAdapter

class MockEngine(BaseInferenceEngine):
    is_mock=True
    def initialize_pipeline(self): pass
    def generate_frame(self,task): return Image.new("RGB",(1024,1024),(30,30,30))

class VisualPipelineTests(unittest.TestCase):
    def test_api_key_only_from_environment(self):
        with patch.dict(os.environ,{},clear=True):
            adapter=RunwareInferenceAdapter("runware:101@1","runware:25@1")
            self.assertIsNone(adapter.api_key)
            with self.assertRaises(RuntimeError):adapter.initialize_pipeline()

    def test_missing_pose_blocks_production(self):
        task={"exercise_id":"x","phase":"start","target_filename":"x/start.webp","prompt":"pose","frame":{},"exercise":{"character_reference":"character.png"}}
        self.assertTrue(any("missing pose/control" in x for x in validate_tasks([task])))

    def test_repdb_reference_is_rejected(self):
        task={"exercise_id":"x","phase":"start","target_filename":"x/start.webp","prompt":"pose",
              "frame":{"pose_reference":"https://repdb.example/image.jpg"},"exercise":{"character_reference":"character.png"}}
        self.assertTrue(any("RepDB" in x for x in validate_tasks([task])))

    def test_mock_cannot_write_production(self):
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaises(RuntimeError):AthleticoProductionGenerator(MockEngine(),td).execute_batch([])

    def test_manifest_yields_three_frames(self):
        with tempfile.TemporaryDirectory() as td:
            path=Path(td)/"manifest.json"
            path.write_text(json.dumps({"exercises":{"local:x":{"frames":{
              "start":{"asset":"/exercise-visuals/local-x/start.webp","prompt":"a"},
              "execution":{"asset":"/exercise-visuals/local-x/execution.webp","prompt":"b"},
              "return":{"asset":"/exercise-visuals/local-x/return.webp","prompt":"c"}}}}}),encoding="utf-8")
            self.assertEqual(3,len(manifest_tasks(path,["local:x"])))

if __name__=="__main__":unittest.main()

"""
Unit tests for portable Clipify Project Format v2.
"""

import os
import tempfile
from clipify.project.project_format import ClipifyProject, CURRENT_PROJECT_VERSION

def test_project_create_and_serialize():
    proj = ClipifyProject(
        project_id="test_001",
        title="Gaming Short 1",
        source_media_path="video.mp4",
        highlights=[{"id": "h1", "score": 9.2}]
    )
    d = proj.to_dict()
    assert d["clipify_version"] == CURRENT_PROJECT_VERSION
    assert d["project_id"] == "test_001"
    assert len(d["highlights"]) == 1

def test_project_save_and_load():
    with tempfile.TemporaryDirectory() as td:
        json_path = os.path.join(td, "project.json")
        orig = ClipifyProject(
            project_id="save_load_test",
            title="My Saved Short",
            source_media_path="input.mp4",
            transcription={"language": "en", "segments": [{"text": "Hello world"}]}
        )
        orig.save_to_file(json_path)
        assert os.path.exists(json_path)

        loaded = ClipifyProject.load_from_file(json_path)
        assert loaded.project_id == "save_load_test"
        assert loaded.title == "My Saved Short"
        assert loaded.transcription["segments"][0]["text"] == "Hello world"


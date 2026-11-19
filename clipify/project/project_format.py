"""
Clipify AI — Portable Cross-Platform Project Model (Format v2.0)
Allows projects created on Windows, Linux, macOS, or Android to be shared and reopened seamlessly.
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Any

CURRENT_PROJECT_VERSION = "2.0.0"

class ClipifyProject:
    def __init__(
        self,
        project_id: str,
        title: str,
        source_media_path: str,
        version: str = CURRENT_PROJECT_VERSION,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
        transcription: Optional[Dict[str, Any]] = None,
        highlights: Optional[List[Dict[str, Any]]] = None,
        export_settings: Optional[Dict[str, Any]] = None,
    ):
        self.project_id = project_id
        self.title = title
        self.source_media_path = source_media_path
        self.version = version
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.created_at = created_at or now
        self.updated_at = updated_at or now
        self.transcription = transcription or {"language": "en", "segments": []}
        self.highlights = highlights or []
        self.export_settings = export_settings or {
            "format": "mp4",
            "aspect_ratio": "9:16",
            "resolution": [1080, 1920],
            "fps": 30,
            "caption_style": "hormozi_yellow"
        }

    def to_dict(self) -> Dict[str, Any]:
        """Serializes project to portable dictionary."""
        return {
            "clipify_version": self.version,
            "project_id": self.project_id,
            "title": self.title,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "source_media": {
                "path": self.source_media_path,
                "filename": os.path.basename(self.source_media_path) if self.source_media_path else "",
            },
            "transcription": self.transcription,
            "highlights": self.highlights,
            "export_settings": self.export_settings,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any], project_dir: Optional[str] = None) -> "ClipifyProject":
        """Deserializes and handles backward compatibility with v1.x projects."""
        version = data.get("clipify_version", "1.0.0")
        project_id = data.get("project_id", "project_untitled")
        title = data.get("title", "Untitled Project")
        
        # Source media path resolution (relative to project_dir if available)
        source_info = data.get("source_media", {})
        if isinstance(source_info, dict):
            media_path = source_info.get("path") or source_info.get("filename", "")
        else:
            media_path = str(source_info)

        if project_dir and media_path and not os.path.isabs(media_path):
            candidate = os.path.join(project_dir, media_path)
            if os.path.exists(candidate):
                media_path = candidate

        return cls(
            project_id=project_id,
            title=title,
            source_media_path=media_path,
            version=version,
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            transcription=data.get("transcription", {}),
            highlights=data.get("highlights", []),
            export_settings=data.get("export_settings", {}),
        )

    def save_to_file(self, filepath: str) -> None:
        """Saves project JSON with atomic write."""
        self.updated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        p = Path(filepath)
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = filepath + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)
        if os.path.exists(filepath):
            os.remove(filepath)
        os.rename(tmp, filepath)

    @classmethod
    def load_from_file(cls, filepath: str) -> "ClipifyProject":
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data, project_dir=str(Path(filepath).parent))

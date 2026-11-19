"""
Clipify AI — Cross-Platform System Paths Resolver
Resolves configuration, cache, projects, and binary directories according to OS standards.
"""

import os
import sys
from pathlib import Path

class PlatformPaths:
    def __init__(self):
        self.os_type = sys.platform

    @property
    def config_dir(self) -> Path:
        """Returns standard configuration directory."""
        if self.os_type == "win32":
            base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~\\AppData\\Local")
            p = Path(base) / "ClipifyAI" / "config"
        elif self.os_type == "darwin":
            p = Path.home() / "Library" / "Application Support" / "ClipifyAI" / "config"
        else: # Linux / POSIX / Android
            xdg = os.environ.get("XDG_CONFIG_HOME")
            base = Path(xdg) if xdg else Path.home() / ".config"
            p = base / "clipify-ai"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def data_dir(self) -> Path:
        """Returns standard application data / model directory."""
        if self.os_type == "win32":
            base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~\\AppData\\Local")
            p = Path(base) / "ClipifyAI"
        elif self.os_type == "darwin":
            p = Path.home() / "Library" / "Application Support" / "ClipifyAI"
        else:
            xdg = os.environ.get("XDG_DATA_HOME")
            base = Path(xdg) if xdg else Path.home() / ".local" / "share"
            p = base / "clipify-ai"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def cache_dir(self) -> Path:
        """Returns temporary render cache directory."""
        if self.os_type == "win32":
            base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~\\AppData\\Local")
            p = Path(base) / "ClipifyAI" / "cache"
        elif self.os_type == "darwin":
            p = Path.home() / "Library" / "Caches" / "ClipifyAI"
        else:
            xdg = os.environ.get("XDG_CACHE_HOME")
            base = Path(xdg) if xdg else Path.home() / ".cache"
            p = base / "clipify-ai"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def default_projects_dir(self) -> Path:
        """Returns default directory for user projects."""
        if self.os_type == "win32":
            # Check if local workspace projects exists, otherwise Documents
            ws = Path(r"L:\ClipifyAI\projects")
            if ws.exists():
                return ws
            return Path.home() / "Documents" / "ClipifyAI" / "Projects"
        elif self.os_type == "darwin":
            return Path.home() / "Movies" / "ClipifyAI" / "Projects"
        else:
            return Path.home() / "Videos" / "ClipifyAI" / "Projects"

    @property
    def default_exports_dir(self) -> Path:
        """Returns default directory for exported 9:16 Shorts."""
        if self.os_type == "win32":
            ws = Path(r"L:\ClipifyAI\output")
            if ws.exists():
                return ws
            return Path.home() / "Videos" / "ClipifyAI" / "Exports"
        elif self.os_type == "darwin":
            return Path.home() / "Movies" / "ClipifyAI" / "Exports"
        else:
            return Path.home() / "Videos" / "ClipifyAI" / "Exports"

_paths_instance = None

def get_platform_paths() -> PlatformPaths:
    global _paths_instance
    if _paths_instance is None:
        _paths_instance = PlatformPaths()
    return _paths_instance

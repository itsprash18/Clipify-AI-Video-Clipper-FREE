"""
Clipify AI — Cross-Platform Binary Discovery
Locates external tools (ffmpeg, ffprobe, ollama, yt-dlp) without hardcoded paths.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional, Dict

class BinaryLocator:
    def __init__(self):
        self.os_type = sys.platform
        self._cache: Dict[str, Optional[str]] = {}

    def find_ffmpeg(self) -> Optional[str]:
        """Locates the FFmpeg binary."""
        if "ffmpeg" in self._cache:
            return self._cache["ffmpeg"]

        # 1. Environment override
        env_path = os.environ.get("CLIPIFY_FFMPEG_PATH") or os.environ.get("FFMPEG_PATH")
        if env_path and os.path.isfile(env_path) and os.access(env_path, os.X_OK):
            self._cache["ffmpeg"] = env_path
            return env_path

        # 2. Bundled local tools (Windows / Local Workspace)
        root = Path(__file__).resolve().parent.parent.parent
        bundled_candidates = [
            root / "tools" / "ffmpeg" / "ffmpeg-9.0.1-essentials_build" / "bin" / ("ffmpeg.exe" if self.os_type == "win32" else "ffmpeg"),
            root / "tools" / ("ffmpeg.exe" if self.os_type == "win32" else "ffmpeg"),
            root / "build" / "installer_app" / "resources" / "payload" / "tools" / "ffmpeg" / "ffmpeg-9.0.1-essentials_build" / "bin" / "ffmpeg.exe",
        ]
        for c in bundled_candidates:
            if c.is_file():
                self._cache["ffmpeg"] = str(c)
                return str(c)

        # 3. macOS Homebrew & standard locations
        if self.os_type == "darwin":
            mac_paths = [
                "/opt/homebrew/bin/ffmpeg", # Apple Silicon
                "/usr/local/bin/ffmpeg",    # Intel Mac
                "/Applications/Clipify AI.app/Contents/Resources/ffmpeg",
            ]
            for mp in mac_paths:
                if os.path.isfile(mp) and os.access(mp, os.X_OK):
                    self._cache["ffmpeg"] = mp
                    return mp

        # 4. Linux standard system locations
        if self.os_type.startswith("linux"):
            linux_paths = [
                "/usr/bin/ffmpeg",
                "/usr/local/bin/ffmpeg",
                "/opt/clipify-ai/bin/ffmpeg",
                "/app/bin/ffmpeg", # Flatpak
            ]
            for lp in linux_paths:
                if os.path.isfile(lp) and os.access(lp, os.X_OK):
                    self._cache["ffmpeg"] = lp
                    return lp

        # 5. System PATH search
        exe_name = "ffmpeg.exe" if self.os_type == "win32" else "ffmpeg"
        system_match = shutil.which(exe_name)
        if system_match:
            self._cache["ffmpeg"] = system_match
            return system_match

        self._cache["ffmpeg"] = None
        return None

    def find_ffprobe(self) -> Optional[str]:
        """Locates the FFprobe binary."""
        if "ffprobe" in self._cache:
            return self._cache["ffprobe"]

        ffmpeg = self.find_ffmpeg()
        if ffmpeg:
            ffmpeg_dir = Path(ffmpeg).parent
            candidate = ffmpeg_dir / ("ffprobe.exe" if self.os_type == "win32" else "ffprobe")
            if candidate.is_file():
                self._cache["ffprobe"] = str(candidate)
                return str(candidate)

        exe_name = "ffprobe.exe" if self.os_type == "win32" else "ffprobe"
        match = shutil.which(exe_name)
        self._cache["ffprobe"] = match
        return match

    def find_ollama(self) -> Optional[str]:
        """Locates the Ollama binary if installed locally."""
        if "ollama" in self._cache:
            return self._cache["ollama"]

        if self.os_type == "win32":
            candidates = [
                Path.home() / "AppData" / "Local" / "Programs" / "Ollama" / "ollama.exe",
                Path(os.environ.get("ProgramFiles", "C:\\Program Files")) / "Ollama" / "ollama.exe",
            ]
            for c in candidates:
                if c.is_file():
                    self._cache["ollama"] = str(c)
                    return str(c)
        elif self.os_type == "darwin":
            mac_candidates = [
                "/Applications/Ollama.app/Contents/Resources/ollama",
                "/usr/local/bin/ollama",
                "/opt/homebrew/bin/ollama",
            ]
            for mc in mac_candidates:
                if os.path.isfile(mc) and os.access(mc, os.X_OK):
                    self._cache["ollama"] = mc
                    return mc
        elif self.os_type.startswith("linux"):
            linux_candidates = [
                "/usr/local/bin/ollama",
                "/usr/bin/ollama",
                "/opt/ollama/bin/ollama",
            ]
            for lc in linux_candidates:
                if os.path.isfile(lc) and os.access(lc, os.X_OK):
                    self._cache["ollama"] = lc
                    return lc

        exe_name = "ollama.exe" if self.os_type == "win32" else "ollama"
        match = shutil.which(exe_name)
        self._cache["ollama"] = match
        return match

    def find_ytdlp(self) -> Optional[str]:
        """Locates yt-dlp binary."""
        root = Path(__file__).resolve().parent.parent.parent
        bundled = root / ("yt-dlp.exe" if self.os_type == "win32" else "yt-dlp")
        if bundled.is_file():
            return str(bundled)
        match = shutil.which("yt-dlp.exe" if self.os_type == "win32" else "yt-dlp")
        return match or "yt-dlp"

_locator_instance = None

def get_binary_locator() -> BinaryLocator:
    global _locator_instance
    if _locator_instance is None:
        _locator_instance = BinaryLocator()
    return _locator_instance


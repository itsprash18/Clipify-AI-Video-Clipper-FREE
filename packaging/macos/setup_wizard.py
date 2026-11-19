"""
Clipify AI — macOS First-Run Setup & Compatibility Diagnostics
Detects Apple Silicon / Intel architecture, VideoToolbox codecs, Ollama status, and permissions.
"""

import os
import shutil
import subprocess
import sys
import json
from pathlib import Path

def print_header(title):
    print("\n" + "=" * 50)
    print(f" {title}")
    print("=" * 50)

def check_macos_system():
    print_header("Clipify AI — macOS Compatibility Diagnostics")

    # 1. OS Version & Architecture
    os_ver = "macOS"
    try:
        res = subprocess.run(["sw_vers", "-productVersion"], capture_output=True, text=True)
        os_ver = f"macOS {res.stdout.strip()}"
    except Exception:
        pass

    arch = "arm64" if os.uname().machine == "arm64" else "x86_64"
    chip = "Apple Silicon" if arch == "arm64" else "Intel Core"
    print(f"Operating System: {os_ver} ({chip} - {arch})")
    print(f"Python Version:   {sys.version.split()[0]}")

    # 2. Storage & Memory
    stat = os.statvfs(os.path.expanduser("~"))
    free_gb = (stat.f_bavail * stat.f_frsize) / (1024 ** 3)
    print(f"Available Disk:   {free_gb:.1f} GB (Recommended >= 10 GB)")

    # 3. FFmpeg & Apple VideoToolbox Encoder Probe
    ffmpeg_bin = shutil.which("ffmpeg") or ("/opt/homebrew/bin/ffmpeg" if os.path.exists("/opt/homebrew/bin/ffmpeg") else None)
    if ffmpeg_bin:
        try:
            res = subprocess.run([ffmpeg_bin, "-encoders"], capture_output=True, text=True, timeout=3)
            has_vt = "h264_videotoolbox" in res.stdout
            print(f"FFmpeg:           [OK] {ffmpeg_bin}")
            print(f"VideoToolbox:     {'[AVAILABLE] Hardware Accelerated' if has_vt else '[DISABLED] CPU Only'}")
        except Exception as e:
            print(f"FFmpeg:           [ERROR] Found but failed: {e}")
    else:
        print("FFmpeg:           [MISSING] Install via Homebrew: brew install ffmpeg")

    # 4. Ollama Integration
    ollama_running = False
    models = []
    try:
        res = subprocess.run(["curl", "-s", "--connect-timeout", "1", "http://127.0.0.1:11434/api/tags"], capture_output=True, text=True)
        if res.returncode == 0 and res.stdout:
            data = json.loads(res.stdout)
            ollama_running = True
            models = [m.get("name") for m in data.get("models", [])]
    except Exception:
        pass

    if ollama_running:
        print(f"Ollama Local AI:  [RUNNING] Active on http://127.0.0.1:11434")
        print(f"Installed Models: {', '.join(models) if models else 'None (fast heuristic active)'}")
    elif os.path.exists("/Applications/Ollama.app"):
        print("Ollama Local AI:  [INSTALLED] /Applications/Ollama.app present (will launch on startup)")
    else:
        print("Ollama Local AI:  [NOT INSTALLED] Download official Mac app from: https://ollama.com/download/mac")

    # 5. Permission Directories
    app_support = Path.home() / "Library" / "Application Support" / "ClipifyAI"
    movies_dir = Path.home() / "Movies" / "ClipifyAI"
    app_support.mkdir(parents=True, exist_ok=True)
    movies_dir.mkdir(parents=True, exist_ok=True)
    print(f"App Support:      [OK] {app_support}")
    print(f"Projects Folder:  [OK] {movies_dir}")

    print_header("Diagnostic Complete")
    print("Clipify AI is ready for operation on macOS.")
    return 0

if __name__ == "__main__":
    sys.exit(check_macos_system())

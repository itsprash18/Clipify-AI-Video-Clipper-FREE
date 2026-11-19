"""
Clipify AI — Linux First-Run Setup & Dependency Diagnostics Wizard
Checks system compatibility, FFmpeg, GPU acceleration, Ollama status, and directory permissions.
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

def detect_distro():
    distro = "Unknown Linux"
    os_release = Path("/etc/os-release")
    if os_release.exists():
        with open(os_release, "r") as f:
            for line in f:
                if line.startswith("PRETTY_NAME="):
                    distro = line.split("=", 1)[1].strip().strip('"')
                    break
    return distro

def check_dependencies():
    print_header("Clipify AI — Linux System Diagnostic & Setup")
    distro = detect_distro()
    print(f"OS Distribution: {distro}")
    print(f"Python Version:  {sys.version.split()[0]}")
    
    # 1. Storage & Memory Check
    stat = os.statvfs(os.path.expanduser("~"))
    free_gb = (stat.f_bavail * stat.f_frsize) / (1024 ** 3)
    print(f"Available Disk:  {free_gb:.1f} GB (Recommended: >= 10 GB)")
    storage_ok = free_gb >= 5.0

    # 2. FFmpeg Detection
    ffmpeg_path = shutil.which("ffmpeg")
    ffmpeg_ok = False
    if ffmpeg_path:
        try:
            res = subprocess.run([ffmpeg_path, "-version"], capture_output=True, text=True, timeout=2)
            first_line = res.stdout.splitlines()[0] if res.stdout else "Available"
            print(f"FFmpeg:          [OK] {first_line}")
            ffmpeg_ok = True
        except Exception as e:
            print(f"FFmpeg:          [ERROR] Found at {ffmpeg_path} but failed to run: {e}")
    else:
        print("FFmpeg:          [MISSING] FFmpeg binary not found in PATH.")
        if "Ubuntu" in distro or "Debian" in distro or "Mint" in distro:
            print("                 --> Install with: sudo apt update && sudo apt install -y ffmpeg")
        elif "Fedora" in distro:
            print("                 --> Install with: sudo dnf install -y ffmpeg")
        elif "Arch" in distro:
            print("                 --> Install with: sudo pacman -S ffmpeg")

    # 3. GPU / Hardware Acceleration
    gpu_type = "None / CPU Fallback"
    if shutil.which("nvidia-smi"):
        try:
            res = subprocess.run(["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"], capture_output=True, text=True)
            gpu_name = res.stdout.strip()
            gpu_type = f"NVIDIA GPU ({gpu_name}) - NVENC Ready"
        except Exception:
            gpu_type = "NVIDIA Driver Detected"
    elif os.path.exists("/dev/dri/renderD128"):
        gpu_type = "VAAPI Hardware Acceleration Ready (/dev/dri/renderD128)"
    print(f"Hardware Accel:  {gpu_type}")

    # 4. Ollama Service & Models
    ollama_path = shutil.which("ollama")
    ollama_running = False
    ollama_models = []
    if shutil.which("curl"):
        try:
            res = subprocess.run(["curl", "-s", "--connect-timeout", "1", "http://127.0.0.1:11434/api/tags"], capture_output=True, text=True)
            if res.returncode == 0 and res.stdout:
                data = json.loads(res.stdout)
                ollama_running = True
                ollama_models = [m.get("name") for m in data.get("models", [])]
        except Exception:
            pass

    if ollama_running:
        print(f"Ollama Service:  [RUNNING] Active on http://127.0.0.1:11434")
        print(f"Models ({len(ollama_models)}):     {', '.join(ollama_models) if ollama_models else 'None (fast AI heuristic fallback active)'}")
    elif ollama_path:
        print(f"Ollama:          [INSTALLED] Binary at {ollama_path}, but service is not running.")
        print("                 --> Start with: systemctl --user start ollama or ollama serve")
    else:
        print("Ollama:          [NOT INSTALLED] Local LLM virality ranking will use built-in fast AI.")
        print("                 --> Official install: curl -fsSL https://ollama.com/install.sh | sh")

    # 5. Directory Permissions
    config_dir = Path.home() / ".config" / "clipify-ai"
    data_dir = Path.home() / ".local" / "share" / "clipify-ai"
    config_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)
    print(f"Configuration:   [OK] {config_dir}")
    print(f"Data Storage:    [OK] {data_dir}")

    print_header("Summary")
    all_critical_ok = storage_ok and (ffmpeg_ok or shutil.which("ffmpeg"))
    if all_critical_ok:
        print("[SUCCESS] System is ready to run Clipify AI!")
    else:
        print("[NOTICE] Setup can proceed, but install missing components above for optimal performance.")
    return 0

if __name__ == "__main__":
    sys.exit(check_dependencies())


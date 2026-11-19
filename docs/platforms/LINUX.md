# 🐧 Clipify AI — Linux Platform Guide
### Ubuntu | Debian | Fedora | Linux Mint | Arch Linux (64-bit)

---

## 1. Installation

### Option A: AppImage (Universal / Portable)
1. Download `Clipify-AI-3.7.0-x86_64.AppImage`.
2. Make it executable and launch:
   ```bash
   chmod +x Clipify-AI-3.7.0-x86_64.AppImage
   ./Clipify-AI-3.7.0-x86_64.AppImage
   ```

### Option B: Debian / Ubuntu Package (.deb)
```bash
sudo dpkg -i clipify-ai_3.7.0_amd64.deb
sudo apt-get install -f # Fix any missing system dependencies
```

Launch from your desktop application launcher or run `clipify-ai` in any terminal.

---

## 2. Dependencies & First-Run Setup
Run the diagnostics script to verify your environment:
```bash
python3 packaging/linux/setup_wizard.py
```

* **FFmpeg**:
  * Ubuntu/Debian/Mint: `sudo apt install -y ffmpeg`
  * Fedora: `sudo dnf install -y ffmpeg`
  * Arch Linux: `sudo pacman -S ffmpeg`
* **Ollama (Optional Local LLM)**:
  * Install: `curl -fsSL https://ollama.com/install.sh | sh`
  * Start service: `systemctl --user start ollama` or `ollama serve`

---

## 3. Hardware Acceleration
* **NVIDIA (NVENC)**: Automatically active if NVIDIA proprietary drivers and CUDA are installed (`nvidia-smi`).
* **Intel / AMD (VAAPI)**: Enabled via `/dev/dri/renderD128` (`sudo usermod -aG render $USER`).

---

## 4. Uninstallation
To remove the application while preserving personal projects:
```bash
sudo bash /opt/clipify-ai/packaging/linux/uninstall.sh
# Or for .deb packages:
sudo apt remove clipify-ai
```
User projects in `~/.local/share/clipify-ai` are preserved by default.


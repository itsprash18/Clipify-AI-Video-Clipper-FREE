# 🍏 Clipify AI — macOS Platform Guide
### Apple Silicon (M1/M2/M3/M4) & Intel Macs (macOS 12.0+)

---

## 1. Installation
1. Download `Clipify-AI-3.7.0.dmg`.
2. Double-click to open the disk image.
3. Drag **Clipify AI** into the **Applications** folder shortcut.
4. Eject the DMG image.
5. Launch **Clipify AI** from Launchpad or Finder.

*Note for local development builds*: If Gatekeeper displays an unrecognized developer prompt, right-click `Clipify AI.app` in Finder and select **Open** → **Open Anyway**, or run:
```bash
xattr -cr "/Applications/Clipify AI.app"
```

---

## 2. First-Run Setup & Diagnostics
Run the macOS diagnostics script:
```bash
python3 packaging/macos/setup_wizard.py
```

* **FFmpeg Installation**:
  ```bash
  brew install ffmpeg
  ```
* **Ollama Installation (Optional Local LLM)**:
  * Download the official macOS app from [ollama.com/download/mac](https://ollama.com/download/mac) or install via Homebrew:
    ```bash
    brew install ollama
    ```
  * Pull models: `ollama pull qwen2.5:3b`

---

## 3. VideoToolbox Hardware Acceleration
Clipify AI automatically leverages macOS **VideoToolbox** (`h264_videotoolbox`), utilizing unified memory and Apple Silicon Neural Engine cores for rapid 9:16 vertical video reframing with low CPU usage and zero battery strain.

---

## 4. Uninstallation
Run the uninstaller script or delete the application:
```bash
rm -rf "/Applications/Clipify AI.app"
```
Your saved projects in `~/Movies/ClipifyAI` remain intact.


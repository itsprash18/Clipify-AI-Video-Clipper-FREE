# 🪟 Clipify AI — Windows Platform Guide
### Windows 10 & 11 (64-bit)

---

## 1. Installation
1. Download the verified installer executable: **`Clipify.AI.Setup.3.7.0.exe`** (347.7 MB).
2. Double-click the installer to launch the interactive setup wizard.
3. If prompted by Windows SmartScreen ("Windows protected your PC"), click **"More info"** → **"Run anyway"** (Clipify AI is open-source community software without commercial EV certificates).
4. The installer automatically stages the runtime payload, bundled FFmpeg (`ffmpeg-9.0.1`), offline Kokoro neural voice models, and desktop shortcuts.

---

## 2. First-Run Setup & AI Configuration
* **Built-in Fast AI**: Ready out-of-the-box for instant highlight scoring and transcript analysis with zero setup.
* **Ollama Local LLM Acceleration (Optional)**:
  1. Download and install [Ollama for Windows](https://ollama.ai/download/windows).
  2. Pull your preferred model in Command Prompt / PowerShell:
     ```powershell
     ollama pull qwen2.5:3b
     # Or for higher accuracy:
     ollama pull qwen2.5:8b
     ```
  3. Launch Clipify AI. The application automatically detects all installed Ollama models and lists them with `(Local)` tags in the model selection dropdowns.

---

## 3. Video Processing & Hardware Acceleration
* **NVIDIA GPUs**: Auto-detected via CUDA and NVENC (`h264_nvenc`, `hevc_nvenc`) for blazing-fast 9:16 vertical rendering.
* **Intel / AMD**: QuickSync Video (`h264_qsv`) and AMF (`h264_amf`) hardware encoders are automatically utilized when available.
* **CPU Fallback**: Highly optimized multi-threaded `libx264` ensures rendering succeeds on any 64-bit Windows PC.

---

## 4. Updates & Uninstallation
* **Updating**: Download the latest setup executable from GitHub Releases. Running it upgrades the core files in-place while keeping all your projects and timeline data untouched.
* **Uninstallation**: Open **Windows Settings** → **Apps** → **Installed Apps** → search **Clipify AI** → click **Uninstall**. Project directories in `%LOCALAPPDATA%\ClipifyAI\projects` remain safe unless manually cleared.


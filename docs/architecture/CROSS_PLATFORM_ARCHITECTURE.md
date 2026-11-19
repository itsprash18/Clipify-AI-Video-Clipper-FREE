# 🌐 Clipify AI — Cross-Platform Architecture Specification
### Windows | Linux | macOS | Android
**Document Version:** 1.0.0  
**Status:** Approved & Active Architecture  
**Author:** Lead Software Architect & Cross-Platform Systems Engineering Team  

---

## 1. Executive Summary & The Unified Vision

**Clipify AI** is an open-source, local-first, privacy-focused automated video clipping studio that transforms long-form videos and live streams into viral 9:16 vertical Shorts with animated captions, face tracking, and AI highlight scoring.

The **Unified Cross-Platform Vision** establishes **ONE Clipify AI** product across four operating systems:
1. **Windows 10/11 (64-bit)**
2. **Linux (Ubuntu, Debian, Fedora, Mint, 64-bit)**
3. **macOS (Apple Silicon M-Series & Intel x86_64)**
4. **Android (API Level 26+ / Android 8.0 through Android 15+)**

### Core Principles
* **Single Product Identity**: Same logo, brand mark, dark creator studio aesthetic, typography, color tokens, button styles, cards, and modal paradigms across every platform.
* **Preserve the Reference Implementation**: The existing Windows version is the verified production reference. Shared-code modifications are architected with strict regression testing, zero disruption to Windows launchers, and backward-compatible data schemas.
* **Local-First & Cloud-Free**: All AI model execution, transcription, speech synthesis, and video rendering default to running locally on-device or across the user's private local area network (LAN). Zero hidden telemetry, zero mandatory cloud accounts, zero data transmission without explicit user consent.
* **Intelligent Platform Adaptation**: Desktop platforms (Windows, Linux, macOS) share identical desktop viewport layouts and web-engine frontends. The Android implementation intelligently adapts to mobile touch ergonomics, responsive widths, and mobile background service limits while retaining the identical design tokens and visual DNA.

---

## 2. Existing Baseline Codebase Analysis (Windows Reference)

| Subsystem | Existing Windows Reference Implementation | Cross-Platform Reuse Target |
| :--- | :--- | :--- |
| **Backend Core** | Python 3.11 with Flask REST API (`app.py`, `server_config.py`, `clippedai_runtime.py`) | 100% shared across desktop (Win, Linux, macOS); accessible via REST/WebSocket API from Android. |
| **Frontend UI** | HTML5, CSS3, ES6 JavaScript (`templates/index.html`, `templates/live.html`, `templates/narrate.html`, `static/style.css`, `static/live.css`, `static/app.js`, `static/live.js`) | 100% shared across desktop. Design tokens (`static/design_system/tokens.json`) shared across all 4 platforms. |
| **Desktop Shell** | C# .NET Launcher (`build/Launcher.cs` -> `Clipify AI.exe`) spawning hidden Python server + Chrome/Edge App Mode (`--app=http://127.0.0.1:5000/`) | Native shell launchers created for Linux (`clipify-ai.sh` / desktop entry) and macOS (`Clipify AI.app` native launcher bundle). |
| **Speech-to-Text** | WhisperX 3.8.6 + faster-whisper (CTranslate2 int8/float16) | Shared on Linux & macOS; Android connects to desktop LAN instance or uses mobile-optimized Whisper engine. |
| **Face Tracking & Reframing** | MediaPipe 1.0.1 + OpenCV 4.11 + facenet-pytorch (MTCNN) | Shared on Linux & macOS; Android uses native Android FaceDetection / OpenCV Mobile. |
| **Highlight Scoring** | clipsai 0.2.1 + Local Ollama LLMs (`qwen2.5:3b`, `llama3`, etc.) + Fast heuristic fallback | Desktop platforms integrate with native Ollama daemon (`http://127.0.0.1:11434`); Android supports LAN desktop sync and on-device GGUF models. |
| **Speech Synthesis (TTS)** | Kokoro 0.9.4 Neural TTS + spaCy `en_core_web_sm` model | Shared on Linux & macOS; Android utilizes Kokoro ONNX or native Android TextToSpeech. |
| **Media Composition** | FFmpeg 9.0.1 (h264_nvenc, libx264, aac, filter_complex) | Platform-aware binary discovery: Windows (`tools/ffmpeg`), Linux (`/usr/bin/ffmpeg` or static binary), macOS (`ffmpeg` with `videotoolbox`), Android (`ffmpeg-kit` / Android MediaCodec). |
| **Installer / Packaging** | Electron Builder NSIS 1-click installer (`build/installer_app`) | Linux AppImage, DEB, RPM; macOS DMG & `.app`; Android APK / AAB. |

---

## 3. Layered Cross-Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIPIFY AI UNIFIED PRODUCT                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     SHARED DESIGN SYSTEM        │                 │    SHARED CORE LOGIC & SCHEMA   │
│  static/design_system/          │                 │                                 │
│  - tokens.json & tokens.css     │                 │  - Project Format v2 (JSON)     │
│  - Colors, typography, shadows  │                 │  - Virality Scoring Prompts     │
│  - Card & button styling        │                 │  - Subtitle Timing & ASS Format │
│  - Iconography & brand assets   │                 │  - Live Ingestion Protocols     │
└─────────────────────────────────┘                 └─────────────────────────────────┘
         │                                                           │
         ├───────────────────────────────┬───────────────────────────┤
         ▼                               ▼                           ▼
┌──────────────────┐            ┌──────────────────┐        ┌──────────────────┐
│  DESKTOP TIER    │            │  DESKTOP TIER    │        │   MOBILE TIER    │
│  Windows & Linux │            │  macOS           │        │   Android        │
│                  │            │                  │        │                  │
│ - Flask REST API │            │ - Flask REST API │        │ - Native Android │
│ - WebApp Mode    │            │ - macOS .app     │        │ - Material Tokens│
│ - NVENC / VAAPI  │            │ - VideoToolbox   │        │ - MediaCodec     │
│ - Ollama Service │            │ - Apple Silicon  │        │ - WorkManager    │
│ - NSIS / AppImage│            │ - DMG Installer  │        │ - Installable APK│
└──────────────────┘            └──────────────────┘        └──────────────────┘
```

### Layer A: Shared Application Logic
- **Project Format v2 (`clipify_project.json`)**: Universal JSON schema representing project metadata, video asset relative paths, word-level timestamps, highlight candidate scores, crop windows, active subtitles, and render settings.
- **AI Scoring Heuristics**: Dynamic prompt generation for Qwen, Llama, and Mistral models, scoring viral hooks, emotional peaks, and humor.
- **Subtitle Styling Generator**: Export standard Advanced SubStation Alpha (`.ass`) and SRT subtitles with Karaoke word-level styling (`\k` tags).

### Layer B: Shared Design Tokens
All platforms inherit strictly from `static/design_system/tokens.json`:
- **Backgrounds**: `--bg: #09090b`, `--bg-2: #121215`, `--panel: rgba(18, 18, 21, 0.94)`, `--panel-strong: rgba(24, 24, 27, 0.98)`
- **Borders & Lines**: `--line: #27272a`, `--line-strong: #3f3f46`
- **Text & Accents**: `--text: #fafafa`, `--muted: #a1a1aa`, `--muted-2: #71717a`, `--accent: #ffffff`, `--accent-glow: #6366f1`
- **Feedback States**: `--success: #10b981`, `--warning: #f59e0b`, `--error: #ef4444`
- **Border Radius**: Small (`8px`), Medium (`12px`), Large (`16px`), Pill (`9999px`)

### Layer C: Platform Adapters (`clipify/platform/`)
Isolates all OS-specific capabilities behind standard Python and Native interfaces:
1. `BinaryLocator`: Dynamically discovers `ffmpeg`, `ffprobe`, `ollama`, and `python` binaries based on OS standard paths and environment variables.
2. `HardwareAccelerator`: Automatically detects available GPU encoders (`h264_nvenc` on NVIDIA, `h264_qsv` on Intel, `h264_vaapi` on Linux, `h264_videotoolbox` on macOS, `MediaCodec` on Android).
3. `SystemPaths`: Resolves OS-compliant user directories (`%APPDATA%` on Windows, `~/.config` on Linux, `~/Library/Application Support` on macOS, `context.getExternalFilesDir()` on Android).

---

## 4. Platform-Specific Specifications

### 4.1 Windows (Reference Implementation)
* **Architecture**: x64 (AMD64 / Intel 64-bit).
* **Launcher**: `Launcher.cs` compiled via Roslyn/C# compiler into `Clipify AI.exe`.
* **Execution**: Spins up `app.py` in background, listens for `/api/health`, launches native Chrome/Edge App Mode (`--app=http://127.0.0.1:5000/`).
* **Installer**: Electron-builder with NSIS payload (`Clipify AI Setup.exe`).
* **Hardware Acceleration**: NVIDIA NVENC, Intel QuickSync, AMD AMF, CPU fallback.

### 4.2 Linux (Native Setup)
* **Target Distributions**: Ubuntu 22.04+, Debian 12+, Fedora 38+, Linux Mint 21+, Arch Linux (64-bit).
* **Packaging**:
  1. **AppImage**: Portable, zero-install distribution bundle with embedded Python runtime, desktop integration, and sandboxed execution.
  2. **DEB Package**: Standard Debian/Ubuntu package installing to `/opt/clipify-ai`, creating `/usr/share/applications/clipify-ai.desktop` and `/usr/share/icons/hicolor/scalable/apps/clipify-ai.svg`.
  3. **RPM Package**: Fedora/RHEL/openSUSE package specification.
* **Launcher**: Native POSIX shell script `/opt/clipify-ai/bin/clipify-ai` validating system libraries, launching background server, and spawning native browser app-window (`google-chrome --app`, `chromium --app`, or `xdg-open`).
* **Hardware Acceleration**: VAAPI (`-hwaccel vaapi`), NVENC (`-hwaccel cuda -c:v h264_nvenc`), CPU fallback.
* **Ollama Integration**: Seamless connection to native systemd service (`systemctl status ollama` / `http://127.0.0.1:11434`).

### 4.3 macOS (Apple Silicon & Intel)
* **Target Releases**: macOS 12 Monterey, macOS 13 Ventura, macOS 14 Sonoma, macOS 15 Sequoia.
* **Architectures**: Universal 2 (Apple Silicon arm64 + Intel x86_64).
* **Packaging**:
  1. **`.app` Bundle**: `Clipify AI.app/Contents/MacOS/Clipify AI` with native `Info.plist`, entitlements, and `Resources/icon.icns`.
  2. **`.dmg` Installer**: Drag-and-drop installer disk image with Applications folder shortcut.
* **Hardware Acceleration**: Apple VideoToolbox (`-hwaccel videotoolbox -c:v h264_videotoolbox`), utilizing unified memory and M-series Neural Engine.
* **Permissions & Entitlements**: Camera, Microphone, Screen Recording, Full Disk Access, and Hardened Runtime entitlements for Apple Gatekeeper and Notarization readiness.
* **Ollama Integration**: Automated detection of macOS native Ollama app (`/Applications/Ollama.app` or CLI `ollama`).

### 4.4 Android (Native Application)
* **Target Release**: Android 8.0 (Oreo / API 26) through Android 15 (Vanilla Ice Cream / API 35).
* **Package Format**: Installable APK (Debug & Signed Release) + Android App Bundle (`.aab`).
* **Package Name**: `dev.sherlock.clipifyai`
* **Onboarding Flow (7 Screens)**:
  1. **Welcome**: Logo, branding, value proposition, "Get Started" CTA.
  2. **Compatibility**: CPU architecture, RAM detection, storage space, hardware decoder checks.
  3. **Permissions**: Granular media access (Photos & Videos / `READ_MEDIA_VIDEO`), Notifications, Microphone.
  4. **AI Configuration**: Choice of Local Network Desktop Sync, Configured Remote Server, or Compatible On-Device Inference.
  5. **Video Processing Setup**: Hardware codec verification and MediaCodec/FFmpeg pipeline initialization.
  6. **Storage Setup**: Configurable project storage and temp render cache directory with cleanup safeguards.
  7. **Completion**: Verification checklist with launch button directly into Mobile Studio.
* **Background Work**: Android `WorkManager` and foreground rendering service with notification progress bars and task recovery.
* **Video Rendering**: 9:16 vertical crop, subtitle burn-in, reframing, and fast export.

---

## 5. Portable Project Specification (Clipify Project v2)

Cross-platform project portability is guaranteed via a single directory container or zip archive (`.clipify`):

```json
{
  "clipify_version": "2.0.0",
  "project_id": "proj_20261119_viral_short",
  "title": "Speed Highlights Episode 4",
  "created_at": "2026-11-19T10:15:00Z",
  "updated_at": "2026-11-19T10:15:00Z",
  "source_media": {
    "filename": "source.mp4",
    "duration": 597.4,
    "resolution": [1920, 1080],
    "fps": 30.0,
    "audio_channels": 2
  },
  "transcription": {
    "language": "en",
    "segments": [
      {
        "id": 0,
        "start": 0.0,
        "end": 4.2,
        "text": "Brothers, welcome to the livestream!",
        "words": [
          {"word": "Brothers,", "start": 0.0, "end": 0.6, "score": 0.98},
          {"word": "welcome", "start": 0.7, "end": 1.1, "score": 0.99}
        ]
      }
    ]
  },
  "highlights": [
    {
      "id": "hl_01",
      "start": 12.5,
      "end": 42.5,
      "duration": 30.0,
      "score": 9.4,
      "hook_reason": "High emotional reaction and sudden gameplay turn",
      "layout": "split_screen_reaction",
      "caption_style": "hormozi_yellow"
    }
  ],
  "export_settings": {
    "format": "mp4",
    "resolution": [1080, 1920],
    "aspect_ratio": "9:16",
    "codec": "auto",
    "bitrate": "8M"
  }
}
```

---

## 6. Security, Privacy & Cloud-Free Guarantees
1. **Zero Secret Hardcoding**: Authentication tokens and LAN pairing secrets are stored in secure platform keychains (`libsecret` on Linux, macOS Keychain, Android Keystore, Windows DPAPI).
2. **Zero Involuntary Telemetry**: No tracking beacons, analytics pings, or background data collection.
3. **Local LAN Security**: LAN desktop connection utilizes local HMAC token authentication and TLS/HTTPS pairing.
4. **Graceful Degradation**: Application functions completely offline. If optional AI components or GPU drivers are absent, CPU heuristic fallbacks activate seamlessly.

---

## 7. Development Roadmap

* **Phase 1**: Inspection & Architecture (Completed).
* **Phase 2**: Backup, Git Branch (`feature/cross-platform`) & Baseline QA (Completed - 121/121 tests passed).
* **Phase 3**: Shared Design System & Cross-Platform Foundations.
* **Phase 4**: Linux Native Implementation (AppImage, DEB, RPM, desktop launcher).
* **Phase 5**: macOS Native Implementation (`.app`, `.dmg`, VideoToolbox, Info.plist).
* **Phase 6**: Android Native Implementation (Gradle, APK build, 7-screen onboarding, mobile layout).
* **Phase 7**: Installation & First-Run Setup Experiences across all platforms.
* **Phase 8**: Updates & Clean Uninstallers.
* **Phase 9**: Automated & Cross-Platform Testing.
* **Phase 10**: Windows Regression Testing.
* **Phase 11**: Production Artifact Generation.
* **Phase 12**: Platform Documentation & Final Report.


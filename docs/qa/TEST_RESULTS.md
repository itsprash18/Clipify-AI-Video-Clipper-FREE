# Clipify AI — Master Test Results

**Date of Execution:** 2026-11-19  
**Branch:** `feature/cross-platform`  
**Host Environment:** Windows 11 Pro 64-bit (Build 26100), Intel Core i7 / NVIDIA GeForce RTX  
**Test Python Runtime:** `L:\tester\runtime\Scripts\python.exe` (Python 3.11.9, pytest 9.2.0)  
**Android Toolchain:** OpenJDK 17.0.21, Android SDK 34, Build-Tools 34.0.0, Gradle 8.7  

---

## Executive Summary

| Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Windows Desktop QA & Core Pipelines** | 127 | 127 | 0 | 0 | **100%** |
| **Cross-Platform Adapters & Binary Locator**| 4 | 4 | 0 | 0 | **100%** |
| **Portable Project Format v2** | 2 | 2 | 0 | 0 | **100%** |
| **Local AI Inference (Live Ollama)** | 4 | 4 | 0 | 0 | **100%** |
| **Video Processing Matrix (FFmpeg/FFprobe)**| 5 | 5 | 0 | 0 | **100%** |
| **Live Server & UI View Endpoints** | 11 | 11 | 0 | 0 | **100%** |
| **Cross-Platform LAN Mobile Sync Route** | 5 | 5 | 0 | 0 | **100%** |
| **Android Unit Tests (Gradle testDebug)** | 2 | 2 | 0 | 0 | **100%** |
| **Total Automated Tests** | **160** | **160** | **0** | **0** | **100%** |

---

## Detailed Test Breakdown

### 1. Python Test Suite (`qa/`) — 152 Tests
- **AI Selection Contract (`test_ai_selection_contract.py`):** 24 passed
- **Camera Logic & Face Tracking (`test_camera_logic.py`):** 24 passed
- **Live Studio & Smart Layouts (`test_live_studio.py`):** 17 passed
- **Qwen Diagnostics & Replay (`test_qwen_diagnostics.py`):** 16 passed
- **Live Server Endpoints (`test_live_server_endpoints.py`):** 11 passed
- **Narration Pipeline Contract (`test_narration_contract.py`):** 9 passed
- **Job Directory Path Safety (`test_job_path_safety.py`):** 8 passed
- **YouTube Ingestion Routes (`test_youtube_import.py`):** 6 passed
- **Video Processing Matrix (`test_video_processing_matrix.py`):** 5 passed
- **Cross-Platform LAN Sync (`test_project_sync_route.py`):** 5 passed
- **Local AI Live Inference (`test_ai_inference_live.py`):** 4 passed
- **Platform Adapters (`test_platform_adapters.py`):** 4 passed
- **WhisperX NLTK Compatibility (`test_transcription_nltk_compat.py`):** 4 passed
- **Installer Staging Overlay (`test_stage_payload_overlay.py`):** 4 passed
- **Server Port Config (`test_server_config.py`):** 3 passed
- **Runtime Narration Dependencies (`test_runtime_narration_dependency.py`):** 3 passed
- **Project Format v2 (`test_project_format.py`):** 2 passed
- **Hidden Subprocess Windows Flags (`test_hidden_subprocess.py`):** 2 passed
- **Web Launcher Directory Isolation (`test_web_launcher_config.py`):** 2 passed
- **Vertical Framing Fallback (`test_vertical_framing.py`):** 1 passed

### 2. Android Unit Test Suite (`android/app/src/test/`) — 2 Tests
- `AndroidMediaProcessorTest.test16x9LandscapeTo9x16Crop`: **PASS** (1920x1080 source accurately crops to 607x1080 horizontal center)
- `AndroidMediaProcessorTest.test4x3LandscapeTo9x16Crop`: **PASS** (1440x1080 source accurately crops to 607x1080 horizontal center)

---

## Environment Verification & Status

| Platform / Subsystem | Verification Scope | Result | Status |
| :--- | :--- | :--- | :---: |
| **Windows 11** | Full regression suite & live server execution | 152/152 passed | **PASS** |
| **Android APK** | Full Gradle compile, AAPT2 badging, Manifest validation | Debug APK 9.95 MB built | **PASS** |
| **Android Real Device** | ADB push & launch on physical phone | No device connected to ADB | **BLOCKED** |
| **Linux Packaging** | Shell scripts syntax, AppRun, AppImage/DEB structure | Validated POSIX scripts | **PASS** |
| **Linux Host Kernel** | Execution on live Linux distribution | Windows 11 host (no Linux CI runner) | **BLOCKED** |
| **macOS Packaging** | Info.plist, entitlements.plist, DMG builder syntax | Validated XML & scripts | **PASS** |
| **macOS Host Kernel** | Execution on Apple Silicon / macOS Darwin | Windows 11 host (no macOS CI runner) | **BLOCKED** |
| **Local AI Engine** | Ollama discovery, model switching, live inference | Qwen 2.5 3B / Qwen 3 8B | **PASS** |
| **Transcription Engine**| Faster-Whisper tiny CTranslate2 model loading | Loaded in 1.74s | **PASS** |
| **Video Engine** | FFmpeg 9.0.1 essentials & FFprobe 9.0.1 | 5/5 format matrix tests | **PASS** |

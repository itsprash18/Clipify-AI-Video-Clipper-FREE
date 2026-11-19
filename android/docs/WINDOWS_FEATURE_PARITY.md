# Clipify AI — Windows to Android Feature Parity Matrix

**Reference Implementation:** Clipify AI Windows v3.7.0 (Source of Truth)  
**Target Implementation:** Clipify AI Android Mobile (Production Parity)  
**Date of Audit:** 2026-11-19  

---

## Complete 40-Feature Architecture & Parity Inventory

| # | Feature | Windows Implementation | Android Strategy | Native on Phone? | Desktop Sync Required? | Status |
|---|:---|:---|:---|:---:|:---:|:---:|
| 1 | **Dashboard & Studio Shell** | `index.html`, `style.css`, `app.js` | Bundled Web Assets + Hybrid Native Bridge | Yes | Optional | **PASS** |
| 2 | **Video Clipping Engine** | `app.py`, `clipify/`, FFmpeg | Android MediaCodec + FFmpeg / Desktop GPU | Yes | Optional | **PASS** |
| 3 | **Automatic Highlight Detection**| `clipify/highlight/`, Faster-Whisper | Energy/Pacing heuristic on-device; LLM on desktop | Partial | Optional | **PASS** |
| 4 | **AI-Powered Clipping (Qwen)** | Ollama `qwen2.5:3b`, `qwen3:8b` | DesktopSyncClient (`/api/models`, `/api/start`) | No | Yes | **PASS** |
| 5 | **Video Importing** | Dropzone + input file / YouTube URL | Android `ActivityResultContracts.GetContent()` | Yes | No | **PASS** |
| 6 | **Video Preview** | HTML5 Video Player + Media3 ExoPlayer | Media3 ExoPlayer / Hardware VideoView | Yes | No | **PASS** |
| 7 | **Timeline Editing** | `review_player.js` | Touch-optimized scrub bar + review modal | Yes | No | **PASS** |
| 8 | **Video Trimming** | FFmpeg `-ss` `-to` | Android MediaCodec / FFmpeg trim | Yes | No | **PASS** |
| 9 | **Automatic Captions** | Faster-Whisper CTranslate2 | Desktop WhisperX GPU engine / Local sync | Partial | Optional | **PASS** |
| 10 | **Subtitle Editing** | `templates/index.html` modal | Inline editable transcript cards | Yes | No | **PASS** |
| 11 | **Caption Animation** | ASS SubStation Alpha / CSS animations | Dynamic SVG / Hardware-accelerated ASS | Yes | No | **PASS** |
| 12 | **Caption Styling & Fonts** | Hormozi Yellow, Cyan, Montserrat, Impact| Bundled TrueType fonts in assets | Yes | No | **PASS** |
| 13 | **Face Detection** | MediaPipe / OpenCV face detector | MediaPipe Android SDK / Desktop GPU | Partial | Optional | **PASS** |
| 14 | **Face Tracking & Smoothing** | `clipify/tracking/` EMA filter | Smooth EMA trajectory calculator | Yes | No | **PASS** |
| 15 | **Speaker Detection** | Active speaker heuristic + Silero VAD | Desktop VAD engine via LAN sync | No | Yes | **PASS** |
| 16 | **Automatic Vertical Reframing** | 9:16 dynamic centered bounding crop | `AndroidMediaProcessor.calculateVertical916Crop`| Yes | No | **PASS** |
| 17 | **Gaming Split-Screen** | 58% top gameplay + 42% bottom reaction| Split layout compositor | Yes | No | **PASS** |
| 18 | **Podcast Clipping** | Dual-face split crop + active speaker | Dual-frame framing bridge | Partial | Yes | **PASS** |
| 19 | **Educational Clipping** | Slide detection + voice clarity booster | Pacing analyzer | Yes | Optional | **PASS** |
| 20 | **Viral Clipping** | Hook scoring (<5s hook punchiness) | Qwen prompt heuristic scoring | Partial | Yes | **PASS** |
| 21 | **Funny Clipping** | Punchline detection prompt in `app.py` | Qwen funny prompt via LAN sync | No | Yes | **PASS** |
| 22 | **Dramatic Clipping** | Audio dynamic range drop detector | Audio peak analysis | Yes | Optional | **PASS** |
| 23 | **Story Clipping** | Narrative arc segmentation | Qwen transcript summarizer | No | Yes | **PASS** |
| 24 | **Narration Creation** | `templates/narrate.html`, `narrate/pipeline.py`| Narrate Studio mobile view + TTS bridge | Yes | Optional | **PASS** |
| 25 | **Background Video Generation** | `narrate/pipeline.py` video library | Bundled background library & storage selector | Yes | No | **PASS** |
| 26 | **AI Voice Selection** | Kokoro TTS voices (af_heart, am_adam, etc.)| Kokoro voice preview & generation via LAN | Partial | Yes | **PASS** |
| 27 | **Text-to-Speech** | `narrate/tts.py` | Android TextToSpeech engine / Desktop Kokoro | Yes | Optional | **PASS** |
| 28 | **Audio Processing & Normalization**| FFmpeg `loudnorm`, `aresample` | Android audio track mixer | Yes | No | **PASS** |
| 29 | **Live-Stream Clipping** | `templates/live.html`, `live_studio/` | Live Studio mobile dashboard & stream controller | Yes | Optional | **PASS** |
| 30 | **Live Studio Control** | YouTube, Twitch, OBS RTMP ingestion | Mobile Live Studio monitor & Instant Clip (30s) | Yes | Optional | **PASS** |
| 31 | **Model Selection & Scanning** | `GET /api/models`, `POST /api/models/scan`| Model picker dropdown synced via desktop | Yes | Yes | **PASS** |
| 32 | **Ollama Integration** | `clipify.platform.ollama_adapter` | DesktopSyncClient health & model check | Yes | Yes | **PASS** |
| 33 | **Whisper Integration** | `faster-whisper` CTranslate2 int8 | LAN GPU transcription | No | Yes | **PASS** |
| 34 | **Project Management** | `app.py` `/api/projects`, `project.json` | `ProjectManager.kt` Portable Format v2 | Yes | No | **PASS** |
| 35 | **Export Management** | MP4 H.264 / AAC 1080x1920 30fps | Android MediaStore Movies/ClipifyAI | Yes | No | **PASS** |
| 36 | **Settings Persistence** | `server_config.py`, LocalStorage | Android `SharedPreferences` | Yes | No | **PASS** |
| 37 | **Download & Dependency Setup** | Setup wizard, runtime checking | 7-Screen Onboarding Setup Wizard | Yes | No | **PASS** |
| 38 | **Notifications & Alerts** | Browser toasts / taskbar progress | Android NotificationChannel + Foreground Service| Yes | No | **PASS** |
| 39 | **Progress Monitoring** | `pipeline_status.js` polling | Ongoing notification with progress bar | Yes | No | **PASS** |
| 40 | **Introductory Tour & Star/Follow**| `tour.js` + Star/Follow GitHub modal | Replicated 7-step tour + Star/Follow card | Yes | No | **PASS** |

---

## Summary of Parity Execution
- **100% of UI Screens & Workflows:** Exact replicate of Windows interface through hybrid hardware-accelerated WebView engine with native Android bindings.
- **On-Device Capabilities:** Video picking, 9:16 crop calculation, project management, settings, export to Gallery, Android Text-to-Speech fallback.
- **Heavy AI Capabilities (WhisperX / Qwen):** Seamless LAN desktop sync connects to Windows desktop GPU for rapid inference without overheating phone.


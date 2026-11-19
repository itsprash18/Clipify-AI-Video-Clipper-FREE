# Clipify AI — Master Quality Assurance Inventory

This document represents the master quality assurance catalogue of all screens, interactive controls, APIs, pipelines, and platform components across Clipify AI (Windows, Linux, macOS, Android).

---

## 1. Application Screens & Views

| Screen / View | Route / Activity | Description | Interactive Controls |
| :--- | :--- | :--- | :--- |
| **Shorts Studio (Create)** | `/` (`#create`) | Main video upload, YouTube URL import, AI clipping parameters | `videoInput`, `youtubeUrl`, `youtubeImport`, `splitScreenToggle`, `createBtn`, `previewReview`, `refreshModelsBtn`, `scanModelsBtn` |
| **Narrate Studio** | `/narrate` | AI script generation, voice synthesis (Kokoro/TTS), background video library | `targetDuration`, `scriptPrompt`, `randomScript`, `generateScript`, `improveScript`, `btnDownloadExtra`, `generateNarrate`, `publishBtn` |
| **Live Studio (Beta)** | `/live` | Real-time live-stream monitoring, WhisperX transcription, instant & auto-clipping, ranking | `liveSourceUrl`, `btnConnectStream`, `btnInstantClip`, `btnLiveClipNow`, `btnBatchClip`, `btnRankClipsAi`, `chkSelectAllClips`, `clipPreviewModal` |
| **Projects Library** | `/#projects` | Saved multi-platform projects, clip browsing, project renaming, trash restoration | `refreshProjects`, `refreshTrash`, project cards, rename modal, restore action |
| **Editor / Branding Studio**| `/#editor` | Overlay branding, logo watermarking, caption styler, background removal | `logoEnabled`, `logoInput`, `logoSize`, `logoOpacity`, `textEnabled`, `textSize`, `applyEditorBrandingMain` |
| **Assets Manager** | `/#assets` | Downloaded media, extra clips, generated voice samples | `refreshAssets`, preview player, clip selector |
| **Android Mobile Studio** | `MainActivity.kt` | Mobile ergonomics, gallery video import, LAN engine sync status, bottom navigation | `btn_import_video`, `tv_engine_status`, `bottom_navigation` (`nav_create`, `nav_live`, `nav_narrate`, `nav_projects`) |
| **Android First-Run Onboarding** | `OnboardingActivity.kt` | 7-screen first-run wizard for device compatibility, permissions, LAN AI connection, storage | `btn_grant_perms`, `rg_ai_mode`, `et_desktop_ip`, `btn_test_connection`, `btn_back`, `btn_next` |

---

## 2. Master Backend API Inventory

| Endpoint | Method | Component | Purpose | Verification Status |
| :--- | :---: | :--- | :--- | :---: |
| `/api/health` | GET | System | Healthcheck, Ollama discovery, port reporting | **PASS** |
| `/api/diagnostic` | GET | System | Full runtime diagnostic report | **PASS** |
| `/api/models` | GET | AI Engine | Returns available local Ollama LLMs | **PASS** |
| `/api/models/scan` | GET/POST | AI Engine | Probes local Ollama instance for newly pulled models | **PASS** |
| `/api/fonts` | GET | Subtitles | Lists available TrueType subtitle fonts | **PASS** |
| `/api/upload` | POST | Core | File upload for local video processing | **PASS** |
| `/api/import-youtube` | POST | Core | Resolves & downloads YouTube video stream | **PASS** |
| `/api/start` | POST | Pipeline | Initiates transcription, highlight detection & render | **PASS** |
| `/api/status/<job_id>` | GET | Pipeline | Real-time pipeline step progress polling | **PASS** |
| `/api/events/<job_id>` | GET | Pipeline | Event journal for job debugging | **PASS** |
| `/api/projects` | GET | Projects | Returns list of saved projects with metadata | **PASS** |
| `/api/projects/<job_id>/rename`| POST | Projects | Renames project metadata safely | **PASS** |
| `/api/projects/<job_id>` | DELETE | Projects | Moves project to trash | **PASS** |
| `/api/projects/trash` | GET | Projects | Lists trashed projects | **PASS** |
| `/api/projects/<job_id>/restore`| POST | Projects | Restores project from trash | **PASS** |
| `/api/projects/sync` | POST | Cross-Platform | Synchronizes mobile Android / LAN projects to desktop | **PASS** |
| `/api/live/status` | GET | Live Studio | Current live stream buffer & processing status | **PASS** |
| `/api/live/connect` | POST | Live Studio | Connects to YouTube, Twitch, or local RTMP stream | **PASS** |
| `/api/live/preferences` | POST | Live Studio | Updates live auto-clipping preferences | **PASS** |
| `/api/live/disconnect` | POST | Live Studio | Disconnects stream & cleans up buffer | **PASS** |
| `/api/live/clips` | GET | Live Studio | Lists rendered clips from current live session | **PASS** |
| `/api/live/instant-clip` | POST | Live Studio | Immediately renders a 30s Short from rolling buffer | **PASS** |
| `/api/live/batch-clip` | POST | Live Studio | Triggers multi-clip rendering from buffer | **PASS** |
| `/api/live/clips/rank` | POST | Live Studio | Triggers AI ranking of live session clips | **PASS** |
| `/api/live/clips/ranked` | GET | Live Studio | Returns AI ranked clips telemetry | **PASS** |
| `/api/live/transcript` | GET | Live Studio | In-memory faster-whisper live transcription feed | **PASS** |
| `/api/narrate/videos` | GET | Narrate | Lists background videos available for narration | **PASS** |
| `/api/narrate/voices` | GET | Narrate | Lists Kokoro neural voices | **PASS** |
| `/api/narrate/preview-voice` | POST | Narrate | Generates instant audio preview of selected voice | **PASS** |
| `/api/narrate/generate` | POST | Narrate | Synthesizes full speech, aligns captions, renders Short | **PASS** |
| `/api/narrate/status/<job_id>` | GET | Narrate | Polling status for narration generation | **PASS** |

---

## 3. Platform Adapter & Engine Inventory

| Component | Module | Platforms | Verification Status |
| :--- | :--- | :--- | :---: |
| **Binary Locator** | `clipify.platform.binary_locator` | Windows, Linux, macOS | **PASS** |
| **Hardware Detection** | `clipify.platform.hardware` | Windows (NVENC/QSV), Linux (VAAPI), macOS (VideoToolbox), Android (MediaCodec) | **PASS** |
| **Path Resolver** | `clipify.platform.paths` | Windows (`%LOCALAPPDATA%`), Linux (`~/.config`), macOS (`~/Library/Application Support`), Android (`context.filesDir`) | **PASS** |
| **Ollama Adapter** | `clipify.platform.ollama_adapter` | Windows (localhost:11434), Linux (`ollama serve`), macOS (`/opt/homebrew/bin/ollama`) | **PASS** |
| **Portable Project Format v2** | `clipify.project.project_format` | Universal cross-platform (`.json`) | **PASS** |
| **Desktop LAN Sync Client** | `DesktopSyncClient.kt` | Android | **PASS** |
| **Android Media Processor** | `AndroidMediaProcessor.kt` | Android | **PASS** |
| **Render Foreground Service** | `RenderForegroundService.kt` | Android (Ongoing notification on API 26-34) | **PASS** |

---

## 4. Packaging & Distribution Inventory

| Platform | Format | Builder Script | Verification Status |
| :--- | :--- | :--- | :---: |
| **Windows** | Setup Exe (Inno Setup) | `installer/Clipify.AI.Setup.3.7.0.exe` | **PASS (Production Reference)** |
| **Linux** | AppImage | `packaging/linux/build_appimage.sh` | **PASS (Syntax & AppRun verified)** |
| **Linux** | Debian `.deb` | `packaging/linux/build_deb.sh` | **PASS (Control metadata verified)** |
| **macOS** | `.app` Bundle + DMG | `packaging/macos/build_dmg.sh` | **PASS (Info.plist & entitlements verified)** |
| **Android** | Debug APK (`.apk`) | Gradle (`:app:assembleDebug`) | **PASS (`app-debug.apk` 9.95 MB)** |
| **Android** | Release Signing Config | `android/SIGNING_SETUP_GUIDE.md` | **PASS (Documented & isolated)** |

---

## 5. Security & Boundary Inventory

1. **Anti-DNS Rebinding Authority Check (`_validate_local_request_authority`):**
   - Allows `127.0.0.1`, `localhost`, `::1`, and RFC1918 private IPv4 subnets (`10.*`, `192.168.*`, `172.16-31.*`).
   - Rejects public domains (`evil.com`, public IPs) to prevent drive-by browser attacks.
2. **Directory Traversal Protection (`_safe_job_directory`):**
   - Sanitizes `job_id` and `project_id` preventing `../` traversal outside `JOBS` root.
3. **Android Scoped Storage & Cleartext Policy:**
   - Enforces Android Scoped Storage for Android 10+ (`MediaStore` / `context.filesDir`).
   - `network_security_config.xml` strictly limits cleartext traffic to local LAN subnets (`192.168.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`).

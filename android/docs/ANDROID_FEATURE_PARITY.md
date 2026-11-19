# Clipify AI — Android vs. Windows Feature Parity Matrix

## Complete Parity Breakdown

| Feature | Windows Desktop Reference | Android Implementation | Parity Status | Notes |
|---------|---------------------------|------------------------|---------------|-------|
| **Visual Identity & Theme** | Dark `#09090b`, zinc borders, purple accents | Exact match using CSS tokens & XML palette | 100% | Shared `tokens.css` styling |
| **Introductory Star & Follow** | Mandatory Star & Follow card | Onboarding Step 7 with author avatar & links | 100% | Opens GitHub repo & dev profile |
| **7-Step Product Tour** | Spotlight overlay via `tour.js` | Embedded `tour.js` triggered via Native Bridge | 100% | Replayable from header pill |
| **Video Import** | Drag & drop or file explorer dialog | System Photo Picker & SAF document picker | 100% | Optimized for Android media store |
| **Vertical 9:16 Reframing** | FFmpeg crop, scale, blurred background | Foreground service with FFmpeg / MediaCodec | 100% | Renders in background with notification |
| **Split-Screen Gaming Short** | Top gameplay (1080x1080), bottom facecam (1080x760) | Exact layout matrix and overlay coordinates | 100% | Renders to standard 1080x1920 Short |
| **Live Stream Clipping** | YouTube/Twitch live monitoring and buffer | Integrated Live Studio with preview monitor | 100% | Uses unified stream resolution engine |
| **Speech-to-Text Transcription** | faster-whisper / WhisperX | Desktop sync or on-device mobile whisper pipeline | 100% | Real-time speech feed integration |
| **Offline Assets** | Local Flask server | Bundled offline assets in `assets/www/` | 100% | Zero latency, works offline |
| **Export & Sharing** | Saved to local disk directory | Saved to Android `Movies/ClipifyAI/` + Share Sheet | 100% | Native Android share intent support |


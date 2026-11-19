# Clipify AI — Android Known Limitations

## 1. Large LLM On-Device Execution
- **Context**: Running 3B+ parameter LLMs (such as Qwen 2.5 3B or Llama 3 8B) locally on mobile chips consumes significant RAM and battery.
- **Resolution**: Clipify AI automatically offloads LLM highlight ranking to the desktop host when connected over local Wi-Fi, while keeping audio clipping, video cropping, and basic transcription local.

## 2. Background Media Processing Constraints (Android 14+)
- **Context**: Android 14 (API 34) restricts long-running background tasks unless wrapped in a properly classified foreground service.
- **Resolution**: Clipify AI uses a dedicated `FOREGROUND_SERVICE_DATA_SYNC` with an ongoing notification and wake-lock so video rendering is never terminated prematurely by OEM battery savers.

## 3. Real-Time Stream Extraction on Restricted Mobile Networks
- **Context**: Certain mobile carrier APNs throttle continuous multi-chunk video stream downloads.
- **Resolution**: Wi-Fi connection is recommended for real-time live stream monitoring and clipping; standard video processing from local device storage is unaffected.


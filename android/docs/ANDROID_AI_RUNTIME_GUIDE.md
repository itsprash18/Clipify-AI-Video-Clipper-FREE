# Clipify AI — Android AI Runtime Guide

## Overview
Clipify AI mobile supports a dual-engine architecture:
1. **Desktop Sync Engine (Recommended for large LLMs)**: Connects to the local desktop Clipify AI or Ollama server over Wi-Fi (`http://<desktop-ip>:5000` or `http://<desktop-ip>:11434`) for high-throughput transcription and LLM clip ranking.
2. **On-Device Mobile Engine**: Executes quantized models (whisper.tflite, mobile face detection) directly on modern Android NPU/GPU hardware.

## Network Discovery & Desktop Pairing
- Android automatically discovers desktop Clipify AI instances on the local subnet.
- The desktop endpoint accepts RFC1918 private subnets without DNS rebinding vulnerabilities (`POST /api/projects/sync`).
- Project metadata, transcriptions, and rendered clips sync bidirectionally between phone and PC.

## Configuration Options
- **Ollama Remote Endpoint**: Custom URL input in settings for local network Ollama servers running Qwen 2.5, Llama 3, Mistral, etc.
- **Local Fallback**: Fallback to on-device rule-based audio energy analysis when offline or detached from the desktop host.


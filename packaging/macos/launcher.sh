#!/usr/bin/env bash
# ==============================================================================
# Clipify AI — macOS Native Application Launcher
# Compatible with Apple Silicon (M1/M2/M3/M4) and Intel Macs
# ==============================================================================

set -e

# Resolve bundle path
CONTENTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"
APP_DIR="${RESOURCES_DIR}/app"

export CLIPIFY_HOME="${APP_DIR}"
export PYTHONUNBUFFERED=1

echo "=========================================="
echo " Starting Clipify AI on macOS"
echo "=========================================="

# 1. Detect Architecture
ARCH="$(uname -m)"
echo "[INFO] Running on architecture: ${ARCH}"

# 2. Locate FFmpeg (with VideoToolbox acceleration)
export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"
if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "[WARNING] FFmpeg not found in PATH."
    echo "To enable fast hardware video rendering, install FFmpeg via Homebrew:"
    echo "  brew install ffmpeg"
fi

# 3. Locate Python 3.11+
PYTHON_BIN=""
if [ -x "${APP_DIR}/runtime/bin/python3" ]; then
    PYTHON_BIN="${APP_DIR}/runtime/bin/python3"
elif [ -x "${APP_DIR}/.venv/bin/python3" ]; then
    PYTHON_BIN="${APP_DIR}/.venv/bin/python3"
elif command -v python3.11 >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python3.11)"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python3)"
else
    echo "[ERROR] Python 3.11+ is required to run the Clipify AI engine."
    osascript -e 'display alert "Python 3.11 Required" message "Clipify AI requires Python 3.11+. Please install it via Homebrew (brew install python@3.11) or from python.org."'
    exit 1
fi

# 4. Check Ollama Local AI Service
if ! curl -s --connect-timeout 1 http://127.0.0.1:11434/api/version >/dev/null 2>&1; then
    if [ -d "/Applications/Ollama.app" ]; then
        echo "[INFO] Launching Ollama.app in background..."
        open -a "/Applications/Ollama.app" --hide || true
    fi
fi

# 5. Check if Server is already running
PORT=5000
if curl -s --connect-timeout 1 "http://127.0.0.1:${PORT}/api/health" | grep -q "ok"; then
    echo "[INFO] Clipify AI server is already active on port ${PORT}."
else
    echo "[INFO] Spawning Clipify AI backend server..."
    nohup "${PYTHON_BIN}" "${APP_DIR}/app.py" > "${HOME}/Library/Logs/clipify_ai.log" 2>&1 &
    
    # Wait for healthcheck
    ATTEMPTS=0
    HEALTHY=false
    while [ $ATTEMPTS -lt 15 ]; do
        if curl -s --connect-timeout 1 "http://127.0.0.1:${PORT}/api/health" | grep -q "ok"; then
            HEALTHY=true
            break
        fi
        sleep 1
        ATTEMPTS=$((ATTEMPTS+1))
    done
fi

TARGET_URL="http://127.0.0.1:${PORT}/"

# 6. Launch Application Window (Google Chrome / Brave App Mode or Safari / Default Browser)
if [ -d "/Applications/Google Chrome.app" ]; then
    exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        --app="${TARGET_URL}" \
        --user-data-dir="${HOME}/Library/Application Support/ClipifyAI/browser-profile" \
        "$@"
elif [ -d "/Applications/Brave Browser.app" ]; then
    exec "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
        --app="${TARGET_URL}" \
        --user-data-dir="${HOME}/Library/Application Support/ClipifyAI/browser-profile" \
        "$@"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    exec "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
        --app="${TARGET_URL}" \
        --user-data-dir="${HOME}/Library/Application Support/ClipifyAI/browser-profile" \
        "$@"
else
    open "${TARGET_URL}"
fi

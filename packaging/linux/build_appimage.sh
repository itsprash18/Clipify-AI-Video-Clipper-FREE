#!/usr/bin/env bash
# ==============================================================================
# Clipify AI — Linux AppImage Builder
# Builds a standalone portable AppImage executable
# ==============================================================================

set -e

VERSION="3.7.0"
APP_NAME="Clipify-AI"
APP_DIR="AppDir"

echo "=========================================="
echo " Packaging ${APP_NAME} v${VERSION} as AppImage"
echo "=========================================="

rm -rf "${APP_DIR}" "out_appimage"
mkdir -p "${APP_DIR}/opt/clipify-ai/bin"
mkdir -p "${APP_DIR}/usr/bin"
mkdir -p "${APP_DIR}/usr/share/applications"
mkdir -p "${APP_DIR}/usr/share/icons/hicolor/512x512/apps"
mkdir -p "out_appimage"

# 1. Install AppRun and Desktop Entry
cp packaging/linux/AppRun "${APP_DIR}/AppRun"
chmod 755 "${APP_DIR}/AppRun"
cp packaging/linux/clipify-ai.desktop "${APP_DIR}/clipify-ai.desktop"
cp packaging/linux/clipify-ai.desktop "${APP_DIR}/usr/share/applications/"
cp static/icon.png "${APP_DIR}/clipify-ai.png"
cp static/icon.png "${APP_DIR}/usr/share/icons/hicolor/512x512/apps/clipify-ai.png"

# 2. Stage Application
cp -r app.py main.py server_config.py clippedai_runtime.py requirements.txt "${APP_DIR}/opt/clipify-ai/"
cp -r templates static clipify qa "${APP_DIR}/opt/clipify-ai/"
cp packaging/linux/bin/clipify-ai "${APP_DIR}/opt/clipify-ai/bin/clipify-ai"
chmod 755 "${APP_DIR}/opt/clipify-ai/bin/clipify-ai"

# 3. Check for appimagetool or download
if ! command -v appimagetool >/dev/null 2>&1; then
    echo "Downloading appimagetool..."
    curl -L -o ./appimagetool "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
    chmod +x ./appimagetool
    TOOL="./appimagetool"
else
    TOOL="appimagetool"
fi

# 4. Generate AppImage
ARCH=x86_64 ${TOOL} "${APP_DIR}" "out_appimage/${APP_NAME}-${VERSION}-x86_64.AppImage"
echo "[SUCCESS] Generated out_appimage/${APP_NAME}-${VERSION}-x86_64.AppImage"


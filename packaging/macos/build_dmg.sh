#!/usr/bin/env bash
# ==============================================================================
# Clipify AI — macOS Application Bundle (.app) & DMG Installer Builder
# Supports Universal 2 (Apple Silicon arm64 & Intel x86_64)
# ==============================================================================

set -e

VERSION="3.7.0"
APP_NAME="Clipify AI"
BUNDLE_DIR="out_macos/${APP_NAME}.app"
DMG_NAME="Clipify-AI-${VERSION}.dmg"

echo "=========================================="
echo " Building ${APP_NAME}.app v${VERSION} for macOS"
echo "=========================================="

rm -rf "out_macos"
mkdir -p "${BUNDLE_DIR}/Contents/MacOS"
mkdir -p "${BUNDLE_DIR}/Contents/Resources/app"

# 1. Info.plist & Entitlements
cp packaging/macos/Info.plist "${BUNDLE_DIR}/Contents/Info.plist"
cp packaging/macos/entitlements.plist "${BUNDLE_DIR}/Contents/Resources/entitlements.plist"

# 2. Main Executable Entrypoint
cp packaging/macos/launcher.sh "${BUNDLE_DIR}/Contents/MacOS/${APP_NAME}"
chmod +x "${BUNDLE_DIR}/Contents/MacOS/${APP_NAME}"

# 3. Application Assets & Code Payload
echo "Copying application payload..."
cp -r app.py main.py server_config.py clippedai_runtime.py requirements.txt "${BUNDLE_DIR}/Contents/Resources/app/"
cp -r templates static clipify qa "${BUNDLE_DIR}/Contents/Resources/app/"

# 4. Icon (convert PNG to ICNS if sips/iconutil available)
if command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1; then
    echo "Generating macOS icon.icns..."
    ICONSET="out_macos/icon.iconset"
    mkdir -p "${ICONSET}"
    sips -z 16 16     static/icon.png --out "${ICONSET}/icon_16x16.png"
    sips -z 32 32     static/icon.png --out "${ICONSET}/icon_16x16@2x.png"
    sips -z 32 32     static/icon.png --out "${ICONSET}/icon_32x32.png"
    sips -z 64 64     static/icon.png --out "${ICONSET}/icon_32x32@2x.png"
    sips -z 128 128   static/icon.png --out "${ICONSET}/icon_128x128.png"
    sips -z 256 256   static/icon.png --out "${ICONSET}/icon_256x256.png"
    sips -z 512 512   static/icon.png --out "${ICONSET}/icon_512x512.png"
    sips -z 1024 1024 static/icon.png --out "${ICONSET}/icon_512x512@2x.png"
    iconutil -c icns "${ICONSET}" -o "${BUNDLE_DIR}/Contents/Resources/icon.icns"
    rm -rf "${ICONSET}"
fi

# 5. Build DMG Image (if on macOS with hdiutil)
if command -v hdiutil >/dev/null 2>&1; then
    echo "Creating Drag-and-Drop DMG Installer..."
    DMG_STAGE="out_macos/dmg_stage"
    mkdir -p "${DMG_STAGE}"
    cp -r "${BUNDLE_DIR}" "${DMG_STAGE}/"
    ln -s /Applications "${DMG_STAGE}/Applications"
    
    hdiutil create -volname "${APP_NAME}" \
        -srcfolder "${DMG_STAGE}" \
        -ov -format UDZO \
        "out_macos/${DMG_NAME}"
    echo "[SUCCESS] Generated out_macos/${DMG_NAME}"
else
    echo "[INFO] hdiutil not available in this environment. .app bundle created in ${BUNDLE_DIR}"
fi


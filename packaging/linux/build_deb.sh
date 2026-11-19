#!/usr/bin/env bash
# ==============================================================================
# Clipify AI — Debian / Ubuntu (.deb) Package Builder
# ==============================================================================

set -e

VERSION="3.7.0"
PACKAGE_NAME="clipify-ai"
ARCH="amd64"
DIST_DIR="$(pwd)/dist_deb"
BUILD_ROOT="${DIST_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}"

echo "=========================================="
echo " Building ${PACKAGE_NAME} v${VERSION} (.deb) for ${ARCH}"
echo "=========================================="

rm -rf "${DIST_DIR}"
mkdir -p "${BUILD_ROOT}/DEBIAN"
mkdir -p "${BUILD_ROOT}/opt/clipify-ai"
mkdir -p "${BUILD_ROOT}/usr/bin"
mkdir -p "${BUILD_ROOT}/usr/share/applications"
mkdir -p "${BUILD_ROOT}/usr/share/icons/hicolor/512x512/apps"

# 1. Debian Control file
cat <<EOF > "${BUILD_ROOT}/DEBIAN/control"
Package: ${PACKAGE_NAME}
Version: ${VERSION}
Section: video
Priority: optional
Architecture: ${ARCH}
Depends: python3 (>= 3.10), python3-pip, ffmpeg, libmagic1, curl
Recommends: google-chrome-stable | chromium | brave-browser
Maintainer: Clipify AI Open Source Team <support@clipify.ai>
Description: AI Video Clipper, Live Stream Studio & 9:16 Shorts Generator
 Clipify AI automatically transforms long-form footage and live streams
 into high-retention vertical 9:16 Shorts with face-tracking, animated
 Hormozi subtitles, and local LLM highlight detection.
EOF

# 2. Post-installation script
cat <<'EOF' > "${BUILD_ROOT}/DEBIAN/postinst"
#!/bin/sh
set -e

# Update desktop and icon databases
if [ -x /usr/bin/update-desktop-database ]; then
    update-desktop-database -q || true
fi
if [ -x /usr/bin/gtk-update-icon-cache ]; then
    gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi

echo "=================================================="
echo " Clipify AI v3.7.0 installed successfully!"
echo " Launch from application menu or run: clipify-ai"
echo "=================================================="
EOF
chmod 755 "${BUILD_ROOT}/DEBIAN/postinst"

# 3. Post-removal script (respecting user data)
cat <<'EOF' > "${BUILD_ROOT}/DEBIAN/postrm"
#!/bin/sh
set -e

if [ "$1" = "remove" ] || [ "$1" = "purge" ]; then
    if [ -x /usr/bin/update-desktop-database ]; then
        update-desktop-database -q || true
    fi
    if [ -x /usr/bin/gtk-update-icon-cache ]; then
        gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
    fi
    echo "Note: User projects in ~/.local/share/clipify-ai have been preserved."
fi
EOF
chmod 755 "${BUILD_ROOT}/DEBIAN/postrm"

# 4. Copy application payload
echo "Copying application payload to /opt/clipify-ai..."
cp -r app.py main.py server_config.py clippedai_runtime.py requirements.txt "${BUILD_ROOT}/opt/clipify-ai/"
cp -r templates static clipify qa "${BUILD_ROOT}/opt/clipify-ai/"
mkdir -p "${BUILD_ROOT}/opt/clipify-ai/bin"
cp packaging/linux/bin/clipify-ai "${BUILD_ROOT}/opt/clipify-ai/bin/clipify-ai"
chmod 755 "${BUILD_ROOT}/opt/clipify-ai/bin/clipify-ai"

# Symlink to /usr/bin
ln -sf /opt/clipify-ai/bin/clipify-ai "${BUILD_ROOT}/usr/bin/clipify-ai"

# 5. Desktop Entry & Icon
cp packaging/linux/clipify-ai.desktop "${BUILD_ROOT}/usr/share/applications/"
cp static/icon.png "${BUILD_ROOT}/usr/share/icons/hicolor/512x512/apps/clipify-ai.png"

# 6. Build the package with dpkg-deb
echo "Packaging .deb archive..."
dpkg-deb --build --root-owner-group "${BUILD_ROOT}" "${DIST_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"

echo "[SUCCESS] Generated ${DIST_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"

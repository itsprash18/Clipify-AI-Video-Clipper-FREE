#!/usr/bin/env bash
# ==============================================================================
# Clipify AI — Linux Clean Uninstaller
# Removes application files while safely preserving user projects by default.
# ==============================================================================

set -e

echo "=================================================="
echo " Clipify AI Uninstaller (Linux)"
echo "=================================================="

# Check permissions
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo to remove system files:"
    echo "  sudo bash $0"
    exit 1
fi

echo "Removing Clipify AI application files..."
rm -rf /opt/clipify-ai
rm -f /usr/bin/clipify-ai
rm -f /usr/share/applications/clipify-ai.desktop
rm -f /usr/share/icons/hicolor/512x512/apps/clipify-ai.png

# Update desktop cache
if [ -x /usr/bin/update-desktop-database ]; then
    update-desktop-database -q || true
fi
if [ -x /usr/bin/gtk-update-icon-cache ]; then
    gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi

echo "[SUCCESS] Core application removed."
echo ""
echo "User Projects and Data Location:"
echo "  ~/.local/share/clipify-ai"
echo "  ~/.config/clipify-ai"
echo ""
read -p "Would you also like to delete your personal Clipify projects and cache? [y/N]: " CONFIRM
if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    REAL_USER="${SUDO_USER:-$USER}"
    USER_HOME=$(eval echo "~$REAL_USER")
    rm -rf "${USER_HOME}/.local/share/clipify-ai"
    rm -rf "${USER_HOME}/.config/clipify-ai"
    echo "User projects and settings deleted."
else
    echo "User projects safely preserved in ~/.local/share/clipify-ai"
fi

echo "Uninstallation complete!"


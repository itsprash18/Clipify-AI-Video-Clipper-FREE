#!/usr/bin/env bash
# ==============================================================================
# Clipify AI — macOS Clean Uninstaller
# ==============================================================================

set -e

echo "=================================================="
echo " Clipify AI Uninstaller (macOS)"
echo "=================================================="

echo "Removing Clipify AI application..."
rm -rf "/Applications/Clipify AI.app"

echo "Application removed from /Applications."
echo ""
echo "User Projects and Data Location:"
echo "  ~/Movies/ClipifyAI"
echo "  ~/Library/Application Support/ClipifyAI"
echo "  ~/Library/Caches/ClipifyAI"
echo ""
read -p "Would you also like to delete your personal Clipify projects and cache? [y/N]: " CONFIRM
if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    rm -rf "${HOME}/Movies/ClipifyAI"
    rm -rf "${HOME}/Library/Application Support/ClipifyAI"
    rm -rf "${HOME}/Library/Caches/ClipifyAI"
    rm -rf "${HOME}/Library/Logs/clipify_ai.log"
    echo "Personal projects and caches deleted."
else
    echo "Personal projects safely preserved in ~/Movies/ClipifyAI"
fi

echo "Uninstallation complete!"

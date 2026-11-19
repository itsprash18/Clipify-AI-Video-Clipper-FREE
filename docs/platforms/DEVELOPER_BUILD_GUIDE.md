# 🛠️ Clipify AI — Cross-Platform Developer Build Guide
### Windows | Linux | macOS | Android

---

## 1. Prerequisites
* **Git**: >= 2.40
* **Python**: 3.11.x (x86_64 / arm64)
* **Node.js**: >= 20.x & npm >= 10.x (for desktop Electron builders)
* **FFmpeg**: >= 6.0 with development headers

---

## 2. Building for Windows (x64)
```powershell
# 1. Install dependencies
python -m pip install -r requirements-runtime.txt

# 2. Build C# Native Launchers
python build/build_installer.py

# 3. Build Electron NSIS Setup Package
cd build/installer_app
npm install
npm run dist
# Output: build/installer_app/out/Clipify AI Setup.exe
```

---

## 3. Building for Linux (x86_64)

### Build .deb Package
```bash
chmod +x packaging/linux/build_deb.sh
./packaging/linux/build_deb.sh
# Output: dist_deb/clipify-ai_3.7.0_amd64.deb
```

### Build AppImage
```bash
chmod +x packaging/linux/build_appimage.sh
./packaging/linux/build_appimage.sh
# Output: out_appimage/Clipify-AI-3.7.0-x86_64.AppImage
```

---

## 4. Building for macOS (Apple Silicon & Intel)
```bash
chmod +x packaging/macos/build_dmg.sh
./packaging/macos/build_dmg.sh
# Output: out_macos/Clipify-AI-3.7.0.dmg
```

For code signing and Apple Notarization, see:
`packaging/macos/NOTARIZATION_GUIDE.md`

---

## 5. Building for Android (APK & AAB)
```bash
cd android

# Build Debug APK
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Build Release APK
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

# Build Google Play Bundle (.aab)
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

For signing key setup, see:
`android/SIGNING_SETUP_GUIDE.md`


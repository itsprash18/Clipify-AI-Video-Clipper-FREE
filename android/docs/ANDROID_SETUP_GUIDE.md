# Clipify AI — Android Setup & Build Guide

## Prerequisites
- Android Studio Ladybug or newer / Command-line Android SDK
- JDK 17+ (`JAVA_HOME` pointing to valid JDK)
- Android SDK Platform 34 (API 34)
- Android SDK Build-Tools 34.0.0
- Physical or Virtual Android device running Android 8.0 (API 26) or higher

## Build Instructions

### 1. Build Debug APK
```bash
cd L:\ClipifyAI\android
.\gradlew assembleDebug
```
The resulting debug APK is located at:
`L:\ClipifyAI\android\app\build\outputs\apk\debug\app-debug.apk`

### 2. Install on Device via ADB
Ensure your Android device has USB debugging enabled and is recognized:
```bash
adb devices
# Install the APK:
adb install -r L:\ClipifyAI\android\app\build\outputs\apk\debug\app-debug.apk
```

### 3. Launch Application
```bash
adb shell am start -n dev.sherlock.clipifyai.debug/dev.sherlock.clipifyai.onboarding.OnboardingActivity
```

## First-Run Experience
1. **Welcome Screen**: Introduces Clipify AI's mobile capabilities.
2. **Compatibility Check**: Scans device hardware, RAM, and media codecs.
3. **Permission Grants**: Requests `READ_MEDIA_VIDEO` / `READ_EXTERNAL_STORAGE` and `POST_NOTIFICATIONS`.
4. **AI Engine Configuration**: Selects local on-device vs. desktop host bridge.
5. **Video Engine Settings**: Hardware acceleration preferences.
6. **Storage Directory**: Configures output folder (`/sdcard/Movies/ClipifyAI/`).
7. **Star & Follow**: Card with author avatar, ⭐ Star Repo button, and 👤 Follow Dev button.


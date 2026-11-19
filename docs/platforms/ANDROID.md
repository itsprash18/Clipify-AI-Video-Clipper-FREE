# 📱 Clipify AI — Android Platform Guide
### Android 8.0+ (API Level 26+) through Android 15 (API Level 35)

---

## 1. Installation
1. Download the verified APK package: `Clipify-AI-3.7.0.apk`.
2. On your Android device, open the downloaded APK file.
3. If prompted, allow "Install unknown apps" for your file manager or browser.
4. Tap **Install** and open **Clipify AI**.

---

## 2. First-Launch Onboarding Experience
Clipify AI features a streamlined 7-screen guided onboarding wizard:
1. **Welcome**: Introduces the studio features and brand identity.
2. **Device Compatibility**: Checks CPU architecture, RAM, and video decoders.
3. **Permissions**: Requests granular video gallery access and notification permissions.
4. **AI Engine Configuration**:
   * **Option A: Connect to Clipify AI Desktop (Recommended)**: Auto-syncs over your home Wi-Fi network to your PC for full GPU processing.
   * **Option B: Remote Server**: Connects to your private self-hosted endpoint.
   * **Option C: On-Device AI**: Uses local mobile-optimized models.
5. **Video Processing Setup**: Validates MediaCodec hardware encoders for 9:16 vertical rendering.
6. **Storage Configuration**: Configures scoped storage directories with cache safeguards.
7. **Completion**: Launches you directly into the mobile studio!

---

## 3. Background Work & Battery Optimization
Clipify AI uses Android `WorkManager` and foreground notifications for video rendering. Rendering jobs continue uninterrupted even if your screen locks or you switch apps.

---

## 4. Uninstallation
Long-press the **Clipify AI** app icon on your home screen or app drawer and tap **Uninstall**.


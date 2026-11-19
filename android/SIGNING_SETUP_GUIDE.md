# 📱 Clipify AI — Android Signing & Distribution Guide
### Release APK & AAB Generation

---

## 1. Overview
This document guides developers on generating release-ready, installable APK and Android App Bundle (`.aab`) files for Clipify AI. Following Google Play and Android OS security standards, private signing keys are **never committed to version control**.

---

## 2. Generating a Secure Release Keystore

Generate a 2048-bit RSA keystore using Java's standard `keytool`:

```bash
keytool -genkey -v -keystore clipify-release-key.jks \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias clipify-release \
    -storetype JKS
```

Store `clipify-release-key.jks` in a secure location outside the repository (e.g., `~/.android/clipify-release-key.jks`).

---

## 3. Configuring Release Signing in Gradle

Add the signing parameters to your user-level `~/.gradle/gradle.properties` (never in the project repository):

```properties
CLIPIFY_RELEASE_STORE_FILE=/path/to/clipify-release-key.jks
CLIPIFY_RELEASE_KEY_ALIAS=clipify-release
CLIPIFY_RELEASE_STORE_PASSWORD=your_keystore_password
CLIPIFY_RELEASE_KEY_PASSWORD=your_key_password
```

In `android/app/build.gradle`:

```groovy
android {
    signingConfigs {
        release {
            if (project.hasProperty('CLIPIFY_RELEASE_STORE_FILE')) {
                storeFile file(CLIPIFY_RELEASE_STORE_FILE)
                storePassword CLIPIFY_RELEASE_STORE_PASSWORD
                keyAlias CLIPIFY_RELEASE_KEY_ALIAS
                keyPassword CLIPIFY_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 4. Building APKs

```bash
cd android

# Build Debug APK (instant installation for local testing)
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Build Signed Release APK
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

# Build Google Play App Bundle (.aab)
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Installing on Real Android Devices
Ensure USB Debugging or "Install from unknown sources" is enabled on the device:
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```
Or transfer `app-release.apk` directly to the phone via USB or local network download.


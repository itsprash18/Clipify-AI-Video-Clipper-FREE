# 🍏 Clipify AI — macOS Signing & Notarization Guide
### Apple Gatekeeper, Hardened Runtime & Distribution Readiness

---

## 1. Overview
macOS Gatekeeper blocks un-notarized applications downloaded outside the Mac App Store. To distribute `Clipify-AI-3.7.0.dmg` publicly without users seeing "App is damaged" or unrecognized developer warnings, the binary bundle must be:
1. Signed with an active Apple Developer ID Application certificate.
2. Compiled with Hardened Runtime enabled and proper entitlements.
3. Submitted to Apple's Notary Service (`xcrun notarytool`).
4. Stapled with the notarization ticket (`xcrun stapler`).

---

## 2. Prerequisites
* Apple Developer Account (Individual or Organization).
* Developer ID Application Certificate installed in macOS Keychain.
* App-Specific Password or App Store Connect API Key.

---

## 3. Step-by-Step Signing Procedure

### Step 1: Deep Code Signing
Sign all embedded binaries, dylibs, frameworks, and Python runtimes before signing the outer `.app`:

```bash
# 1. Sign internal executables & dylibs
find "Clipify AI.app/Contents/Resources/app" -type f \( -name "*.dylib" -o -name "*.so" \) -exec \
    codesign --force --options runtime --timestamp \
    --sign "Developer ID Application: Your Name (TEAM_ID)" {} +

# 2. Sign outer Application bundle with Hardened Runtime entitlements
codesign --force --options runtime --deep --timestamp \
    --entitlements "packaging/macos/entitlements.plist" \
    --sign "Developer ID Application: Your Name (TEAM_ID)" \
    "Clipify AI.app"

# 3. Verify signature
codesign --verify --deep --strict --verbose=2 "Clipify AI.app"
spctl --assess -vv --type install "Clipify AI.app"
```

---

## 4. Submitting for Apple Notarization

```bash
# 1. Package into signed DMG or ZIP
hdiutil create -volname "Clipify AI" -srcfolder "Clipify AI.app" -ov -format UDZO "Clipify-AI-3.7.0.dmg"

codesign --force --sign "Developer ID Application: Your Name (TEAM_ID)" "Clipify-AI-3.7.0.dmg"

# 2. Submit to Apple Notary Service
xcrun notarytool submit "Clipify-AI-3.7.0.dmg" \
    --keychain-profile "AC_PASSWORD" \
    --wait

# 3. Staple the ticket to the DMG
xcrun stapler staple "Clipify-AI-3.7.0.dmg"

# 4. Verify Gatekeeper acceptance
spctl --assess -vv --type open --context context:primary-signature "Clipify-AI-3.7.0.dmg"
```

---

## 5. Development Mode Override (Unsigned Local Testing)
For local testing on development Macs without an Apple Developer certificate, users can bypass Gatekeeper using:
```bash
xattr -cr "/Applications/Clipify AI.app"
```
Or right-click the app in Finder and choose **Open** → **Open Anyway**.


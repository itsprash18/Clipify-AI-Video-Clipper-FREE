import subprocess
import json
import os
import sys
from pathlib import Path

def get_token():
    p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    creds, _ = p.communicate('protocol=https\nhost=github.com\n\n')
    return dict([l.split('=', 1) for l in creds.splitlines() if '=' in l]).get('password', '')

token = get_token()
repo = "sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE"
release_id = 450374034  # v3.7.0

assets_to_upload = [
    {"path": r"L:\ClipifyAI\SHA256SUMS.txt", "name": "SHA256SUMS.txt", "mime": "text/plain"},
    {"path": r"L:\ClipifyAI\1-Click-Unblock.bat", "name": "1-Click-Unblock.bat", "mime": "application/x-bat"},
    {"path": r"L:\ClipifyAI\Trust-Clipify.bat", "name": "Trust-Clipify.bat", "mime": "application/x-bat"},
    {"path": r"L:\ClipifyAI\Clipify_AI_CodeSigning.cer", "name": "Clipify_AI_CodeSigning.cer", "mime": "application/x-x509-ca-cert"},
    {"path": r"L:\ClipifyAI\Clipify_AI_v3.7.0_Mobile.apk", "name": "Clipify_AI_v3.7.0_Mobile.apk", "mime": "application/vnd.android.package-archive"},
    {"path": r"L:\ClipifyAI\Clipify.AI.Setup.3.7.0.exe", "name": "Clipify.AI.Setup.3.7.0.exe", "mime": "application/octet-stream"},
]

print(f"Connecting to GitHub API for {repo} release {release_id}...")

# 1. Check existing assets in release
chk_cmd = [
    'curl.exe', '-s',
    '-H', f'Authorization: token {token}',
    '-H', 'User-Agent: ReleaseUploader',
    f'https://api.github.com/repos/{repo}/releases/{release_id}/assets'
]
res = subprocess.run(chk_cmd, capture_output=True, text=True)
existing_assets = {}
try:
    for a in json.loads(res.stdout):
        existing_assets[a['name']] = a['id']
    print(f"Existing assets in release: {list(existing_assets.keys())}")
except Exception as e:
    print(f"Error parsing existing assets: {e}")

# 2. Upload or update each asset
for item in assets_to_upload:
    file_path = Path(item["path"])
    asset_name = item["name"]
    mime_type = item["mime"]

    if not file_path.exists():
        print(f"[SKIP] File not found: {file_path}")
        continue

    size_mb = file_path.stat().st_size / (1024 * 1024)
    print(f"\nProcessing {asset_name} ({size_mb:.2f} MB)...")

    # If it already exists, delete old asset first
    if asset_name in existing_assets:
        aid = existing_assets[asset_name]
        print(f"  Deleting existing asset {asset_name} (id: {aid})...")
        del_cmd = [
            'curl.exe', '-s', '-X', 'DELETE',
            '-H', f'Authorization: token {token}',
            '-H', 'User-Agent: ReleaseUploader',
            f'https://api.github.com/repos/{repo}/releases/assets/{aid}'
        ]
        subprocess.run(del_cmd, capture_output=True)
        print("  Deleted.")

    # Upload using curl HTTP/1.1
    upload_url = f"https://uploads.github.com/repos/{repo}/releases/{release_id}/assets?name={asset_name}"
    print(f"  Uploading {asset_name} to {upload_url}...")
    up_cmd = [
        'curl.exe', '--http1.1',
        '-H', f'Authorization: token {token}',
        '-H', f'Content-Type: {mime_type}',
        '-H', 'User-Agent: ReleaseUploader',
        '--progress-bar',
        '-T', str(file_path),
        upload_url
    ]
    up_res = subprocess.run(up_cmd, capture_output=True, text=True)
    try:
        data = json.loads(up_res.stdout)
        if 'browser_download_url' in data:
            print(f"  SUCCESS! Download URL: {data['browser_download_url']}")
        else:
            print(f"  Upload warning: {up_res.stdout[:250]}")
    except Exception as e:
        print(f"  Parse response error: {e}, stdout: {up_res.stdout[:200]}")

# 3. Update release body with false positive instructions & checksums
new_body = """**AI-powered video clipping and live stream recording for Windows and Android.**

Clipify AI converts long-form videos and live streams into short-form clips with automated highlight detection, speech-to-text, face tracking, and animated subtitles. 100% free, local, and private.

![Clipify AI Live Studio](https://raw.githubusercontent.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE/main/docs/screenshots/live_studio_stream.jpg)

---

## 📥 Downloads (v3.7.0)

| Package | Platform | Size | Checksum (SHA-256) |
| :--- | :---: | :---: | :--- |
| **`Clipify.AI.Setup.3.7.0.exe`** | Windows 10/11 (x64) | 347.7 MB | `16813525a3b5faaf70c150ed32350c3e7ae00ca199fbfe3960e8c92c0444f69b` |
| **`Clipify_AI_v3.7.0_Mobile.apk`** | Android (ARM64/x86_64) | 8.44 MB | `90be1d042416d720e1ca6df82ee8829edb9804ea0ce693ade61b5873832cbc4f` |
| **`SHA256SUMS.txt`** | All Platforms | 260 B | Cryptographic Release Hashes |
| **`1-Click-Unblock.bat`** | Windows Tool | 500 B | Removes browser download block in 1 click |
| **`Trust-Clipify.bat`** | Windows Tool | 700 B | Installs publisher certificate to Trusted Store |

---

## 🛡️ Windows SmartScreen / Antivirus False Positive Notice

Clipify AI is **100% open-source community software**. Because community releases are not signed by expensive commercial EV certificates ($400+/year), Windows Defender SmartScreen or web browsers may show a standard unrecognized publisher prompt ("Windows protected your PC") on new releases.

**How to bypass in 2 seconds:**
1. Click **"More info"** on the Windows SmartScreen blue screen.
2. Click **"Run anyway"**.

**Alternative 1-Click Fix:**
- Download `1-Click-Unblock.bat` into the same folder as the installer and double-click it.
- Or right-click `Clipify.AI.Setup.3.7.0.exe` → **Properties** → Check **"Unblock"** → Click **OK**.
- Or run in PowerShell: `Unblock-File .\\Clipify.AI.Setup.3.7.0.exe`
"""

print("\nUpdating Release v3.7.0 description on GitHub...")
patch_data = json.dumps({"body": new_body})
patch_cmd = [
    'curl.exe', '-s', '-X', 'PATCH',
    '-H', f'Authorization: token {token}',
    '-H', 'Content-Type: application/json',
    '-H', 'User-Agent: ReleaseUploader',
    f'https://api.github.com/repos/{repo}/releases/{release_id}',
    '-d', patch_data
]
patch_res = subprocess.run(patch_cmd, capture_output=True, text=True)
try:
    pdata = json.loads(patch_res.stdout)
    if 'id' in pdata:
        print("Release v3.7.0 description updated successfully!")
    else:
        print("Update response:", patch_res.stdout[:200])
except Exception as e:
    print(f"Failed to parse patch response: {e}")

print("\nAll assets and release notes updated!")

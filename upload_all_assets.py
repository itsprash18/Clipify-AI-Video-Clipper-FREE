import subprocess
import json
import sys
from pathlib import Path

def get_token():
    p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    creds, _ = p.communicate('protocol=https\nhost=github.com\n\n')
    return dict([l.split('=', 1) for l in creds.splitlines() if '=' in l]).get('password', '')

token = get_token()
repo = "sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE"
release_id = 450374034  # v3.7.0

print(f"Connecting to GitHub release {release_id}...")

# 1. Fetch current assets
chk_cmd = [
    'curl.exe', '-s',
    '-H', f'Authorization: token {token}',
    '-H', 'User-Agent: SherlockDev',
    f'https://api.github.com/repos/{repo}/releases/{release_id}/assets'
]
res = subprocess.run(chk_cmd, capture_output=True, text=True)
assets = json.loads(res.stdout)

print(f"Found {len(assets)} assets:")
for a in assets:
    name = a['name']
    aid = a['id']
    print(f" - {name} (id: {aid})")
    # Delete everything except Clipify.AI.Setup.3.7.0.exe
    if name != "Clipify.AI.Setup.3.7.0.exe":
        print(f"   --> Deleting {name}...")
        del_cmd = [
            'curl.exe', '-s', '-X', 'DELETE',
            '-H', f'Authorization: token {token}',
            '-H', 'User-Agent: SherlockDev',
            f'https://api.github.com/repos/{repo}/releases/assets/{aid}'
        ]
        subprocess.run(del_cmd, capture_output=True)
        print(f"   --> Deleted {name}.")

# 2. Re-upload clean Clipify.AI.Setup.3.7.0.exe
setup_exe = Path(r"L:\ClipifyAI\Clipify.AI.Setup.3.7.0.exe")
if setup_exe.exists():
    # Check if Clipify.AI.Setup.3.7.0.exe is already there
    existing_setup = [a for a in assets if a['name'] == setup_exe.name]
    if existing_setup:
        aid = existing_setup[0]['id']
        print(f"Deleting previous setup asset {setup_exe.name} (id: {aid}) to re-upload clean version...")
        del_cmd = [
            'curl.exe', '-s', '-X', 'DELETE',
            '-H', f'Authorization: token {token}',
            '-H', 'User-Agent: SherlockDev',
            f'https://api.github.com/repos/{repo}/releases/assets/{aid}'
        ]
        subprocess.run(del_cmd, capture_output=True)
        print("Deleted old setup asset.")

    upload_url = f"https://uploads.github.com/repos/{repo}/releases/{release_id}/assets?name={setup_exe.name}"
    print(f"Uploading clean {setup_exe.name} ({setup_exe.stat().st_size / (1024*1024):.1f} MB)...")
    up_cmd = [
        'curl.exe', '--http1.1',
        '-H', f'Authorization: token {token}',
        '-H', 'Content-Type: application/octet-stream',
        '-H', 'User-Agent: SherlockDev',
        '--progress-bar',
        '-T', str(setup_exe),
        upload_url
    ]
    up_res = subprocess.run(up_cmd, capture_output=True, text=True)
    try:
        data = json.loads(up_res.stdout)
        print("Upload result:", data.get("browser_download_url", up_res.stdout[:200]))
    except Exception as e:
        print("Upload response parse:", e)

# 3. Update release body to ONLY show Windows setup file
clean_body = """**AI-powered video clipping and live stream recording for Windows.**

Clipify AI converts long-form videos and live streams into short-form clips with automated highlight detection, speech-to-text, face tracking, and animated word subtitles. 100% free, local, and private.

![Clipify AI Live Studio](https://raw.githubusercontent.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE/main/docs/screenshots/live_studio_stream.jpg)

---

## 📥 Download (Windows x64)

**Clipify AI v3.7.0 Setup**

- **Installer:** `Clipify.AI.Setup.3.7.0.exe` (331.6 MB)
- **Platform:** Windows 10 / Windows 11 (64-bit)
- **Architecture:** x64

[**Download Clipify.AI.Setup.3.7.0.exe**](https://github.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE/releases/download/v3.7.0/Clipify.AI.Setup.3.7.0.exe)

---

### 🛡️ Windows SmartScreen Note
Clipify AI is free, open-source software. If Windows SmartScreen displays **"Windows protected your PC"**, simply click **"More info"** → **"Run anyway"** to launch the installer.
"""

patch_data = json.dumps({"body": clean_body})
patch_cmd = [
    'curl.exe', '-s', '-X', 'PATCH',
    '-H', f'Authorization: token {token}',
    '-H', 'Content-Type: application/json',
    '-H', 'User-Agent: SherlockDev',
    f'https://api.github.com/repos/{repo}/releases/{release_id}',
    '-d', patch_data
]
subprocess.run(patch_cmd, capture_output=True)
print("Release description updated to show only Windows setup.")

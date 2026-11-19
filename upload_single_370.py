import subprocess
import json
import os
import sys
import time

def get_token():
    p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, cwd=r'L:\ClipifyAI')
    creds, _ = p.communicate('protocol=https\nhost=github.com\n\n')
    return dict([l.split('=', 1) for l in creds.splitlines() if '=' in l]).get('password', '')

token = get_token()
if not token:
    print("[ERROR] No token retrieved.")
    sys.exit(1)

repo = "sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE"
rel_id = 450374034
source_exe = r"L:\ClipifyAI\build\installer_app\out\Clipify AI Setup.exe"

print(f"Target installer: {source_exe}")
print(f"Size: {os.path.getsize(source_exe)} bytes")

# 1. Upload Clipify.AI.Setup.3.7.0.exe
asset_name = "Clipify.AI.Setup.3.7.0.exe"
upload_url = f"https://uploads.github.com/repos/{repo}/releases/{rel_id}/assets?name={asset_name}"
print(f"[GITHUB] Uploading {asset_name} via curl chunked transfer...")

up_cmd = [
    'curl.exe', '--http1.1',
    '-H', f'Authorization: token {token}',
    '-H', 'Content-Type: application/octet-stream',
    '-H', 'User-Agent: ReleaseUploader',
    '-T', source_exe,
    upload_url
]

up_res = subprocess.run(up_cmd, capture_output=True, text=True)
print("Upload result output length:", len(up_res.stdout))

# Check assets now
chk_cmd = ['curl.exe', '-s', '-H', f'Authorization: token {token}', f'https://api.github.com/repos/{repo}/releases/{rel_id}/assets']
res = subprocess.run(chk_cmd, capture_output=True, text=True)
assets = json.loads(res.stdout)
print(f"Total assets after upload: {len(assets)}")

new_asset_ok = False
for a in assets:
    print(f" - Asset: {a['name']}, Size: {a['size']}, State: {a['state']}, ID: {a['id']}")
    if a['name'] == asset_name and a['state'] == 'uploaded' and a['size'] == os.path.getsize(source_exe):
        new_asset_ok = True

# If new asset is successfully uploaded, delete the old Clipify.AI.Setup.exe so only 1 exe remains
if new_asset_ok:
    print("[SUCCESS] New asset Clipify.AI.Setup.3.7.0.exe is uploaded and verified!")
    for a in assets:
        if a['name'] == 'Clipify.AI.Setup.exe':
            print(f"[CLEANUP] Deleting redundant asset {a['name']} (id {a['id']}) so only 1 exe remains...")
            del_cmd = [
                'curl.exe', '-s', '-X', 'DELETE',
                '-H', f'Authorization: token {token}',
                f'https://api.github.com/repos/{repo}/releases/assets/{a["id"]}'
            ]
            subprocess.run(del_cmd, capture_output=True)
            time.sleep(1)
            print("[CLEANUP] Deleted.")
else:
    print("[WARNING] New asset verification failed or still in progress.")


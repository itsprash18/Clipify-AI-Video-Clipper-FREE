import os
import sys
import zipfile
import shutil
import requests

sdk_dir = r"L:\tools\android-sdk"
cmdline_tools_dir = os.path.join(sdk_dir, "cmdline-tools", "latest")
sdkmanager = os.path.join(cmdline_tools_dir, "bin", "sdkmanager.bat")

if os.path.exists(sdkmanager):
    print(f"[OK] Android SDK Tools already exist at {sdkmanager}")
    sys.exit(0)

os.makedirs(sdk_dir, exist_ok=True)
zip_path = r"L:\tools\commandlinetools-win.zip"

url = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

print("Fetching Google Android Command-Line Tools for Windows...")
r = requests.get(url, headers=headers, stream=True, allow_redirects=True, timeout=30)
print(f"Status: {r.status_code}")

total = int(r.headers.get('content-length', 0))
downloaded = 0
with open(zip_path, 'wb') as f:
    for chunk in r.iter_content(chunk_size=1024*1024):
        if chunk:
            f.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                pct = int(downloaded * 100 / total)
                if pct % 10 == 0:
                    print(f"\rDownloading SDK Tools: {pct}% ({downloaded/(1024*1024):.1f}/{total/(1024*1024):.1f} MB)", end="", flush=True)

print("\nExtracting Command-Line Tools...")
extract_tmp = r"L:\tools\cmdline_tmp"
os.makedirs(extract_tmp, exist_ok=True)
with zipfile.ZipFile(zip_path, 'r') as zf:
    zf.extractall(extract_tmp)

# Android SDK requires cmdline-tools to be at cmdline-tools/latest/bin/sdkmanager
os.makedirs(os.path.join(sdk_dir, "cmdline-tools"), exist_ok=True)
src_cmdline = os.path.join(extract_tmp, "cmdline-tools")
if os.path.exists(cmdline_tools_dir):
    shutil.rmtree(cmdline_tools_dir)
shutil.move(src_cmdline, cmdline_tools_dir)

print(f"[SUCCESS] Android SDK Tools installed at {cmdline_tools_dir}")

shutil.rmtree(extract_tmp, ignore_errors=True)
if os.path.exists(zip_path):
    os.remove(zip_path)

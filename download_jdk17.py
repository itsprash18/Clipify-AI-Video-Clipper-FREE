import os
import sys
import zipfile
import shutil
import requests

jdk_dir = r"L:\tools\jdk-17"
if os.path.exists(os.path.join(jdk_dir, "bin", "javac.exe")):
    print(f"[OK] JDK 17 already exists at {jdk_dir}")
    sys.exit(0)

os.makedirs(r"L:\tools", exist_ok=True)
zip_path = r"L:\tools\openjdk-17.zip"

url = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

print("Fetching JDK 17 binary download...")
r = requests.get(url, headers=headers, stream=True, allow_redirects=True, timeout=30)
print(f"Status: {r.status_code}, Final URL: {r.url[:80]}...")

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
                    print(f"\rDownloading JDK 17: {pct}% ({downloaded/(1024*1024):.1f}/{total/(1024*1024):.1f} MB)", end="", flush=True)

print("\nExtracting JDK 17 archive...")
extract_dir = r"L:\tools\jdk_extract_tmp"
os.makedirs(extract_dir, exist_ok=True)
with zipfile.ZipFile(zip_path, 'r') as zf:
    zf.extractall(extract_dir)

extracted_folders = [f for f in os.listdir(extract_dir) if os.path.isdir(os.path.join(extract_dir, f))]
if extracted_folders:
    inner = os.path.join(extract_dir, extracted_folders[0])
    if os.path.exists(jdk_dir):
        shutil.rmtree(jdk_dir)
    shutil.move(inner, jdk_dir)
    print(f"[SUCCESS] JDK 17 installed to {jdk_dir}")

shutil.rmtree(extract_dir, ignore_errors=True)
if os.path.exists(zip_path):
    os.remove(zip_path)

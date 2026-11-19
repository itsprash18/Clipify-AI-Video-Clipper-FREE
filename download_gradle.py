import os
import sys
import zipfile
import shutil
import requests

gradle_dir = r"L:\tools\gradle-8.7"
gradle_bin = os.path.join(gradle_dir, "bin", "gradle.bat")

if os.path.exists(gradle_bin):
    print(f"[OK] Gradle already exists at {gradle_bin}")
    sys.exit(0)

os.makedirs(r"L:\tools", exist_ok=True)
zip_path = r"L:\tools\gradle-8.7-bin.zip"

url = "https://services.gradle.org/distributions/gradle-8.7-bin.zip"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

print("Fetching Gradle 8.7 binary distribution...")
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
                    print(f"\rDownloading Gradle: {pct}% ({downloaded/(1024*1024):.1f}/{total/(1024*1024):.1f} MB)", end="", flush=True)

print("\nExtracting Gradle 8.7...")
extract_tmp = r"L:\tools\gradle_tmp"
os.makedirs(extract_tmp, exist_ok=True)
with zipfile.ZipFile(zip_path, 'r') as zf:
    zf.extractall(extract_tmp)

extracted_folders = [f for f in os.listdir(extract_tmp) if os.path.isdir(os.path.join(extract_tmp, f))]
if extracted_folders:
    inner = os.path.join(extract_tmp, extracted_folders[0])
    if os.path.exists(gradle_dir):
        shutil.rmtree(gradle_dir)
    shutil.move(inner, gradle_dir)
    print(f"[SUCCESS] Gradle installed at {gradle_dir}")

shutil.rmtree(extract_tmp, ignore_errors=True)
if os.path.exists(zip_path):
    os.remove(zip_path)

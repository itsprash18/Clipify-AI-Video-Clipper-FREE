import os
import sys
import subprocess

jdk = r"L:\tools\jdk-17"
sdk = r"L:\tools\android-sdk"
cmdline_bin = os.path.join(sdk, "cmdline-tools", "latest", "bin", "sdkmanager.bat")

env = os.environ.copy()
env["JAVA_HOME"] = jdk
env["PATH"] = os.path.join(jdk, "bin") + os.pathsep + env.get("PATH", "")
env["ANDROID_HOME"] = sdk
env["ANDROID_SDK_ROOT"] = sdk

packages = ["platform-tools", "platforms;android-34", "build-tools;34.0.0"]

print("Installing Android SDK packages:", packages)
# Accept licenses
p = subprocess.Popen([cmdline_bin, "--licenses"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, text=True)
p.communicate("y\ny\ny\ny\ny\ny\ny\ny\n")

# Install packages
cmd = [cmdline_bin] + packages
p2 = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env, text=True)
while True:
    line = p2.stdout.readline()
    if not line:
        break
    print(line, end="", flush=True)

p2.wait()
print(f"\nsdkmanager finished with code {p2.returncode}")
sys.exit(p2.returncode)

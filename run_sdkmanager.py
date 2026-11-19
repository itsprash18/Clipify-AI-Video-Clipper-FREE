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

args = sys.argv[1:] if len(sys.argv) > 1 else ["--version"]
cmd = [cmdline_bin] + args

print(f"Running: {' '.join(cmd)}")
res = subprocess.run(cmd, env=env, text=True)
sys.exit(res.returncode)

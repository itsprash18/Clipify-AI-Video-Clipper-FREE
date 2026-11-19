import os
import sys
import subprocess
from pathlib import Path

SIGNTOOL_PATH = r"C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe"
OUTPUT_DIR = Path(__file__).resolve().parent

def ensure_certificate():
    """Ensure a code signing certificate exists in the CurrentUser store."""
    ps_check = (
        'Get-ChildItem Cert:\\CurrentUser\\My | '
        'Where-Object { $_.Subject -like "*Clipify AI*" } | '
        'Select-Object -First 1 -ExpandProperty Thumbprint'
    )
    res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_check], capture_output=True, text=True)
    thumbprint = res.stdout.strip()
    if thumbprint:
        print(f"Found existing certificate with thumbprint: {thumbprint}")
        return thumbprint

    print("Creating new Code Signing Certificate for Clipify AI...")
    ps_create = (
        '$cert = New-SelfSignedCertificate -Type CodeSigningCert '
        '-Subject "CN=Clipify AI Open Source Project, O=sherlock-dev-ai, OU=Desktop Engineering" '
        '-FriendlyName "Clipify AI Code Signing Certificate" '
        '-KeyUsage DigitalSignature '
        '-CertStoreLocation Cert:\\CurrentUser\\My '
        '-NotAfter (Get-Date).AddYears(10); '
        '$cert.Thumbprint'
    )
    res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_create], capture_output=True, text=True)
    thumbprint = res.stdout.strip()
    if not thumbprint:
        raise RuntimeError(f"Failed to create certificate: {res.stderr}")
    print(f"Created new certificate with thumbprint: {thumbprint}")
    return thumbprint

def export_public_certificate(thumbprint: str):
    """Export public .cer file for users and automated trust install."""
    cer_path = OUTPUT_DIR / "Clipify_AI_CodeSigning.cer"
    ps_export = (
        f'$cert = Get-Item Cert:\\CurrentUser\\My\\{thumbprint}; '
        f'Export-Certificate -Cert $cert -FilePath "{cer_path}" -Force | Out-Null'
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", ps_export], check=True)
    print(f"Exported public certificate to: {cer_path}")
    return cer_path

def sign_binary(target_exe: Path, thumbprint: str, timestamp_url: str = "http://timestamp.digicert.com"):
    """Sign an executable with Authenticode SHA256 and RFC 3161 timestamp."""
    if not target_exe.exists():
        raise FileNotFoundError(f"Target executable not found: {target_exe}")

    print(f"Signing {target_exe.name} with thumbprint {thumbprint}...")
    ps_sign = (
        f'$cert = Get-Item Cert:\\CurrentUser\\My\\{thumbprint}; '
        f'Set-AuthenticodeSignature -FilePath "{target_exe}" -Certificate $cert -HashAlgorithm SHA256 '
        f'-TimestampServer "{timestamp_url}"'
    )
    res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_sign], capture_output=True, text=True)
    print(res.stdout)
    if "Valid" not in res.stdout and "UnknownError" not in res.stdout:
        print("Set-AuthenticodeSignature warning/output:", res.stderr)

    # Also verify
    ps_verify = f'Get-AuthenticodeSignature "{target_exe}" | Select-Object Status, StatusMessage, SignerCertificate'
    vres = subprocess.run(["powershell", "-NoProfile", "-Command", ps_verify], capture_output=True, text=True)
    print("Verification result:\n", vres.stdout)

if __name__ == "__main__":
    tb = ensure_certificate()
    export_public_certificate(tb)
    if len(sys.argv) > 1:
        target = Path(sys.argv[1])
        sign_binary(target, tb)


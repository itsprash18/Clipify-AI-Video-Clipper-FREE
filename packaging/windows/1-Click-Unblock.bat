@echo off
setlocal
echo ========================================================
echo   Clipify AI - Windows SmartScreen Unblocker
echo ========================================================
echo.
echo Removing browser download quarantine flag (Mark-of-the-Web)...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Get-ChildItem -Path '%~dp0' -Filter '*.exe' | ForEach-Object { Unblock-File $_.FullName; Write-Host '  [OK] Unblocked:' $_.Name }"

echo.
echo ========================================================
echo   Done! You can now run the installer normally.
echo ========================================================
echo.
pause


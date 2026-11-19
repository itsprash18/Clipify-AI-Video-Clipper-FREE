@echo off
setlocal
echo ========================================================
echo   Clipify AI - Code Signing Certificate Trust Tool
echo ========================================================
echo.
echo Installing Clipify AI Open Source Project certificate
echo to current user Trusted Publishers store...
echo.

set "CER_FILE=%~dp0Clipify_AI_CodeSigning.cer"
if not exist "%CER_FILE%" (
    echo [ERROR] Certificate file Clipify_AI_CodeSigning.cer not found in %~dp0
    pause
    exit /b 1
)

certutil -user -addstore TrustedPublisher "%CER_FILE%"

echo.
echo ========================================================
echo   Certificate successfully trusted!
echo   SmartScreen and UAC will now recognize the publisher.
echo ========================================================
echo.
pause


@echo off
rem Batch helper to launch Clipify AI from L:\ClipifyAI cleanly
cd /d "L:\ClipifyAI"
echo [Clipify AI] Launching app server...
start python app.py
echo [Clipify AI] Server launched at http://127.0.0.1:5000
pause


import os
import re

for t in ["index.html", "narrate.html", "live.html"]:
    p = os.path.join(r"L:\ClipifyAI\templates", t)
    with open(p, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    buttons = re.findall(r"<button[^>]*id=[\"']([^\"']+)[\"']", html)
    inputs = re.findall(r"<input[^>]*id=[\"']([^\"']+)[\"']", html)
    modals = re.findall(r"<div[^>]*class=[\"'][^\"']*modal[^\"']*[\"'][^>]*id=[\"']([^\"']+)[\"']", html)
    dialogs = re.findall(r"<dialog[^>]*id=[\"']([^\"']+)[\"']", html)
    nav_links = re.findall(r"<a[^>]*href=[\"']([^\"']+)[\"']", html)
    
    print(f"\n==================== {t} ====================")
    print(f"Buttons ({len(buttons)}): {buttons}")
    print(f"Inputs ({len(inputs)}): {inputs}")
    print(f"Modals ({len(modals)}): {modals}")
    print(f"Dialogs ({len(dialogs)}): {dialogs}")
    print(f"Nav Links ({len(nav_links)}): {nav_links[:15]}")

"""
Clipify AI — Cross-Platform Ollama Model & Service Adapter
Checks local Ollama service health, lists installed models, and provides cross-platform guidance.
"""

import os
import subprocess
import sys
import requests
from typing import Dict, List, Optional
from .binary_locator import get_binary_locator

class OllamaAdapter:
    def __init__(self, host: str = "http://127.0.0.1:11434"):
        self.host = os.environ.get("OLLAMA_HOST", host).rstrip("/")
        self.os_type = sys.platform

    def is_service_running(self) -> bool:
        """Verifies whether the Ollama HTTP API is responsive."""
        try:
            r = requests.get(f"{self.host}/api/version", timeout=1.5)
            return r.status_code == 200
        except Exception:
            return False

    def get_version(self) -> Optional[str]:
        """Returns the version string of the running Ollama server."""
        try:
            r = requests.get(f"{self.host}/api/version", timeout=1.5)
            if r.status_code == 200:
                return r.json().get("version")
        except Exception:
            pass
        return None

    def list_installed_models(self) -> List[Dict[str, any]]:
        """Returns the list of locally available models."""
        try:
            r = requests.get(f"{self.host}/api/tags", timeout=2.5)
            if r.status_code == 200:
                data = r.json()
                return data.get("models", [])
        except Exception:
            pass
        return []

    def get_service_status(self) -> Dict[str, any]:
        """Comprehensive status report for first-run diagnostics."""
        binary = get_binary_locator().find_ollama()
        running = self.is_service_running()
        version = self.get_version() if running else None
        models = self.list_installed_models() if running else []
        
        return {
            "binary_path": binary,
            "binary_installed": binary is not None,
            "service_running": running,
            "version": version,
            "models_count": len(models),
            "models": [m.get("name") for m in models],
            "host": self.host,
            "platform": self.os_type
        }

_ollama_instance = None

def get_ollama_adapter() -> OllamaAdapter:
    global _ollama_instance
    if _ollama_instance is None:
        _ollama_instance = OllamaAdapter()
    return _ollama_instance


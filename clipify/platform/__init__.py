"""
Clipify AI — Platform Abstraction Layer
Provides cross-platform binary discovery, hardware acceleration detection,
OS path resolution, and system service integration.
"""

from .paths import get_platform_paths
from .binary_locator import get_binary_locator
from .hardware import get_hardware_accelerator
from .ollama_adapter import get_ollama_adapter

__all__ = [
    "get_platform_paths",
    "get_binary_locator",
    "get_hardware_accelerator",
    "get_ollama_adapter",
]

"""
Unit tests for Clipify AI Cross-Platform Abstraction Layer.
"""

import sys
from pathlib import Path
from clipify.platform import (
    get_platform_paths,
    get_binary_locator,
    get_hardware_accelerator,
    get_ollama_adapter,
)

def test_platform_paths():
    paths = get_platform_paths()
    assert paths.config_dir is not None
    assert paths.data_dir is not None
    assert paths.cache_dir is not None
    assert paths.default_projects_dir is not None
    assert paths.default_exports_dir is not None

def test_binary_locator():
    loc = get_binary_locator()
    ffmpeg = loc.find_ffmpeg()
    assert ffmpeg is not None, "FFmpeg should be detected"
    ffprobe = loc.find_ffprobe()
    assert ffprobe is not None, "FFprobe should be detected"

def test_hardware_accelerator():
    accel = get_hardware_accelerator().detect_best_encoder()
    assert "encoder" in accel
    assert "args" in accel
    assert isinstance(accel["args"], list)

def test_ollama_adapter():
    ollama = get_ollama_adapter()
    status = ollama.get_service_status()
    assert "service_running" in status
    assert "binary_installed" in status
    assert "platform" in status

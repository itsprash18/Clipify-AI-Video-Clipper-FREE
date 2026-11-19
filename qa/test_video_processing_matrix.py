import json
import os
import subprocess
import pytest
from pathlib import Path

from clipify.platform.binary_locator import get_ffmpeg_path, get_ffprobe_path

@pytest.fixture(scope="module")
def media_tools():
    ffmpeg = get_ffmpeg_path()
    ffprobe = get_ffprobe_path()
    assert ffmpeg and os.path.isfile(ffmpeg), f"FFmpeg not found: {ffmpeg}"
    assert ffprobe and os.path.isfile(ffprobe), f"FFprobe not found: {ffprobe}"
    return {"ffmpeg": ffmpeg, "ffprobe": ffprobe}

def probe_file(ffprobe_bin: str, file_path: str) -> dict:
    cmd = [
        ffprobe_bin,
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        file_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0, f"FFprobe failed: {res.stderr}"
    return json.loads(res.stdout)

def test_generate_and_probe_16x9_landscape_mp4(media_tools, tmp_path):
    output_video = str(tmp_path / "landscape_1080p.mp4")
    # Generate 3 seconds of 1920x1080 30fps color test with 1kHz sine audio
    cmd = [
        media_tools["ffmpeg"], "-y",
        "-f", "lavfi", "-i", "testsrc=duration=3:size=1920x1080:rate=30",
        "-f", "lavfi", "-i", "sine=frequency=1000:duration=3",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        output_video
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0, f"Failed generating test video: {res.stderr}"
    assert os.path.isfile(output_video)

    # Probe metadata
    info = probe_file(media_tools["ffprobe"], output_video)
    video_stream = next(s for s in info["streams"] if s["codec_type"] == "video")
    audio_stream = next(s for s in info["streams"] if s["codec_type"] == "audio")

    assert video_stream["width"] == 1920
    assert video_stream["height"] == 1080
    assert video_stream["codec_name"] == "h264"
    assert audio_stream["codec_name"] == "aac"
    duration = float(info["format"]["duration"])
    assert 2.9 <= duration <= 3.2

def test_crop_16x9_to_9x16_vertical_short(media_tools, tmp_path):
    # Step 1: create 2s landscape
    src = str(tmp_path / "source.mp4")
    dest = str(tmp_path / "vertical_short.mp4")
    subprocess.run([
        media_tools["ffmpeg"], "-y",
        "-f", "lavfi", "-i", "testsrc=duration=2:size=1920x1080:rate=30",
        "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
        "-c:v", "libx264", "-c:a", "aac", src
    ], check=True, capture_output=True)

    # Step 2: Auto crop to 9:16 vertical short (1080x1920 scale or 607x1080 crop scaled to 1080x1920)
    # Using the standard Clipify AI vertical transform
    crop_cmd = [
        media_tools["ffmpeg"], "-y",
        "-i", src,
        "-vf", "crop=ih*9/16:ih,scale=1080:1920",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        dest
    ]
    res = subprocess.run(crop_cmd, capture_output=True, text=True)
    assert res.returncode == 0, f"Crop failed: {res.stderr}"

    info = probe_file(media_tools["ffprobe"], dest)
    video_stream = next(s for s in info["streams"] if s["codec_type"] == "video")
    assert video_stream["width"] == 1080
    assert video_stream["height"] == 1920

def test_audio_extraction_for_whisper(media_tools, tmp_path):
    src = str(tmp_path / "audio_source.mp4")
    dest_wav = str(tmp_path / "extracted_16khz.wav")
    subprocess.run([
        media_tools["ffmpeg"], "-y",
        "-f", "lavfi", "-i", "testsrc=duration=2:size=640x360:rate=30",
        "-f", "lavfi", "-i", "sine=frequency=800:duration=2",
        "-c:v", "libx264", "-c:a", "aac", src
    ], check=True, capture_output=True)

    # Whisper requires 16kHz mono 16-bit PCM WAV
    cmd = [
        media_tools["ffmpeg"], "-y",
        "-i", src,
        "-vn", "-acodec", "pcm_s16le",
        "-ar", "16000", "-ac", "1",
        dest_wav
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0

    info = probe_file(media_tools["ffprobe"], dest_wav)
    audio_stream = next(s for s in info["streams"] if s["codec_type"] == "audio")
    assert audio_stream["codec_name"] == "pcm_s16le"
    assert audio_stream["sample_rate"] == "16000"
    assert audio_stream["channels"] == 1

def test_container_formats_mov_mkv_webm(media_tools, tmp_path):
    # Verify MOV, MKV, and WebM encoding and probing
    formats = [
        ("test.mov", ["-c:v", "libx264", "-c:a", "aac"]),
        ("test.mkv", ["-c:v", "libx264", "-c:a", "aac"]),
        ("test.webm", ["-c:v", "libvpx", "-c:a", "libvorbis"]),
    ]
    for filename, codecs in formats:
        target = str(tmp_path / filename)
        cmd = [
            media_tools["ffmpeg"], "-y",
            "-f", "lavfi", "-i", "testsrc=duration=1:size=640x360:rate=24",
            "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
        ] + codecs + [target]
        res = subprocess.run(cmd, capture_output=True, text=True)
        assert res.returncode == 0, f"Failed for {filename}: {res.stderr}"

        info = probe_file(media_tools["ffprobe"], target)
        assert len(info["streams"]) >= 2
        assert os.path.getsize(target) > 5000

def test_corrupted_file_error_handling(media_tools, tmp_path):
    corrupt_file = str(tmp_path / "corrupted.mp4")
    with open(corrupt_file, "wb") as f:
        f.write(b"NOT_A_REAL_VIDEO_HEADER_12345")

    cmd = [
        media_tools["ffprobe"],
        "-v", "error",
        "-show_format",
        corrupt_file
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    # Must fail with non-zero exit code on corrupted file
    assert res.returncode != 0
    assert len(res.stderr) > 0

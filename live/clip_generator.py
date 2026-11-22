"""Clip rendering engine for Clipify AI Live Studio.

Generates broadcast-quality AI Shorts with intelligent face tracking,
gaming facecam split screen, word-by-word styled captions, and dynamic energy zooms.
"""

from __future__ import annotations

import json
import logging
import os
import subprocess
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from live.rolling_buffer import RollingBuffer
from live.smart_editor import SmartEditor

logger = logging.getLogger("clipify.live.generator")


def _hidden_flags() -> int:
    return getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0


class LiveClipGenerator:
    """Renders final MP4 clips from rolling buffer chunks using SmartEditor."""

    def __init__(
        self,
        ffmpeg_bin: str,
        rolling_buffer: RollingBuffer,
        clips_output_dir: Path,
    ):
        self.ffmpeg_bin = ffmpeg_bin
        self.rolling_buffer = rolling_buffer
        self.clips_output_dir = Path(clips_output_dir)
        self.clips_output_dir.mkdir(parents=True, exist_ok=True)
        self.smart_editor = SmartEditor(ffmpeg_bin)

    def render_clip(
        self,
        start_sec: float,
        end_sec: float,
        title: str,
        category: str,
        subtitle_text: str = "",
        format_type: str = "vertical",
        transcripts: Optional[List[Dict[str, Any]]] = None,
        editing_prefs: Optional[Dict[str, Any]] = None,
        energy_score: float = 7.0,
    ) -> Optional[dict[str, Any]]:
        """Generate intelligently edited Short MP4, 16:9 MP4, and thumbnail."""
        clip_id = uuid.uuid4().hex[:10]
        clip_dir = self.clips_output_dir / clip_id
        clip_dir.mkdir(parents=True, exist_ok=True)

        raw_stitched = clip_dir / "raw_stitched.mp4"
        out_vertical = clip_dir / "short_9_16.mp4"
        out_original = clip_dir / "clip_16_9.mp4"
        out_thumb = clip_dir / "thumb.jpg"

        # 1. Stitch raw footage from buffer
        ok = self.rolling_buffer.extract_stitched_video(start_sec, end_sec, raw_stitched, reencode=True)
        if not ok or not raw_stitched.exists() or raw_stitched.stat().st_size < 1000:
            logger.warning("Failed extracting raw stitched video for clip %s", clip_id)
            return None

        # 2. Intelligent AI Short Editing
        duration = max(1.0, end_sec - start_sec)
        decision = self.smart_editor.edit(
            raw_video_path=raw_stitched,
            output_vertical=out_vertical,
            transcripts=transcripts or [],
            clip_start=start_sec,
            clip_duration=duration,
            editing_prefs=editing_prefs,
            energy_score=energy_score,
        )

        # 3. Render 16:9 original format
        cmd_orig = [
            self.ffmpeg_bin, "-y",
            "-i", str(raw_stitched),
            "-c", "copy",
            "-movflags", "+faststart",
            str(out_original),
        ]
        subprocess.run(
            cmd_orig, capture_output=True, text=True,
            timeout=30, creationflags=_hidden_flags(),
        )

        # 4. Generate poster thumbnail
        thumb_src = out_vertical if (out_vertical.exists() and out_vertical.stat().st_size > 1000) else (raw_stitched if raw_stitched.exists() else out_original)
        cmd_thumb = [
            self.ffmpeg_bin, "-y",
            "-ss", "00:00:01.000",
            "-i", str(thumb_src),
            "-vframes", "1",
            "-q:v", "2",
            str(out_thumb),
        ]
        subprocess.run(
            cmd_thumb, capture_output=True, text=True,
            timeout=15, creationflags=_hidden_flags(),
        )

        # Remove temporary intermediate raw stitched file to conserve space
        try:
            if raw_stitched.exists():
                raw_stitched.unlink()
        except Exception:
            pass

        # Generate viral packaging (Title, Description, Hashtags & Tags)
        clean_title = title.strip() if title else f"Live Highlight #{clip_id[:4]}"
        if transcripts:
            all_words = []
            for t in transcripts:
                w_list = t.get("words")
                if w_list:
                    all_words.extend([w.get("word", "") for w in w_list])
                elif t.get("text"):
                    all_words.extend(t.get("text").split())
            if all_words:
                cand_title = " ".join(all_words[:6]).strip()
                if len(cand_title) >= 5 and "Live Highlight" in clean_title:
                    clean_title = cand_title.capitalize() + " 🔥"

        description = (
            f"🎮 {clean_title}\n\n"
            f"Epic stream moment captured with Clipify AI Live Studio. "
            f"Features dynamic gaming split-screen, high-contrast animated subtitles, and AI highlight detection.\n\n"
            f"⏱️ Timestamp: {round(start_sec, 1)}s - {round(end_sec, 1)}s ({round(duration, 1)}s)\n"
            f"🎯 Layout: {decision.layout.replace('_', ' ').title()}\n\n"
            f"Subscribe and drop a like for more viral stream highlights!"
        )

        base_tags = ["#Shorts", "#Gaming", "#LiveStream", "#ViralShorts", "#ClipifyAI", "#Highlights", "#KickClips", "#KickLive", "#TwitchClips", "#YouTubeShorts", "#Gamer"]
        low_t = (clean_title + " " + " ".join(t.get("text", "") for t in (transcripts or []))).lower()
        if any(w in low_t for w in ["gta", "car", "drift", "speed", "drive"]):
            base_tags.extend(["#GTA5", "#GTAV", "#Drift", "#Clutch"])
        elif any(w in low_t for w in ["minecraft", "craft", "parkour"]):
            base_tags.extend(["#Minecraft", "#MinecraftShorts"])
        elif any(w in low_t for w in ["mad", "rage", "fail", "omg", "lol"]):
            base_tags.extend(["#StreamerRage", "#FunnyClips", "#InstantRegret"])

        tags_str = " ".join(base_tags)

        clip_record: dict[str, Any] = {
            "id": clip_id,
            "title": clean_title,
            "category": category,
            "description": description,
            "tags": base_tags,
            "tags_str": tags_str,
            "start_sec": round(start_sec, 2),
            "end_sec": round(end_sec, 2),
            "duration": round(duration, 1),
            "vertical_video": f"/api/live/media/{clip_id}/short_9_16.mp4",
            "original_video": f"/api/live/media/{clip_id}/clip_16_9.mp4",
            "thumbnail": f"/api/live/media/{clip_id}/thumb.jpg",
            "created_at": time.time(),
            "formatted_time": time.strftime("%H:%M:%S", time.localtime()),
            "status": "ready",
            "layout": decision.layout,
            "content_type": decision.content_type,
            "face_tracked": decision.face_tracked,
            "facecam_detected": decision.facecam_detected,
            "captions_applied": decision.captions_applied,
            "caption_style": decision.caption_style,
            "energy_zoom": decision.energy_zoom,
            "badges": decision.badges,
        }

        # Save metadata JSON
        meta_file = clip_dir / "meta.json"
        meta_file.write_text(json.dumps(clip_record, indent=2), encoding="utf-8")

        return clip_record

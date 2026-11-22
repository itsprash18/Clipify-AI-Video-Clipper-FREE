"""Content Analyzer for Clipify AI Live Studio.

Classifies incoming video highlights into intelligent editing modes:
- gaming_facecam: Gameplay with persistent corner streamer webcam.
- gaming_fullscreen: Fast-paced gameplay footage without facecam.
- podcast: Two or more prominent speakers conversing.
- talking_head: Single prominent speaker / commentator.
- reaction: Reaction layout (commentary over media).
- general: General entertainment / landscape footage.
"""

from __future__ import annotations

import logging
import os
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("clipify.live.analyzer")


@dataclass
class FaceBox:
    x: float  # Normalized 0.0 - 1.0 (left)
    y: float  # Normalized 0.0 - 1.0 (top)
    w: float  # Normalized 0.0 - 1.0 (width)
    h: float  # Normalized 0.0 - 1.0 (height)
    confidence: float = 1.0

    @property
    def cx(self) -> float:
        return self.x + self.w / 2.0

    @property
    def cy(self) -> float:
        return self.y + self.h / 2.0


@dataclass
class ContentProfile:
    mode: str  # "gaming_facecam", "talking_head", "podcast", "gaming_fullscreen", "general"
    layout: str  # "gaming_split", "face_track", "dual_split", "blurred_frame"
    confidence: float
    facecam_box: Optional[dict[str, Any]] = None
    faces_detected: int = 0
    primary_face_x: float = 0.5
    primary_face_y: Optional[float] = None
    secondary_face_x: Optional[float] = None
    secondary_face_y: Optional[float] = None
    tags: list[str] = field(default_factory=list)


class ContentAnalyzer:
    """Extracts visual and spatial signals to determine the optimal Shorts editing layout."""

    def __init__(self, ffmpeg_bin: Optional[str] = None):
        self.ffmpeg_bin = ffmpeg_bin
        self._cv2 = None
        self._haar = None
        self._mtcnn = None
        self._init_vision()

    def _init_vision(self) -> None:
        try:
            import cv2
            self._cv2 = cv2
            haar_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            if os.path.exists(haar_path):
                self._haar = cv2.CascadeClassifier(haar_path)
        except Exception as e:
            logger.warning("OpenCV init warning in ContentAnalyzer: %s", e)

        try:
            import torch
            from facenet_pytorch import MTCNN
            device = "cuda:0" if torch.cuda.is_available() else "cpu"
            self._mtcnn = MTCNN(keep_all=True, device=device)
        except Exception:
            self._mtcnn = None

    def analyze(self, video_path: Union[str, Path], transcript_text: str = "", sample_count: int = 6) -> ContentProfile:
        """Analyze a video file and return its classified editing profile."""
        p = Path(video_path)
        if not p.exists() or not self._cv2:
            return ContentProfile(mode="general", layout="blurred_frame", confidence=0.5, tags=["Standard Framing"])

        cv2 = self._cv2
        cap = cv2.VideoCapture(str(p))
        if not cap.isOpened():
            return ContentProfile(mode="general", layout="blurred_frame", confidence=0.5, tags=["Standard Framing"])

        samples = []
        try:
            total_frames = max(1, int(cap.get(cv2.CAP_PROP_FRAME_COUNT)))
            # Sample 6 frames evenly spaced across the clip duration
            ratios = (0.15, 0.30, 0.45, 0.60, 0.75, 0.90)
            for r in ratios:
                idx = min(total_frames - 1, int(total_frames * r))
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret and frame is not None:
                    samples.append(frame)
        finally:
            cap.release()

        if len(samples) < 2:
            return ContentProfile(mode="general", layout="blurred_frame", confidence=0.5, tags=["Standard Framing"])

        # Detect faces in samples
        frame_detections: list[list[FaceBox]] = []
        for frame in samples:
            frame_detections.append(self._detect_faces_in_frame(frame))

        # Check for gaming corner facecam
        facecam = self._detect_corner_facecam(frame_detections)
        if facecam:
            return ContentProfile(
                mode="gaming_facecam",
                layout="gaming_split",
                confidence=facecam.get("confidence", 0.85),
                facecam_box=facecam,
                faces_detected=1,
                primary_face_x=facecam.get("x", 0.76) + facecam.get("w", 0.22) / 2.0,
                primary_face_y=facecam.get("y", 0.68) + facecam.get("h", 0.26) / 2.0,
                tags=["Gaming Facecam", "Dynamic Split-Screen"],
            )

        # Count visible persistent faces
        avg_faces = sum(len(d) for d in frame_detections) / max(1, len(frame_detections))

        # Check for podcast / 2-person interview
        if avg_faces >= 1.6:
            # Check if faces appear on distinct horizontal halves (left and right)
            left_faces = 0
            right_faces = 0
            for d in frame_detections:
                for f in d:
                    if f.cx < 0.48:
                        left_faces += 1
                    elif f.cx > 0.52:
                        right_faces += 1

            if left_faces >= 2 and right_faces >= 2:
                return ContentProfile(
                    mode="podcast",
                    layout="dual_split",
                    confidence=0.82,
                    faces_detected=2,
                    primary_face_x=0.28,
                    secondary_face_x=0.72,
                    tags=["Multi-Speaker Conversation", "Two-Person Split"],
                )

        # Check for single talking head (vlog, commentary, educator)
        if avg_faces >= 0.6:
            # Compute average face position
            all_faces = [f for d in frame_detections for f in d]
            avg_x = sum(f.cx for f in all_faces) / max(1, len(all_faces))
            avg_y = sum(f.cy for f in all_faces) / max(1, len(all_faces))
            return ContentProfile(
                mode="talking_head",
                layout="face_track",
                confidence=0.88,
                faces_detected=1,
                primary_face_x=avg_x,
                primary_face_y=avg_y,
                tags=["Subject Face Tracking", "Smart 9:16 Reframe"],
            )

        # No persistent face found. Check transcript context for gaming or general
        text_lower = transcript_text.lower()
        gaming_keywords = ("kill", "game", "clutch", "boss", "round", "level", "died", "pog", "gg", "weapon")
        if any(kw in text_lower for kw in gaming_keywords):
            return ContentProfile(
                mode="gaming_fullscreen",
                layout="blurred_frame",
                confidence=0.75,
                tags=["Gameplay Action", "Full Gameplay Safe Area"],
            )

        return ContentProfile(
            mode="general",
            layout="blurred_frame",
            confidence=0.60,
            tags=["Dynamic Presentation", "Blurred Background"],
        )

    def _detect_faces_in_frame(self, frame) -> list[FaceBox]:
        """Detect faces in a single frame using MTCNN with Haar fallback."""
        cv2 = self._cv2
        h, w = frame.shape[:2]
        boxes: list[FaceBox] = []

        # Downscale for high-speed inference while preserving small streamer facecams
        scale = min(1.0, 960.0 / max(1, w))
        small = cv2.resize(frame, (int(w * scale), int(h * scale))) if scale < 1.0 else frame
        sw, sh = small.shape[1], small.shape[0]

        if self._mtcnn is not None:
            try:
                from PIL import Image
                rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
                res_boxes, probs = self._mtcnn.detect(Image.fromarray(rgb), landmarks=False)
                if res_boxes is not None:
                    for b, p in zip(res_boxes.tolist(), probs.tolist()):
                        if (p or 0) >= 0.70:
                            boxes.append(FaceBox(
                                x=max(0.0, b[0] / sw),
                                y=max(0.0, b[1] / sh),
                                w=min(1.0, (b[2] - b[0]) / sw),
                                h=min(1.0, (b[3] - b[1]) / sh),
                                confidence=float(p),
                            ))
                    if boxes:
                        return boxes
            except Exception:
                pass

        if self._haar is not None:
            try:
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                haar_faces = self._haar.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20))
                for (x, y, fw, fh) in haar_faces:
                    boxes.append(FaceBox(
                        x=x / sw,
                        y=y / sh,
                        w=fw / sw,
                        h=fh / sh,
                        confidence=0.70,
                    ))
            except Exception:
                pass

        return boxes

    def _detect_corner_facecam(self, frame_detections: list[list[FaceBox]]) -> Optional[dict[str, Any]]:
        """Identify if a facecam persists in one of the 4 outer corners across samples."""
        corner_hits: list[FaceBox] = []

        for d in frame_detections:
            for f in d:
                # Streamer facecams typically occupy 1.8% to 30% of frame width
                # and sit strictly along the outer corners/lateral borders (never central gameplay zone)
                if 0.018 <= f.w <= 0.30:
                    # Outer corner / lateral border check:
                    # Streamers place cameras in outer edges (cx <= 0.30 or cx >= 0.70)
                    # Central gameplay (0.30 < cx < 0.70) is excluded to avoid detecting moving in-game characters
                    is_corner = (f.cx <= 0.30 or f.cx >= 0.70) or (f.cy <= 0.22 and (f.cx <= 0.35 or f.cx >= 0.65))
                    if is_corner:
                        corner_hits.append(f)

        if len(corner_hits) < 2:
            return None

        # Cluster persistent detections by spatial proximity
        clusters: list[list[FaceBox]] = []
        for f in corner_hits:
            matched = False
            for cl in clusters:
                ref = cl[0]
                if abs(f.cx - ref.cx) < 0.10 and abs(f.cy - ref.cy) < 0.15:
                    cl.append(f)
                    matched = True
                    break
            if not matched:
                clusters.append([f])

        if not clusters:
            return None

        # Choose the best streamer facecam cluster:
        # Avoid picking in-game character portraits (which typically sit in the bottom-left HUD with 0 drift)
        # when a streamer webcam exists in the top-right, bottom-right, or has natural live human micro-motion.
        def _cluster_streamer_score(cl: list[FaceBox]) -> float:
            c_len = len(cl)
            if c_len < 2:
                return -1.0
            c_cx = sum(h.cx for h in cl) / c_len
            c_cy = sum(h.cy for h in cl) / c_len
            c_drift = max(abs(h.cx - c_cx) + abs(h.cy - c_cy) for h in cl)
            if c_drift > 0.14:
                return -1.0
            score = float(c_len)
            # Streamers place webcam in top-right or bottom-right ~90% of the time
            if c_cx >= 0.65:
                score += 2.5
            elif c_cx <= 0.30 and c_cy >= 0.70:
                # Bottom-left is classic game HUD portrait / minimap location
                score -= 1.5
            # Real human streamers show natural micro-drift between sampled frames
            if 0.003 <= c_drift <= 0.12:
                score += 1.5
            return score

        valid_clusters = [cl for cl in clusters if len(cl) >= 2]
        if not valid_clusters:
            return None
        hits = max(valid_clusters, key=_cluster_streamer_score)

        avg_cx = sum(h.cx for h in hits) / len(hits)
        avg_cy = sum(h.cy for h in hits) / len(hits)
        avg_w = sum(h.w for h in hits) / len(hits)
        avg_h = sum(h.h for h in hits) / len(hits)

        # Streamer webcam overlays are fixed in position; reject clusters with high spatial drift
        max_drift = max(abs(h.cx - avg_cx) + abs(h.cy - avg_cy) for h in hits)
        if max_drift > 0.14:
            return None

        # Tight crop directly around the streamer's person/webcam (zero gameplay bleed)
        # Facecam overlays in 16:9 streams are ~18-22% wide and ~20-25% high
        box_w = max(0.16, min(0.22, avg_w * 4.0))
        box_h = max(0.20, min(0.26, avg_h * 2.8))
        left = max(0.0, min(1.0 - box_w, avg_cx - box_w / 2.0))
        top = max(0.0, min(1.0 - box_h, avg_cy - box_h * 0.45))

        corner_key = ("t" if avg_cy < 0.5 else "b") + ("l" if avg_cx < 0.5 else "r")

        return {
            "x": round(left, 3),
            "y": round(top, 3),
            "w": round(box_w, 3),
            "h": round(box_h, 3),
            "corner": corner_key,
            "confidence": min(0.95, 0.60 + len(hits) * 0.08),
        }

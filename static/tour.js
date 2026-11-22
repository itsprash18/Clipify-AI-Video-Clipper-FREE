/**
 * Clipify AI - Interactive Guided Workspace Tour & Support System
 * Automatically recognizes the active workspace:
 * - Create a Short (/ or #create)
 * - Projects Workspace (#projects)
 * - Post-Processing Editor (#editor)
 * - Beta Testing Lab (#beta)
 * - Live Stream Studio (/live)
 * - AI Narration Studio (/narrate)
 */
(function () {
  const TOUR_STORAGE_KEY = 'clipify_tour_completed';

  // ==========================================
  // 1. CREATE A SHORT STEPS (index.html #create)
  // ==========================================
  const CREATE_STEPS = [
    {
      target: '#openInput, #openOutput',
      title: '1. Quick Workspace Folder Access',
      desc: 'Instant 1-click access to your files: <b>[ Open input ]</b> opens your raw footage folder, and <b>[ Open output ]</b> opens your rendered 9:16 vertical shorts in Windows File Explorer.',
      pos: 'bottom'
    },
    {
      target: '#dropzone, #videoInput',
      title: '2. Video Import & Drag-and-Drop Zone',
      desc: 'Drag and drop any long-form video file (MP4, MKV, MOV, WEBM) directly into this dropzone, or browse local drives with instant codec validation.',
      pos: 'right'
    },
    {
      target: '#youtubeUrl, #fetchUrl',
      title: '3. YouTube Link Ingestion',
      desc: 'Paste any public YouTube URL and click <b>Import</b> to download and process long videos automatically at full resolution.',
      pos: 'bottom'
    },
    {
      target: '#navClearCacheLink, #create .btn-clear-cache-link, .btn-clear-cache-link',
      title: '4. Clear Cache & Temporary Footage',
      desc: 'Reclaim gigabytes of disk storage in 1 click! Safely purges cached Whisper transcriptions and downloaded YouTube video files without touching your finished shorts in <code>output/</code>.',
      pos: 'bottom'
    },
    {
      target: '#modelSelect, #btnOpenModelHub',
      title: '5. AI Intelligence Engine & Model Hub',
      desc: 'Choose your local Ollama LLM (Qwen 2.5 7B, Llama 3.2, DeepSeek) or connect Hugging Face Serverless Cloud for instant highlight extraction.',
      pos: 'top'
    },
    {
      target: '#provTabOllama, #provTabHuggingFace',
      title: '6. Local vs Cloud AI Provider Switcher',
      desc: 'Switch between <b>Local Ollama</b> (100% private, offline, zero API fees) and <b>Hugging Face Cloud</b> (instant cloud processing requiring 0 GB of local RAM).',
      pos: 'top'
    },
    {
      target: '#fontSelect',
      title: '7. Subtitle Typography & Fonts',
      desc: 'Select high-legibility subtitle fonts: <b>Montserrat Extra Bold</b>, <b>Impact</b>, <b>Segoe UI Black</b>, or <b>Arial Black</b> with high-contrast outlines.',
      pos: 'top'
    },
    {
      target: '#clips',
      title: '8. Target Number of Shorts',
      desc: 'Configure how many distinct viral clips (1 to 4) the AI should discover, rank, frame, and export from your source video.',
      pos: 'top'
    },
    {
      target: '#minDuration, #maxDuration',
      title: '9. Short Duration Range (Seconds)',
      desc: 'Define minimum and maximum clip duration (25s–60s). The AI refines speech boundaries to prevent awkward sentence cutoffs.',
      pos: 'top'
    },
    {
      target: '#splitScreenToggle',
      title: '10. Split-Screen Podcasting Layout',
      desc: 'Transform horizontal interviews and video podcasts into stacked 9:16 vertical shorts. Automatically frames conversation partners on top and bottom.',
      pos: 'bottom'
    },
    {
      target: '#gamingSplitToggle, #gamingSplitRow',
      title: '11. 🎮 Gaming Split-Screen Architecture',
      desc: '<b>ENABLED:</b> Full gameplay stream on top + Streamer webcam on bottom.<br><b>DISABLED:</b> 2-person conversation split with face-tracking.',
      pos: 'bottom'
    },
    {
      target: '#fastWhisperToggle',
      title: '12. Turbo WhisperX Acceleration',
      desc: 'Toggle Turbo WhisperX for up to 5x faster offline speech-to-text transcription with GPU CUDA acceleration and word-level timestamp alignment.',
      pos: 'top'
    },
    {
      target: '#logoEnabled, #watermarkPanel',
      title: '13. Watermark & Logo Overlay',
      desc: 'Brand your clips automatically with custom channel logos, selectable anchor positions (top-right, bottom-center), and optional chroma-key background removal.',
      pos: 'top'
    },
    {
      target: '#createBtn',
      title: '14. 1-Click Generate Shorts',
      desc: 'Click Generate to execute the complete local pipeline: Audio extraction → WhisperX transcription → Ollama viral scoring → 9:16 smart framing → Caption burn-in.',
      pos: 'top'
    },
    {
      target: '#progressPanel',
      title: '15. Real-Time Pipeline Tracker',
      desc: 'Follow live progress updates across every phase: Transcribe, AI Analyze, Smart Edit, Captions, and Final Render with detailed event logs.',
      pos: 'top'
    }
  ];

  // ==========================================
  // 2. PROJECTS WORKSPACE STEPS (#projects)
  // ==========================================
  const PROJECTS_STEPS = [
    {
      target: '#refreshProjects',
      title: '1. Refresh Project Library',
      desc: 'Scan local workspace and jobs folders to sync newly rendered clips or updates across sessions.',
      pos: 'bottom'
    },
    {
      target: '#projectList',
      title: '2. Rendered Shorts Library & Clip Grid',
      desc: 'Replay finished 9:16 vertical cuts, copy AI-generated titles & hashtags in one click, download MP4s, or launch the post-processing editor.',
      pos: 'top'
    },
    {
      target: '#refreshTrash, #trashList',
      title: '3. Built-In Recycle Bin & Recovery Shelf',
      desc: 'Never lose accidental deletions! Deleted projects are safely staged here where they can be restored back to your active library or permanently erased.',
      pos: 'top'
    }
  ];

  // ==========================================
  // 3. POST-PROCESSING EDITOR STEPS (#editor)
  // ==========================================
  const EDITOR_STEPS = [
    {
      target: '#editorPreviewFrame, #reviewVideo',
      title: '1. Interactive 9:16 Preview Frame',
      desc: 'Review your vertical cut in full resolution with interactive playback, pause, seeking, and real-time canvas overlays.',
      pos: 'right'
    },
    {
      target: '#editorLogo, #editorDragHint',
      title: '2. Draggable Watermark & Logo Overlay',
      desc: 'Brand a finished Short without rerunning AI pipelines! Drag overlays directly on the video player with live visual coordinates.',
      pos: 'left'
    },
    {
      target: '#editorClipSwitcher',
      title: '3. Multi-Cut Switcher',
      desc: 'Easily cycle between all candidate shorts generated for this job to review and export individual variations.',
      pos: 'left'
    },
    {
      target: '#reviewTitle, #reviewMeta',
      title: '4. Project Metadata & Render Specs',
      desc: 'Displays resolution (1080 × 1920), duration, source parent job ID, and AI viral hook rating.',
      pos: 'left'
    }
  ];

  // ==========================================
  // 4. BETA TESTING LAB STEPS (#beta)
  // ==========================================
  const BETA_STEPS = [
    {
      target: '#betaDropZone, #betaFileInput',
      title: '1. Beta Source Footage Dropzone',
      desc: 'Drag & drop raw horizontal clips here or browse files to test the next-generation AI video processing engine.',
      pos: 'bottom'
    },
    {
      target: '#betaYtUrl, #betaYtImportBtn',
      title: '2. Experimental YouTube Link Ingestion',
      desc: 'Paste any video URL and click <b>Import</b> to download and test experimental stream segmenting at full 1080p resolution.',
      pos: 'bottom'
    },
    {
      target: '#beta .btn-clear-cache-link, .btn-clear-cache-link',
      title: '3. Clear Beta Cache & Storage',
      desc: 'Clean downloaded YouTube test videos and Whisper caches with 1 click to keep your drives clean without touching rendered shorts.',
      pos: 'bottom'
    },
    {
      target: '#betaSplitRatioRow, #betaSplitRatio, #betaLayout',
      title: '4. Two-Panel Split-Ratio Framing',
      desc: 'Fine-tune exact split ratio percentages (e.g. 50/50, 60/40) for stacked horizontal-to-vertical compositions with live drag handle.',
      pos: 'left'
    },
    {
      target: '#betaPremiumCaptions, #betaCaptionPreset',
      title: '5. Premium Motion Subtitles',
      desc: 'Test kinetic typography styles with high-energy scale-pop bouncy words, glowing strokes, and animated text transitions.',
      pos: 'left'
    },
    {
      target: '#betaSituationalCues',
      title: '6. Situational Action Cues',
      desc: 'Enable AI context cues that highlight dramatic gasps, screaming reactions, laughter, and gameplay climax moments.',
      pos: 'left'
    },
    {
      target: '#betaWatermarkEnabled, #betaWatermarkText',
      title: '7. Custom Watermark Branding',
      desc: 'Overlay channel handles or custom text stamps with adjustable opacity, angle tilt, and anchor positions.',
      pos: 'left'
    },
    {
      target: '#betaRunPipelineBtn',
      title: '8. Run Experimental AI Pipeline',
      desc: 'Execute experimental segmentation and framing models with real-time profiling and live GPU acceleration metrics.',
      pos: 'top'
    },
    {
      target: '#betaPreviewFrame, #betaResultVideo',
      title: '9. Real-Time Result Monitor & Split Resizer',
      desc: 'Watch the newly processed beta vertical Short inside the 9:16 interactive player frame with live draggable split resizer handle.',
      pos: 'left'
    },
    {
      target: '#betaTextEditorPanel, #betaTextInput, #betaApplyTextBtn',
      title: '10. Draggable Text & Timeline Overlay',
      desc: 'Brand or annotate your Short directly! Drag text overlay anywhere on the video preview, set start/end timestamps on the timeline, and adjust font, color, and background box.',
      pos: 'left'
    },
    {
      target: '#betaDownloadBtn, #betaOpenInEditor',
      title: '11. Direct Download & Edit Actions',
      desc: 'Download the rendered MP4 immediately or jump directly to the full Post-Processing Editor.',
      pos: 'left'
    }
  ];

  // ==========================================
  // 5. LIVE STUDIO STEPS (/live)
  // ==========================================
  const LIVE_STEPS = [
    {
      target: '.source-tabs',
      title: '1. Multi-Platform Stream Ingestion',
      desc: 'Select your live stream source: <b>YouTube Live</b>, <b>Twitch Live</b>, <b>Kick Live</b>, or local <b>OBS Studio</b> RTMP ingestion.',
      pos: 'bottom'
    },
    {
      target: '#liveSourceUrl, #btnConnectStream',
      title: '2. Stream Connection & Status Bar',
      desc: 'Paste any public live stream or channel URL and click <b>Connect & Start Clipping</b> to attach the real-time buffer.',
      pos: 'bottom'
    },
    {
      target: '#btnObsGuide, #obsConfigBox',
      title: '3. OBS Studio Local RTMP Stream Ingestion',
      desc: 'Stream directly from OBS on the same PC! Click <b>OBS Setup</b> for your local RTMP Server URL and Stream Key to capture private streams latency-free.',
      pos: 'bottom'
    },
    {
      target: '#monitorScreen, #waveform',
      title: '4. 16:9 Broadcast Centerpiece Preview Monitor',
      desc: 'Live broadcast preview with stream title, active duration, buffer health, and real-time audio waveform visualizer.',
      pos: 'right'
    },
    {
      target: '#btnInstantClip, #btnLiveClipNow',
      title: '5. ⚡ Instant Clip Quick Capture',
      desc: 'Hit the instant clip button to immediately capture the last 15s, 30s, or 60s of broadcast into a framed 9:16 vertical Short.',
      pos: 'bottom'
    },
    {
      target: '#toggleAutoClip',
      title: '6. Hands-Free Automated Clipping Engine',
      desc: 'Enable Auto-Clipping to let AI continuously monitor the live stream, detect climax moments and chat spikes, and auto-render vertical Shorts while you stream.',
      pos: 'left'
    },
    {
      target: '#autoClipIntervalSelect, #autoClipTargetInput',
      title: '7. Auto-Clip Frequency & Target Limits',
      desc: 'Configure how often the AI evaluates stream buffers (e.g. every 5 mins) and set maximum clip targets (1 - 100 clips) before pausing.',
      pos: 'left'
    },
    {
      target: '#sensitivitySlider',
      title: '8. Highlight Detection Sensitivity Slider',
      desc: 'Adjust sensitivity from 1 (only the highest viral peaks) to 10 (frequent energetic clips) to match your broadcast style.',
      pos: 'left'
    },
    {
      target: '#toggleAutoEdit, #toggleFaceTrack',
      title: '9. AI Smart Editing & Speaker Face Tracking',
      desc: 'Automatically tracks streamer and guest face centroids, applying smooth deadzone framing and energy zooms on excited reactions.',
      pos: 'left'
    },
    {
      target: '#toggleGamingLayout',
      title: '10. Gaming Split-Screen Architecture',
      desc: 'When enabled: Full gameplay on top + Streamer webcam on bottom. When disabled: 2-person conversation split (host on top + guest below).',
      pos: 'left'
    },
    {
      target: '#toggleAutoCaptions',
      title: '11. Animated Live Auto-Captions',
      desc: 'Automatically transcribes spoken dialogue and burns dynamic word-by-word karaoke subtitles in your chosen typography.',
      pos: 'left'
    },
    {
      target: '#toggleCustomText, #customTextInput',
      title: '12. Custom Branding Watermark & Channel Handle',
      desc: 'Add custom broadcast watermarks (e.g., LIVE · @MYCHANNEL) with selectable positioning and brand colors.',
      pos: 'left'
    },
    {
      target: '#transcriptFeed',
      title: '13. Real-Time Whisper Speech-to-Text Feed',
      desc: 'Live continuous speech-to-text transcription as the streamer talks, timestamping every sentence and calculating engagement velocity.',
      pos: 'left'
    },
    {
      target: '#studioConsolePanel',
      title: '14. Studio Activity & Event Console',
      desc: 'Monitors real-time live events, stream resolution, buffer ingestion metrics, and highlight detection triggers.',
      pos: 'top'
    },
    {
      target: '#btnRankClipsAi',
      title: '15. AI Viral Hook Clip Ranker Terminal',
      desc: 'Click <b>RANK CLIPS AI</b> to run local LLM evaluations on all captured clips, scoring hook power and ordering top viral candidates.',
      pos: 'top'
    },
    {
      target: '#liveClipsGrid',
      title: '16. Live Shorts Gallery & Batch Controls',
      desc: 'Horizontal shelf displaying all rendered live clips. Preview videos, copy AI titles, download MP4s, or batch select and delete unwanted clips.',
      pos: 'top'
    }
  ];

  // ==========================================
  // 6. NARRATION STUDIO STEPS (/narrate)
  // ==========================================
  const NARRATE_STEPS = [
    {
      target: '#targetDuration',
      title: '1. Target Video Length Slider',
      desc: 'Set the target duration for your Short from 30 to 60 seconds. The AI automatically calibrates spoken word count and pacing to match.',
      pos: 'bottom'
    },
    {
      target: '#scriptInput, #wordCount',
      title: '2. Narration Dialogue & Script Input',
      desc: 'Write or paste spoken narration dialogue, story hooks, or facts. The live word counter and estimated duration update in real time.',
      pos: 'right'
    },
    {
      target: '#scriptPrompt, #generateScript, #improveScript',
      title: '3. AI Script Writing & 1-Click Polish',
      desc: 'Describe an idea in the AI prompt box and click <b>Generate with AI</b>, or click <b>Improve with AI</b> to rewrite your draft for higher retention with strong hooks.',
      pos: 'right'
    },
    {
      target: '#voiceGrid, #voiceSearch',
      title: '4. Neural Kokoro Voice Actors',
      desc: 'Browse and audition high-fidelity offline neural voice actors. Filter by tone, accent, and style with zero cloud API latency.',
      pos: 'right'
    },
    {
      target: '#voiceSpeed',
      title: '5. Voice Pacing & Speed Adjustment',
      desc: 'Fine-tune spoken speech delivery from Slower (-2), Natural (0), to Faster (+2) for high-energy Shorts.',
      pos: 'top'
    },
    {
      target: '#clipFolder, #chooseClipFolder',
      title: '6. Atmosphere & Background Footage',
      desc: 'Select licensed vertical 9:16 background gameplay (GTA 5 Stunts, Subway Surfers, Minecraft Parkour) or change to your custom folders.',
      pos: 'right'
    },
    {
      target: '#btnDownloadExtra',
      title: '7. Additional Background Gameplay (62 Videos)',
      desc: 'Click to automatically download 62 additional licensed vertical gameplay backgrounds in high quality directly to your library.',
      pos: 'right'
    },
    {
      target: '#customVideo',
      title: '8. Custom Gameplay Video Upload',
      desc: 'Want your own gameplay behind the story? Click here to upload any local video clip directly into the Narration Studio.',
      pos: 'right'
    },
    {
      target: '#presetGrid',
      title: '9. Word-Sync Subtitle Presets',
      desc: 'Choose your caption aesthetic: <b>Sync yellow</b> (active word follows audio), <b>White + yellow</b>, or <b>Color words</b>.',
      pos: 'right'
    },
    {
      target: '#captionSize',
      title: '10. Caption Typography Size Slider',
      desc: 'Scale your vertical caption typography up to 120px for maximum readability on mobile feeds.',
      pos: 'top'
    },
    {
      target: '#generateNarrate',
      title: '11. Generate Narrated Short',
      desc: 'Click Generate to synthesize offline Kokoro neural audio, align speech timestamps, composite background gameplay, and burn dynamic subtitles.',
      pos: 'top'
    },
    {
      target: '#narratePreview',
      title: '12. 9:16 Live Preview & Video Player',
      desc: 'Review the completed vertical Short in the responsive 9:16 video player with full playback controls.',
      pos: 'left'
    },
    {
      target: '.timeline',
      title: '13. Multi-Track Timeline Sync',
      desc: 'Visual timeline showing multi-track synchronization across voice audio, video clip, and subtitles.',
      pos: 'left'
    },
    {
      target: '#narrateDownload',
      title: '14. Instant Download & Social Export',
      desc: 'Download ready-to-post MP4 videos with 1 click, or click <b>Share / Publish</b> to prepare metadata for YouTube Shorts, TikTok, and Instagram Reels.',
      pos: 'left'
    },
    {
      target: '#narrateHistory',
      title: '15. Narration Archive & History Shelf',
      desc: 'Browse, replay, and manage previously generated narrated shorts stored locally on your PC.',
      pos: 'top'
    }
  ];

  // Distinct section theming colors (designed for aesthetic, non-AI craft look)
  const CONTEXT_THEMES = {
    beta: {
      name: 'Beta Testing Lab',
      label: '🧪 Beta Lab',
      steps: BETA_STEPS,
      accent: '#22c55e',
      accentLight: '#4ade80',
      accentGlow: 'rgba(34, 197, 94, 0.45)',
      badgeBg: 'rgba(34, 197, 94, 0.12)',
      badgeBorder: 'rgba(34, 197, 94, 0.35)',
    },
    create: {
      name: 'Create a Short',
      label: '🎬 Create',
      steps: CREATE_STEPS,
      accent: '#f59e0b',
      accentLight: '#fbbf24',
      accentGlow: 'rgba(245, 158, 11, 0.45)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
    },
    projects: {
      name: 'Projects Workspace',
      label: '📁 Projects',
      steps: PROJECTS_STEPS,
      accent: '#06b6d4',
      accentLight: '#22d3ee',
      accentGlow: 'rgba(6, 182, 212, 0.45)',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      badgeBorder: 'rgba(6, 182, 212, 0.35)',
    },
    editor: {
      name: 'Post-Processing Editor',
      label: '✂️ Editor',
      steps: EDITOR_STEPS,
      accent: '#a855f7',
      accentLight: '#c084fc',
      accentGlow: 'rgba(168, 85, 247, 0.45)',
      badgeBg: 'rgba(168, 85, 247, 0.12)',
      badgeBorder: 'rgba(168, 85, 247, 0.35)',
    },
    live: {
      name: 'Live Studio',
      label: '🔴 Live Studio',
      steps: LIVE_STEPS,
      accent: '#ef4444',
      accentLight: '#f87171',
      accentGlow: 'rgba(239, 68, 68, 0.45)',
      badgeBg: 'rgba(239, 68, 68, 0.12)',
      badgeBorder: 'rgba(239, 68, 68, 0.35)',
    },
    narrate: {
      name: 'Narration Studio',
      label: '🎙️ Narration Studio',
      steps: NARRATE_STEPS,
      accent: '#0284c7',
      accentLight: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.45)',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.35)',
    }
  };

  // Helper to accurately determine active workspace context
  function getCurrentPageContext() {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('/live')) return 'live';
    if (p.includes('/narrate')) return 'narrate';

    // 1. Check which DOM section is currently visible in single-page application
    const sections = ['beta', 'projects', 'editor', 'create'];
    for (const s of sections) {
      const el = document.getElementById(s);
      if (el) {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden' && (el.classList.contains('visible') || el.offsetParent !== null)) {
          return s;
        }
      }
    }

    // 2. Check active navigation link in sidebar
    const activeNav = document.querySelector('[data-nav].active');
    if (activeNav && activeNav.dataset.nav && sections.includes(activeNav.dataset.nav)) {
      return activeNav.dataset.nav;
    }

    // 3. Check hash
    const h = (window.location.hash || '').replace('#', '').toLowerCase();
    if (sections.includes(h)) return h;

    return 'create';
  }

  // Scoped, resilient target element locator
  function findVisibleTarget(selectorString, currentContext) {
    if (!selectorString) return null;
    const parts = selectorString.split(',');

    let sectionContainer = null;
    if (currentContext === 'beta') {
      sectionContainer = document.querySelector('#beta');
    } else if (currentContext === 'projects') {
      sectionContainer = document.querySelector('#projects');
    } else if (currentContext === 'editor') {
      sectionContainer = document.querySelector('#editor');
    } else if (currentContext === 'create') {
      sectionContainer = document.querySelector('#create') || document.querySelector('main');
    }

    // 1. Prioritize elements inside the current workspace section container
    if (sectionContainer) {
      for (const p of parts) {
        const sel = p.trim();
        try {
          const els = sectionContainer.querySelectorAll(sel);
          for (let el of els) {
            const resolved = resolveVisibleElement(el);
            if (resolved) return resolved;
          }
        } catch (_) {}
      }
    }

    // 2. Fall back to search globally in document
    for (const p of parts) {
      const sel = p.trim();
      try {
        const els = document.querySelectorAll(sel);
        for (let el of els) {
          const resolved = resolveVisibleElement(el);
          if (resolved) return resolved;
        }
      } catch (_) {}
    }

    return null;
  }

  function resolveVisibleElement(el) {
    if (!el) return null;

    // Checkbox, radio, or file inputs: automatically target the enclosing visible label/toggle-row
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio' || el.type === 'file' || el.type === 'hidden')) {
      const parentLabel = el.closest('label') || el.closest('.toggle-row') || el.parentElement;
      if (parentLabel) el = parentLabel;
    }

    // Must be in DOM and visible
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') {
      return null;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width > 4 && rect.height > 4) {
      return el;
    }
    return null;
  }

  // Position card comfortably with center-alignment on the orthogonal axis
  function positionCard(rect, preferredPos, cardWidth, cardHeight) {
    const margin = 20;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left, top;

    if (preferredPos === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left + (rect.width - cardWidth) / 2;
      if (top + cardHeight > vh - margin) {
        top = rect.top - cardHeight - margin;
      }
    } else if (preferredPos === 'top') {
      top = rect.top - cardHeight - margin;
      left = rect.left + (rect.width - cardWidth) / 2;
      if (top < margin) {
        top = rect.bottom + margin;
      }
    } else if (preferredPos === 'right') {
      left = rect.right + margin;
      top = rect.top + (rect.height - cardHeight) / 2;
      if (left + cardWidth > vw - margin) {
        left = rect.left - cardWidth - margin;
      }
    } else { // left
      left = rect.left - cardWidth - margin;
      top = rect.top + (rect.height - cardHeight) / 2;
      if (left < margin) {
        left = rect.right + margin;
      }
    }

    left = Math.max(margin, Math.min(left, vw - cardWidth - margin));
    top = Math.max(margin, Math.min(top, vh - cardHeight - margin));

    return { left, top };
  }

  // Compute smooth, aesthetically curved cubic Bezier curve connecting card and spotlight anchor
  function computeCurvedDottedConnector(cardRect, spotRect) {
    const cMidX = cardRect.left + cardRect.width / 2;
    const cMidY = cardRect.top + cardRect.height / 2;
    const sMidX = spotRect.left + spotRect.width / 2;
    const sMidY = spotRect.top + spotRect.height / 2;

    let x1, y1, x2, y2, cx1, cy1, cx2, cy2;

    const dx = sMidX - cMidX;
    const dy = sMidY - cMidY;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx > 0) {
        // Target is to the RIGHT of card
        x1 = cardRect.right;
        y1 = Math.max(cardRect.top + 20, Math.min(cardRect.bottom - 20, cardRect.top + cardRect.height * 0.4));
        x2 = spotRect.left;
        y2 = Math.max(spotRect.top + 8, Math.min(spotRect.bottom - 8, sMidY));
        const spanX = Math.max(60, (x2 - x1) * 0.55);
        const verticalBow = (y2 >= y1) ? -25 : 25;
        cx1 = x1 + spanX;
        cy1 = y1 + verticalBow;
        cx2 = x2 - spanX;
        cy2 = y2 - verticalBow * 0.5;
      } else {
        // Target is to the LEFT of card
        x1 = cardRect.left;
        y1 = Math.max(cardRect.top + 20, Math.min(cardRect.bottom - 20, cardRect.top + cardRect.height * 0.4));
        x2 = spotRect.right;
        y2 = Math.max(spotRect.top + 8, Math.min(spotRect.bottom - 8, sMidY));
        const spanX = Math.max(60, (x1 - x2) * 0.55);
        const verticalBow = (y2 >= y1) ? -25 : 25;
        cx1 = x1 - spanX;
        cy1 = y1 + verticalBow;
        cx2 = x2 + spanX;
        cy2 = y2 - verticalBow * 0.5;
      }
    } else {
      if (dy > 0) {
        // Target is BELOW card
        x1 = Math.max(cardRect.left + 24, Math.min(cardRect.right - 24, cMidX));
        y1 = cardRect.bottom;
        x2 = Math.max(spotRect.left + 8, Math.min(spotRect.right - 8, sMidX));
        y2 = spotRect.top;
        const spanY = Math.max(50, (y2 - y1) * 0.55);
        const horizontalBow = (x2 >= x1) ? 30 : -30;
        cx1 = x1 + horizontalBow;
        cy1 = y1 + spanY;
        cx2 = x2 - horizontalBow * 0.5;
        cy2 = y2 - spanY;
      } else {
        // Target is ABOVE card
        x1 = Math.max(cardRect.left + 24, Math.min(cardRect.right - 24, cMidX));
        y1 = cardRect.top;
        x2 = Math.max(spotRect.left + 8, Math.min(spotRect.right - 8, sMidX));
        y2 = spotRect.bottom;
        const spanY = Math.max(50, (y1 - y2) * 0.55);
        const horizontalBow = (x2 >= x1) ? 30 : -30;
        cx1 = x1 + horizontalBow;
        cy1 = y1 - spanY;
        cx2 = x2 - horizontalBow * 0.5;
        cy2 = y2 + spanY;
      }
    }

    const pathStr = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    return { pathStr, x1, y1, x2, y2 };
  }

  let currentContext = 'create';
  let tourSteps = CREATE_STEPS;
  let currentStepIndex = 0;
  let overlayEl = null;
  let spotlightEl = null;
  let cardEl = null;
  let svgEl = null;
  let pathEl = null;
  let anchorDotEl = null;
  let anchorPulseEl = null;
  let cardDotEl = null;
  let supportModalOverlayEl = null;

  function initTourElements() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'tourOverlay';

    spotlightEl = document.createElement('div');
    spotlightEl.id = 'tourSpotlight';
    overlayEl.appendChild(spotlightEl);

    // SVG container for animated curved dotted line
    svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.id = 'tourConnectorSvg';
    svgEl.setAttribute('class', 'tour-connector-svg');

    pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.id = 'tourConnectorPath';
    pathEl.setAttribute('class', 'tour-connector-path');
    svgEl.appendChild(pathEl);

    anchorPulseEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    anchorPulseEl.id = 'tourAnchorPulse';
    anchorPulseEl.setAttribute('class', 'tour-anchor-pulse');
    svgEl.appendChild(anchorPulseEl);

    anchorDotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    anchorDotEl.id = 'tourAnchorDot';
    anchorDotEl.setAttribute('class', 'tour-anchor-dot');
    svgEl.appendChild(anchorDotEl);

    cardDotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cardDotEl.id = 'tourCardDot';
    cardDotEl.setAttribute('class', 'tour-card-dot');
    svgEl.appendChild(cardDotEl);

    overlayEl.appendChild(svgEl);

    cardEl = document.createElement('div');
    cardEl.id = 'tourCard';
    overlayEl.appendChild(cardEl);

    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl || e.target === spotlightEl) {
        endTour();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!overlayEl || !overlayEl.classList.contains('active')) return;
      if (e.key === 'Escape') endTour();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
    });

    window.addEventListener('resize', updateSpotlightAndConnector);
    window.addEventListener('scroll', updateSpotlightAndConnector, { passive: true });

    document.body.appendChild(overlayEl);
  }

  function startTour(force = false, contextOverride = null) {
    if (window.isAndroidApp && !force) {
      return;
    }
    if (!force && localStorage.getItem(TOUR_STORAGE_KEY)) {
      return;
    }

    currentContext = contextOverride || getCurrentPageContext();
    const info = CONTEXT_THEMES[currentContext] || CONTEXT_THEMES['create'];
    tourSteps = info.steps;

    initTourElements();
    currentStepIndex = 0;
    overlayEl.style.display = 'block';
    overlayEl.classList.add('active');
    renderCurrentStep();
  }

  function endTour() {
    if (!overlayEl) return;
    overlayEl.classList.remove('active');
    overlayEl.style.display = 'none';
    if (svgEl) svgEl.style.display = 'none';
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }

  function nextStep() {
    if (currentStepIndex < tourSteps.length - 1) {
      currentStepIndex++;
      renderCurrentStep();
    } else {
      endTour();
      showSupportModal();
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      renderCurrentStep();
    }
  }

  function updateConnectorCurve(theme) {
    if (!svgEl || !pathEl || !cardEl || !spotlightEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const spotRect = spotlightEl.getBoundingClientRect();

    if (spotRect.width <= 4 || spotRect.height <= 4 || cardRect.width === 0) {
      svgEl.style.display = 'none';
      return;
    }
    svgEl.style.display = 'block';

    pathEl.setAttribute('stroke', theme.accentLight);
    pathEl.style.filter = `drop-shadow(0 0 7px ${theme.accentGlow})`;
    anchorDotEl.setAttribute('fill', theme.accentLight);
    anchorPulseEl.setAttribute('stroke', theme.accentLight);
    cardDotEl.setAttribute('fill', theme.accentLight);

    const conn = computeCurvedDottedConnector(cardRect, spotRect);
    pathEl.setAttribute('d', conn.pathStr);
    anchorDotEl.setAttribute('cx', conn.x2);
    anchorDotEl.setAttribute('cy', conn.y2);
    anchorPulseEl.setAttribute('cx', conn.x2);
    anchorPulseEl.setAttribute('cy', conn.y2);
    cardDotEl.setAttribute('cx', conn.x1);
    cardDotEl.setAttribute('cy', conn.y1);
  }

  function updateSpotlightAndConnector() {
    if (!overlayEl || !overlayEl.classList.contains('active')) return;
    const theme = CONTEXT_THEMES[currentContext] || CONTEXT_THEMES['create'];
    tourSteps = theme.steps;
    const step = tourSteps[currentStepIndex];
    if (!step) return;

    const targetEl = findVisibleTarget(step.target, currentContext);
    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const pad = 8;
    spotlightEl.style.top = Math.max(0, rect.top - pad) + 'px';
    spotlightEl.style.left = Math.max(0, rect.left - pad) + 'px';
    spotlightEl.style.width = (rect.width + pad * 2) + 'px';
    spotlightEl.style.height = (rect.height + pad * 2) + 'px';

    const cardWidth = 360;
    const cardHeight = cardEl.offsetHeight || 220;
    const pos = positionCard(rect, step.pos, cardWidth, cardHeight);
    cardEl.style.top = pos.top + 'px';
    cardEl.style.left = pos.left + 'px';

    updateConnectorCurve(theme);
  }

  function renderCurrentStep() {
    const theme = CONTEXT_THEMES[currentContext] || CONTEXT_THEMES['create'];
    tourSteps = theme.steps;
    const step = tourSteps[currentStepIndex];
    if (!step) return;

    if (step.isFinal) {
      endTour();
      showSupportModal();
      return;
    }

    // Apply section color themes to overlay CSS custom properties
    overlayEl.style.setProperty('--tour-accent', theme.accent);
    overlayEl.style.setProperty('--tour-accent-light', theme.accentLight);
    overlayEl.style.setProperty('--tour-accent-glow', theme.accentGlow);
    overlayEl.style.setProperty('--tour-badge-bg', theme.badgeBg);
    overlayEl.style.setProperty('--tour-badge-border', theme.badgeBorder);

    // Locate visible target
    let targetEl = findVisibleTarget(step.target, currentContext);

    if (!targetEl) {
      if (currentStepIndex < tourSteps.length - 1) {
        currentStepIndex++;
        renderCurrentStep();
      } else {
        endTour();
        showSupportModal();
      }
      return;
    }

    try {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch (_) {
      targetEl.scrollIntoView();
    }

    setTimeout(() => {
      const rect = targetEl.getBoundingClientRect();
      const pad = 8;

      spotlightEl.style.display = 'block';
      spotlightEl.style.top = Math.max(0, rect.top - pad) + 'px';
      spotlightEl.style.left = Math.max(0, rect.left - pad) + 'px';
      spotlightEl.style.width = (rect.width + pad * 2) + 'px';
      spotlightEl.style.height = (rect.height + pad * 2) + 'px';
      spotlightEl.style.borderRadius = '16px';

      // Clean card without cross-page switcher bar
      cardEl.innerHTML = `
        <div class="tour-card-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="tour-context-badge">${theme.label}</span>
            <span class="tour-step-badge">COMPONENT ${currentStepIndex + 1} OF ${tourSteps.length}</span>
          </div>
          <button type="button" class="tour-skip-btn" id="tourSkipBtn">Skip</button>
        </div>
        <h3 class="tour-card-title">${step.title}</h3>
        <p class="tour-card-desc">${step.desc}</p>
        <div class="tour-card-footer">
          <div class="tour-nav-btns">
            ${currentStepIndex > 0 ? `<button type="button" class="tour-btn tour-btn-prev" id="tourPrevBtn">← Previous</button>` : ''}
            <button type="button" class="tour-btn tour-btn-next" id="tourNextBtn">
              ${currentStepIndex === tourSteps.length - 1 ? 'Finish Tour ★' : 'Next →'}
            </button>
          </div>
        </div>
      `;

      cardEl.querySelector('#tourSkipBtn')?.addEventListener('click', endTour);
      cardEl.querySelector('#tourPrevBtn')?.addEventListener('click', prevStep);
      cardEl.querySelector('#tourNextBtn')?.addEventListener('click', nextStep);

      const cardWidth = 360;
      const cardHeight = cardEl.offsetHeight || 220;
      const pos = positionCard(rect, step.pos, cardWidth, cardHeight);

      cardEl.style.top = pos.top + 'px';
      cardEl.style.left = pos.left + 'px';
      cardEl.style.display = 'block';

      // Update animated curved dotted SVG line
      requestAnimationFrame(() => {
        updateConnectorCurve(theme);
      });
    }, 110);
  }

  // ==========================================
  // SUPPORT MODAL (Star & Follow Community Support)
  // ==========================================
  function initSupportModal() {
    if (supportModalOverlayEl) return;

    supportModalOverlayEl = document.createElement('div');
    supportModalOverlayEl.id = 'supportModalOverlay';
    supportModalOverlayEl.className = 'support-modal-overlay';
    supportModalOverlayEl.innerHTML = `
      <div class="support-modal-card">
        <button type="button" class="support-modal-close" aria-label="Close modal">&times;</button>
        <div class="support-modal-header">
          <div class="support-modal-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h3>Support Clipify AI</h3>
          <p>Clipify AI is built <b>100% free, private, and open-source</b> with zero subscriptions. Starring our repository and following the developer helps immensely to sustain continuous free updates for the entire community!</p>
        </div>
        <div class="support-modal-actions">
          <a class="support-btn-star" href="https://github.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>Star the Repository ★</span>
          </a>
          <a class="support-btn-follow" href="https://github.com/sherlock-dev-ai" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>Follow @sherlock-dev-ai</span>
          </a>
        </div>
        <div class="support-modal-footer">
          <button type="button" class="support-modal-dismiss">Back to Clipify AI</button>
        </div>
      </div>
    `;

    supportModalOverlayEl.querySelector('.support-modal-close')?.addEventListener('click', closeSupportModal);
    supportModalOverlayEl.querySelector('.support-modal-dismiss')?.addEventListener('click', closeSupportModal);

    supportModalOverlayEl.addEventListener('click', (e) => {
      if (e.target === supportModalOverlayEl) {
        closeSupportModal();
      }
    });

    supportModalOverlayEl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.AndroidBridge && window.AndroidBridge.openBrowser) {
          e.preventDefault();
          window.AndroidBridge.openBrowser(link.href);
        }
      });
    });

    document.body.appendChild(supportModalOverlayEl);
  }

  function showSupportModal() {
    initSupportModal();
    supportModalOverlayEl.style.display = 'flex';
    requestAnimationFrame(() => {
      supportModalOverlayEl.classList.add('active');
    });
  }

  function closeSupportModal() {
    if (!supportModalOverlayEl) return;
    supportModalOverlayEl.classList.remove('active');
    setTimeout(() => {
      supportModalOverlayEl.style.display = 'none';
    }, 280);
  }

  function bindNavLinks() {
    document.querySelectorAll('#navGuideLink').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        startTour(true);
      });
    });

    document.querySelectorAll('#navSupportLink').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showSupportModal();
      });
    });

    function handleHash() {
      const h = window.location.hash.toLowerCase();
      if (h === '#support') {
        setTimeout(showSupportModal, 120);
      } else if (h === '#guide') {
        setTimeout(() => startTour(true), 120);
      }
    }
    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindNavLinks);
  } else {
    bindNavLinks();
  }

  window.startClipifyTour = (ctx) => startTour(true, ctx);
  window.showSupportModal = () => showSupportModal();
})();

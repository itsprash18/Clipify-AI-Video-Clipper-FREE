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
      target: '#youtubeUrl',
      title: '3. YouTube Link Ingestion',
      desc: 'Paste any public YouTube URL and click <b>Import</b> to download and process long videos automatically at full resolution.',
      pos: 'bottom'
    },
    {
      target: '#navClearCacheLink, .btn-clear-cache-link',
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
      desc: 'Drop raw horizontal clips here to test the next-generation AI video processing engine.',
      pos: 'bottom'
    },
    {
      target: '#betaYtUrl, #betaYtImportBtn',
      title: '2. Experimental YouTube Link Ingestion',
      desc: 'Paste a video URL and click Fetch Link to test stream segmenting and live buffer downloads.',
      pos: 'bottom'
    },
    {
      target: '.btn-clear-cache-link',
      title: '3. Clear Beta Cache & Storage',
      desc: 'Clean downloaded YouTube test videos and Whisper caches with 1 click to keep your drives uncluttered.',
      pos: 'bottom'
    },
    {
      target: '#betaLayout, #betaSplitRatio',
      title: '4. Two-Panel Split-Ratio Framing',
      desc: 'Fine-tune exact split ratio percentages (e.g. 50/50, 60/40) for stacked horizontal-to-vertical compositions.',
      pos: 'left'
    },
    {
      target: '#betaPremiumCaptions, #betaCaptionPreset',
      title: '5. Premium Motion Subtitles',
      desc: 'Test kinetic typography styles with high-energy bouncy words, glowing strokes, and animated text transitions.',
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
      desc: 'Overlay channel handles or custom text stamps with adjustable opacity and tilt angle.',
      pos: 'left'
    },
    {
      target: '#betaRunPipelineBtn',
      title: '8. Run Experimental AI Pipeline',
      desc: 'Execute experimental segmentation and framing models with real-time profiling and GPU metrics.',
      pos: 'top'
    },
    {
      target: '#betaPreviewFrame, #betaResultVideo',
      title: '9. Real-Time Result Monitor',
      desc: 'Watch the newly processed beta vertical Short inside the 9:16 interactive player frame.',
      pos: 'left'
    },
    {
      target: '#betaDownloadBtn, #betaOpenInEditor',
      title: '10. Direct Download & Edit Actions',
      desc: 'Download the rendered MP4 immediately or jump directly to the post-processing editor.',
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

  // Helper to determine active workspace context
  function getCurrentPageContext() {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('/live')) return 'live';
    if (p.includes('/narrate')) return 'narrate';

    const h = (window.location.hash || '').replace('#', '').toLowerCase();
    if (h === 'projects') return 'projects';
    if (h === 'editor') return 'editor';
    if (h === 'beta') return 'beta';
    return 'create';
  }

  function getStepsForContext(ctx) {
    switch (ctx) {
      case 'live':
        return { name: 'Live Studio', label: '🔴 Live Studio', steps: LIVE_STEPS };
      case 'narrate':
        return { name: 'Narration Studio', label: '🎙️ Narration Studio', steps: NARRATE_STEPS };
      case 'projects':
        return { name: 'Projects Workspace', label: '📁 Projects', steps: PROJECTS_STEPS };
      case 'editor':
        return { name: 'Post-Processing Editor', label: '✂️ Editor', steps: EDITOR_STEPS };
      case 'beta':
        return { name: 'Beta Testing Lab', label: '🧪 Beta Lab', steps: BETA_STEPS };
      default:
        return { name: 'Create a Short', label: '🎬 Create', steps: CREATE_STEPS };
    }
  }

  let currentContext = 'create';
  let tourSteps = CREATE_STEPS;
  let currentStepIndex = 0;
  let overlayEl = null;
  let spotlightEl = null;
  let cardEl = null;
  let supportModalOverlayEl = null;

  function initTourElements() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'tourOverlay';

    spotlightEl = document.createElement('div');
    spotlightEl.id = 'tourSpotlight';
    overlayEl.appendChild(spotlightEl);

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

    window.addEventListener('resize', () => {
      if (overlayEl && overlayEl.classList.contains('active')) {
        renderCurrentStep();
      }
    });

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
    const info = getStepsForContext(currentContext);
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

  function switchTourContext(targetCtx) {
    if (targetCtx === 'live') {
      if (window.location.pathname.toLowerCase().includes('/live')) {
        currentContext = 'live';
        tourSteps = LIVE_STEPS;
        currentStepIndex = 0;
        renderCurrentStep();
      } else {
        window.location.href = '/live#guide';
      }
      return;
    }

    if (targetCtx === 'narrate') {
      if (window.location.pathname.toLowerCase().includes('/narrate')) {
        currentContext = 'narrate';
        tourSteps = NARRATE_STEPS;
        currentStepIndex = 0;
        renderCurrentStep();
      } else {
        window.location.href = '/narrate#guide';
      }
      return;
    }

    // Target is on index.html
    const isIndex = !window.location.pathname.toLowerCase().includes('/live') && !window.location.pathname.toLowerCase().includes('/narrate');
    if (!isIndex) {
      window.location.href = '/#' + targetCtx;
      return;
    }

    if (typeof window.navigateTo === 'function') {
      window.navigateTo(targetCtx);
    }
    currentContext = targetCtx;
    const info = getStepsForContext(targetCtx);
    tourSteps = info.steps;
    currentStepIndex = 0;
    setTimeout(() => {
      renderCurrentStep();
    }, 80);
  }

  function renderCurrentStep() {
    const step = tourSteps[currentStepIndex];
    if (!step) return;

    if (step.isFinal) {
      endTour();
      showSupportModal();
      return;
    }

    // Attempt to locate target element
    let targetEl = null;
    const parts = step.target.split(',');
    for (const p of parts) {
      const el = document.querySelector(p.trim());
      if (el && el.offsetParent !== null && !el.hidden) {
        targetEl = el;
        break;
      }
    }
    if (!targetEl) {
      for (const p of parts) {
        const el = document.querySelector(p.trim());
        if (el) {
          targetEl = el;
          break;
        }
      }
    }

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

      const info = getStepsForContext(currentContext);

      const switcherHtml = `
        <div class="tour-page-switcher">
          <button type="button" class="tour-page-btn ${currentContext === 'create' ? 'active' : ''}" data-ctx="create">🎬 Create</button>
          <button type="button" class="tour-page-btn ${currentContext === 'projects' ? 'active' : ''}" data-ctx="projects">📁 Projects</button>
          <button type="button" class="tour-page-btn ${currentContext === 'editor' ? 'active' : ''}" data-ctx="editor">✂️ Editor</button>
          <button type="button" class="tour-page-btn ${currentContext === 'beta' ? 'active' : ''}" data-ctx="beta">🧪 Beta Lab</button>
          <button type="button" class="tour-page-btn ${currentContext === 'narrate' ? 'active' : ''}" data-ctx="narrate">🎙️ Narrate</button>
          <button type="button" class="tour-page-btn ${currentContext === 'live' ? 'active' : ''}" data-ctx="live">🔴 Live</button>
        </div>
      `;

      cardEl.innerHTML = `
        ${switcherHtml}
        <div class="tour-card-header">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="tour-context-badge">${info.label}</span>
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

      cardEl.querySelectorAll('.tour-page-btn').forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetCtx = b.getAttribute('data-ctx');
          switchTourContext(targetCtx);
        });
      });

      cardEl.querySelector('#tourSkipBtn')?.addEventListener('click', endTour);
      cardEl.querySelector('#tourPrevBtn')?.addEventListener('click', prevStep);
      cardEl.querySelector('#tourNextBtn')?.addEventListener('click', nextStep);

      // Positioning logic
      const cardWidth = 360;
      const cardHeight = cardEl.offsetHeight || 240;
      const margin = 16;
      let cardTop = 0;
      let cardLeft = 0;

      if (step.pos === 'bottom') {
        cardTop = rect.bottom + margin;
        cardLeft = rect.left;
        if (cardTop + cardHeight > window.innerHeight) {
          cardTop = Math.max(margin, rect.top - cardHeight - margin);
        }
      } else if (step.pos === 'top') {
        cardTop = rect.top - cardHeight - margin;
        cardLeft = rect.left;
        if (cardTop < margin) {
          cardTop = rect.bottom + margin;
        }
      } else if (step.pos === 'right') {
        cardLeft = rect.right + margin;
        cardTop = rect.top;
        if (cardLeft + cardWidth > window.innerWidth) {
          cardLeft = Math.max(margin, rect.left - cardWidth - margin);
        }
      } else {
        cardLeft = rect.left - cardWidth - margin;
        cardTop = rect.top;
        if (cardLeft < margin) {
          cardLeft = rect.right + margin;
        }
      }

      cardLeft = Math.max(margin, Math.min(cardLeft, window.innerWidth - cardWidth - margin));
      cardTop = Math.max(margin, Math.min(cardTop, window.innerHeight - cardHeight - margin));

      cardEl.style.top = cardTop + 'px';
      cardEl.style.left = cardLeft + 'px';
      cardEl.style.display = 'block';
    }, 100);
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

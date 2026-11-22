/**
 * Clipify AI - Interactive Guided Onboarding Tour & Support Modal
 * Comprehensive component-level walkthrough covering all features across all tabs:
 * Workspace & Create, Narration Studio, Live Studio, Projects, Editor, Beta Features, Models, Mascot & Support.
 */
(function() {
  const TOUR_STORAGE_KEY = 'clipify_tour_completed';

  // ==========================================
  // 1. WORKSPACE & CREATE STEPS (index.html)
  // ==========================================
  const INDEX_STEPS = [
    {
      target: '#openInput, #openOutput',
      section: 'create',
      title: '1. Quick Workspace Folder Access',
      desc: 'Instant 1-click access to your files: <b>[ Open input ]</b> opens your raw footage folder, and <b>[ Open output ]</b> opens your rendered 9:16 vertical shorts in Windows File Explorer.',
      pos: 'bottom'
    },
    {
      target: '#dropZone',
      section: 'create',
      title: '2. Video Import & Drag-and-Drop Zone',
      desc: 'Drag and drop any long-form video file (MP4, MKV, MOV, WEBM) directly into this dropzone, or browse your local drives.',
      pos: 'right'
    },
    {
      target: '#youtubeUrl, #importYoutubeBtn',
      section: 'create',
      title: '3. YouTube Link Ingestion',
      desc: 'Paste any public YouTube URL and click <b>Import</b> to download and process long videos automatically at full resolution.',
      pos: 'bottom'
    },
    {
      target: '.sample-pills, #samplesContainer',
      section: 'create',
      title: '4. Quick Test Footage Presets',
      desc: 'Click any sample chip (Gaming, Tech Review, Action, Podcast) to test the AI video pipeline immediately without downloading your own footage.',
      pos: 'bottom'
    },
    {
      target: '.intent-row, #presets',
      section: 'create',
      title: '5. AI Editing Intelligence & Vibes',
      desc: 'Select how AI analyzes and cuts your footage: <b>Gaming</b> (facecam + gameplay sync), <b>Viral</b> (high retention & hook rating), <b>Funny</b> (reaction timing), <b>Dramatic</b> (suspense pacing), or <b>Educational</b> (key takeaways).',
      pos: 'bottom'
    },
    {
      target: '.split-options, #splitScreenToggle',
      section: 'create',
      title: '6. Split-Screen Podcasting & Facecam Framing',
      desc: 'Transform horizontal interviews and gaming streams into stacked 9:16 vertical shorts. AI auto-detects speakers, placing the active host on top and the guest or gameplay below.',
      pos: 'bottom'
    },
    {
      target: '#splitSlider, .split-resizer, .split-slider-wrap',
      section: 'create',
      title: '7. Draggable Seam Resizer Slider',
      desc: 'Drag the split-ratio slider to adjust the exact dividing line between top and bottom video frames with real-time percentage readouts.',
      pos: 'top'
    },
    {
      target: '.caption-card, #captionPresetRow',
      section: 'create',
      title: '8. Dynamic Word-Sync Subtitles',
      desc: 'Select Hormozi-style animated subtitles: <b>Yellow Punch</b> (active word follows spoken audio), <b>Clean White</b>, or <b>Color Pop</b> with automatic high-energy emoji cues.',
      pos: 'top'
    },
    {
      target: '#captionFontSelect',
      section: 'create',
      title: '9. Subtitle Typography & Fonts',
      desc: 'Choose from high-legibility fonts including Montserrat Extra Bold, Impact, Segoe UI Black, and Arial Black with customizable outlines and shadows.',
      pos: 'top'
    },
    {
      target: '#modelSelect',
      section: 'create',
      title: '10. Local AI Intelligence Engine',
      desc: 'Choose your local Ollama LLM (Qwen 2.5 3B, Qwen 2.5 7B, Llama 3.2) or connect Hugging Face Serverless Cloud (0 GB RAM required) for highlight extraction.',
      pos: 'top'
    },
    {
      target: '#fastWhisperToggle, .whisper-switch',
      section: 'create',
      title: '11. Turbo WhisperX Speech Acceleration',
      desc: 'Toggle Turbo WhisperX for up to 5x faster offline speech-to-text transcription with GPU CUDA acceleration and word-level timestamp alignment.',
      pos: 'top'
    },
    {
      target: '#generateShorts, #pipelineProgressBar',
      section: 'create',
      title: '12. 1-Click Generation & Pipeline Tracker',
      desc: 'Click Generate to execute the complete local pipeline: Audio extraction → WhisperX transcription → Ollama viral scoring → 9:16 smart framing → Caption burn-in.',
      pos: 'top'
    },
    {
      target: '#navProjectsLink',
      section: 'projects',
      title: '13. Projects: Workspace & Clip Library',
      desc: 'Replay all rendered 9:16 vertical cuts, copy AI-generated titles & hashtags in one click, download MP4s, or search, filter, and restore deleted projects from the built-in Recycle Bin.',
      pos: 'right'
    },
    {
      target: '#navEditorLink',
      section: 'editor',
      title: '14. Editor: Post-Processing & Branding',
      desc: 'Fine-tune finished videos without re-running AI pipelines: 9:16 vertical camera framing with pan (X/Y) & zoom, custom watermark/logo overlays with chroma key transparency, and subtitle font overrides.',
      pos: 'right'
    },
    {
      target: '#navBetaLink',
      section: 'beta',
      title: '15. Beta Lab: Dynamic Video Slicing',
      desc: 'Test the newest cutting algorithms before release: multi-tier video segmentation, motion pop graphic subtitles, situational action cues, and live GPU/CPU pipeline profiling.',
      pos: 'right'
    },
    {
      target: '#navNarrateLink',
      title: '16. Narration Studio: Script-to-Short',
      desc: 'Generate viral voiceover stories completely offline with zero API costs: Write stories or prompt AI to brainstorm hooks, pick Kokoro neural TTS voice actors with speed pacing, and pair with licensed vertical gameplay.',
      pos: 'right',
      actionButton: { text: 'Open Narration Studio ↗', url: '/narrate' }
    },
    {
      target: '#navLiveLink',
      title: '17. Live Studio: Real-Time Stream Clipper',
      desc: 'Connect live streams from YouTube Live, Twitch, Kick Live, or OBS Studio via RTMP stream key. Features real-time Whisper speech transcription, automatic viral climax spike detection, and instant vertical Short production.',
      pos: 'right',
      actionButton: { text: 'Open Live Studio ↗', url: '/live' }
    },
    {
      target: '#navModelsLink',
      title: '18. Model Hub: Local & Cloud Inference',
      desc: 'Explore open-weight models auto-managed via Ollama, or connect Hugging Face Serverless Cloud for instant free inference without using local RAM.',
      pos: 'right'
    },
    {
      target: '#navUpdateLink',
      title: '19. Live Software Updater',
      desc: 'Stay up-to-date with one click! Checks GitHub for new patches and downloads updates directly into Clipify AI without full reinstallation.',
      pos: 'right'
    },
    {
      target: '#navSupportLink',
      title: '20. Support Us: Free & Open-Source ⭐',
      desc: 'Clipify AI is 100% free with zero subscriptions. Click Support Us anytime to star the GitHub repository and follow the developer to keep free AI accessible to everyone!',
      pos: 'right'
    },
    {
      target: '#sidebarCreatureCard',
      title: '21. Forest Runner: Mascot & Offline Minigame',
      desc: 'Meet our confused running mascot flanked by swaying pine trees! Click the creature anytime to open the Forest Runner mini-game popup — jump over woodland hazards while waiting for your AI clips to render.',
      pos: 'right'
    },
    {
      target: '#creatureSupportLink',
      title: '22. Need Help? Direct Support Chat',
      desc: 'Have questions, feedback, or need help setting up? Click the <b>"need help?"</b> board held by our mascot to chat directly with our team in our Instagram creator support group!',
      pos: 'right',
      actionButton: { text: 'Open Instagram Support ↗', url: 'https://ig.me/j/AQj1lYCWh_iV_S7J/', target: '_blank' }
    },
    {
      isFinal: true,
      title: 'Support Clipify AI ⭐',
      desc: 'Clipify AI is built 100% free, private, and local with zero paywalls. Starring the GitHub repo and following the developer helps immensely to support free updates!'
    }
  ];

  // ==========================================
  // 2. NARRATION STUDIO STEPS (/narrate)
  // ==========================================
  const NARRATE_STEPS = [
    {
      target: '.length-control, #targetDuration',
      title: '1. Target Video Length',
      desc: 'Set the target duration for your Short from 30 to 60 seconds. The AI automatically calibrates spoken word count and pacing to match.',
      pos: 'bottom'
    },
    {
      target: '.script-panel, #scriptInput',
      title: '2. Narration Dialogue & Script Input',
      desc: 'Write or paste spoken narration dialogue, story hooks, or facts. The live word counter and estimated duration update in real time.',
      pos: 'right'
    },
    {
      target: '.script-generator, #scriptPrompt, #generateScript, #improveScript',
      title: '3. AI Script Writing & 1-Click Polish',
      desc: 'Describe an idea in the AI prompt box and click <b>Generate with AI</b>, or click <b>Improve with AI</b> to rewrite your draft for higher retention with strong hooks.',
      pos: 'right'
    },
    {
      target: '.voice-panel, #voiceGrid, #voiceSearch',
      title: '4. Neural Kokoro Voice Actors',
      desc: 'Browse and audition high-fidelity offline neural voice actors. Filter by tone, accent, and style with zero cloud API latency.',
      pos: 'right'
    },
    {
      target: '.voice-settings, #voiceSpeed',
      title: '5. Voice Pacing & Speed Adjustment',
      desc: 'Fine-tune spoken speech delivery from Slower (-2), Natural (0), to Faster (+2) for high-energy Shorts.',
      pos: 'top'
    },
    {
      target: '.clip-panel, #clipFolder, #chooseClipFolder',
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
      target: '.upload-custom, #customVideo',
      title: '8. Custom Gameplay Video Upload',
      desc: 'Want your own gameplay behind the story? Click here to upload any local video clip directly into the Narration Studio.',
      pos: 'right'
    },
    {
      target: '.style-panel, #presetGrid',
      title: '9. Word-Sync Subtitle Presets',
      desc: 'Choose your caption aesthetic: <b>Sync yellow</b> (active word follows audio), <b>White + yellow</b>, or <b>Color words</b>.',
      pos: 'right'
    },
    {
      target: '.caption-size, #captionSize',
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
      target: '.preview-panel, #narratePreview',
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
      target: '#narrateDownload, #narratePublish',
      title: '14. Instant Download & Social Publishing',
      desc: 'Download ready-to-post MP4 videos with 1 click, or click <b>Share / Publish</b> to prepare metadata for YouTube Shorts, TikTok, and Instagram Reels.',
      pos: 'left'
    },
    {
      target: '.narrate-history, #narrateHistory',
      title: '15. Narration Archive & History Shelf',
      desc: 'Browse, replay, and manage previously generated narrated shorts stored locally on your PC.',
      pos: 'top'
    },
    {
      target: '#navSupportLink',
      title: '16. Support Clipify AI ⭐',
      desc: 'Enjoying Narration Studio? Star the GitHub repo and follow @sherlock-dev-ai to keep free AI tools alive!',
      pos: 'right'
    },
    {
      target: '#creatureSupportLink',
      title: '17. Need Help? Direct Support Chat',
      desc: 'Click the "need help?" board held by our creature anytime to chat directly with our team in our Instagram creator support group!',
      pos: 'right',
      actionButton: { text: 'Open Instagram Support ↗', url: 'https://ig.me/j/AQj1lYCWh_iV_S7J/', target: '_blank' }
    },
    {
      isFinal: true,
      title: 'Support Clipify AI ⭐',
      desc: 'Clipify AI is built 100% free, private, and local with zero paywalls. Starring the GitHub repo and following the developer helps immensely to support free updates!'
    }
  ];

  // ==========================================
  // 3. LIVE STUDIO STEPS (/live)
  // ==========================================
  const LIVE_STEPS = [
    {
      target: '.source-tabs',
      title: '1. Multi-Platform Stream Ingestion',
      desc: 'Select your live stream source: <b>YouTube Live</b>, <b>Twitch Live</b>, <b>Kick Live</b>, or local <b>OBS Studio</b> RTMP ingestion.',
      pos: 'bottom'
    },
    {
      target: '#youtubeInputGroup, #liveSourceUrl, #btnConnectStream',
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
      target: '.monitor-panel, #monitorScreen',
      title: '4. 16:9 Broadcast Centerpiece Preview Monitor',
      desc: 'Live broadcast preview with stream title, active duration, buffer health, and live audio waveform visualizer.',
      pos: 'right'
    },
    {
      target: '#btnInstantClip, #btnLiveClipNow',
      title: '5. ⚡ Instant Clip Quick Capture',
      desc: 'Hit the instant clip button to immediately capture the last 15s, 30s, or 60s of broadcast into a framed 9:16 vertical Short.',
      pos: 'bottom'
    },
    {
      target: '.clipping-prefs-details, #toggleAutoClip',
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
      target: '.gaming-split-card, #toggleGamingLayout',
      title: '10. Gaming Split-Screen Architecture',
      desc: 'When enabled: Full gameplay on top + Streamer webcam on bottom. When disabled: 2-person conversation split (host on top + guest below).',
      pos: 'left'
    },
    {
      target: '#toggleAutoCaptions, #captionStyleSelect, #captionFontSelect',
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
      target: '.transcript-panel, #transcriptFeed',
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
      target: '#btnRankClipsAi, #rankingConsolePanel',
      title: '15. AI Viral Hook Clip Ranker Terminal',
      desc: 'Click <b>RANK CLIPS AI</b> to run local LLM evaluations on all captured clips, scoring hook power and ordering top viral candidates.',
      pos: 'top'
    },
    {
      target: '.full-width-gallery, #liveClipsGrid, #clipsBatchToolbar',
      title: '16. Live Shorts Gallery & Batch Controls',
      desc: 'Horizontal shelf displaying all rendered live clips. Preview videos, copy AI titles, download MP4s, or batch select and delete unwanted clips.',
      pos: 'top'
    },
    {
      target: '#navSupportLink',
      title: '17. Support Clipify AI ⭐',
      desc: 'Love using Live Studio? Star the GitHub repository and follow @sherlock-dev-ai to support ongoing free software development!',
      pos: 'right'
    },
    {
      target: '#creatureSupportLink',
      title: '18. Need Help? Direct Support Chat',
      desc: 'Click the "need help?" board held by our mascot anytime to chat with our team on Instagram for live streaming assistance!',
      pos: 'right',
      actionButton: { text: 'Open Instagram Support ↗', url: 'https://ig.me/j/AQj1lYCWh_iV_S7J/', target: '_blank' }
    },
    {
      isFinal: true,
      title: 'Support Clipify AI ⭐',
      desc: 'Clipify AI is built 100% free, private, and local with zero paywalls. Starring the GitHub repo and following the developer helps immensely to support free updates!'
    }
  ];

  // Helper to determine active page steps
  function getStepsForCurrentPage() {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('/narrate')) return NARRATE_STEPS;
    if (p.includes('/live')) return LIVE_STEPS;
    return INDEX_STEPS;
  }

  let tourSteps = INDEX_STEPS;
  let currentStepIndex = 0;
  let overlayEl = null;
  let spotlightEl = null;
  let cardEl = null;

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

    // Dismiss tour when clicking dark overlay outside card
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl || e.target === spotlightEl) {
        endTour();
      }
    });

    // Keyboard listener
    window.addEventListener('keydown', (e) => {
      if (!overlayEl || !overlayEl.classList.contains('active')) return;
      if (e.key === 'Escape') endTour();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      if (overlayEl && overlayEl.classList.contains('active')) {
        renderCurrentStep();
      }
    });

    document.body.appendChild(overlayEl);
  }

  function startTour(force = false) {
    if (window.isAndroidApp && !force) {
      return;
    }
    if (!force && localStorage.getItem(TOUR_STORAGE_KEY)) {
      return;
    }
    tourSteps = getStepsForCurrentPage();
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

  function renderCurrentStep() {
    const step = tourSteps[currentStepIndex];
    if (!step) return;

    if (step.isFinal) {
      endTour();
      showSupportModal();
      return;
    }

    if (step.section && typeof window.navigateTo === 'function') {
      try { window.navigateTo(step.section); } catch(e){}
    }

    let targetEl = null;
    const parts = step.target.split(',');
    for (const p of parts) {
      targetEl = document.querySelector(p.trim());
      if (targetEl && targetEl.offsetParent !== null) break;
      if (targetEl && !targetEl.hidden) break;
    }

    if (!targetEl) {
      // If target not visible in DOM, skip forward
      if (currentStepIndex < tourSteps.length - 1) {
        currentStepIndex++;
        renderCurrentStep();
      } else {
        endTour();
        showSupportModal();
      }
      return;
    }

    // Scroll element smoothly into view
    try {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch (_) {
      targetEl.scrollIntoView();
    }

    setTimeout(() => {
      const rect = targetEl.getBoundingClientRect();
      const pad = 8;

      // Position moving spotlight
      spotlightEl.style.display = 'block';
      spotlightEl.style.top = Math.max(0, rect.top - pad) + 'px';
      spotlightEl.style.left = Math.max(0, rect.left - pad) + 'px';
      spotlightEl.style.width = (rect.width + pad * 2) + 'px';
      spotlightEl.style.height = (rect.height + pad * 2) + 'px';
      spotlightEl.style.borderRadius = '16px';

      const actionHtml = step.actionButton ? `
        <div style="margin-top: 12px; margin-bottom: 6px;">
          <a href="${step.actionButton.url}" target="${step.actionButton.target || '_self'}" class="tour-action-pill" style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;">
            <span>${step.actionButton.text}</span>
          </a>
        </div>
      ` : '';

      // Card content
      cardEl.innerHTML = `
        <div class="tour-card-header">
          <span class="tour-step-badge">Component ${currentStepIndex + 1} of ${tourSteps.length - 1}</span>
          <button class="tour-skip-btn" type="button" aria-label="Skip tour">Skip</button>
        </div>
        <h3 class="tour-title">${step.title}</h3>
        <p class="tour-desc">${step.desc}</p>
        ${actionHtml}
        <div class="tour-footer">
          <button class="tour-btn prev" type="button" ${currentStepIndex === 0 ? 'disabled' : ''}>← Previous</button>
          <div class="tour-nav-btns">
            <button class="tour-btn next" type="button">${currentStepIndex === tourSteps.length - 2 ? 'Done 🎉' : 'Next →'}</button>
          </div>
        </div>
      `;

      cardEl.querySelector('.tour-skip-btn')?.addEventListener('click', endTour);
      cardEl.querySelector('.tour-btn.prev')?.addEventListener('click', prevStep);
      cardEl.querySelector('.tour-btn.next')?.addEventListener('click', nextStep);

      // Position tooltip card smartly
      positionCard(rect, step.pos);
    }, 120);
  }

  function positionCard(targetRect, preferredPos) {
    const cardW = 360;
    const cardH = cardEl.offsetHeight || 250;
    const margin = 14;

    let top = 0;
    let left = 0;

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceRight = window.innerWidth - targetRect.right;
    const spaceLeft = targetRect.left;

    if (preferredPos === 'right' && spaceRight >= cardW + margin) {
      left = targetRect.right + margin;
      top = Math.max(margin, Math.min(window.innerHeight - cardH - margin, targetRect.top));
    } else if (preferredPos === 'left' && spaceLeft >= cardW + margin) {
      left = targetRect.left - cardW - margin;
      top = Math.max(margin, Math.min(window.innerHeight - cardH - margin, targetRect.top));
    } else if (spaceBelow >= cardH + margin) {
      top = targetRect.bottom + margin;
      left = Math.max(margin, Math.min(window.innerWidth - cardW - margin, targetRect.left));
    } else if (spaceAbove >= cardH + margin) {
      top = targetRect.top - cardH - margin;
      left = Math.max(margin, Math.min(window.innerWidth - cardW - margin, targetRect.left));
    } else if (spaceRight >= cardW + margin) {
      left = targetRect.right + margin;
      top = Math.max(margin, (window.innerHeight - cardH) / 2);
    } else {
      top = Math.max(margin, Math.min(window.innerHeight - cardH - margin, 24));
      left = Math.max(margin, Math.min(window.innerWidth - cardW - margin, 24));
    }

    cardEl.style.top = `${Math.round(top)}px`;
    cardEl.style.left = `${Math.round(left)}px`;
  }

  // ==========================================
  // 4. OBSIDIAN THEMED SUPPORT US MODAL
  // ==========================================
  let supportModalOverlayEl = null;

  function initSupportModal() {
    if (supportModalOverlayEl) return;

    supportModalOverlayEl = document.createElement('div');
    supportModalOverlayEl.id = 'clipifySupportModalOverlay';

    supportModalOverlayEl.innerHTML = `
      <div id="clipifySupportModalCard" role="dialog" aria-modal="true" aria-labelledby="supportModalHeading">
        <button class="support-modal-close" type="button" aria-label="Close modal">✕</button>
        <div class="support-icon-wrap">
          <img class="support-icon-img" src="/static/icon.png" alt="Clipify AI Logo" onerror="this.src='/static/icon.png'">
          <div class="support-star-badge" aria-hidden="true">★</div>
        </div>
        <div class="support-tag-pill">100% Free & Open-Source</div>
        <h2 class="support-modal-title" id="supportModalHeading">Support Clipify AI ⭐</h2>
        <p class="support-modal-subtitle">
          Clipify AI is built <b>100% free, private, and local</b> with zero monthly paywalls, ads, or watermarks.
          Starring the repository and following on GitHub helps more creators discover free AI video editing and fuels future releases!
        </p>
        <div class="support-modal-buttons">
          <a class="support-btn-star" href="https://github.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>Star Repo on GitHub (⭐)</span>
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

    // Dismiss on clicking backdrop
    supportModalOverlayEl.addEventListener('click', (e) => {
      if (e.target === supportModalOverlayEl) {
        closeSupportModal();
      }
    });

    // Android webview bridge handler
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

  // Bind clicks to #navGuideLink and #navSupportLink
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

    // Handle deep-link hashes (#support or #guide)
    function handleHash() {
      const h = window.location.hash.toLowerCase();
      if (h === '#support') {
        setTimeout(showSupportModal, 150);
      } else if (h === '#guide') {
        setTimeout(() => startTour(true), 150);
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

  // Expose Global APIs
  window.startClipifyTour = () => startTour(true);
  window.showSupportModal = () => showSupportModal();
})();

/**
 * Clipify AI - Interactive Guided Onboarding Tour
 * Comprehensive walkthrough covering all features across all tabs:
 * Create, Narrate, Live Studio, Projects, Editor, Beta Features, Models, Mascot & Support.
 */
(function() {
  const TOUR_STORAGE_KEY = 'clipify_tour_completed';

  // Steps for the main workspace (index.html)
  const INDEX_STEPS = [
    {
      target: '#openInput',
      section: 'create',
      title: '1. Top Bar: Quick Folder Access',
      desc: 'Instant 1-click access to your files: <b>[ Open input ]</b> opens your source footage folder, and <b>[ Open output ]</b> opens your rendered vertical shorts in Windows File Explorer.',
      pos: 'bottom'
    },
    {
      target: '#dropZone',
      section: 'create',
      title: '2. Create: Video Import & URL Ingestion',
      desc: 'Drag and drop long-form videos (MP4, MKV, MOV, WEBM) or paste a YouTube URL. Pre-bundled sample gaming and tech clips are also available to test immediately.',
      pos: 'right'
    },
    {
      target: '.intent-row, #presets',
      section: 'create',
      title: '3. Create: Editing Intelligence & Vibes',
      desc: 'Select how AI segments your footage: <b>Gaming</b> (facecam + action sync), <b>Viral</b> (high retention & hook rating), <b>Funny</b> (reaction timing), <b>Dramatic</b> (suspense pacing), or <b>Educational</b> (key takeaways).',
      pos: 'bottom'
    },
    {
      target: '.split-options, #splitScreenToggle',
      section: 'create',
      title: '4. Create: Split-Screen Podcast Framing',
      desc: 'Transform horizontal interviews and talk shows into stacked 9:16 Shorts. AI auto-detects speakers, placing the active host on top and the guest or gameplay below.',
      pos: 'bottom'
    },
    {
      target: '.caption-card, #captionPresetRow, #generateShorts',
      section: 'create',
      title: '5. Create: Dynamic Captions & Render',
      desc: 'Choose karaoke-style active word animations, font typography, and emoji cues. Click Generate to run the local WhisperX speech transcription + Ollama highlight extraction engine.',
      pos: 'top'
    },
    {
      target: '#navNarrateLink',
      title: '6. Narrate: Script-to-Short Voice Studio',
      desc: 'Generate viral voiceover stories completely offline with zero API costs: Write stories or prompt AI to brainstorm hooks, pick Kokoro neural TTS voice actors with speed pacing, and pair with licensed vertical gameplay (GTA 5 Stunts, Minecraft, Subway Surfers).',
      pos: 'right',
      actionButton: { text: 'Open Narration Studio ↗', url: '/narrate' }
    },
    {
      target: '#navLiveLink',
      title: '7. Live Studio: Real-Time Stream Clipping',
      desc: 'Connect live streams from YouTube Live, TikTok Live, Twitch, or OBS Studio via RTMP stream key. Features real-time Whisper speech transcription, automatic viral climax spike detection, and instant vertical Short production while the stream is broadcasting.',
      pos: 'right',
      actionButton: { text: 'Open Live Studio ↗', url: '/live' }
    },
    {
      target: '#navProjectsLink',
      section: 'projects',
      title: '8. Projects: Workspace & Clip History',
      desc: 'Replay all rendered 9:16 vertical cuts, copy AI-generated titles & hashtags in one click, download MP4s, or search, filter, and restore deleted projects from the built-in Recycle Bin.',
      pos: 'right'
    },
    {
      target: '#navEditorLink',
      section: 'editor',
      title: '9. Editor: Post-Processing & Branding',
      desc: 'Fine-tune finished videos without re-running AI pipelines: 9:16 vertical camera framing with pan (X/Y) & zoom, custom watermark/logo overlays with chroma key transparency, and subtitle font overrides.',
      pos: 'right'
    },
    {
      target: '#navBetaLink',
      section: 'beta',
      title: '10. Beta Features: Video Clipping Lab',
      desc: 'Test the newest cutting algorithms before release: multi-tier video segmentation, motion pop graphic subtitles, situational action cues, and live GPU/CPU pipeline profiling.',
      pos: 'right'
    },
    {
      target: '#navModelsLink',
      title: '11. Models: Local Hub & Cloud Inference',
      desc: 'Explore open-weight models (Qwen 3 4B, Qwen 3 8B, DeepSeek R1 7B) auto-managed via Ollama, or connect Hugging Face Serverless Cloud (0 GB RAM required) for instant free cloud inference.',
      pos: 'right'
    },
    {
      target: '#sidebarCreatureCard',
      title: '12. Forest Runner: Mascot & Offline Mini Game',
      desc: 'Meet our confused running mascot flanked by swaying pine trees! Click the creature anytime to open the Forest Runner mini-game popup — jump over woodland hazards while waiting for your AI clips to render.',
      pos: 'right'
    },
    {
      target: '#creatureSupportLink',
      title: '13. Need Help? Direct Support Button',
      desc: 'Have questions, feedback, or need help setting up? Click the <b>"need help?"</b> board held by our mascot to chat directly with our team in our Instagram creator support group!',
      pos: 'right',
      actionButton: { text: 'Open Instagram Support ↗', url: 'https://ig.me/j/AQj1lYCWh_iV_S7J/', target: '_blank' }
    },
    {
      isFinal: true,
      title: 'Support Clipify AI & Follow ⭐',
      desc: 'Clipify AI is built 100% free, private, and local so creators never have to pay expensive monthly subscriptions. Please star the repository and follow @sherlock-dev-ai on GitHub to support free open-source software!'
    }
  ];

  // Steps for Narration page (/narrate)
  const NARRATE_STEPS = [
    {
      target: '.script-panel, #scriptInput',
      title: '1. Script: Story Prompting & Generation',
      desc: 'Write or paste spoken narration dialogue, or enter an AI prompt to brainstorm storytelling ideas and wild plot twists. Includes 1-click script improvement powered by your local Ollama model.',
      pos: 'right'
    },
    {
      target: '.voice-panel, #voiceGrid',
      title: '2. Voice: Kokoro Neural Voices & Pacing',
      desc: 'Select from high-quality offline neural voice actors. Adjust speech pacing slider from Slower (-2) to Faster (+2) and click Audition Voice Sample to hear realistic intonation.',
      pos: 'right'
    },
    {
      target: '.clip-panel, #clipGrid',
      title: '3. Atmosphere: Vertical Gameplay Footage',
      desc: 'Choose from licensed vertical 9:16 background gameplay (GTA 5 Stunts, Subway Surfers, Minecraft Parkour) or upload your own custom gameplay video clips.',
      pos: 'right'
    },
    {
      target: '.style-panel, #presetGrid',
      title: '4. Captions: Animated Word-Sync Subtitles',
      desc: 'Choose from Sync Yellow (active word follows spoken audio), White + Yellow highlights, or Color Words, with live caption font size adjustments up to 120px.',
      pos: 'right'
    },
    {
      target: '.preview-panel, #narratePreview',
      title: '5. Output: 9:16 Video Player & Export',
      desc: 'Review live multi-track playback (voice, video, and captions) in a 9:16 vertical frame, download ready-to-post MP4 videos, or share with one click.',
      pos: 'left'
    },
    {
      target: '#creatureSupportLink',
      title: '6. Need Help? Direct Support Button',
      desc: 'Click the "need help?" board held by our creature anytime to chat with our team in our Instagram creator support group for instant assistance!',
      pos: 'right',
      actionButton: { text: 'Open Instagram Support ↗', url: 'https://ig.me/j/AQj1lYCWh_iV_S7J/', target: '_blank' }
    },
    {
      isFinal: true,
      title: 'Support Clipify AI & Follow ⭐',
      desc: 'Clipify AI is built 100% free, private, and local so creators never have to pay expensive monthly subscriptions. Please star the repository and follow @sherlock-dev-ai on GitHub to support free open-source software!'
    }
  ];

  // Steps for Live Studio page (/live)
  const LIVE_STEPS = [
    {
      target: '.live-source-panel, .source-tabs',
      title: '1. Stream Source: Multi-Platform Ingestion',
      desc: 'Connect live streams by entering YouTube Live, TikTok Live, or Twitch broadcast URLs, or stream directly from OBS Studio via local RTMP stream key.',
      pos: 'bottom'
    },
    {
      target: '.monitor-panel, #livePreviewVideo',
      title: '2. Monitor: 16:9 Broadcast Centerpiece',
      desc: 'Real-time broadcast preview with live viewer counts, streamer status, and volume indicator. Audio is routed directly into the local Whisper transcription pipeline.',
      pos: 'right'
    },
    {
      target: '.transcript-panel, #transcriptFeed',
      title: '3. Transcript: Real-Time Speech-to-Text',
      desc: 'Live continuous speech-to-text transcription as the streamer talks, timestamping every sentence and calculating viral engagement potential.',
      pos: 'left'
    },
    {
      target: '.clips-gallery-panel, #liveClipsGrid',
      title: '4. Live Shorts Gallery & Auto-Clipping',
      desc: 'When a viral climax or volume spike occurs, Clipify AI automatically extracts, frames to vertical 9:16, adds captions, and places the ready-to-download Short in this gallery.',
      pos: 'top'
    },
    {
      target: '#creatureSupportLink',
      title: '5. Need Help? Direct Support Button',
      desc: 'Click the "need help?" board held by our creature anytime to chat with our team in our Instagram creator support group for instant assistance!',
      pos: 'right',
      actionButton: { text: 'Open Instagram Support ↗', url: 'https://ig.me/j/AQj1lYCWh_iV_S7J/', target: '_blank' }
    },
    {
      isFinal: true,
      title: 'Support Clipify AI & Follow ⭐',
      desc: 'Clipify AI is built 100% free, private, and local so creators never have to pay expensive monthly subscriptions. Please star the repository and follow @sherlock-dev-ai on GitHub to support free open-source software!'
    }
  ];

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

    // Dismiss tour when clicking outside card
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
      renderFinalStep(step);
      return;
    }

    if (step.section && typeof window.navigateTo === 'function') {
      try { window.navigateTo(step.section); } catch(e){}
    }

    let targetEl = document.querySelector(step.target);
    if (!targetEl) {
      // If target not directly found, try alternative selector
      const parts = step.target.split(',');
      for (const p of parts) {
        targetEl = document.querySelector(p.trim());
        if (targetEl) break;
      }
    }

    if (!targetEl) {
      nextStep();
      return;
    }

    // Scroll element immediately into view
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
        <div style="margin-top: 10px; margin-bottom: 6px;">
          <a href="${step.actionButton.url}" target="${step.actionButton.target || '_self'}" class="tour-action-pill" style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;">
            <span>${step.actionButton.text}</span>
          </a>
        </div>
      ` : '';

      // Card content
      cardEl.innerHTML = `
        <div class="tour-card-header">
          <span class="tour-step-badge">Feature ${currentStepIndex + 1} of ${tourSteps.length - 1}</span>
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
    const cardH = cardEl.offsetHeight || 240;
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

  function renderFinalStep(step) {
    // Hide spotlight for center modal
    spotlightEl.style.display = 'none';

    cardEl.innerHTML = `
      <div class="tour-github-card">
        <div class="tour-avatar-wrap">
          <img class="tour-avatar-img" src="/static/icon.png" alt="Clipify AI" onerror="this.src='/static/icon.png'">
          <div class="tour-star-badge" aria-hidden="true">★</div>
        </div>
        <h3 class="tour-title" style="font-size:1.4rem;margin-bottom:8px;">${step.title}</h3>
        <p class="tour-desc" style="font-size:13.5px;margin-bottom:18px;">${step.desc}</p>
        <div class="tour-action-row">
          <a class="tour-star-btn" href="https://github.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE" target="_blank" rel="noopener noreferrer">
            <span>⭐ Star Repo</span>
          </a>
          <a class="tour-follow-btn" href="https://github.com/sherlock-dev-ai" target="_blank" rel="noopener noreferrer">
            <span>👤 Follow Dev</span>
          </a>
        </div>
        <button class="tour-finish-btn" type="button">Let's Create Some Shorts →</button>
      </div>
    `;

    cardEl.querySelector('.tour-finish-btn')?.addEventListener('click', endTour);
    cardEl.querySelector('.tour-star-btn')?.addEventListener('click', (e) => {
      if (window.AndroidBridge && window.AndroidBridge.openBrowser) {
        e.preventDefault();
        window.AndroidBridge.openBrowser(e.currentTarget.href);
      }
    });
    cardEl.querySelector('.tour-follow-btn')?.addEventListener('click', (e) => {
      if (window.AndroidBridge && window.AndroidBridge.openBrowser) {
        e.preventDefault();
        window.AndroidBridge.openBrowser(e.currentTarget.href);
      }
    });

    // Center the card in viewport
    const cardRect = cardEl.getBoundingClientRect();
    const top = Math.max(20, (window.innerHeight - cardRect.height) / 2);
    const left = Math.max(20, (window.innerWidth - cardRect.width) / 2);
    cardEl.style.top = `${top}px`;
    cardEl.style.left = `${left}px`;
  }

  // Expose API
  window.startClipifyTour = () => startTour(true);
})();

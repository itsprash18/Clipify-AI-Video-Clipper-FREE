/**
 * Clipify AI - Interactive Guided Onboarding Tour
 * Features walkthrough for all 9 core sidebar sections
 */
(function() {
  const TOUR_STORAGE_KEY = 'clipify_tour_completed';

  const TOUR_STEPS = [
    {
      target: '#navCreateLink',
      section: 'create',
      title: '1. Create: Smart AI Video Clipper',
      desc: 'The core editing studio. Upload long-form videos (MP4, MKV, MOV, WEBM) or paste YouTube links. Pick from 4 AI editing modes (Viral Hooks, Flow, Highlights, Gaming), enable Split-Screen for podcast framing, choose caption fonts, and render high-retention 9:16 Shorts powered by local WhisperX + Ollama.',
      pos: 'right'
    },
    {
      target: '#navNarrateLink',
      title: '2. Narrate: Script-to-Short Voice Studio',
      desc: 'Generate viral voiceover stories completely offline with zero API costs. Write your own storytelling script or let AI brainstorm one, select offline text-to-speech voices, and pair it with licensed vertical gameplay backgrounds (GTA 5 Stunts, Minecraft Parkour).',
      pos: 'right'
    },
    {
      target: '#navLiveLink',
      title: '3. Live Studio: Real-Time Stream Clipping',
      desc: 'Connect live broadcasts from YouTube Live, TikTok Live, Twitch, or OBS Studio via RTMP. Clipify AI transcribes speech in real time, automatically identifies viral climax moments, and produces ready-to-publish vertical Shorts while the stream is still broadcasting.',
      pos: 'right'
    },
    {
      target: '#navProjectsLink',
      section: 'projects',
      title: '4. Projects: Workspace & Clip History',
      desc: 'All rendered Shorts, video slices, transcripts, and metadata are saved permanently in your local workspace. Preview finished cuts, copy AI-generated titles and hashtags, export clips, or restore deleted projects from the recycle bin.',
      pos: 'right'
    },
    {
      target: '#navEditorLink',
      section: 'editor',
      title: '5. Editor: Post-Render Video Studio',
      desc: 'Brand your finished videos without re-running AI pipelines. Fine-tune 9:16 vertical camera framing with pan (X/Y) & zoom, customize text typography, and upload watermarks or logos with instant background removal via chroma keying.',
      pos: 'right'
    },
    {
      target: '#navBetaLink',
      section: 'beta',
      title: '6. Beta Features: Experimental Suite',
      desc: 'Test preview features before they hit production: Premium Caption Mode with scale-pop motion graphics, situational *ACTION CUES*, real-time GPU/CPU pipeline profiling, and all-in-one AI narration testing.',
      pos: 'right'
    },
    {
      target: '#navModelsLink',
      title: '7. Models: Local Hub & Cloud Inference',
      desc: 'Explore 12 curated open-weight AI models (Qwen 2.5, DeepSeek R1, Llama 3.3, Mistral, Gemma 2, Phi 4). Download models with live progress bars, delete unused models to free up disk storage, or connect Hugging Face Serverless Cloud (0 GB RAM required).',
      pos: 'right'
    },
    {
      target: '#navUpdateLink',
      title: '8. Update: One-Click In-Place Updater',
      desc: 'Stay on the cutting edge with one click. Check GitHub for new releases and apply instant in-place updates without needing to re-download or re-run heavy setup installers.',
      pos: 'right'
    },
    {
      target: '#sidebarCreatureCard',
      title: '9. Forest Runner: Mascot & Offline Mini Game',
      desc: 'Meet our confused running mascot! Click it anytime to open the Forest Runner mini-game popup. Jump over woodland obstacles and set high scores while waiting for your AI clips to render.',
      pos: 'right'
    },
    {
      isFinal: true,
      title: 'Support Clipify AI & Follow ⭐',
      desc: 'Clipify AI is built 100% free, private, and local so creators never have to pay expensive monthly subscriptions. Please star the repository and follow @sherlock-dev-ai on GitHub to support free open-source software!'
    }
  ];

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

    document.body.appendChild(overlayEl);

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
  }

  function startTour(force = false) {
    if (window.isAndroidApp && !force) {
      return;
    }
    if (!force && localStorage.getItem(TOUR_STORAGE_KEY)) {
      return;
    }
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
    if (currentStepIndex < TOUR_STEPS.length - 1) {
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
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    if (step.isFinal) {
      renderFinalStep(step);
      return;
    }

    if (step.section && typeof window.navigateTo === 'function') {
      try { window.navigateTo(step.section); } catch(e){}
    }

    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      nextStep();
      return;
    }

    // Scroll element immediately into view
    targetEl.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });

    const rect = targetEl.getBoundingClientRect();
    const pad = 8;

    // Position moving spotlight
    spotlightEl.style.display = 'block';
    spotlightEl.style.top = Math.max(0, rect.top - pad) + 'px';
    spotlightEl.style.left = Math.max(0, rect.left - pad) + 'px';
    spotlightEl.style.width = (rect.width + pad * 2) + 'px';
    spotlightEl.style.height = (rect.height + pad * 2) + 'px';
    spotlightEl.style.borderRadius = '16px';

    // Card content
    cardEl.innerHTML = `
      <div class="tour-card-header">
        <span class="tour-step-badge">Feature ${currentStepIndex + 1} of ${TOUR_STEPS.length - 1}</span>
        <button class="tour-skip-btn" type="button" aria-label="Skip tour">Skip</button>
      </div>
      <h3 class="tour-title">${step.title}</h3>
      <p class="tour-desc">${step.desc}</p>
      <div class="tour-footer">
        <button class="tour-btn prev" type="button" ${currentStepIndex === 0 ? 'disabled' : ''}>← Previous</button>
        <div class="tour-nav-btns">
          <button class="tour-btn next" type="button">Next →</button>
        </div>
      </div>
    `;

    cardEl.querySelector('.tour-skip-btn')?.addEventListener('click', endTour);
    cardEl.querySelector('.tour-btn.prev')?.addEventListener('click', prevStep);
    cardEl.querySelector('.tour-btn.next')?.addEventListener('click', nextStep);

    // Position tooltip card smartly
    positionCard(rect, step.pos);
  }

  function positionCard(targetRect, preferredPos) {
    const cardW = 350;
    const cardH = cardEl.offsetHeight || 220;
    const margin = 14;

    let top = 0;
    let left = 0;

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceRight = window.innerWidth - targetRect.right;

    if (preferredPos === 'right' && spaceRight >= cardW + margin) {
      left = targetRect.right + margin;
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

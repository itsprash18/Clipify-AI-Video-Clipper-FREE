/**
 * Clipify AI - Clippy AI Chat Assistant
 * Expandable right-side drawer chat agent with real-time Ollama integration,
 * fastest model auto-detection, typing animation, and rich markdown rendering.
 */

(function () {
  'use strict';

  // State
  const state = {
    open: false,
    history: [],
    modelName: 'Detecting...',
    modelSpeed: '',
    isThinking: false,
  };

  function initClippy() {
    // Avoid double initialization
    if (document.getElementById('clippyContainer')) return;

    // Inject DOM structure
    const container = document.createElement('div');
    container.id = 'clippyContainer';
    container.className = 'clippy-container';
    container.innerHTML = `
      <!-- Right-side Big Arrow Toggle Tab -->
      <button id="clippyToggleBtn" class="clippy-toggle-btn" title="Chat with Clippy AI" aria-label="Open Clippy AI chat">
        <span class="clippy-toggle-arrow">❮</span>
        <span class="clippy-toggle-content">
          <span class="clippy-toggle-avatar">🤖</span>
          <span class="clippy-toggle-text">Clippy AI</span>
        </span>
      </button>

      <!-- Slide-Out Sidebar Drawer -->
      <div id="clippyDrawer" class="clippy-drawer" role="dialog" aria-modal="true" aria-labelledby="clippyTitle" aria-hidden="true">
        <!-- Drawer Header -->
        <div class="clippy-header">
          <div class="clippy-header-left">
            <div class="clippy-avatar-box">
              <span class="clippy-avatar-icon">🤖</span>
              <span class="clippy-avatar-pulse"></span>
            </div>
            <div class="clippy-title-info">
              <h3 id="clippyTitle" class="clippy-title">Clippy AI</h3>
              <div class="clippy-model-badge" id="clippyModelBadge" title="Fastest local AI engine">
                <span class="clippy-badge-dot"></span>
                <span id="clippyModelText">Fastest AI · Loading...</span>
              </div>
            </div>
          </div>
          <button id="clippyCloseBtn" class="clippy-close-btn" title="Close Clippy AI" aria-label="Close sidebar">
            <span class="clippy-close-arrow">❯</span>
          </button>
        </div>

        <!-- Messages Scroll Area -->
        <div class="clippy-messages" id="clippyMessages">
          <!-- Welcome Message -->
          <div class="clippy-msg clippy-msg-ai">
            <div class="clippy-msg-bubble">
              <p><strong>Hi! I'm Clippy AI 🤖</strong></p>
              <p>I know everything about Clipify AI! Ask me anything about creating viral Shorts, Beta Lab text overlays, Live Studio RTMP, Narration voices, or models.</p>
              <div class="clippy-chips">
                <button class="clippy-chip" data-prompt="How do I create a vertical Short from a video?">🎬 Create a Short</button>
                <button class="clippy-chip" data-prompt="How do I add draggable text and timing in Beta Lab?">✍️ Beta Text Overlay</button>
                <button class="clippy-chip" data-prompt="How does Live Studio connect to OBS?">🔴 Live Studio OBS</button>
                <button class="clippy-chip" data-prompt="How do I clear cache to free disk space?">🧹 Clear Cache</button>
                <button class="clippy-chip" data-prompt="Which Ollama model is fastest on my system?">⚡ Fastest Model</button>
              </div>
            </div>
            <span class="clippy-msg-time">Just now</span>
          </div>

          <!-- Typing Indicator -->
          <div class="clippy-msg clippy-msg-ai clippy-typing-row" id="clippyTyping" style="display: none;">
            <div class="clippy-msg-bubble clippy-typing-bubble">
              <div class="clippy-typing-indicator">
                <span class="clippy-dot"></span>
                <span class="clippy-dot"></span>
                <span class="clippy-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input Footer -->
        <div class="clippy-footer">
          <form id="clippyForm" class="clippy-input-box" onsubmit="return false;">
            <textarea
              id="clippyInput"
              class="clippy-input"
              rows="1"
              placeholder="Ask Clippy anything about Clipify AI..."
              aria-label="Message input"
            ></textarea>
            <button type="submit" id="clippySendBtn" class="clippy-send-btn" title="Send message" aria-label="Send message">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <div class="clippy-footer-note">Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Bind DOM elements
    const toggleBtn = document.getElementById('clippyToggleBtn');
    const closeBtn = document.getElementById('clippyCloseBtn');
    const drawer = document.getElementById('clippyDrawer');
    const input = document.getElementById('clippyInput');
    const form = document.getElementById('clippyForm');
    const messages = document.getElementById('clippyMessages');

    // Toggle Drawer
    function openDrawer() {
      state.open = true;
      drawer.classList.add('clippy-open');
      toggleBtn.classList.add('clippy-toggle-hidden');
      drawer.setAttribute('aria-hidden', 'false');
      setTimeout(() => input.focus(), 150);
    }

    function closeDrawer() {
      state.open = false;
      drawer.classList.remove('clippy-open');
      toggleBtn.classList.remove('clippy-toggle-hidden');
      drawer.setAttribute('aria-hidden', 'true');
    }

    toggleBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.open) {
        closeDrawer();
      }
    });

    // Auto-expand textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Enter to submit (Shift+Enter for newline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage();
    });

    // Chip click delegation
    messages.addEventListener('click', (e) => {
      const chip = e.target.closest('.clippy-chip');
      if (chip && chip.dataset.prompt) {
        input.value = chip.dataset.prompt;
        sendMessage();
      }
    });

    // Fetch fastest model info
    fetchModelInfo();

    // Deep-link auto-open support: ?clippy=open or ?clippy=chat
    if (window.location.search.includes('clippy=open') || window.location.search.includes('clippy=chat')) {
      openDrawer();
      if (window.location.search.includes('clippy=chat')) {
        setTimeout(() => {
          const chip = document.querySelector('.clippy-chip');
          if (chip) chip.click();
        }, 400);
      }
    }
  }

  // Fetch model info from backend
  async function fetchModelInfo() {
    try {
      const res = await fetch('/api/clippy/model');
      if (res.ok) {
        const data = await res.json();
        const badge = document.getElementById('clippyModelText');
        if (badge) {
          if (data.model) {
            state.modelName = data.model;
            state.modelSpeed = data.speed || 'Fastest AI';
            badge.textContent = `⚡ ${data.model} (${state.modelSpeed})`;
          } else {
            badge.textContent = '⚡ Clipify Intelligence';
          }
        }
      }
    } catch (_) {
      const badge = document.getElementById('clippyModelText');
      if (badge) badge.textContent = '⚡ Clipify Intelligence';
    }
  }

  // Format simple markdown into HTML
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      // Escape raw HTML tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```code```
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Headers ### Title
    html = html.replace(/^### (.*$)/gim, '<h4 class="clippy-md-h4">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="clippy-md-h3">$1</h3>');
    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Bullet lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
    // Paragraph breaks
    html = html.replace(/\n\n+/g, '</p><p>');
    html = html.replace(/\n/g, '<br/>');

    return `<p>${html}</p>`;
  }

  function appendUserMessage(text) {
    const messages = document.getElementById('clippyMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'clippy-msg clippy-msg-user';
    msgDiv.innerHTML = `
      <div class="clippy-msg-bubble">
        <p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</p>
      </div>
      <span class="clippy-msg-time">Just now</span>
    `;
    // Insert before typing indicator
    const typing = document.getElementById('clippyTyping');
    messages.insertBefore(msgDiv, typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendAiMessage(text, model) {
    const messages = document.getElementById('clippyMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'clippy-msg clippy-msg-ai';
    const formatted = formatMarkdown(text);
    msgDiv.innerHTML = `
      <div class="clippy-msg-bubble">
        ${formatted}
      </div>
      <span class="clippy-msg-time">${model ? `⚡ ${model} · ` : ''}Just now</span>
    `;
    const typing = document.getElementById('clippyTyping');
    messages.insertBefore(msgDiv, typing);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById('clippyInput');
    const text = (input.value || '').trim();
    if (!text || state.isThinking) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Append user message
    appendUserMessage(text);
    state.history.push({ role: 'user', content: text });

    // Show typing animation
    state.isThinking = true;
    const typing = document.getElementById('clippyTyping');
    if (typing) typing.style.display = 'flex';
    const messages = document.getElementById('clippyMessages');
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch('/api/clippy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: state.history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'I am sorry, I could not generate a response right now.';
      state.history.push({ role: 'assistant', content: reply });
      appendAiMessage(reply, data.model);
    } catch (err) {
      appendAiMessage(
        `### ⚠️ Notice\nCould not connect to AI service: ${err.message}.\n\nMake sure Clipify AI is running properly and try again!`,
        'Error'
      );
    } finally {
      state.isThinking = false;
      if (typing) typing.style.display = 'none';
      messages.scrollTop = messages.scrollHeight;
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClippy);
  } else {
    initClippy();
  }
})();


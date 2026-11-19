import os
import shutil
import jinja2

src_templates = r"L:\ClipifyAI\templates"
src_static = r"L:\ClipifyAI\static"
dest_www = r"L:\ClipifyAI\android\app\src\main\assets\www"

os.makedirs(dest_www, exist_ok=True)
dest_static = os.path.join(dest_www, "static")
shutil.rmtree(dest_static, ignore_errors=True)
shutil.copytree(src_static, dest_static)

MODES = {
    "gaming": {"name": "Gaming", "icon": "🎮", "description": "Gameplay + facecam reactions with stable smart framing"},
    "viral": {"name": "Viral", "icon": "✦", "description": "Hooks, curiosity, surprise & payoff"},
    "funny": {"name": "Funny", "icon": "😂", "description": "Punchlines, reactions & comedic timing"},
    "dramatic": {"name": "Dramatic", "icon": "⚡", "description": "Tension, reveals & emotional moments"},
    "educational": {"name": "Educational", "icon": "◈", "description": "Facts, explanations & takeaways"},
    "story": {"name": "Story", "icon": "◉", "description": "Setup → escalation → payoff"},
    "meme": {"name": "Meme", "icon": "💀", "description": "Chaotic, absurd & reaction-heavy"},
}

def fake_url_for(endpoint, filename=None, **kwargs):
    if endpoint == "static" and filename:
        return f"static/{filename}"
    return f"static/{filename or ''}"

env = jinja2.Environment(loader=jinja2.FileSystemLoader(src_templates))
env.globals["url_for"] = fake_url_for

# Mobile CSS enhancements injected into head
mobile_css = """
<style id="mobile-responsive-styles">
/* Mobile ergonomics & touch optimizations */
:root {
  --mobile-pad: 14px;
}
html, body {
  background: #09090b !important;
  color: #fafafa !important;
  font-size: 15px !important;
  overflow-x: hidden !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-font-smoothing: antialiased !important;
}
/* Ensure the sidebar on mobile does not block content since BottomNavigationView handles tabs */
@media (max-width: 900px) {
  .sidebar {
    display: none !important;
  }
  .main, .app, .workspace {
    margin-left: 0 !important;
    padding: 12px 14px 80px 14px !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }
  .top-bar, .top-actions {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    margin-bottom: 14px !important;
  }
  .hero-panel, .card, .panel, .upload-card, .preview-container {
    border-radius: 14px !important;
    padding: 16px !important;
    margin-bottom: 14px !important;
    box-sizing: border-box !important;
  }
  .grid-container, .workflow, .control-grid, .two, .mode-grid, .brand-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }
  .mode-card, .btn, button, select, input {
    min-height: 48px !important;
    font-size: 15px !important;
  }
  .btn-primary, .primary, .hero-btn {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  /* Horizontal shelves for Live Studio */
  .clips-shelf, .horizontal-shelf {
    display: flex !important;
    overflow-x: auto !important;
    gap: 12px !important;
    padding-bottom: 12px !important;
    -webkit-overflow-scrolling: touch !important;
  }
}
</style>
"""

# Native JavaScript Bridge hook
bridge_script = """
<script>
window.isAndroidApp = true;
window.addEventListener('DOMContentLoaded', () => {
  console.log('[ClipifyAI Android] Web shell initialized.');
  // Connect file picker to Android native gallery picker
  const fileInputs = document.querySelectorAll('input[type="file"], .drop-area, #videoInput, [data-picker="video"]');
  fileInputs.forEach(el => {
    el.addEventListener('click', (e) => {
      if (window.AndroidBridge && window.AndroidBridge.pickVideo) {
        e.preventDefault();
        window.AndroidBridge.pickVideo();
      }
    });
  });
  // Connect external links
  document.querySelectorAll('a[href*="github.com"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.AndroidBridge && window.AndroidBridge.openBrowser) {
        e.preventDefault();
        window.AndroidBridge.openBrowser(a.href);
      }
    });
  });
});

function onAndroidVideoSelected(uri, filename, duration) {
  console.log('[ClipifyAI Android] Video selected:', filename);
  const dropText = document.querySelector('.drop-title');
  if (dropText) dropText.textContent = 'Selected: ' + filename;
  const badge = document.querySelector('.drop-badge');
  if (badge) badge.textContent = 'Ready to Clip';
  if (window.showToast) window.showToast('Imported ' + filename, 'success');
}
</script>
</body>
"""

for t in ["index.html", "narrate.html", "live.html"]:
    template = env.get_template(t)
    rendered = template.render(modes=MODES)
    
    # Ensure viewport meta is present and mobile-first
    if '<meta name="viewport"' not in rendered:
        rendered = rendered.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">')
    else:
        rendered = rendered.replace('<meta name="viewport" content="width=device-width,initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">')
        rendered = rendered.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">')

    # Inject mobile CSS before </head>
    rendered = rendered.replace("</head>", f"{mobile_css}\n</head>")
    
    # Inject bridge script before </body>
    rendered = rendered.replace("</body>", bridge_script)

    dest_file = os.path.join(dest_www, t)
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(rendered)
    print(f"Pre-rendered {t} -> {dest_file} ({len(rendered)} bytes)")

print("All web assets pre-rendered and bundled successfully.")

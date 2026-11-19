import os
import shutil

src_templates = r"L:\ClipifyAI\templates"
src_static = r"L:\ClipifyAI\static"
dest_www = r"L:\ClipifyAI\android\app\src\main\assets\www"

os.makedirs(dest_www, exist_ok=True)
dest_static = os.path.join(dest_www, "static")
shutil.rmtree(dest_static, ignore_errors=True)
shutil.copytree(src_static, dest_static)

# Copy templates into dest_www as html files with relative static paths
for t in os.listdir(src_templates):
    if t.endswith(".html"):
        src_file = os.path.join(src_templates, t)
        dest_file = os.path.join(dest_www, t)
        with open(src_file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        # Replace absolute /static/ with relative static/
        content = content.replace('src="/static/', 'src="static/')
        content = content.replace('href="/static/', 'href="static/')
        content = content.replace("url('/static/", "url('static/")
        content = content.replace('url("/static/', 'url("static/')
        
        # Inject AndroidBridge JavaScript hook
        bridge_script = """
<script>
window.isAndroidApp = true;
window.addEventListener('DOMContentLoaded', () => {
  console.log('[ClipifyAI Android] Web shell initialized.');
  // Override file input to use Android native file picker
  const fileInput = document.getElementById('videoInput');
  if (fileInput) {
    fileInput.addEventListener('click', (e) => {
      if (window.AndroidBridge && window.AndroidBridge.pickVideo) {
        e.preventDefault();
        window.AndroidBridge.pickVideo();
      }
    });
  }
  // Connect GitHub star & follow buttons
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
        content = content.replace("</body>", bridge_script)

        with open(dest_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Bundled {t} -> {dest_file}")

print("Web assets bundled into assets/www successfully.")


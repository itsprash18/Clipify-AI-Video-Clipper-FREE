/**
 * Clipify AI - In-Place Fast Updater
 * Checks GitHub for new releases and updates files in-place without running the 330MB installer.
 */
(function() {
  function initSidebarUpdater() {
    const card = document.getElementById('sidebarUpdateCard');
    const btn = document.getElementById('btnSidebarUpdate');
    const statusMsg = document.getElementById('sidebarUpdateStatus');
    const badge = document.getElementById('sidebarVersionBadge');
    const modal = document.getElementById('updateModal');
    const closeModal = document.getElementById('closeUpdateModal');
    const modalContent = document.getElementById('updateModalContent');
    const btnExecute = document.getElementById('btnExecuteUpdate');
    const btnView = document.getElementById('btnViewRelease');
    const modalTitle = document.getElementById('updateModalTitle');
    const navUpdateLink = document.getElementById('navUpdateLink');
    const navVersionTag = document.getElementById('navVersionTag');

    if (!card && !btn && !navUpdateLink) return;

    let updateState = {
      checked: false,
      updateAvailable: false,
      latestVersion: 'v4.0.8',
      currentVersion: 'v4.0.8',
      releaseUrl: 'https://github.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE/releases',
      releaseName: '',
      notes: '',
      isGit: false,
      gitBehind: false
    };

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    async function checkUpdate(silent = false) {
      if (!silent) {
        btn.innerHTML = '<span class="btn-update-icon spinning">↻</span> Checking…';
        btn.disabled = true;
      }
      try {
        const res = await fetch('/api/updater/check');
        const data = await res.json();
        updateState = {
          checked: true,
          updateAvailable: !!data.update_available,
          latestVersion: data.latest_version || 'v4.0.8',
          currentVersion: data.current_version || 'v4.0.8',
          releaseUrl: data.release_url || updateState.releaseUrl,
          releaseName: data.release_name || '',
          notes: data.body || '',
          isGit: !!data.is_git,
          gitBehind: !!data.git_behind
        };

        if (badge) badge.textContent = data.current_version || 'v4.0.8';
        if (navVersionTag) navVersionTag.textContent = data.current_version || 'v4.0.8';

        if (updateState.updateAvailable) {
          if (card) card.classList.add('has-update');
          if (navVersionTag) {
            navVersionTag.textContent = 'Update';
            navVersionTag.style.background = '#22c55e';
            navVersionTag.style.color = '#052e16';
          }
          if (statusMsg) statusMsg.textContent = `New: ${updateState.latestVersion}`;
          if (btn) {
            btn.innerHTML = '<span class="btn-update-icon">⚡</span> Update';
            btn.disabled = false;
          }
          if (!silent) {
            openModalWithRelease(updateState);
          }
        } else {
          if (card) card.classList.remove('has-update');
          if (statusMsg) statusMsg.textContent = 'Up to date ✓';
          if (btn) {
            btn.innerHTML = '<span class="btn-update-icon">↻</span> Update';
            btn.disabled = false;
          }
          if (!silent) {
            openModalUpToDate(updateState);
          }
        }
      } catch (err) {
        if (statusMsg) statusMsg.textContent = 'Offline';
        if (btn) {
          btn.innerHTML = '<span class="btn-update-icon">↻</span> Retry';
          btn.disabled = false;
        }
        if (!silent) {
          alert('Could not check for updates: ' + err.message);
        }
      }
    }

    function openModalWithRelease(info) {
      if (!modal) return;
      modal.style.display = 'flex';
      if (modalTitle) modalTitle.textContent = `New Release Available: ${info.latestVersion}`;
      if (btnView) btnView.href = info.releaseUrl;
      if (btnExecute) {
        btnExecute.style.display = 'inline-block';
        btnExecute.textContent = '⚡ Update Now (Fast)';
        btnExecute.disabled = false;
      }
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="margin-bottom:10px;">
            <b style="color:#4ade80;font-size:14px;">${escapeHtml(info.releaseName || ('Clipify AI ' + info.latestVersion))}</b>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px;">Installed: <b>${escapeHtml(info.currentVersion)}</b> &nbsp;→&nbsp; Latest: <b>${escapeHtml(info.latestVersion)}</b></div>
          </div>
          <p style="margin:8px 0 12px;font-size:12px;color:#cbd5e1;line-height:1.5;">
            Press <b>Update Now</b> to update in-place without running the 330MB installer. Your clips, jobs, and AI models are completely preserved.
          </p>
          ${info.notes ? `<pre style="font-family:inherit;font-size:11px;color:#94a3b8;max-height:120px;overflow-y:auto;background:rgba(0,0,0,0.35);padding:10px;border-radius:8px;white-space:pre-wrap;border:1px solid rgba(255,255,255,0.06);">${escapeHtml(info.notes)}</pre>` : ''}
        `;
      }
    }

    function openModalUpToDate(info) {
      if (!modal) return;
      modal.style.display = 'flex';
      if (modalTitle) modalTitle.textContent = 'Clipify AI is Up to Date';
      if (btnView) btnView.href = info.releaseUrl;
      if (btnExecute) {
        btnExecute.style.display = 'inline-block';
        btnExecute.textContent = 'Force Re-sync / Hotfixes';
        btnExecute.disabled = false;
      }
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="color:#4ade80;font-size:20px;">✓</span>
            <div>
              <b style="color:#f8fafc;font-size:13px;">Version ${escapeHtml(info.currentVersion)} is currently installed.</b>
              <div style="font-size:11px;color:#94a3b8;">You are running the latest official release.</div>
            </div>
          </div>
          <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;line-height:1.4;">
            If you want to pull the newest commits and hotfixes from GitHub without waiting for a new tag, click <b>Force Re-sync / Hotfixes</b>.
          </p>
        `;
      }
    }

    async function applyUpdate() {
      if (!btnExecute) return;
      btnExecute.disabled = true;
      btnExecute.innerHTML = '<span class="btn-update-icon spinning">↻</span> Updating…';
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="text-align:center;padding:16px 0;">
            <div style="font-size:26px;margin-bottom:8px;">🚀</div>
            <b style="color:#f8fafc;font-size:14px;">Applying in-place update…</b>
            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Fetching updated code and assets from GitHub. Keeping models and data safe…</p>
          </div>
        `;
      }

      try {
        const res = await fetch('/api/updater/apply', { method: 'POST' });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Update failed');
        }

        if (modalContent) {
          modalContent.innerHTML = `
            <div style="text-align:center;padding:16px 0;">
              <div style="font-size:26px;color:#4ade80;margin-bottom:8px;">✓</div>
              <b style="color:#4ade80;font-size:14px;">Update Complete!</b>
              <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">${escapeHtml(data.message || 'Updated successfully.')}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">Reloading app in 3 seconds…</p>
            </div>
          `;
        }
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } catch (err) {
        if (modalContent) {
          modalContent.innerHTML = `
            <div style="padding:10px 0;">
              <b style="color:#ef4444;font-size:13px;">Update Failed</b>
              <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">${escapeHtml(err.message)}</p>
            </div>
          `;
        }
        btnExecute.disabled = false;
        btnExecute.textContent = 'Retry Update';
      }
    }

    if (btn) {
      btn.addEventListener('click', () => {
        if (updateState.checked && updateState.updateAvailable) {
          openModalWithRelease(updateState);
        } else {
          checkUpdate(false);
        }
      });
    }

    if (navUpdateLink) {
      navUpdateLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (updateState.checked && updateState.updateAvailable) {
          openModalWithRelease(updateState);
        } else {
          openModalUpToDate(updateState);
          checkUpdate(true);
        }
      });
    }

    window.openClipifyUpdate = () => {
      if (updateState.checked && updateState.updateAvailable) {
        openModalWithRelease(updateState);
      } else {
        openModalUpToDate(updateState);
        checkUpdate(true);
      }
    };

    btnExecute?.addEventListener('click', applyUpdate);

    closeModal?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Check silently on startup after 3 seconds
    setTimeout(() => checkUpdate(true), 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarUpdater);
  } else {
    initSidebarUpdater();
  }
})();

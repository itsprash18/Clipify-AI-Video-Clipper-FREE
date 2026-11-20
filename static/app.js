const state={jobId:null,mode:'viral',source:null,logoFile:null,logoPath:null,logoServerPath:null,es:null,model:null,modelsAvailable:false,font:'Montserrat Extra Bold',outputs:[],currentOutputIndex:0,drag:null,reviewFile:null,editorLogoFile:null,editorLogoPath:null,youtubePoll:null,sourcePreviewUrl:null};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];

async function safeJson(response, fallbackMsg = 'Server response error') {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    let msg = fallbackMsg;
    try {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      msg = doc.querySelector('title, h1, p')?.textContent?.trim() || fallbackMsg;
    } catch (_) {}
    throw new Error(msg);
  }
}
const editorDownloads=()=>['#reviewDownload','#reviewDownloadMain'].map($).filter(Boolean);
const editorApplyButtons=()=>['#applyEditorBranding','#applyEditorBrandingMain'].map($).filter(Boolean);
const reviewPlayer=window.ClipifyReviewPlayer?.attach($('#reviewVideo'),$('#reviewVideoStatus'),$('#reviewVideoSpinner'),$('#reviewVideoStatusText'));
const input=$('#videoInput'),drop=$('#dropzone'),create=$('#createBtn'),chip=$('#fileChip'),nameEl=$('#fileName'),sizeEl=$('#fileSize'),progressPanel=$('#progressPanel'),results=$('#results'),grid=$('#resultGrid'),log=$('#log'),modelSelect=$('#modelSelect'),refreshModelsBtn=$('#refreshModelsBtn'),scanModelsBtn=$('#scanModelsBtn'),fontSelect=$('#fontSelect'),minDuration=$('#minDuration'),maxDuration=$('#maxDuration'),youtubeUrl=$('#youtubeUrl'),youtubeImport=$('#youtubeImport'),youtubeStatus=$('#youtubeStatus');
const positions=['top-left','top-center','top-right','center-left','center','center-right','bottom-left','bottom-center','bottom-right','custom'];

function startTypewriter(){
  const lead=$('#typewriterLead');
  const focus=$('#typewriterFocus');
  if(!lead||!focus)return;
  const leadText='From long-form video to a ';
  const focusText='Short worth watching.';
  let index=0;
  let phase='typingLead';
  const tick=()=>{
    if(phase==='typingLead'){
      lead.textContent=leadText.slice(0,++index);
      if(index>=leadText.length){index=0;phase='typingFocus';}
      return setTimeout(tick,62);
    }
    if(phase==='typingFocus'){
      focus.textContent=focusText.slice(0,++index);
      if(index>=focusText.length){phase='pause';return setTimeout(tick,2100);}
      return setTimeout(tick,72);
    }
    if(phase==='pause'){phase='erasingFocus';index=focusText.length;return tick();}
    if(phase==='erasingFocus'){
      focus.textContent=focusText.slice(0,--index);
      if(index<=0){phase='erasingLead';index=leadText.length;}
      return setTimeout(tick,42);
    }
    lead.textContent=leadText.slice(0,--index);
    if(index<=0){phase='typingLead';index=0;return setTimeout(tick,500);}
    return setTimeout(tick,42);
  };
  setTimeout(tick,350);
}

startTypewriter();

modelSelect?.addEventListener('change',()=>{state.model=modelSelect.value});

refreshModelsBtn?.addEventListener('click', async () => {
  try {
    if (refreshModelsBtn) {
      refreshModelsBtn.disabled = true;
      refreshModelsBtn.textContent = '…';
    }
    await loadOptions();
  } finally {
    if (refreshModelsBtn) {
      refreshModelsBtn.disabled = false;
      refreshModelsBtn.textContent = '↻';
    }
  }
});

scanModelsBtn?.addEventListener('click', async () => {
  if (scanModelsBtn) {
    scanModelsBtn.disabled = true;
    scanModelsBtn.textContent = '🔍 Searching PC…';
  }
  try {
    const res = await fetch('/api/models/scan', { method: 'POST' });
    const data = await safeJson(res, 'PC scan failed.');
    if (data.ok && data.models && data.models.length) {
      await loadOptions();
      if (scanModelsBtn) scanModelsBtn.style.display = 'none';
    } else {
      alert(data.error || 'No Ollama models found during PC scan. Please make sure models were downloaded.');
    }
  } catch (err) {
    alert('PC scan failed: ' + err.message);
  } finally {
    if (scanModelsBtn) {
      scanModelsBtn.disabled = false;
      scanModelsBtn.textContent = '🔍 Search PC';
    }
  }
});

async function refreshModelOptions(){
  if (refreshModelsBtn) {
    refreshModelsBtn.disabled = true;
    refreshModelsBtn.textContent = '…';
  }

  try {
    await loadOptions();
  } finally {
    if (refreshModelsBtn) {
      refreshModelsBtn.disabled = false;
      refreshModelsBtn.textContent = '↻';
    }
  }
}

function formatBytes(n){
  if(!n)return '';
  const u=['B','KB','MB','GB'];
  let i=0;
  while(n>=1024&&i<3){n/=1024;i++}
  return `${n.toFixed(i?1:0)} ${u[i]}`
}

function setFile(file){
  state.jobId=null;
  state.source=file;
  nameEl.textContent=file.name;
  sizeEl.textContent=formatBytes(file.size);
  chip.hidden=false;
  create.disabled=false;
  if(youtubeStatus)youtubeStatus.textContent='';
  const url=URL.createObjectURL(file);
  const preview=$('#sourcePreview');
  // Assigning src is not enough: the element was hidden while the file was
  // being read, and Chromium leaves a blob-backed <video> parked in
  // NETWORK_LOADING (readyState 0) so the preview box stays empty. load()
  // restarts the fetch and lets the poster render.
  if(state.sourcePreviewUrl)URL.revokeObjectURL(state.sourcePreviewUrl);
  state.sourcePreviewUrl=url;
  preview.src=url;
  preview.load();
  preview.hidden=false;
  $('.preview-placeholder').style.display='none';
  $('#previewMeta').textContent=`${file.name} · ${formatBytes(file.size)}`
}

input?.addEventListener('change',e=>e.target.files[0]&&setFile(e.target.files[0]));

['dragenter','dragover'].forEach(x=>drop?.addEventListener(x,e=>{
  e.preventDefault();
  drop.classList.add('drag')
}));

['dragleave','drop'].forEach(x=>drop?.addEventListener(x,e=>{
  e.preventDefault();
  drop.classList.remove('drag')
}));

drop?.addEventListener('drop',e=>{
  const f=e.dataTransfer.files[0];
  if(f&&f.type.startsWith('video/'))setFile(f)
});

async function importYouTube(){
  sanitizeYouTubeInput(youtubeUrl);
  const url=youtubeUrl.value.trim();

  if(!url || (url.includes('@') && !url.includes('youtube.com') && !url.includes('youtu.be'))){
    youtubeUrl.value = '';
    youtubeStatus.textContent='Paste a valid YouTube video link first.';
    return;
  }

  youtubeImport.disabled=true;
  youtubeImport.textContent='Connecting…';
  youtubeStatus.textContent='Connecting to YouTube…';

  const track=$('#youtubeProgress');
  const bar=$('#youtubeProgressBar');

  if(track)track.hidden=false;
  if(bar)bar.style.width='0%';

  try{
    const r=await fetch('/api/import-youtube',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({url})
    });

    const d=await safeJson(r, 'Could not start YouTube import.');

    if(!r.ok)throw Error(d.error||'Could not start YouTube import.');

    state.jobId=d.job_id||state.jobId;
    state.source=null;
    chip.hidden=true;
    create.disabled=true;

    youtubeImport.textContent='Downloading…';

    await waitForYouTubeDownload(d.job_id);

  }catch(error){

    if(state.youtubePoll)clearInterval(state.youtubePoll);
    state.youtubePoll=null;

    youtubeStatus.textContent=error.message;
    youtubeImport.disabled=false;
    youtubeImport.textContent='Import video';

    if(track)track.hidden=true;
  }
}

async function waitForYouTubeDownload(jobId){

  const track=$('#youtubeProgress');
  const bar=$('#youtubeProgressBar');

  let finished=false;

  const tick=async()=>{

    try{

      const r=await fetch(`/api/status/${jobId}`,{cache:'no-store'});
      const d=await safeJson(r, 'Could not read YouTube download status.');

      if(!r.ok)throw Error(d.error||'Could not read YouTube download status.');

      const pct=Math.max(
        0,
        Math.min(100,Number(d.progress)||0)
      );

      if(bar)bar.style.width=pct+'%';

      youtubeStatus.textContent=
        `${pct}% · ${d.detail||d.stage||'Downloading video…'}`;

      if(d.status==='uploaded'){

        finished=true;

        if(state.youtubePoll)clearInterval(state.youtubePoll);
        state.youtubePoll=null;

        state.jobId=jobId;
        state.source={
          name:d.filename,
          size:0,
          origin:'youtube',
          jobId:jobId
        };

        nameEl.textContent=d.filename;
        sizeEl.textContent='Downloaded locally';
        chip.hidden=false;

        // Immediately show the downloaded YouTube video in the main preview frame
        const mediaUrl=`/project-media/${encodeURIComponent(jobId)}/input/${encodeURIComponent(d.filename)}`;
        const preview=$('#sourcePreview');
        if(preview){
          preview.src=mediaUrl;
          preview.load();
          preview.hidden=false;
        }
        const placeholder=$('.preview-placeholder');
        if(placeholder)placeholder.style.display='none';
        const meta=$('#previewMeta');
        if(meta)meta.textContent=`${d.filename} · Downloaded from YouTube`;

        youtubeStatus.textContent=
          '100% · Download complete. Video ready.';

        youtubeImport.disabled=false;
        youtubeImport.textContent='Import video';

        if(!state.modelsAvailable){
          try{await loadOptions();}catch{}
        }

        create.disabled=false;

        if(track)track.hidden=true;

      }else if(d.status==='error'){

        finished=true;

        if(state.youtubePoll)clearInterval(state.youtubePoll);
        state.youtubePoll=null;

        throw Error(
          d.error||
          d.detail||
          'YouTube download failed.'
        );
      }

    }catch(error){

      if(state.youtubePoll)clearInterval(state.youtubePoll);
      state.youtubePoll=null;

      youtubeImport.disabled=false;
      youtubeImport.textContent='Import video';
      youtubeStatus.textContent=error.message;

      if(track)track.hidden=true;

      state.jobId=null;
      state.source=null;
      create.disabled=true;
    }

    if(finished)return;
  };

  await tick();

  if(finished)return;

  state.youtubePoll=setInterval(tick,500);
}

youtubeImport?.addEventListener(
  'click',
  importYouTube
);

youtubeUrl?.addEventListener(
  'keydown',
  event=>{
    if(event.key==='Enter'){
      event.preventDefault();
      importYouTube();
    }
  }
);

youtubeUrl?.addEventListener(
  'paste',
  event=>{
    setTimeout(()=>{
      const val = (youtubeUrl.value||'').trim();
      if(val.includes('youtube.com/') || val.includes('youtu.be/')){
        importYouTube();
      }
    }, 50);
  }
);

// Prevent browser password/email autofill from injecting credentials into YouTube link inputs
function sanitizeYouTubeInput(inputEl){
  if(!inputEl) return;
  const v = (inputEl.value || '').trim();
  if(v && v.includes('@') && !v.includes('youtube.com') && !v.includes('youtu.be')){
    inputEl.value = '';
  }
}

['DOMContentLoaded', 'load'].forEach(ev => {
  window.addEventListener(ev, () => {
    [10, 80, 200, 500, 1000, 2000].forEach(delay => {
      setTimeout(() => {
        sanitizeYouTubeInput(youtubeUrl);
        const betaYt = $('#betaYtUrl');
        if (betaYt) sanitizeYouTubeInput(betaYt);
      }, delay);
    });
  });
});

[youtubeUrl, $('#betaYtUrl')].forEach(el => {
  if(!el) return;
  ['input', 'change', 'focus', 'animationstart'].forEach(ev => {
    el.addEventListener(ev, () => sanitizeYouTubeInput(el));
  });
});

$$('.mode-card').forEach(btn=>
  btn.addEventListener('click',()=>{
    $$('.mode-card').forEach(x=>
      x.classList.remove('selected')
    );

    btn.classList.add('selected');
    state.mode=btn.dataset.mode;
  })
);

function syncDuration(){

  let min=+minDuration.value;
  let max=+maxDuration.value;

  if(min>max){
    max=min;
    maxDuration.value=max;
  }

  $('#durationNote').textContent=
    `Recommended: ${min}–${max} seconds. Qwen can refine boundaries inside candidates.`;
}

minDuration?.addEventListener('change',syncDuration);
maxDuration?.addEventListener('change',syncDuration);
if(minDuration&&maxDuration) syncDuration();

function syncRange(id,out){

  const el=$('#'+id);
  const o=$('#'+out);

  const f=()=>{
    o.textContent=el.value+'%';
    updatePreview();
  };

  el.addEventListener('input',f);
  f();
}

syncRange('logoSize','logoSizeOut');
syncRange('logoOpacity','logoOpacityOut');
syncRange('textBgOpacity','textBgOpacityOut');

[
  'logoEnabled',
  'textEnabled',
  'textBgEnabled',
  'logoBgRemove',
  'logoBgColor',
  'logoBgSimilarity',
  'logoPosition',
  'logoMargin',
  'textPosition',
  'textSize',
  'textMargin',
  'textColor',
  'textBgColor',
  'overlayText'
].forEach(id=>
  $('#'+id)?.addEventListener(
    'input',
    ()=>{
      if(
        id==='logoPosition' &&
        $('#logoPosition').value!=='custom'
      ){}

      if(
        id==='textPosition' &&
        $('#textPosition').value!=='custom'
      ){}

      updatePreview();
    }
  )
);

function hexAlpha(hex,p){
  return hex+
    Math.round(p*2.55)
      .toString(16)
      .padStart(2,'0')
}

function applyPresetPosition(el,pos,m){

  el.style.left='';
  el.style.right='';
  el.style.top='';
  el.style.bottom='';
  el.style.transform='';

  if(pos.includes('left'))
    el.style.left=m+'px';

  if(pos.includes('right'))
    el.style.right=m+'px';

  if(
    pos.includes('center') &&
    !pos.startsWith('center-')
  ){
    el.style.left='50%';
    el.style.transform='translateX(-50%)';
  }

  if(pos.startsWith('top'))
    el.style.top=m+'px';

  if(pos.startsWith('bottom'))
    el.style.bottom=m+'px';

  if(pos==='center'){
    el.style.top='50%';
    el.style.transform='translate(-50%,-50%)';
  }

  if(
    pos==='center-left' ||
    pos==='center-right'
  ){
    el.style.top='50%';
    el.style.transform='translateY(-50%)';
  }
}

function setCustomFromCenter(el,x,y){

  const frame=$('#previewFrame');
  const r=frame.getBoundingClientRect();
  const er=el.getBoundingClientRect();

  const px=Math.max(
    0,
    Math.min(
      100,
      ((x-r.left-er.width/2)/
      (r.width-er.width))*100
    )
  );

  const py=Math.max(
    0,
    Math.min(
      100,
      ((y-r.top-er.height/2)/
      (r.height-er.height))*100
    )
  );

  return [px,py];
}

function applyCustom(el,x,y){

  el.style.left=x+'%';
  el.style.top=y+'%';
  el.style.right='auto';
  el.style.bottom='auto';
  el.style.transform='translate(-50%,-50%)';

  el.dataset.x=x;
  el.dataset.y=y;
}

function updatePreview(){

  const logo=$('#previewLogo');
  const txt=$('#previewText');

  const logoImg=$('#previewLogoImg');
  if(logoImg && state.logoPath){
    logoImg.src=state.logoPath;
    logoImg.style.display='block';
  }

  logo.style.display=
    $('#logoEnabled').checked?'block':'none';

  logo.style.opacity=
    (+$('#logoOpacity').value)/100;

  logo.style.width=
    Math.max(
      28,
      Math.round(
        220*(+$('#logoSize').value)/20
      )
    )+'px';

  logo.style.fontSize=
    Math.max(
      14,
      Math.round(
        36*(+$('#logoSize').value)/12
      )
    )+'px';

  if($('#logoPosition').value==='custom'){

    applyCustom(
      logo,
      +logo.dataset.x||92,
      +logo.dataset.y||8
    );

  }else{

    applyPresetPosition(
      logo,
      $('#logoPosition').value,
      +$('#logoMargin').value
    );
  }

  txt.style.display=
    $('#textEnabled').checked &&
    $('#overlayText').value.trim()
      ?'block'
      :'none';

  txt.textContent=
    $('#overlayText').value||'Your text';

  txt.style.fontSize=
    Math.max(
      14,
      Math.round(
        120*(+$('#textSize').value)/12
      )
    )+'px';

  txt.style.color=
    $('#textColor').value;

  txt.style.background=
    $('#textBgEnabled').checked
      ?hexAlpha(
        $('#textBgColor').value,
        +$('#textBgOpacity').value
      )
      :'transparent';

  if($('#textPosition').value==='custom'){

    applyCustom(
      txt,
      +txt.dataset.x||50,
      +txt.dataset.y||75
    );

  }else{

    applyPresetPosition(
      txt,
      $('#textPosition').value,
      +$('#textMargin').value
    );
  }

  const wm = $('#previewWatermark');
  if(wm){
    const wmEnabled = $('#watermarkTextEnabled')?.checked || false;
    const wmText = ($('#watermarkTextInput')?.value || '').trim();
    if(wmEnabled && wmText){
      wm.style.display = 'block';
      wm.textContent = wmText;
      const opacity = (+($('#watermarkTextOpacity')?.value || 35)) / 100;
      const angle = +($('#watermarkTextAngle')?.value || -20);
      const sizePct = +($('#watermarkTextSize')?.value || 6);
      const color = $('#watermarkTextColor')?.value || '#FFFFFF';
      const pos = $('#watermarkTextPosition')?.value || 'center';
      wm.style.opacity = opacity;
      wm.style.color = color;
      wm.style.fontSize = Math.max(12, Math.round(280 * (sizePct / 100))) + 'px';
      wm.style.transform = `rotate(${angle}deg)`;

      if(pos === 'custom'){
        const xPct = +($('#watermarkTextX')?.value || 50);
        const yPct = +($('#watermarkTextY')?.value || 50);
        applyCustom(wm, xPct, yPct);
      }else{
        applyPresetPosition(wm, pos, 40);
      }
    }else{
      wm.style.display = 'none';
    }
  }
}

function beginDrag(el,e){

  if(
    e.button!==undefined &&
    e.button!==0
  )return;

  if(
    !el ||
    getComputedStyle(el).display==='none'
  )return;

  e.preventDefault();

  const frame=
    el.closest(
      '.preview-frame,.editor-preview-frame'
    );

  if(!frame)return;

  const r=frame.getBoundingClientRect();
  const er=el.getBoundingClientRect();

  state.drag={
    el,
    frame,
    startX:e.clientX,
    startY:e.clientY,
    startLeft:er.left-r.left,
    startTop:er.top-r.top,
    frameW:r.width,
    frameH:r.height
  };

  el.classList.add('dragging');

  try{
    el.setPointerCapture?.(e.pointerId)
  }catch{}
}

function dragMove(e){

  if(!state.drag)return;

  const d=state.drag;
  const er=d.el.getBoundingClientRect();

  const x=Math.max(
    0,
    Math.min(
      d.frameW-er.width,
      d.startLeft+(e.clientX-d.startX)
    )
  );

  const y=Math.max(
    0,
    Math.min(
      d.frameH-er.height,
      d.startTop+(e.clientY-d.startY)
    )
  );

  const px=Math.max(
    0,
    Math.min(
      100,
      (x+er.width/2)/d.frameW*100
    )
  );

  const py=Math.max(
    0,
    Math.min(
      100,
      (y+er.height/2)/d.frameH*100
    )
  );

  applyCustom(d.el,px,py);

  if(d.el.id.includes('Logo')){

    if($('#logoPosition'))
      $('#logoPosition').value='custom';

    if($('#editorLogoEnabled'))
      $('#editorLogoEnabled').checked=true;

  }else{

    if($('#textPosition'))
      $('#textPosition').value='custom';

    if($('#editorTextEnabled'))
      $('#editorTextEnabled').checked=true;
  }
}

function endDrag(){

  if(!state.drag)return;

  state.drag.el.classList.remove('dragging');
  state.drag=null;
}

[
  'previewLogo',
  'previewText',
  'editorLogo',
  'editorText'
].forEach(id=>{

  $('#'+id)?.addEventListener(
    'pointerdown',
    e=>beginDrag($('#'+id),e)
  );

});

document.addEventListener(
  'pointermove',
  dragMove
);

document.addEventListener(
  'pointerup',
  endDrag
);

document.addEventListener(
  'pointercancel',
  endDrag
);

function editorPreviewUpdate(){

  const logo=$('#editorLogo');
  const txt=$('#editorText');

  if(!logo||!txt)return;

  logo.style.display=
    $('#editorLogoEnabled')?.checked
      ?'block'
      :'none';

  logo.style.opacity=
    (+($('#editorLogoOpacity')?.value||80))/100;

  logo.style.width=
    Math.max(
      28,
      Math.round(
        220*(+($('#editorLogoSize')?.value||8))/20
      )
    )+'px';

  if(logo.dataset.x){

    applyCustom(
      logo,
      +logo.dataset.x,
      +logo.dataset.y
    );
  }

  txt.style.display=
    $('#editorTextEnabled')?.checked &&
    $('#editorTextValue')?.value.trim()
      ?'block'
      :'none';

  txt.textContent=
    $('#editorTextValue')?.value||'Your text';

  txt.style.fontSize=
    Math.max(
      14,
      Math.round(
        120*(+($('#editorTextSize')?.value||6))/12
      )
    )+'px';

  txt.style.color=
    $('#editorTextColor')?.value||'#FFFFFF';

  txt.style.background=
    $('#editorTextBg')?.checked
      ?hexAlpha(
        $('#editorTextBgColor')?.value||'#000000',
        +($('#editorTextBgOpacity')?.value||65)
      )
      :'transparent';

  const bgOut=$('#editorTextBgOpacityOut');
  if(bgOut)
    bgOut.textContent=(+($('#editorTextBgOpacity')?.value||65))+'%';

  if(txt.dataset.x){

    applyCustom(
      txt,
      +txt.dataset.x,
      +txt.dataset.y
    );
  }

  const img=$('#editorLogoImg');

  if(
    img &&
    state.editorLogoPath
  ){
    img.src=
      state.editorLogoPath+
      (state.editorLogoPath.includes('?')?'&':'?')+
      'v='+Date.now();
  }
}

[
  'editorLogoEnabled',
  'editorTextEnabled',
  'editorTextValue',
  'editorLogoSize',
  'editorLogoOpacity',
  'editorTextSize',
  'editorTextColor',
  'editorTextBg',
  'editorTextBgColor',
  'editorTextBgOpacity'
].forEach(id=>
  $('#'+id)?.addEventListener(
    'input',
    editorPreviewUpdate
  )
);

$('#editorLogoInput')?.addEventListener(
  'change',
  e=>{
    const file=e.target.files[0];

    if(!file)return;

    state.editorLogoFile=file;

    const url=URL.createObjectURL(file);

    state.editorLogoPath=url;

    const img=$('#editorLogoImg');

    if(img){
      img.src=url;
      img.style.display='block';
    }

    $('#editorLogoEnabled').checked=true;

    editorPreviewUpdate();
  }
);

$('#logoInput')?.addEventListener(
  'change',
  e=>{
    const file=e.target.files[0];

    if(!file)return;

    state.logoFile=file;

    const url=URL.createObjectURL(file);

    state.logoPath=url;

    $('#logoPath').value=file.name;

    $('#logoEnabled').checked=true;

    updatePreview();
  }
);

$('#clearLogo')?.addEventListener(
  'click',
  ()=>{
    state.logoFile=null;
    state.logoPath=null;

    if($('#logoInput'))
      $('#logoInput').value='';

    if($('#logoPath'))
      $('#logoPath').value='';

    $('#logoEnabled').checked=false;

    updatePreview();
  }
);

function addLog(message){

  if(!log)return;

  const line=
    document.createElement('div');

  line.textContent=message;

  log.appendChild(line);
  log.scrollTop=log.scrollHeight;
}

function escapeHtml(value){

  return String(value??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

async function loadOptions(){

  if (refreshModelsBtn) {
    refreshModelsBtn.disabled = false;
    refreshModelsBtn.textContent = '↻';
  }

  try{

    const r=await fetch(
      '/api/health',
      {cache:'no-store'}
    );

    const d=await r.json();

    const models=d.models||[];

    modelSelect.innerHTML='';

    if(models.length){

      models.forEach(model=>{
        const option=
          document.createElement('option');

        option.value=model;
        option.textContent=model;

        modelSelect.appendChild(option);
      });

      state.modelsAvailable=true;
      modelSelect.disabled=false;

      state.model=
        d.default_model||
        d.model||
        models[0];

      modelSelect.value=state.model;

      if (window.refreshModelHub) {
        window.refreshModelHub();
      }

      create.disabled=!state.source;

      $('#healthDot')?.classList.add('online');

      // Models are up: stop any pending retry loop.
      modelRetries = MODEL_RETRY_LIMIT;
      if(modelRetryTimer){
        clearTimeout(modelRetryTimer);
        modelRetryTimer = null;
      }

      if($('#healthText'))
        $('#healthText').textContent=
          `${models.length} local model${models.length===1?'':'s'} ready`;

      if($('#statusPill'))
        $('#statusPill').innerHTML=
          '<span></span> Local AI ready';

      if (scanModelsBtn) scanModelsBtn.style.display = 'none';

    }else{

      state.modelsAvailable=false;
      state.model='';
      modelSelect.disabled=false;
      create.disabled=!state.source;

      if (scanModelsBtn) scanModelsBtn.style.display = 'inline-flex';

      modelSelect.innerHTML=
        '<option value="">⚡ Built-in Heuristic AI (No Ollama needed)</option>';

      if($('#healthText'))
        $('#healthText').textContent=
          'Built-in Heuristic AI (Ollama offline)';

      if($('#statusPill'))
        $('#statusPill').innerHTML=
          '<span></span> Heuristic Mode';

      _scheduleModelRetry();

    }

  }catch(error){

    console.error(
      '[Health] failed:',
      error
    );

    state.modelsAvailable=false;
    state.model='';
    modelSelect.disabled=false;
    create.disabled=!state.source;

    if (scanModelsBtn) scanModelsBtn.style.display = 'inline-flex';

    modelSelect.innerHTML=
      '<option value="">⚡ Built-in Heuristic AI (No Ollama needed)</option>';

    if($('#healthText'))
      $('#healthText').textContent=
        'Built-in Heuristic AI';

    if($('#statusPill'))
      $('#statusPill').innerHTML=
        '<span></span> Heuristic Mode';

    _scheduleModelRetry();
  }
}

// Ollama usually needs a few seconds to answer on a cold start, and a single
// check at page load would otherwise leave Generate permanently disabled until
// the user happened to find the refresh button.
const MODEL_RETRY_LIMIT = 8;
let modelRetries = 0;
let modelRetryTimer = null;

function _scheduleModelRetry(){
  if(modelRetries >= MODEL_RETRY_LIMIT) return;
  if(modelRetryTimer) clearTimeout(modelRetryTimer);
  const delay = Math.min(1000 * (modelRetries + 1), 8000);
  modelRetryTimer = setTimeout(async () => {
    modelRetryTimer = null;
    modelRetries += 1;
    await loadOptions();
  }, delay);
}

function selectedBranding(){

  return {
    logo_enabled:
      $('#logoEnabled')?.checked||false,

    logo_path:
      state.logoServerPath||
      state.logoPath||
      $('#logoPath')?.value||
      '',

    logo_position:
      $('#logoPosition')?.value||
      'top-right',

    logo_size:
      +($('#logoSize')?.value||8),

    logo_opacity:
      +($('#logoOpacity')?.value||80),

    logo_margin:
      +($('#logoMargin')?.value||40),

    logo_x:
      +($('#previewLogo')?.dataset.x||92),

    logo_y:
      +($('#previewLogo')?.dataset.y||8),

    logo_bg_remove:
      $('#logoBgRemove')?.checked||false,

    logo_bg_color:
      $('#logoBgColor')?.value||'#9B5CFF',

    logo_bg_similarity:
      +($('#logoBgSimilarity')?.value||0.22),

    text_enabled:
      $('#textEnabled')?.checked||false,

    text:
      $('#overlayText')?.value||'',

    text_position:
      $('#textPosition')?.value||
      'bottom-center',

    text_size:
      +($('#textSize')?.value||6),

    text_color:
      $('#textColor')?.value||
      '#FFFFFF',

    text_bg_enabled:
      $('#textBgEnabled')?.checked??true,

    text_bg_color:
      $('#textBgColor')?.value||
      '#000000',

    text_bg_opacity:
      +($('#textBgOpacity')?.value||65),

    text_margin:
      +($('#textMargin')?.value||110),

    text_x:
      +($('#previewText')?.dataset.x||50),

    text_y:
      +($('#previewText')?.dataset.y||75),

    watermark_text_enabled:
      $('#watermarkTextEnabled')?.checked || false,

    watermark_text:
      $('#watermarkTextInput')?.value || '',

    watermark_text_position:
      $('#watermarkTextPosition')?.value || 'center',

    watermark_text_size:
      +($('#watermarkTextSize')?.value || 6),

    watermark_text_opacity:
      +($('#watermarkTextOpacity')?.value || 35),

    watermark_text_angle:
      +($('#watermarkTextAngle')?.value || -20),

    watermark_text_color:
      $('#watermarkTextColor')?.value || '#FFFFFF',

    watermark_text_x:
      +($('#watermarkTextX')?.value || 50),

    watermark_text_y:
      +($('#watermarkTextY')?.value || 50),

    premium_captions:
      $('#premiumCaptionsToggle')?.checked ?? false,

    situational_cues:
      $('#situationalCuesToggle')?.checked ?? false,

    caption_preset:
      $('#captionPresetSelect')?.value || 'center_seam',

    caption_accent:
      $('#captionAccentSelect')?.value || 'gold_yellow'
  };
}

async function start(){

  if(!state.source && youtubeUrl && youtubeUrl.value.trim()){
    const trimmedUrl = youtubeUrl.value.trim();
    if(trimmedUrl.includes('youtube.com/') || trimmedUrl.includes('youtu.be/')){
      addLog('[YouTube] Importing video link before generating…');
      await importYouTube();
      if(!state.source){
        create.disabled=false;
        return;
      }
    }
  }

  if(!state.source){
    alert('Please upload a video or paste a YouTube link to generate Shorts.');
    if(drop){
      drop.scrollIntoView({behavior:'smooth',block:'center'});
    }
    return;
  }

  if(!state.modelsAvailable){
    try{await loadOptions();}catch{}
    if(!state.modelsAvailable){
      addLog('[AI] Ollama offline: Using built-in candidate & audio density heuristics.');
      state.model = '';
    }
  }

  try{
    if(!state.jobId){
      if(state.source && state.source.origin === 'youtube' && state.source.jobId){
        state.jobId = state.source.jobId;
      }else if(state.source instanceof File){
        const uploadForm=new FormData();
        uploadForm.append('video',state.source);
        const uploadResponse=await fetch('/api/upload',{method:'POST',body:uploadForm});
        const uploadData=await safeJson(uploadResponse, 'Could not upload the video.');
        if(!uploadResponse.ok) throw Error(uploadData.error||'Could not upload the video.');
        state.jobId=uploadData.job_id;
        addLog(`[Upload] Video ready as project ${state.jobId}`);
      }else{
        throw Error('Could not find video project. Please re-select or re-import the video.');
      }
    }

    if(state.logoFile){
      const logoForm=new FormData();
      logoForm.append('logo',state.logoFile);
      const logoResponse=await fetch(`/api/upload-logo/${state.jobId}`,{method:'POST',body:logoForm});
      const logoData=await safeJson(logoResponse, 'Could not upload the logo.');
      if(!logoResponse.ok) throw Error(logoData.error||'Could not upload the logo.');
      state.logoServerPath=logoData.path;
    }

  }catch(error){
    addLog(`[Error] ${error.message}`);
    alert(error.message);
    create.disabled=false;
    return;
  }

  const form=new FormData();
  form.append('job_id',state.jobId);

  form.append(
    'mode',
    state.mode
  );

  form.append(
    'clips',
    $('#clips').value
  );

  form.append(
    'model',
    modelSelect.value
  );

  form.append(
    'font',
    fontSelect.value
  );

  form.append(
    'min_duration',
    minDuration.value
  );

  form.append(
    'max_duration',
    maxDuration.value
  );

  form.append(
    'split_screen',
    $('#splitScreenToggle')?.checked ? '1' : '0'
  );

  form.append(
    'gaming_split',
    $('#gamingSplitToggle')?.checked ? '1' : '0'
  );

  form.append(
    'fast_whisper',
    $('#fastWhisperToggle')?.checked ? '1' : '0'
  );

  form.append(
    'premium_captions',
    $('#premiumCaptionsToggle')?.checked ? '1' : '0'
  );

  form.append(
    'situational_cues',
    $('#situationalCuesToggle')?.checked ? '1' : '0'
  );

  form.append(
    'caption_preset',
    $('#captionPresetSelect')?.value || 'center_seam'
  );

  form.append(
    'caption_accent',
    $('#captionAccentSelect')?.value || 'gold_yellow'
  );

  form.append(
    'branding',
    JSON.stringify(selectedBranding())
  );

  create.disabled=true;
  progressPanel.hidden=false;
  results.hidden=true;

  progressPanel.dataset.state='running';
  progressPanel.dataset.progress='0';
  progressPanel.setAttribute('role','region');
  progressPanel.setAttribute('aria-live','polite');
  $('#progressTitle').textContent='Processing locally';
  $('#progressStatus').textContent='LIVE';
  $('#progressBar').style.width='0%';
  $('#progressBar').setAttribute('aria-valuenow','0');
  $('#progressPercent').textContent='0%';
  $('#stageIcon').textContent='\u25cc';
  $('#stageText').textContent='Preparing\u2026';
  $('#subStage').textContent='Clipify AI is working locally';
  renderPipelineSteps(0,false);

  addLog('[Start] Starting Clipify AI…');

  try{

    const r=await fetch(
      '/api/start',
      {
        method:'POST',
        body:form
      }
    );

    const d=await safeJson(r, 'Could not start the job.');

    if(!r.ok)
      throw Error(
        d.error||
        'Could not start the job.'
      );

    state.jobId=d.job_id;

    addLog(
      `[Start] Job ${state.jobId}`
    );

    await watchJob(state.jobId);

  }catch(error){

    addLog(
      `[Error] ${error.message}`
    );

    alert(error.message);

    create.disabled=false;
  }
}

function renderPipelineSteps(progress, failed=false){
  const helper=window.ClipifyPipelineStatus;
  if(!helper)return;
  const marks={complete:'\u2713',active:'\u2026',failed:'!',pending:'\u00b7'};
  helper.stepStates(progress,failed).forEach(step=>{
    const node=document.querySelector('[data-step="'+step.name+'"]');
    if(!node)return;
    node.dataset.state=step.state;
    const indicator=node.querySelector('.step-indicator');
    if(indicator)indicator.textContent=marks[step.state]||'';
  });
}

function setPipelineFailure(message){
  if(progressPanel.dataset.state==='error'||progressPanel.dataset.state==='complete')return;
  const pct=Math.max(0,Math.min(100,Number(progressPanel.dataset.progress)||0));
  const detail=window.ClipifyPipelineStatus
    ? window.ClipifyPipelineStatus.cleanFailure(message)
    : String(message||'The pipeline stopped before a Short was created.').trim();
  progressPanel.dataset.state='error';
  progressPanel.setAttribute('role','alert');
  progressPanel.setAttribute('aria-live','assertive');
  $('#progressTitle').textContent='Processing failed';
  $('#progressPercent').textContent=pct?('Stopped at '+pct+'%'):'Stopped';
  $('#progressBar').setAttribute('aria-valuenow',String(pct));
  $('#stageIcon').textContent='!';
  $('#stageText').textContent='No Short was created';
  $('#subStage').textContent=detail;
  $('#progressStatus').textContent='FAILED';
  renderPipelineSteps(pct,true);
}

function setPipelineComplete(){
  updateProgress({
    progress:100,
    stage:'Shorts ready',
    detail:'Your finished Shorts are ready to review.'
  });
  progressPanel.dataset.state='complete';
  progressPanel.setAttribute('role','status');
  progressPanel.setAttribute('aria-live','polite');
  $('#progressTitle').textContent='Processing complete';
  $('#progressStatus').textContent='DONE';
  $('#stageIcon').textContent='\u2713';
}

function updateProgress(d){
  if(progressPanel.dataset.state==='error'||progressPanel.dataset.state==='complete')return;
  const pct=Math.max(0,Math.min(100,Number(d.progress)||0));
  progressPanel.dataset.state='running';
  progressPanel.dataset.progress=String(pct);
  const bar=$('#progressBar');
  if(bar){
    bar.style.width=pct+'%';
    bar.setAttribute('aria-valuenow',String(pct));
  }
  if($('#progressPercent'))$('#progressPercent').textContent=String(pct)+'%';
  if($('#progressTitle'))$('#progressTitle').textContent='Processing locally';
  if($('#progressStatus'))$('#progressStatus').textContent='LIVE';
  if($('#stageText'))$('#stageText').textContent=d.stage||'Working...';
  if($('#subStage'))$('#subStage').textContent=d.detail||'';
  if($('#stageIcon'))$('#stageIcon').textContent=pct>=100?'\u2713':'\u2726';
  renderPipelineSteps(pct,false);
}

async function watchJob(jobId){
  if(state.es){
    try{state.es.close()}catch{}
  }
  let terminal=false;
  const stream=new EventSource('/api/events/'+jobId);
  state.es=stream;

  stream.onmessage=event=>{
    try{
      const d=JSON.parse(event.data);
      const failed=d.kind==='error'||(d.kind==='status'&&d.status==='error');
      const succeeded=(d.kind==='complete'&&d.pipeline===true)||d.kind==='done'||(d.kind==='status'&&d.status==='done');

      if(d.kind==='log'){
        addLog(d.message);
        return;
      }
      if(failed){
        const detail=d.detail||d.message||d.error||'The pipeline stopped before a Short was created.';
        addLog('[Error] '+detail);
        setPipelineFailure(detail);
        terminal=true;
        stream.close();
        if(state.es===stream)state.es=null;
        create.disabled=false;
        return;
      }
      if(succeeded){
        setPipelineComplete();
        terminal=true;
        stream.close();
        if(state.es===stream)state.es=null;
        loadJobResult(jobId);
        return;
      }
      if(d.kind==='progress'||d.kind==='status')updateProgress(d);
    }catch(error){
      console.error('[SSE]',error);
    }
  };

  stream.onerror=()=>{
    if(!terminal&&stream.readyState===EventSource.CLOSED){
      terminal=true;
      stream.close();
      if(state.es===stream)state.es=null;
      setPipelineFailure('Connection to the local processing service was lost before the job finished.');
      create.disabled=false;
    }
  };
}

async function loadJobResult(jobId){

  try{

    const r=await fetch(
      `/api/status/${jobId}`,
      {cache:'no-store'}
    );

    const d=await r.json();

    if(!r.ok)
      throw Error(
        d.error||
        'Could not load job result.'
      );

    const outputs=
      d.outputs||
      d.output_files||
      [];

    await loadResults(outputs, jobId);

    if(outputs.length){

      await selectReview(jobId, outputs[0]);

      // Present all generated clips in the results view
      $('#results')?.scrollIntoView({
        behavior:'smooth',
        block:'start'
      });

      addLog(
        `[Done] ${outputs.length} Short(s) ready.`
      );

      // Automatically show Share & Publish options once clipping completes
      setTimeout(() => {
        if (window.openPublishModal) {
          window.openPublishModal(jobId, outputs[0]);
        }
      }, 700);

    }else{

      addLog(
        '[Done] Job completed but no output files were returned.'
      );

      create.disabled=false;
    }

  }catch(error){

    addLog(
      `[Error] ${error.message}`
    );

    create.disabled=false;
  }
}

async function fetchMetadata(job,file){

  try{

    const r=await fetch(
      `/api/metadata/${job}/${encodeURIComponent(file)}`,
      {cache:'no-store'}
    );

    if(!r.ok)return null;

    return await r.json();

  }catch{

    return null;
  }
}

function metadataMarkup(m){

  if(!m)return '';

  const title=
    escapeHtml(m.title||'');

  const description=
    escapeHtml(m.description||'');

  const hashes=
    escapeHtml(
      (m.hashtags||[]).join(' ')
    );

  const tags=
    escapeHtml(
      (m.tags||[]).join(', ')
    );

  return `
    <div class="metadata-title">${title}</div>
    <div class="metadata-description">${description}</div>
    <div class="metadata-label">Hashtags</div>
    <div class="metadata-hashes">${hashes}</div>
    <div class="metadata-label">Tags</div>
    <small>${tags}</small>
    <div class="metadata-copy-actions">
      <button class="ghost" type="button" data-copy-field="title">Copy Title</button>
      <button class="ghost" type="button" data-copy-field="description">Copy Description</button>
      <button class="ghost" type="button" data-copy-field="hashtags">Copy Hashtags</button>
      <button class="ghost" type="button" data-copy-field="tags">Copy Tags</button>
    </div>
  `;
}

async function copyMetadataValue(value,button){

  if(!value)return;

  try{

    if(navigator.clipboard?.writeText){

      await navigator.clipboard.writeText(value);

    }else{

      const area=
        document.createElement('textarea');

      area.value=value;
      area.style.position='fixed';
      area.style.opacity='0';

      document.body.appendChild(area);

      area.select();

      document.execCommand('copy');

      area.remove();
    }

    const label=button.textContent;

    button.textContent='Copied';

    setTimeout(
      ()=>button.textContent=label,
      1200
    );

  }catch(error){

    console.error(
      '[Metadata] copy failed:',
      error
    );
  }
}

function bindMetadataCopyButtons(container,m){

  const values={
    title:String(m.title||''),
    description:String(m.description||''),
    hashtags:(m.hashtags||[]).join(' '),
    tags:(m.tags||[]).join(', ')
  };

  container
    .querySelectorAll('[data-copy-field]')
    .forEach(button=>
      button.addEventListener(
        'click',
        ()=>{
          copyMetadataValue(
            values[button.dataset.copyField],
            button
          );
        }
      )
    );
}

function renderOutputCarousel(){
  const featured=$('#featuredResult');
  if(!featured) return;
  if(!state.outputs.length){
    featured.hidden=true;
    return;
  }

  const total=state.outputs.length;
  const currentFile=state.outputs[state.currentOutputIndex] || state.outputs[0];
  const src=`/media/${state.jobId}/${encodeURIComponent(currentFile)}`;
  const title=currentFile.replace(/\.mp4$/i,'');

  featured.hidden=false;
  featured.classList.remove('featured-pop');
  void featured.offsetWidth;
  featured.classList.add('featured-pop');

  featured.innerHTML=`
    <div class="featured-carousel-shell">
      <button class="carousel-nav prev" type="button" aria-label="Previous clip" ${state.currentOutputIndex===0 ? 'disabled' : ''}>‹</button>
      <div class="featured-video-shell">
        <video id="featuredVideo" controls playsinline preload="metadata" muted autoplay loop src="${src}?v=${Date.now()}"></video>
        <div class="featured-badge">${state.currentOutputIndex + 1} / ${total} · FINISHED SHORT</div>
      </div>
      <button class="carousel-nav next" type="button" aria-label="Next clip" ${state.currentOutputIndex===total-1 ? 'disabled' : ''}>›</button>
    </div>
    <div class="featured-copy">
      <div class="featured-meta-row">
        <span class="kicker">JUST GENERATED</span>
        <span class="carousel-index">${state.currentOutputIndex + 1} / ${total}</span>
      </div>
      <h3 id="featuredTitle">${escapeHtml(title)}</h3>
      <p id="featuredMeta">1080 × 1920 · finished captions · optional branding</p>
      <div class="featured-dots" aria-label="Select clip">
        ${state.outputs.map((_, index)=>`<button class="dot ${index===state.currentOutputIndex ? 'active' : ''}" type="button" aria-label="Go to clip ${index + 1}" data-index="${index}"></button>`).join('')}
      </div>
      <div class="featured-actions">
        <button class="primary" id="featuredReview" type="button"><span>✏️ Edit in Studio</span><b>→</b></button>
        <button class="secondary" id="featuredPublish" type="button" style="background:rgba(215,187,148,0.18);border:1px solid rgba(215,187,148,0.4);color:var(--text);border-radius:10px;padding:9px 18px;font-weight:600;cursor:pointer;"><span>🚀 Share / Publish</span></button>
        <a class="ghost" id="featuredDownload" href="${src}" download="${currentFile}">Download ↓</a>
        <button class="ghost" id="featuredNew" type="button">＋ New</button>
      </div>
    </div>
  `;

  const featuredVideo=$('#featuredVideo');
  const featuredReview=$('#featuredReview');
  const featuredDownload=$('#featuredDownload');

  if(featuredVideo){
    featuredVideo.muted=true;
    featuredVideo.autoplay=true;
    featuredVideo.loop=true;
    featuredVideo.load();
    featuredVideo.play().catch(()=>{});
  }

  featuredReview?.addEventListener('click', ()=>selectReview(state.jobId, currentFile));
  featured.querySelector('#featuredPublish')?.addEventListener('click', ()=>{
    if(window.openPublishModal){
      window.openPublishModal(state.jobId, currentFile);
    }
  });
  featured.querySelector('#featuredNew')?.addEventListener('click', ()=>{
    $('#newBtn')?.click();
  });
  featuredDownload?.addEventListener('click', (event)=>{
    event.preventDefault();
    window.location.href = `${src}?download=1`;
  });

  featured.querySelector('.carousel-nav.prev')?.addEventListener('click', ()=>{
    if(state.currentOutputIndex>0){
      state.currentOutputIndex -= 1;
      renderOutputCarousel();
    }
  });

  featured.querySelector('.carousel-nav.next')?.addEventListener('click', ()=>{
    if(state.currentOutputIndex < state.outputs.length - 1){
      state.currentOutputIndex += 1;
      renderOutputCarousel();
    }
  });

  featured.querySelectorAll('.featured-dots .dot').forEach((dot)=>{
    dot.addEventListener('click', ()=>{
      state.currentOutputIndex = Number(dot.dataset.index || 0);
      renderOutputCarousel();
    });
  });

  featured.querySelector('.featured-video-shell')?.addEventListener('dblclick', ()=>selectReview(state.jobId, currentFile));

  const reviewFile = currentFile;
  const renderedJob = state.jobId;
  fetchMetadata(renderedJob, reviewFile).then((m)=>{
    if(state.jobId!==renderedJob || state.outputs[state.currentOutputIndex]!==reviewFile) return;
    const titleEl=$('#featuredTitle');
    if(titleEl && m?.title) titleEl.textContent = m.title;
    const metaEl=$('#featuredMeta');
    const selection=m?.selection||{};
    if(metaEl && selection.method==='qwen' && selection.decision==='reject'){
      metaEl.textContent=`1080 × 1920 · Qwen (${selection.model||'local model'}) rejected this clip · recovery used`;
    }else if(metaEl && selection.method==='qwen' && selection.decision==='keep'){
      metaEl.textContent=`1080 × 1920 · Qwen (${selection.model||'local model'}) selected this clip`;
    }else if(metaEl && selection.method==='deterministic_fallback'){
      metaEl.textContent='1080 × 1920 · deterministic fallback · Qwen score unavailable';
    }
  });
}

async function loadResults(outputs, jobId = state.jobId){

  state.jobId = jobId || state.jobId;
  state.outputs = outputs || [];
  state.currentOutputIndex = 0;

  grid.innerHTML='';

  renderOutputCarousel();

  for(let i=0;i<state.outputs.length;i++){
    const file=state.outputs[i];
    const src=`/media/${state.jobId}/${encodeURIComponent(file)}`;
    const card=document.createElement('button');
    card.type='button';
    card.className='result-thumb';
    card.dataset.index=String(i);
    card.innerHTML=`
      <video muted playsinline preload="metadata" src="${src}"></video>
      <span>${i + 1}</span>
    `;
    card.addEventListener('click', ()=>{
      state.currentOutputIndex=i;
      renderOutputCarousel();
    });
    grid.appendChild(card);
  }

  results.hidden=!state.outputs.length;

  if(state.outputs.length){
    results.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>$('#featuredVideo')?.focus({preventScroll:true}), 450);
  }

  updateEditorClipSwitcher();
  create.disabled=false;
}

function updateEditorClipSwitcher(){
  const switcher=$('#editorClipSwitcher');
  if(!switcher) return;
  if(!state.outputs || state.outputs.length<=1){
    switcher.hidden=true;
    switcher.innerHTML='';
    return;
  }
  switcher.hidden=false;
  switcher.innerHTML=state.outputs.map((out, idx)=>{
    const active=(out===state.reviewFile || (!state.reviewFile && idx===0));
    return `<button type="button" class="editor-short-pill ${active ? 'active' : ''}" data-file="${out}" style="background:${active ? 'rgba(215,187,148,0.28)' : 'rgba(255,255,255,0.06)'};border:1px solid ${active ? 'var(--warm,#d6b388)' : 'rgba(190,176,159,0.3)'};color:var(--text);padding:6px 12px;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;">Short #${idx + 1}</button>`;
  }).join('');
  switcher.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const f=btn.dataset.file;
      if(f) selectReview(state.jobId, f);
    });
  });
}

function updateEditorFramingPreview(){
  const panX=+$('#editorPanX')?.value||0;
  const panY=+$('#editorPanY')?.value||0;
  const zoom=(+$('#editorZoom')?.value||100)/100;
  if($('#editorPanXOut')) $('#editorPanXOut').textContent=(panX>=0?`+${panX}%`:`${panX}%`);
  if($('#editorPanYOut')) $('#editorPanYOut').textContent=(panY>=0?`+${panY}%`:`${panY}%`);
  if($('#editorZoomOut')) $('#editorZoomOut').textContent=`${zoom.toFixed(1)}x`;

  const video=$('#reviewVideo');
  if(video){
    if(panX===0 && panY===0 && zoom===1){
      video.style.transform='none';
    }else{
      video.style.transform=`scale(${zoom}) translate(${panX*0.3}%, ${panY*0.3}%)`;
      video.style.transformOrigin='center center';
    }
  }
}

async function selectReview(job,file){

  state.jobId=job;
  state.reviewFile=file;

  const src=
    `/media/${job}/${encodeURIComponent(file)}`;

  $('#reviewTitle').textContent=file;

  $('#reviewMeta').textContent=
    '1080 × 1920 · local render · post-render branding available';

  // Reset framing preview controls to automatic defaults
  if($('#editorPanX')) $('#editorPanX').value=0;
  if($('#editorPanY')) $('#editorPanY').value=0;
  if($('#editorZoom')) $('#editorZoom').value=100;
  if($('#editorSplitRatio')) $('#editorSplitRatio').value=50;
  updateEditorFramingPreview();
  updateEditorClipSwitcher();

  // The editor renders its primary actions twice (panel + footer). Both copies
  // must be wired, otherwise the visible one stays a dead href="#".
  editorDownloads().forEach(a=>{a.href=src;a.hidden=false;});

  editorApplyButtons().forEach(b=>b.disabled=false);

  $('#editorLogoImg').removeAttribute('src');

  state.editorLogoFile=null;
  state.editorLogoPath=null;

  $('#editorLogoEnabled').checked=false;
  $('#editorTextEnabled').checked=false;
  $('#editorTextValue').value='';

  $('#editorLogo').dataset.x='92';
  $('#editorLogo').dataset.y='8';

  $('#editorText').dataset.x='50';
  $('#editorText').dataset.y='75';

  const m=
    await fetchMetadata(
      job,
      file
    );

  const meta=
    $('#editorMetadata');

  if(m){

    meta.hidden=false;

    const selectionNote=$('#editorSelectionNote');
    const selection=m.selection||{};
    if(selectionNote){
      selectionNote.hidden=true;
      selectionNote.textContent='';
      selectionNote.dataset.decision='';
      if(selection.method==='qwen' && selection.decision==='reject'){
        selectionNote.textContent=`Qwen (${selection.model||'local model'}) marked this clip reject. It was retained by the older recovery policy after boundary and duration validation.`;
        selectionNote.dataset.decision='reject';
        selectionNote.hidden=false;
      }else if(selection.method==='qwen' && selection.decision==='keep'){
        selectionNote.textContent=`Selected by Qwen (${selection.model||'local model'}); decision: keep.`;
        selectionNote.dataset.decision='keep';
        selectionNote.hidden=false;
      }else if(selection.method==='deterministic_fallback'){
        selectionNote.textContent='Selected by deterministic fallback because no usable Qwen score was available.';
        selectionNote.dataset.decision='fallback';
        selectionNote.hidden=false;
      }
    }

    $('#reviewTitle').textContent=
      m.title||file;

    $('#editorMetaDescription').textContent=
      m.description||
      m.title||
      '';

    $('#editorMetaHashtags').textContent=
      (m.hashtags||[]).join(' ');

    $('#editorMetaTags').textContent=
      'Tags: '+
      (m.tags||[]).join(', ');

  }else{

    meta.hidden=true;
  }

  navigateTo('editor');
  // Let the editor section become visible before asking Chromium to fetch media.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  $('#reviewEmpty').hidden=true;
  if(reviewPlayer){
    reviewPlayer.load(src);
  }else{
    const video=$('#reviewVideo');
    video.hidden=false;
    video.src=src;
    video.load();
  }
  editorPreviewUpdate();
}

async function applyEditorBranding(){

  if(
    !state.jobId||
    !state.reviewFile
  )return;

  const b={

    logo_enabled:
      $('#editorLogoEnabled').checked,

    logo_path:
      state.editorLogoPath||'',

    logo_position:
      'custom',

    logo_size:
      +$('#editorLogoSize').value,

    logo_opacity:
      +$('#editorLogoOpacity').value,

    logo_margin:
      40,

    logo_x:
      +$('#editorLogo').dataset.x||92,

    logo_y:
      +$('#editorLogo').dataset.y||8,

    logo_bg_remove:
      $('#editorLogoBgRemove').checked,

    logo_bg_color:
      $('#editorLogoBgColor').value,

    logo_bg_similarity:
      .22,

    logo_bg_blend:
      .05,

    text_enabled:
      $('#editorTextEnabled').checked,

    text:
      $('#editorTextValue').value,

    text_position:
      'custom',

    text_size:
      +$('#editorTextSize').value,

    text_color:
      $('#editorTextColor').value,

    text_bg_enabled:
      $('#editorTextBg').checked,

    text_bg_color:
      $('#editorTextBgColor').value,

    text_bg_opacity:
      +$('#editorTextBgOpacity').value,

    text_margin:
      110,

    text_x:
      +$('#editorText').dataset.x||50,

    text_y:
      +$('#editorText').dataset.y||75,

    framing: {
      pan_x: +$('#editorPanX')?.value || 0,
      pan_y: +$('#editorPanY')?.value || 0,
      zoom: (+$('#editorZoom')?.value || 100) / 100,
      split_ratio: +$('#editorSplitRatio')?.value || 50
    }
  };

  try{

    editorApplyButtons().forEach(b=>{
      b.disabled=true;
      const span=b.querySelector('span');
      if(span)span.textContent='Rendering…';
    });

    if(state.editorLogoFile){

      const fd=new FormData();

      fd.append(
        'logo',
        state.editorLogoFile
      );

      const ur=
        await fetch(
          '/api/upload-logo/'+state.jobId,
          {
            method:'POST',
            body:fd
          }
        );

      const ud=
        await ur.json();

      if(!ur.ok)
        throw Error(
          ud.error||
          'Logo upload failed'
        );

      state.editorLogoPath=ud.path;
      b.logo_path=ud.path;
    }

    const r=
      await fetch(
        '/api/apply-branding/'+state.jobId,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            filename:state.reviewFile,
            branding:b,
            font:fontSelect.value
          })
        }
      );

    const d=
      await r.json();

    if(!r.ok)
      throw Error(
        d.error||
        'Branding render failed'
      );

    state.reviewFile=d.filename;

    const src=
      d.url+
      '?v='+
      Date.now();

    if(reviewPlayer) reviewPlayer.load(src);
    else { $('#reviewVideo').src=src; $('#reviewVideo').load(); }

    editorDownloads().forEach(a=>a.href=d.url);

    $('#reviewTitle').textContent=
      d.filename;

    addLog(
      '[Editor] '+
      d.filename+
      ' created'
    );

    const m=
      await fetchMetadata(
        state.jobId,
        state.reviewFile
      );

    if(m){

      $('#editorMetadata').hidden=false;

      $('#editorMetaDescription').textContent=
        m.description||
        m.title||
        '';

      $('#editorMetaHashtags').textContent=
        (m.hashtags||[]).join(' ');

      $('#editorMetaTags').textContent=
        'Tags: '+
        (m.tags||[]).join(', ');
    }

    loadProjects();

  }catch(e){

    alert(e.message);

  }finally{

    editorApplyButtons().forEach(b=>{
      b.disabled=false;
      const span=b.querySelector('span');
      if(span)span.textContent='Apply to Finished Short';
    });
  }
}

editorApplyButtons().forEach(btn=>btn.addEventListener('click',applyEditorBranding));

['#editorPanX', '#editorPanY', '#editorZoom', '#editorSplitRatio'].forEach(sel=>{
  $(sel)?.addEventListener('input', updateEditorFramingPreview);
});

$('#resetFramingBtn')?.addEventListener('click', ()=>{
  if($('#editorPanX')) $('#editorPanX').value = 0;
  if($('#editorPanY')) $('#editorPanY').value = 0;
  if($('#editorZoom')) $('#editorZoom').value = 100;
  if($('#editorSplitRatio')) $('#editorSplitRatio').value = 50;
  updateEditorFramingPreview();
});

async function loadProjects(){

  const r=
    await fetch('/api/projects');

  const d=
    await r.json();

  const list=
    $('#projectList');

  list.innerHTML='';

  const sel=
    $('#assetProject');

  if(sel)
    sel.innerHTML=
      '<option value="">Choose a project</option>';

  const visibleProjects=(d.projects||[]).filter(x=>x.outputs?.length||['running','uploaded'].includes(x.status));

  visibleProjects.forEach(x=>{

    if(sel){

      sel.add(
        new Option(
          `${x.source||x.id} · ${x.outputs.length} Short(s)`,
          x.id
        )
      );
    }

    const el=
      document.createElement('article');

    el.className=
      'project-card panel';
    const firstOutput=x.outputs?.[0];
    const firstMetadata=x.output_metadata?.[firstOutput]||{};
    const projectTitle=firstMetadata.title||x.name||x.source||x.id;
    const projectDescription=firstMetadata.description||'No description generated yet.';
    const outputTitles=(x.outputs||[]).map((output,index)=>{
      const metadata=x.output_metadata?.[output]||{};
      return `<button class="project-output" type="button" data-output="${escapeHtml(output)}">${escapeHtml(metadata.title||`Short ${index+1}`)}</button>`;
    }).join('');
    const thumbnail=firstOutput?`<video class="project-thumb" muted playsinline preload="metadata" src="/media/${encodeURIComponent(x.id)}/${encodeURIComponent(firstOutput)}"></video>`:'<div class="project-thumb project-thumb-empty">✦</div>';

    el.innerHTML=`
      ${thumbnail}

      <div class="project-main">

        <b>
          ${escapeHtml(
            projectTitle
          )}
        </b>

        <small>
          ${x.outputs.length} Short(s) · ${x.status}
        </small>

        <span>
          ${escapeHtml(projectDescription)}
        </span>

        <div class="project-outputs">${outputTitles}</div>

      </div>

      <div class="project-actions">
        <button class="ghost project-open">Open</button>
        <button class="ghost project-share" title="Share & Publish this project's Short" style="color:var(--warm,#d6b388);font-weight:600;">🚀 Share</button>
        <button class="ghost project-rename" title="Rename project">Rename</button>
        <button class="ghost project-delete" title="Move project to Recently deleted">Delete</button>
      </div>
    `;

    el
      .querySelector('.project-open')
      .onclick=async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        const output = (x.outputs && x.outputs.length) ? x.outputs[0] : null;
        if(output)
          await selectReview(
            x.id,
            output
          );
        else
          navigateTo('create');
      };

    el.querySelector('.project-share')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const output = x.outputs?.[0] || 'short_01.mp4';
      if (window.openPublishModal) {
        window.openPublishModal(x.id, output);
      }
    });

    el.querySelectorAll('.project-output').forEach(button=>{
      button.onclick=()=>selectReview(x.id,button.dataset.output);
    });

    el.querySelector('.project-rename').onclick=async()=>{
      const next=prompt('Project name',x.name||x.source||x.id);
      if(next===null)return;
      const response=await fetch(`/api/projects/${x.id}/rename`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:next})});
      const data=await response.json();
      if(!response.ok){alert(data.error||'Could not rename project.');return;}
      loadProjects();
    };

    el.querySelector('.project-delete').onclick=async()=>{
      if(!confirm('Move this project to Recently deleted?'))return;
      const response=await fetch(`/api/projects/${x.id}`,{method:'DELETE'});
      const data=await response.json();
      if(!response.ok){alert(data.error||'Could not delete project.');return;}
      await loadProjects();
      loadTrash();
    };

    list.appendChild(el);

    const thumb=el.querySelector('.project-thumb');
    if(thumb?.tagName==='VIDEO'){
      thumb.addEventListener('loadedmetadata',()=>{
        thumb.currentTime=Math.min(1,thumb.duration||1);
      });
    }
  });

  if(!visibleProjects.length){

    list.innerHTML=
      '<div class="empty-state">No projects yet. Generate your first Short.</div>';
  }
}

async function loadTrash(){
  const list=$('#trashList');
  if(!list)return;
  const response=await fetch('/api/projects/trash',{cache:'no-store'});
  const data=await response.json();
  if(!response.ok){list.innerHTML='<div class="empty-state">Could not load deleted projects.</div>';return;}
  list.innerHTML=(data.projects||[]).map(x=>`
    <div class="trash-row">
      <div><b>${escapeHtml(x.name||x.id)}</b><small>${escapeHtml(x.id)}</small></div>
      <button class="ghost" data-restore="${escapeHtml(x.id)}">Restore</button>
    </div>`).join('')||'<div class="empty-state">No deleted projects.</div>';
  list.querySelectorAll('[data-restore]').forEach(button=>button.onclick=async()=>{
    const response=await fetch(`/api/projects/${encodeURIComponent(button.dataset.restore)}/restore`,{method:'POST'});
    const result=await response.json();
    if(!response.ok){alert(result.error||'Could not restore project.');return;}
    await loadProjects();
    loadTrash();
  });
}

async function loadAssets(){

  const id=
    $('#assetProject').value;

  if(!id){

    $('#assetList').innerHTML=
      '<div class="empty-state">Choose a project to load assets.</div>';

    return;
  }

  const r=
    await fetch(
      '/api/assets/'+id
    );

  const d=
    await r.json();

  $('#assetList').innerHTML=
    (d.assets||[])
      .map(a=>`

        <div class="asset-row">

          <span>
            ${a.kind==='source'?'🎬':'✦'}
          </span>

          <div>

            <b>
              ${escapeHtml(a.name)}
            </b>

            <small>
              ${escapeHtml(a.kind)} ·
              ${formatBytes(a.size)}
            </small>

          </div>

          <a
            class="ghost"
            href="${a.url}"
            target="_blank"
          >
            Open
          </a>

        </div>

      `)
      .join('')||
      '<div class="empty-state">No assets.</div>';
}

$('#refreshProjects')
  .onclick=loadProjects;

$('#refreshTrash')
  ?.addEventListener('click',loadTrash);

$('#refreshAssets')
  .onclick=loadAssets;

$('#assetProject')
  .onchange=loadAssets;

$('#newBtn')
  .onclick=()=>{

    state.jobId=null;
    state.source=null;
    state.logoFile=null;
    state.logoPath=null;

    input.value='';

    if(youtubeUrl)
      youtubeUrl.value='';

    if(youtubeStatus)
      youtubeStatus.textContent='';

    $('#logoInput').value='';

    chip.hidden=true;
    results.hidden=true;
    progressPanel.hidden=true;
    create.disabled=true;

    location.hash='create';
  };

if(create) create.onclick=start;

function navigateTo(id){
  const target = id || 'create';
  if(target === 'models'){
    if(window.openModelHub) window.openModelHub();
    return;
  }
  if(location.hash.slice(1) !== target){
    location.hash = target;
  }
  $$('.page-section').forEach(s=>
    s.classList.toggle('visible', s.id === target)
  );
  $$('[data-nav]').forEach(a=>
    a.classList.toggle('active', a.dataset.nav === target)
  );
  if(target === 'projects') loadProjects();
  if(target === 'assets') loadProjects().then(loadAssets);
  const el = document.getElementById(target);
  if(el){
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

$('#previewReview')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (state.jobId && state.reviewFile) {
    selectReview(state.jobId, state.reviewFile);
  } else if (state.outputs && state.outputs.length) {
    selectReview(state.jobId, state.outputs[0]);
  } else {
    navigateTo('editor');
  }
});

async function handleOpenOutput(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const btn = e?.currentTarget || $('#openOutput') || $('#openOutput2');
  const originalText = btn ? btn.textContent : 'Open output';
  if (btn) btn.textContent = 'Opening…';

  try {
    const res = await fetch('/api/open-output-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: state.jobId || null })
    });
    const data = await res.json();
    if (data && data.opened) {
      if (btn) {
        btn.textContent = 'Opened ✓';
        setTimeout(() => { if (btn) btn.textContent = originalText; }, 2000);
      }
      return;
    }
  } catch (err) {
    console.warn('Native folder open failed:', err);
  }

  if (btn) {
    btn.textContent = originalText;
  }

  // Graceful browser fallback: if in a remote/sandbox browser or explorer failed
  if (state.jobId && state.outputs?.[0]) {
    selectReview(state.jobId, state.outputs[0]);
  } else {
    navigateTo('projects');
  }
}

$('#openOutput')?.addEventListener('click', handleOpenOutput);
$('#openOutput2')?.addEventListener('click', handleOpenOutput);

window.addEventListener(
  'hashchange',
  ()=>{
    const searchParams = new URLSearchParams(location.search);
    const raw = location.hash.slice(1) || searchParams.get('section') || 'create';
    const id = raw.split('?')[0];
    navigateTo(id);

    const urlParams = new URLSearchParams(raw.includes('?') ? raw.slice(raw.indexOf('?')) : location.search);
    const videoParam = urlParams.get('video');
    const titleParam = urlParams.get('title') || 'Custom Short';
    if (id === 'editor' && videoParam) {
      if ($('#reviewEmpty')) $('#reviewEmpty').hidden = true;
      if (reviewPlayer) {
        reviewPlayer.load(videoParam);
      } else {
        const video = $('#reviewVideo');
        if (video) {
          video.hidden = false;
          video.src = videoParam;
          video.load();
        }
      }
      if ($('#reviewTitle')) $('#reviewTitle').textContent = titleParam;
      if ($('#reviewMeta')) $('#reviewMeta').textContent = '1080 × 1920 · live stream short · editor';
      editorDownloads().forEach(a => { a.href = videoParam; a.hidden = false; });
      editorApplyButtons().forEach(b => b.disabled = false);
      editorPreviewUpdate();
    }
  }
);

const initialHash = (location.hash.slice(1) || '').split('?')[0];
if (initialHash && document.getElementById(initialHash)) {
  try { navigateTo(initialHash); } catch(e){ console.warn(e); }
} else if (initialHash === 'models') {
  if (window.openModelHub) window.openModelHub();
} else {
  try { window.dispatchEvent(new Event('hashchange')); } catch(e){ console.warn(e); }
  try { navigateTo('create'); } catch(e){ console.warn(e); }
}
try { loadOptions(); } catch(e){ console.warn(e); }
try { loadProjects(); } catch(e){ console.warn(e); }
try { loadTrash(); } catch(e){ console.warn(e); }
try { updatePreview(); } catch(e){ console.warn(e); }
try { editorPreviewUpdate(); } catch(e){ console.warn(e); }

const revealSections = $$('.page-section');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealSections.forEach(section => revealObserver.observe(section));
} else {
  revealSections.forEach(section => section.classList.add('reveal-visible'));
}

// --- Social Publishing & MCP Integration ---
function initSocialPublishing() {
  const modal = $('#publishModal');
  const closeBtn = $('#closePublishModal');
  const cancelBtn = $('#cancelPublish');
  const form = $('#publishForm');
  const featuredPublish = $('#featuredPublish');
  const reviewPublish = $('#reviewPublish');
  const statusMsg = $('#publishStatusMsg');
  const pubTabs = $$('.pub-tab');

  // Ensure modal is strictly hidden on initial page load
  if (modal) {
    modal.style.display = 'none';
    modal.hidden = true;
  }

  function openPublish(jobId, filename, optionalTitle) {
    if (!modal) return;
    const jId = jobId || state.jobId;
    const fName = filename || state.outputs[state.currentOutputIndex] || 'short_01.mp4';
    if (!jId || !fName) {
      alert('Please generate or select a Short first.');
      return;
    }
    $('#publishJobId').value = jId;
    $('#publishFilename').value = fName;
    $('#publishTitle').value = optionalTitle || fName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    $('#publishDescription').value = '#Shorts #ClipifyAI #Viral';
    if (statusMsg) { statusMsg.style.display = 'none'; statusMsg.textContent = ''; }

    fetchMetadata(jId, fName).then(meta => {
      if (meta && meta.title) $('#publishTitle').value = meta.title;
      if (meta && meta.description) {
        const hashtags = Array.isArray(meta.hashtags) ? meta.hashtags.join(' ') : (Array.isArray(meta.tags) ? meta.tags.map(t => t.startsWith('#') ? t : '#' + t).join(' ') : '#Shorts');
        $('#publishDescription').value = `${meta.description}\n\n${hashtags}`;
      }
    }).catch(() => {});

    modal.style.display = 'flex';
    modal.hidden = false;
  }

  function closePublish() {
    if (modal) {
      modal.style.display = 'none';
      modal.hidden = true;
    }
  }

  window.openPublishModal = openPublish;
  window.closePublishModal = closePublish;

  featuredPublish?.addEventListener('click', () => openPublish());
  reviewPublish?.addEventListener('click', () => {
    const curFile = state.reviewFile || state.outputs[state.currentOutputIndex];
    openPublish(state.jobId, curFile);
  });
  closeBtn?.addEventListener('click', closePublish);
  cancelBtn?.addEventListener('click', closePublish);

  pubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      pubTabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'transparent';
        t.style.border = '1px solid transparent';
        t.style.color = 'var(--muted,#c9b9a4)';
      });
      tab.classList.add('active');
      tab.style.background = 'rgba(215,187,148,0.22)';
      tab.style.border = '1px solid rgba(215,187,148,0.4)';
      tab.style.color = 'var(--text,#f3eadf)';
      const platform = tab.dataset.platform;
      $('#publishPlatform').value = platform;
      const submitBtn = $('#submitPublish span');
      if (submitBtn) {
        submitBtn.textContent = platform === 'package' ? '📦 Export Package' : `🚀 Publish to ${tab.textContent}`;
      }
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const jobId = $('#publishJobId').value;
    const filename = $('#publishFilename').value;
    const platform = $('#publishPlatform').value;
    const title = $('#publishTitle').value.trim();
    const description = $('#publishDescription').value.trim();
    const privacy = $('#publishPrivacy').value;
    const submitBtn = $('#submitPublish');

    if (submitBtn) { submitBtn.disabled = true; submitBtn.querySelector('span').textContent = 'Publishing…'; }
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(215,187,148,0.12)';
      statusMsg.style.color = 'var(--text,#f3eadf)';
      statusMsg.textContent = `Preparing ${platform.toUpperCase()} distribution…`;
    }

    try {
      const resp = await fetch('/api/publish/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, filename, platform, title, description, privacy })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.error || 'Publishing failed.');

      if (statusMsg) {
        statusMsg.style.background = 'rgba(74,222,128,0.15)';
        statusMsg.style.border = '1px solid rgba(74,222,128,0.4)';
        statusMsg.style.color = '#4ade80';
        if (data.status === 'published' && data.url) {
          statusMsg.innerHTML = `✓ Successfully published to ${platform}! <a href="${data.url}" target="_blank" style="color:#60a5fa;text-decoration:underline;margin-left:8px;">View Short ↗</a>`;
        } else if (data.status === 'manual_action_ready') {
          statusMsg.innerHTML = `✓ Ready to publish! ${data.message || ''} ${data.studio_url ? `<a href="${data.studio_url}" target="_blank" style="color:#60a5fa;text-decoration:underline;margin-left:8px;">Open Studio Upload ↗</a>` : ''}`;
        } else {
          statusMsg.innerHTML = `✓ Package exported to: <code>${data.export_directory || data.copy_file || 'social_export'}</code>`;
        }
      }
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.background = 'rgba(239,68,68,0.15)';
        statusMsg.style.border = '1px solid rgba(239,68,68,0.4)';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = `Error: ${err.message}`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = '🚀 Publish Now';
      }
    }
  });
}
initSocialPublishing();


// --- AI Model & Cloud Integration (Hugging Face + Ollama) ---
function initAIModelManagement() {
  const tabOllama = $('#provTabOllama');
  const tabHf = $('#provTabHuggingFace');
  const hfPanel = $('#hfConfigPanel');
  const ollamaRow = $('#ollamaDownloadRow');
  const hfTokenInput = $('#hfTokenInput');
  const hfModelSelect = $('#hfModelSelect');
  const btnVerifyHf = $('#btnVerifyHfToken');
  const hfStatusMsg = $('#hfStatusMsg');
  const btnDownloadOllama = $('#btnDownloadOllama');
  const ollamaInput = $('#ollamaDownloadInput');
  const dlProgress = $('#modelDlProgress');
  const dlBar = $('#dlProgressBar');
  const dlText = $('#dlStatusText');

  let currentProvider = 'ollama';

  async function loadConfig() {
    try {
      const res = await fetch('/api/models/config');
      const data = await res.json();
      if (data.ok) {
        currentProvider = data.provider || 'ollama';
        if (hfModelSelect && data.hf_model) hfModelSelect.value = data.hf_model;
        if (hfTokenInput && data.hf_token_masked) hfTokenInput.value = data.hf_token_masked;
        updateUI();
      }
    } catch (_) {}
  }

  function updateUI() {
    if (currentProvider === 'huggingface') {
      tabHf?.classList.add('active');
      tabOllama?.classList.remove('active');
      if (hfPanel) hfPanel.style.display = 'block';
      if (ollamaRow) ollamaRow.style.display = 'none';
      if ($('#healthText')) $('#healthText').textContent = 'Hugging Face API (Cloud)';
      if ($('#statusPill')) $('#statusPill').innerHTML = '<span></span> HF Cloud Mode';
    } else {
      tabOllama?.classList.add('active');
      tabHf?.classList.remove('active');
      if (hfPanel) hfPanel.style.display = 'none';
      if (ollamaRow) ollamaRow.style.display = 'block';
    }
  }

  tabOllama?.addEventListener('click', async () => {
    currentProvider = 'ollama';
    updateUI();
    try {
      await fetch('/api/models/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'ollama' })
      });
      loadOptions();
    } catch (_) {}
  });

  tabHf?.addEventListener('click', async () => {
    currentProvider = 'huggingface';
    updateUI();
    try {
      await fetch('/api/models/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'huggingface' })
      });
    } catch (_) {}
  });

  hfModelSelect?.addEventListener('change', async () => {
    try {
      await fetch('/api/models/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hf_model: hfModelSelect.value })
      });
    } catch (_) {}
  });

  btnVerifyHf?.addEventListener('click', async () => {
    const token = hfTokenInput?.value.trim();
    if (!token) {
      if (hfStatusMsg) hfStatusMsg.textContent = 'Please paste a valid Hugging Face token (starts with hf_).';
      return;
    }
    btnVerifyHf.disabled = true;
    btnVerifyHf.textContent = 'Verifying…';
    if (hfStatusMsg) hfStatusMsg.textContent = 'Connecting to Hugging Face API…';
    try {
      const res = await fetch('/api/models/huggingface/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.ok) {
        if (hfStatusMsg) {
          hfStatusMsg.innerHTML = `<span style="color:#4ade80;">✓ Verified & Connected as <b>${data.name}</b> (${data.type})</span>`;
        }
        if ($('#healthDot')) $('#healthDot').classList.add('online');
        if ($('#healthText')) $('#healthText').textContent = 'Hugging Face API connected';
      } else {
        if (hfStatusMsg) {
          hfStatusMsg.innerHTML = `<span style="color:#ef4444;">✗ ${data.error || 'Invalid token'}</span>`;
        }
      }
    } catch (err) {
      if (hfStatusMsg) hfStatusMsg.innerHTML = `<span style="color:#ef4444;">✗ Error: ${err.message}</span>`;
    } finally {
      btnVerifyHf.disabled = false;
      btnVerifyHf.textContent = 'Verify Token';
    }
  });

  const modelPresetSelect = $('#ollamaModelPresetSelect');
  modelPresetSelect?.addEventListener('change', () => {
    const val = modelPresetSelect.value;
    if (val && val !== 'custom') {
      if (ollamaInput) ollamaInput.value = val;
    } else if (val === 'custom') {
      if (ollamaInput) {
        ollamaInput.value = '';
        ollamaInput.focus();
      }
    }
  });

  let pollInterval = null;
  btnDownloadOllama?.addEventListener('click', async () => {
    const model = ollamaInput?.value.trim();
    if (!model) {
      alert('Please enter an Ollama model tag (e.g. qwen2.5:3b, llama3.2:3b).');
      return;
    }
    btnDownloadOllama.disabled = true;
    if (dlProgress) dlProgress.style.display = 'block';
    if (dlBar) dlBar.style.width = '0%';
    if (dlText) dlText.textContent = `Requesting pull of ${model}…`;

    try {
      const res = await fetch('/api/models/ollama/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || 'Failed to start download.');
        btnDownloadOllama.disabled = false;
        return;
      }
      pollInterval = setInterval(async () => {
        try {
          const sRes = await fetch('/api/models/ollama/download-status');
          const sData = await sRes.json();
          if (dlBar) dlBar.style.width = `${sData.percent || 0}%`;
          if (dlText) dlText.textContent = sData.status || 'Downloading…';
          if (!sData.active) {
            clearInterval(pollInterval);
            btnDownloadOllama.disabled = false;
            if (sData.percent === 100) {
              await loadOptions();
              if (ollamaInput) ollamaInput.value = '';
            } else if (sData.error) {
              alert(sData.error);
            }
          }
        } catch (_) {}
      }, 1200);
    } catch (err) {
      alert('Error initiating model pull: ' + err.message);
      btnDownloadOllama.disabled = false;
    }
  });

  loadConfig();
}

initAIModelManagement();
initWatermarkAndCaptionsUI();
initBetaTestingSection();

// --- Watermark & Caption UI Setup ---
function initWatermarkAndCaptionsUI() {
  const premToggle = $('#premiumCaptionsToggle');
  const premDrawer = $('#premiumCaptionDrawer');
  if (premToggle && premDrawer) {
    premToggle.addEventListener('change', () => {
      premDrawer.style.display = premToggle.checked ? 'block' : 'none';
    });
  }

  const wmToggle = $('#watermarkTextEnabled');
  const wmDrawer = $('#watermarkControlsDrawer');
  if (wmToggle && wmDrawer) {
    wmToggle.addEventListener('change', () => {
      wmDrawer.style.display = wmToggle.checked ? 'block' : 'none';
      updatePreview();
    });
  }

  const wmPos = $('#watermarkTextPosition');
  const wmCoords = $('#watermarkCustomCoords');
  if (wmPos && wmCoords) {
    wmPos.addEventListener('change', () => {
      wmCoords.style.display = wmPos.value === 'custom' ? 'grid' : 'none';
      updatePreview();
    });
  }

  const bindSlider = (sliderId, outId, suffix = '') => {
    const s = $(sliderId);
    const o = $(outId);
    if (s && o) {
      s.addEventListener('input', () => {
        o.textContent = s.value + suffix;
        updatePreview();
      });
    }
  };

  bindSlider('#watermarkTextOpacity', '#watermarkTextOpacityOut', '%');
  bindSlider('#watermarkTextAngle', '#watermarkTextAngleOut', '°');
  bindSlider('#watermarkTextSize', '#watermarkTextSizeOut', '%');
  bindSlider('#watermarkTextX', '#watermarkTextXOut', '%');
  bindSlider('#watermarkTextY', '#watermarkTextYOut', '%');

  ['#watermarkTextInput', '#watermarkTextColor', '#captionPresetSelect', '#captionAccentSelect'].forEach(sel => {
    $(sel)?.addEventListener('input', updatePreview);
  });
}

// --- Beta Testing Section Controller ---
function initBetaTestingSection() {
  const dropZone = $('#betaDropZone');
  const fileInput = $('#betaFileInput');
  const ytUrl = $('#betaYtUrl');
  const ytImportBtn = $('#betaYtImportBtn');
  const sourceInfo = $('#betaSourceInfo');
  const sourceName = $('#betaSourceName');
  const sourceMeta = $('#betaSourceMeta');
  const clearSource = $('#betaClearSource');
  const runBtn = $('#betaRunPipelineBtn');
  const progressBox = $('#betaProgressBox');
  const progressBar = $('#betaProgressBar');
  const progressPct = $('#betaProgressPct');
  const stageText = $('#betaStageText');
  const logBox = $('#betaLog');
  const resultVideo = $('#betaResultVideo');
  const placeholder = $('#betaPlaceholder');
  const clipSwitcher = $('#betaClipSwitcher');
  const downloadBtn = $('#betaDownloadBtn');
  const openInEditorBtn = $('#betaOpenInEditor');

  let betaState = {
    sourceFile: null,
    jobId: null,
    running: false,
    outputs: [],
    selectedClip: null,
  };

  const bindBetaSlider = (sliderId, outId, suffix = '') => {
    const s = $(sliderId);
    const o = $(outId);
    if (s && o) {
      s.addEventListener('input', () => { o.textContent = s.value + suffix; });
    }
  };
  bindBetaSlider('#betaWmOpacity', '#betaWmOpacityOut', '%');
  bindBetaSlider('#betaWmAngle', '#betaWmAngleOut', '°');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#ffffff'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'rgba(255,255,255,0.18)'; });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'rgba(255,255,255,0.18)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleBetaFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleBetaFile(fileInput.files[0]);
      }
    });
  }

  async function handleBetaFile(file) {
    betaState.sourceFile = file;
    betaState.jobId = null;
    dropZone.style.display = 'none';
    sourceInfo.style.display = 'flex';
    sourceName.textContent = file.name;
    sourceMeta.textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB · Local Upload`;
  }

  if (clearSource) {
    clearSource.addEventListener('click', () => {
      betaState.sourceFile = null;
      betaState.jobId = null;
      dropZone.style.display = 'block';
      sourceInfo.style.display = 'none';
      if (fileInput) fileInput.value = '';
    });
  }

  if (ytImportBtn && ytUrl) {
    ytImportBtn.addEventListener('click', async () => {
      const url = ytUrl.value.trim();
      if (!url) return alert('Enter a valid YouTube URL first.');
      ytImportBtn.disabled = true;
      ytImportBtn.textContent = 'Fetching...';
      try {
        const res = await fetch('/api/import-youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to import YouTube video');
        betaState.jobId = data.job_id;
        betaState.sourceFile = null;
        dropZone.style.display = 'none';
        sourceInfo.style.display = 'flex';
        sourceName.textContent = data.title || 'YouTube Video';
        sourceMeta.textContent = `Project ${data.job_id} · Imported from YouTube`;
      } catch (err) {
        alert(err.message);
      } finally {
        ytImportBtn.disabled = false;
        ytImportBtn.textContent = 'Fetch Link';
      }
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      if (!betaState.sourceFile && !betaState.jobId) {
        alert('Please select a video file or fetch a YouTube link first.');
        return;
      }
      runBtn.disabled = true;
      progressBox.style.display = 'block';
      progressBar.style.width = '3%';
      progressPct.textContent = '3%';
      stageText.textContent = 'Uploading / Preparing workspace...';
      logBox.textContent = '[Beta] Initializing run...\n';

      try {
        if (!betaState.jobId && betaState.sourceFile) {
          const upForm = new FormData();
          upForm.append('video', betaState.sourceFile);
          const upRes = await fetch('/api/upload', { method: 'POST', body: upForm });
          const upData = await upRes.json();
          if (!upRes.ok || !upData.job_id) throw new Error(upData.error || 'Failed to upload video');
          betaState.jobId = upData.job_id;
          logBox.textContent += `[Upload] Created project ${betaState.jobId}\n`;
        }

        const layout = $('#betaLayout')?.value || 'gaming_split';
        const splitScreen = layout !== 'normal' ? '1' : '0';
        const gamingSplit = layout === 'gaming_split' ? '1' : '0';

        const brandingPayload = {
          watermark_text_enabled: $('#betaWatermarkEnabled')?.checked || false,
          watermark_text: $('#betaWatermarkText')?.value || '',
          watermark_text_position: $('#betaWatermarkPosition')?.value || 'center',
          watermark_text_opacity: +($('#betaWmOpacity')?.value || 35),
          watermark_text_angle: +($('#betaWmAngle')?.value || -20),
          watermark_text_size: 6,
          watermark_text_color: '#FFFFFF',
          premium_captions: $('#betaPremiumCaptions')?.checked ?? true,
          situational_cues: $('#betaSituationalCues')?.checked ?? true,
          caption_preset: $('#betaCaptionPreset')?.value || 'center_seam',
          caption_accent: $('#betaCaptionAccent')?.value || 'gold_yellow',
        };

        const startPayload = {
          job_id: betaState.jobId,
          mode: 'viral',
          clips: $('#betaClipsCount')?.value || 2,
          min_duration: 25,
          max_duration: 60,
          split_screen: splitScreen,
          gaming_split: gamingSplit,
          fast_whisper: '1',
          branding: brandingPayload,
          premium_captions: $('#betaPremiumCaptions')?.checked ?? true,
          situational_cues: $('#betaSituationalCues')?.checked ?? true,
          caption_preset: $('#betaCaptionPreset')?.value || 'center_seam',
          caption_accent: $('#betaCaptionAccent')?.value || 'gold_yellow',
        };

        const startRes = await fetch('/api/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(startPayload)
        });
        const startData = await startRes.json();
        if (!startRes.ok || !startData.ok) throw new Error(startData.error || 'Failed to start pipeline');

        logBox.textContent += `[Pipeline] Job ${betaState.jobId} started with Premium Captions & Watermark...\n`;

        const sse = new EventSource(`/api/events/${betaState.jobId}`);
        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'progress') {
              const pct = Math.min(100, Math.max(0, parseInt(data.progress || 0)));
              progressBar.style.width = `${pct}%`;
              progressPct.textContent = `${pct}%`;
              if (data.stage) stageText.textContent = data.stage;
            } else if (data.type === 'log') {
              logBox.textContent += `${data.text}\n`;
              logBox.scrollTop = logBox.scrollHeight;
            } else if (data.type === 'complete') {
              sse.close();
              progressBar.style.width = '100%';
              progressPct.textContent = '100%';
              stageText.textContent = 'Finished rendering all Shorts!';
              runBtn.disabled = false;
              loadBetaOutputs(betaState.jobId);
            } else if (data.type === 'error') {
              sse.close();
              runBtn.disabled = false;
              stageText.textContent = 'Pipeline error';
              logBox.textContent += `[Error] ${data.text}\n`;
            }
          } catch (_) {}
        };
        sse.onerror = () => {
          sse.close();
          runBtn.disabled = false;
        };

      } catch (err) {
        alert(err.message);
        runBtn.disabled = false;
        stageText.textContent = 'Run failed';
      }
    });
  }

  async function loadBetaOutputs(jobId) {
    try {
      const res = await fetch(`/api/job/${jobId}`);
      const data = await res.json();
      const outputs = data.outputs || [];
      if (!outputs.length) {
        logBox.textContent += '[Warning] No outputs returned.\n';
        return;
      }
      betaState.outputs = outputs;
      clipSwitcher.innerHTML = '';
      outputs.forEach((filename, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `ghost ${idx === 0 ? 'active' : ''}`;
        btn.style.padding = '5px 12px';
        btn.style.fontSize = '0.78rem';
        btn.textContent = `Short #${idx + 1} (${filename})`;
        btn.addEventListener('click', () => {
          $$('#betaClipSwitcher button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          playBetaClip(jobId, filename);
        });
        clipSwitcher.appendChild(btn);
      });

      playBetaClip(jobId, outputs[0]);
    } catch (err) {
      logBox.textContent += `[Error] Failed to fetch job outputs: ${err.message}\n`;
    }
  }

  function playBetaClip(jobId, filename) {
    betaState.selectedClip = filename;
    const url = `/media/${jobId}/${encodeURIComponent(filename)}`;
    placeholder.style.display = 'none';
    resultVideo.style.display = 'block';
    resultVideo.src = url;
    resultVideo.load();
    resultVideo.play().catch(() => {});

    downloadBtn.href = `${url}?download=1`;
    downloadBtn.style.pointerEvents = 'auto';
    downloadBtn.style.opacity = '1';

    openInEditorBtn.disabled = false;
    openInEditorBtn.onclick = () => {
      window.location.hash = `#editor?video=${encodeURIComponent(url)}&title=${encodeURIComponent(filename)}`;
    };
  }

  // --- Beta Top Subtabs (Narration vs Video Clipper) ---
  const tabNarrate = $('#btnBetaTabNarrate');
  const tabClipper = $('#btnBetaTabClipper');
  const wsNarrate = $('#betaNarrateWorkspace');
  const wsClipper = $('#betaClipperWorkspace');

  function switchBetaTab(tab) {
    if (tab === 'narrate') {
      tabNarrate?.classList.add('active');
      if (tabNarrate) { tabNarrate.style.background = '#ffffff'; tabNarrate.style.color = '#000000'; }
      tabClipper?.classList.remove('active');
      if (tabClipper) { tabClipper.style.background = 'rgba(255,255,255,0.06)'; tabClipper.style.color = '#ffffff'; }
      if (wsNarrate) wsNarrate.style.display = 'grid';
      if (wsClipper) wsClipper.style.display = 'none';
      loadBetaNarrateResources();
    } else {
      tabClipper?.classList.add('active');
      if (tabClipper) { tabClipper.style.background = '#ffffff'; tabClipper.style.color = '#000000'; }
      tabNarrate?.classList.remove('active');
      if (tabNarrate) { tabNarrate.style.background = 'rgba(255,255,255,0.06)'; tabNarrate.style.color = '#ffffff'; }
      if (wsNarrate) wsNarrate.style.display = 'none';
      if (wsClipper) wsClipper.style.display = 'grid';
    }
  }

  tabNarrate?.addEventListener('click', () => switchBetaTab('narrate'));
  tabClipper?.addEventListener('click', () => switchBetaTab('clipper'));

  // --- Beta Narration Testing Suite ---
  const narratePrompt = $('#betaNarratePrompt');
  const narrateScript = $('#betaNarrateScript');
  const btnGenScript = $('#btnBetaNarrateGenScript');
  const btnRandomScript = $('#btnBetaNarrateRandom');
  const wordCountOut = $('#betaNarrateWordCount');
  const voiceSelect = $('#betaNarrateVoiceSelect');
  const speedSelect = $('#betaNarrateSpeedSelect');
  const btnAudition = $('#btnBetaAuditionVoice');
  const voiceAudio = $('#betaVoiceAudio');
  const videoSelect = $('#betaNarrateVideoSelect');
  const captionPreset = $('#betaNarrateCaptionPreset');
  const btnStartNarrate = $('#btnBetaStartNarrate');
  const narrateProgBox = $('#betaNarrateProgressBox');
  const narrateProgBar = $('#betaNarrateProgressBar');
  const narrateProgPct = $('#betaNarrateProgressPct');
  const narrateStageText = $('#betaNarrateStageText');
  const narrateResultVideo = $('#betaNarrateResultVideo');
  const narratePlaceholder = $('#betaNarratePlaceholder');
  const narrateDownloadBtn = $('#betaNarrateDownloadBtn');

  function updateWordCount() {
    const text = narrateScript?.value.trim() || '';
    const words = text ? text.split(/\s+/).length : 0;
    const estSec = Math.round(words / 2.5);
    const m = String(Math.floor(estSec / 60)).padStart(2, '0');
    const s = String(estSec % 60).padStart(2, '0');
    if (wordCountOut) wordCountOut.textContent = `${words} words · ~${m}:${s} est.`;
  }
  narrateScript?.addEventListener('input', updateWordCount);

  let narrateResourcesLoaded = false;
  async function loadBetaNarrateResources() {
    if (narrateResourcesLoaded) return;
    narrateResourcesLoaded = true;

    // Load voices
    try {
      const vRes = await fetch('/api/narrate/voices');
      const vData = await vRes.json();
      if (vData.voices && vData.voices.length && voiceSelect) {
        voiceSelect.innerHTML = '';
        const kokoroGroup = document.createElement('optgroup');
        kokoroGroup.label = 'Kokoro Neural Voices (Ultra-Realistic)';
        const winGroup = document.createElement('optgroup');
        winGroup.label = 'Windows System Voices';

        vData.voices.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.id;
          opt.textContent = `${v.name} (${v.gender || 'Neural'} · ${v.provider || 'local'})`;
          if (v.id === 'af_heart') opt.selected = true;
          if (v.provider === 'kokoro') kokoroGroup.appendChild(opt);
          else winGroup.appendChild(opt);
        });

        if (kokoroGroup.children.length) voiceSelect.appendChild(kokoroGroup);
        if (winGroup.children.length) voiceSelect.appendChild(winGroup);
      }
    } catch (_) {}

    // Load background clips
    try {
      const bRes = await fetch('/api/narrate/videos');
      const bData = await bRes.json();
      if (bData.videos && bData.videos.length && videoSelect) {
        videoSelect.innerHTML = '';
        bData.videos.forEach((vid, i) => {
          const opt = document.createElement('option');
          opt.value = vid.name || vid;
          opt.textContent = `${vid.name || vid} (9:16 vertical)`;
          if (i === 0) opt.selected = true;
          videoSelect.appendChild(opt);
        });
      }
    } catch (_) {}
  }

  // Audition voice
  btnAudition?.addEventListener('click', async () => {
    const voice = voiceSelect?.value || 'af_heart';
    const speed = parseInt(speedSelect?.value || '0', 10);
    btnAudition.disabled = true;
    btnAudition.textContent = 'Auditioning...';
    try {
      const res = await fetch('/api/narrate/preview-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice, speed })
      });
      const data = await res.json();
      if (data.url && voiceAudio) {
        voiceAudio.src = data.url;
        voiceAudio.style.display = 'block';
        voiceAudio.play().catch(() => {});
      }
    } catch (err) {
      alert('Audition error: ' + err.message);
    } finally {
      btnAudition.disabled = false;
      btnAudition.textContent = '▶ Audition Voice Sample';
    }
  });

  // AI Script generation
  btnGenScript?.addEventListener('click', async () => {
    const prompt = narratePrompt?.value.trim();
    if (!prompt) return alert('Enter a story prompt or idea first.');
    btnGenScript.disabled = true;
    btnGenScript.textContent = 'Writing...';
    try {
      const res = await fetch('/api/narrate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration: 30 })
      });
      const data = await res.json();
      if (data.script && narrateScript) {
        narrateScript.value = data.script;
        updateWordCount();
      } else {
        alert(data.error || 'Failed to generate script.');
      }
    } catch (err) {
      alert('Script generation error: ' + err.message);
    } finally {
      btnGenScript.disabled = false;
      btnGenScript.textContent = '✨ Generate Script';
    }
  });

  // Random Script
  btnRandomScript?.addEventListener('click', async () => {
    btnRandomScript.disabled = true;
    try {
      const res = await fetch('/api/narrate/random-script', { method: 'POST' });
      const data = await res.json();
      if (data.script && narrateScript) {
        narrateScript.value = data.script;
        updateWordCount();
      }
    } catch (_) {}
    finally {
      btnRandomScript.disabled = false;
    }
  });

  // Start Narration Generation
  let narratePoll = null;
  btnStartNarrate?.addEventListener('click', async () => {
    const script = narrateScript?.value.trim();
    if (!script) return alert('Enter or generate a script first.');
    const voice = voiceSelect?.value || 'af_heart';
    const video = videoSelect?.value || '';
    const speed = parseInt(speedSelect?.value || '0', 10);
    const caption_mode = captionPreset?.value || 'sync-yellow';

    btnStartNarrate.disabled = true;
    if (narrateProgBox) narrateProgBox.style.display = 'block';
    if (narrateProgBar) narrateProgBar.style.width = '10%';
    if (narrateProgPct) narrateProgPct.textContent = '10%';
    if (narrateStageText) narrateStageText.textContent = 'Starting voice synthesis...';

    try {
      const res = await fetch('/api/narrate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, voice, video, speed, caption_mode })
      });
      const data = await res.json();
      if (!data.ok || !data.job_id) {
        throw new Error(data.error || 'Failed to start narration generation.');
      }

      const jobId = data.job_id;
      narratePoll = setInterval(async () => {
        try {
          const sRes = await fetch(`/api/narrate/status/${jobId}`);
          const sData = await sRes.json();
          const pct = Math.min(100, Math.max(0, parseInt(sData.progress || 0)));
          if (narrateProgBar) narrateProgBar.style.width = `${pct}%`;
          if (narrateProgPct) narrateProgPct.textContent = `${pct}%`;
          if (narrateStageText && sData.stage) narrateStageText.textContent = sData.stage;

          if (sData.status === 'done') {
            clearInterval(narratePoll);
            btnStartNarrate.disabled = false;
            if (narrateProgBar) narrateProgBar.style.width = '100%';
            if (narrateProgPct) narrateProgPct.textContent = '100%';
            if (narrateStageText) narrateStageText.textContent = 'Narration Complete!';

            const outUrl = `/api/narrate/result-media/${jobId}/${encodeURIComponent(sData.output || 'narrated_short.mp4')}`;
            if (narratePlaceholder) narratePlaceholder.style.display = 'none';
            if (narrateResultVideo) {
              narrateResultVideo.style.display = 'block';
              narrateResultVideo.src = outUrl;
              narrateResultVideo.load();
              narrateResultVideo.play().catch(() => {});
            }
            if (narrateDownloadBtn) {
              narrateDownloadBtn.href = `${outUrl}?download=1`;
              narrateDownloadBtn.style.pointerEvents = 'auto';
              narrateDownloadBtn.style.opacity = '1';
            }
          } else if (sData.status === 'error') {
            clearInterval(narratePoll);
            btnStartNarrate.disabled = false;
            if (narrateStageText) narrateStageText.textContent = 'Narration failed: ' + (sData.error || 'Unknown error');
            alert('Narration Error: ' + (sData.error || 'Generation failed'));
          }
        } catch (_) {}
      }, 1000);
    } catch (err) {
      alert('Narration error: ' + err.message);
      btnStartNarrate.disabled = false;
      if (narrateProgBox) narrateProgBox.style.display = 'none';
    }
  });

  // Pre-load narration resources on startup
  loadBetaNarrateResources();
}

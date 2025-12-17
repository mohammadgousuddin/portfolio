// Set year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
if (toggle && menu){
  toggle.addEventListener('click', () => {
    const opened = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
}

// Highlight active link
const links = document.querySelectorAll('.menu a');
links.forEach(a => {
  const path = location.pathname.split('/').pop() || 'index.html';
  if (a.getAttribute('href') === path) a.classList.add('active');
});

/* ===== Holographic interactive background ===== */
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // respect reduced motion

  const holo = document.createElement('div');
  holo.className = 'holo-bg';
  holo.innerHTML = '<div class="holo-layer layer-1"></div><div class="holo-layer layer-2"></div>';
  document.body.prepend(holo);

  const layers = holo.querySelectorAll('.holo-layer');

  // normalized target positions [0..1]
  let tx = 0.5, ty = 0.5;
  let cx = 0.5, cy = 0.5;

  // allow mouse tracking only for fine pointer devices
  const supportsMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (supportsMouse){
    window.addEventListener('mousemove', (e)=>{
      const vw = window.innerWidth; const vh = window.innerHeight;
      tx = Math.min(1, Math.max(0, e.clientX / vw));
      ty = Math.min(1, Math.max(0, e.clientY / vh));
    }, {passive:true});
  } else {
    // slow automated motion for touch devices
    let t = 0;
    setInterval(()=>{ t += 0.02; tx = 0.5 + 0.35 * Math.cos(t); ty = 0.5 + 0.25 * Math.sin(t*0.7); }, 80);
  }

  // smoothing loop
  function raf(){
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;

    // set multiple variables for layered parallax
    holo.style.setProperty('--mx', (cx*100).toFixed(2) + '%');
    holo.style.setProperty('--my', (cy*100).toFixed(2) + '%');
    holo.style.setProperty('--mx2', (Math.min(1, Math.max(0,(cx + 0.06)))*100).toFixed(2) + '%');
    holo.style.setProperty('--my2', (Math.min(1, Math.max(0,(cy - 0.06)))*100).toFixed(2) + '%');
    holo.style.setProperty('--mx3', (Math.min(1, Math.max(0,(cx - 0.12)))*100).toFixed(2) + '%');
    holo.style.setProperty('--my3', (Math.min(1, Math.max(0,(cy + 0.12)))*100).toFixed(2) + '%');
    holo.style.setProperty('--mx4', (Math.min(1, Math.max(0,(cx + 0.18)))*100).toFixed(2) + '%');
    holo.style.setProperty('--my4', (Math.min(1, Math.max(0,(cy - 0.18)))*100).toFixed(2) + '%');

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* ===== Pop-out CTA injection & interactions ===== */
(function(){
  const root = document.createElement('div');
  root.className = 'popout-root';
  root.innerHTML = `
    <button class="popout-btn" aria-expanded="false" aria-controls="popout-panel" aria-label="Open quick actions">⚡ Quick</button>
    <div id="popout-panel" class="popout-panel" role="dialog" aria-label="Quick actions">
      <a href="contact.html">Contact</a>
      <a href="assets/Mohammad_Gousuddin_CV.pdf" target="_blank">View CV</a>
      <a href="assets/Mohammad_Gousuddin_CV.pdf" download>Download CV</a>
      <a href="https://www.linkedin.com/in/md-ghousuddin/" target="_blank" rel="noopener">LinkedIn</a>
      <hr style="border:none;border-top:1px solid rgba(0, 85, 255, 1);margin:.5rem 0">
      <label style="display:flex;align-items:center;gap:.5rem"><input id="toggle-matrix" type="checkbox"> Matrix background</label>
      <label style="display:flex;align-items:center;gap:.5rem"><input id="toggle-collider" type="checkbox" checked> Mouse collider</label>
      <button id="toggle-console" class="btn secondary" style="margin-top:.4rem">Open Dev Console</button>
    </div>`;

  document.body.appendChild(root);

  const btn = root.querySelector('.popout-btn');
  const panel = root.querySelector('.popout-panel');

  function closePanel(){
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }
  function openPanel(){
    panel.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    panel.querySelector('a')?.focus();
  }

  btn.addEventListener('click', (e)=>{
    const open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) panel.querySelector('a')?.focus();
  });

  // close on outside click
  document.addEventListener('click', (e)=>{
    if (!root.contains(e.target)) closePanel();
  });

  // close on Escape
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closePanel(); });
})();

/* ===== Matrix background (canvas) ===== */
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-canvas';
  canvas.setAttribute('aria-hidden','true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let width, height, cols, ypos;
  const fontSize = 24;
  // Speed control: smaller values = slower drops
  const speedBase = 0.016; // base increment per frame
  const speedVariance = 0.114; // added random variance

  function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cols = Math.floor(width / fontSize) + 1;
    // initialize ypos as vertical offsets around the canvas center
    ypos = new Array(cols).fill(0).map(()=> (Math.random() - 0.5) * height );
  }
  window.addEventListener('resize', resize);
  resize();

  const chars = 'Welcome to My Portfolio';

  let animId = null;
  let running = !prefersReduced; // default on unless reduced motion
  // pointer / collider
  let mouseX = null, mouseY = null;
  let colliderEnabled = true;
  window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; }, {passive:true});
  window.addEventListener('touchmove', (e)=>{ const t = e.touches[0]; if (t){ mouseX = t.clientX; mouseY = t.clientY; } }, {passive:true});
  window.addEventListener('mouseleave', ()=>{ mouseX = null; mouseY = null; });

  function frame(){
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0,0,width,height);
    ctx.font = fontSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const totalWidth = cols * fontSize;
    const offsetX = (width - totalWidth) / 2;

    for (let i=0;i<cols;i++){
      const text = chars.charAt(Math.floor(Math.random()*chars.length));
      const x = offsetX + i * fontSize + fontSize/2;
      const y = (height / 2) + ypos[i];

      // default appearance
      ctx.fillStyle = 'rgba(255, 0, 0, 1)';

      // collider effect: repel and highlight nearby columns
      if (colliderEnabled && mouseX !== null && mouseY !== null){
        const cx = x + fontSize/1;
        const cy = y;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = Math.max(80, Math.min(220, Math.floor(Math.max(window.innerWidth, window.innerHeight) * 0.12)));
        if (dist < radius){
          const force = (1 - dist / radius);
            // nudge column upwards for a repelling ripple (relative to center)
            ypos[i] = Math.max(-height/2, ypos[i] - force * 0.85);
          // make character brighter / tinted
          const alpha = Math.min(1, 0.9 - force * 0.2);
          ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        }
      }

      ctx.fillText(text, x, y);
      // advance drop with slower, smoother increments (ypos is in pixels offset from center)
      ypos[i] += (speedBase + Math.random()*speedVariance) * fontSize;
      // reset when the drop moves beyond the bottom edge
      if (y > height && Math.random() > 0.995) ypos[i] = -height/2;
    }

    animId = requestAnimationFrame(frame);
  }

  function startMatrix(){ if (!running){ running=true; frame(); canvas.style.opacity='0.12'; } }
  function stopMatrix(){ if (running){ running=false; cancelAnimationFrame(animId); animId=null; ctx.clearRect(0,0,width,height); canvas.style.opacity='0'; } }

  // initial state
  if (running) frame(); else canvas.style.opacity='0';

  // hook into popout toggle
  const toggle = document.getElementById('toggle-matrix');
  if (toggle){
    toggle.checked = running;
    toggle.addEventListener('change', ()=>{ toggle.checked ? startMatrix() : stopMatrix(); });
  }

  // collider toggle wiring
  const colliderToggle = document.getElementById('toggle-collider');
  if (colliderToggle){ colliderToggle.checked = colliderEnabled; colliderToggle.addEventListener('change', ()=>{ colliderEnabled = !!colliderToggle.checked; }); }

  // expose for debugging
  window.__matrix = { start:startMatrix, stop:stopMatrix };
})();

/* ===== Developer console (simulated) ===== */
(function(){
  const consoleEl = document.createElement('div');
  consoleEl.className = 'dev-console';
  consoleEl.setAttribute('role','dialog');
  consoleEl.setAttribute('aria-label','Developer console');
  consoleEl.innerHTML = `
    <div class="console-header"><strong>Dev Console</strong><button id="close-console" class="btn secondary">Close</button></div>
    <pre id="console-body">// starting...
    </pre>`;
  document.body.appendChild(consoleEl);

  const body = consoleEl.querySelector('#console-body');

  let consoleOpen = false;
  let ticker = null;

  function startConsole(){
    consoleEl.classList.add('open'); consoleOpen = true;
    body.textContent = '';
    const sample = [
      "// Running live demo code...",
      "fetch('/api/demo') // http 200",
      "compile('project-a') // success",
      "render('3D BIM model') // done",
      "analyze('concrete_tests.csv') // anomalies: 2",
      "// Enjoy the showcase — all samples are simulated." 
    ];
    let i=0, j=0;
    ticker = setInterval(()=>{
      if (!consoleOpen) return;
      if (j >= sample[i].length){ body.textContent += '\n'; i = (i+1) % sample.length; j=0; return; }
      body.textContent += sample[i][j++];
      body.scrollTop = body.scrollHeight;
    }, 28);
  }
  function stopConsole(){ consoleEl.classList.remove('open'); consoleOpen=false; clearInterval(ticker); ticker=null; }

  // hook up popout button
  const btn = document.getElementById('toggle-console');
  if (btn){ btn.addEventListener('click', ()=>{ if (!consoleOpen) startConsole(); else stopConsole(); btn.textContent = consoleOpen ? 'Open Dev Console' : 'Close Console'; }); }

  // close button
  consoleEl.querySelector('#close-console').addEventListener('click', ()=>{ stopConsole(); btn.textContent = 'Open Dev Console'; });

})();

/* ===== Context-aware 'Back to list' for certificates ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  const back = document.querySelector('.back-to-list');
  if (!back) return;

  back.addEventListener('click', (e)=>{
    const ref = document.referrer || '';
    // If user navigated here from experience/education/projects, route back to that page
    if (/\/(experience|education|projects)\.html/.test(ref)){
      e.preventDefault();
      window.location = ref;
      return;
    }
    // otherwise prefer history.back if possible (keeps the user's flow)
    if (history.length > 1){ e.preventDefault(); history.back(); }
    // else fall back to the href already present (certifications.html)
  });
});

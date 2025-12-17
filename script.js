/* =========================================================
   BASIC UI: Footer year, menu toggle, active link
========================================================= */

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Highlight active link
document.querySelectorAll('.menu a').forEach(a => {
  const path = location.pathname.split('/').pop() || 'index.html';
  if (a.getAttribute('href') === path) a.classList.add('active');
});


/* =========================================================
   HOLOGRAPHIC BACKGROUND (SOFT INTERACTIVE LAYERS)
========================================================= */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const holo = document.createElement('div');
  holo.className = 'holo-bg';
  holo.innerHTML = `
    <div class="holo-layer layer-1"></div>
    <div class="holo-layer layer-2"></div>
  `;
  document.body.prepend(holo);

  let tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5;
  const hasMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (hasMouse) {
    window.addEventListener('mousemove', e => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
    }, { passive: true });
  }

  function animate() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;

    holo.style.setProperty('--mx', cx * 100 + '%');
    holo.style.setProperty('--my', cy * 100 + '%');

    requestAnimationFrame(animate);
  }
  animate();
})();


/* =========================================================
   MATRIX BACKGROUND (WHITE + SLOW + MOUSE COLLIDER)
========================================================= */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Matrix config
  const chars = 'WELCOME TO MY PORTFOLIO';
  const fontSize = 20;
  let cols = Math.floor(w / fontSize);
  let drops = Array(cols).fill(0).map(() => Math.random() * h);

  // Mouse collider
  const mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = mouse.y = null;
  });

  window.addEventListener('click', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.radius = 240;
    setTimeout(() => mouse.radius = 140, 300);
  });

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = fontSize + 'px monospace';
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < drops.length; i++) {
      let x = i * fontSize;
      let y = drops[i] * fontSize;

// ===== TRUE 2D MOUSE COLLISION =====
if (mouse.x !== null) {
  const dx = mouse.x - x;
  const dy = mouse.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < mouse.radius) {
    const force = (mouse.radius - dist) / mouse.radius;

    // Pull characters toward cursor (collision feel)
    x += dx * force * 0.08;
    y += dy * force * 0.08;
  }
}


      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, x, y);

      drops[i] += 0.35;
      if (y > h && Math.random() > 0.98) drops[i] = 0;
    }
  }

  setInterval(draw, 90);
})();


/* =========================================================
   CURSOR GLOW (JS-INJECTED)
========================================================= */
(function () {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let gx = 0, gy = 0;

  window.addEventListener('mousemove', e => {
    gx = e.clientX;
    gy = e.clientY;
  }, { passive: true });

  function animate() {
    const rect = glow.getBoundingClientRect();
    glow.style.left = rect.left + (gx - rect.left) * 0.15 + 'px';
    glow.style.top = rect.top + (gy - rect.top) * 0.15 + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();


/* =========================================================
   BACK-TO-LIST (CERTIFICATIONS / PROJECT DETAILS)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const back = document.querySelector('.back-to-list');
  if (!back) return;

  back.addEventListener('click', e => {
    if (history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
});

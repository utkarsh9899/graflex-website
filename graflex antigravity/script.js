/* ═══════════════════════════════════════════
   GRAFLEX PRODUCTIONS — INTERACTION LAYER
   Lenis · GSAP ScrollTrigger · Canvas · Cursor
   ═══════════════════════════════════════════ */

// ── SMOOTH SCROLL (Lenis) ──
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── LOADER ──
const loaderTL = gsap.timeline({
  onComplete: () => {
    document.body.classList.add('loaded');
    document.getElementById('loader').style.pointerEvents = 'none';
    initHeroAnim();
    initReveals();
    initManifesto();
    initCounters();
  }
});
const counterEl = document.querySelector('.loader-counter');
loaderTL
  .to('.loader-bar', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' })
  .to(counterEl, {
    textContent: 100, duration: 2.2, snap: { textContent: 1 },
    ease: 'power2.inOut',
    onUpdate: function() { counterEl.textContent = Math.round(counterEl.textContent); }
  }, 0)
  .to('#loader', { yPercent: -100, duration: .85, ease: 'power3.inOut', delay: .2 });

// ── CURSOR ──
const cursor = document.getElementById('cursor');
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && cursor) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function moveCursor() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(moveCursor);
  })();
  document.querySelectorAll('a, button, .work-card, .cap-row, .price-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ── CLOCK ──
function tick() {
  const n = new Date();
  const h = String(n.getHours()).padStart(2, '0');
  const m = String(n.getMinutes()).padStart(2, '0');
  const clockEl = document.getElementById('clock');
  if (clockEl) clockEl.textContent = h + ':' + m + ' IST';
}
tick(); setInterval(tick, 30000);

// ── NAV BEHAVIOR ──
let lastScroll = 0;
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (cur > lastScroll && cur > 120) nav.classList.add('hide');
  else nav.classList.remove('hide');
  lastScroll = cur;
});

// ── MOBILE MENU ──
let menuOpen = false;
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobile-menu');
function toggleMenu() {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  menuBtn.textContent = menuOpen ? 'Close' : 'Menu';
}
function closeMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  menuBtn.textContent = 'Menu';
}
if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));

// ── HERO CANVAS — PARTICLE NETWORK ──
const canvas = document.getElementById('hero-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let mouseX = null, mouseY = null;
const isMobile = window.innerWidth < 768;
const PARTICLE_COUNT = isMobile ? 45 : 100;
const CONNECT_DIST = isMobile ? 100 : 140;

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r = Math.random() * 1.5 + 0.5;
    this.o = Math.random() * 0.4 + 0.1;
    this.accent = Math.random() < 0.08;
  }
  update(w, h) {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h; if (this.y > h) this.y = 0;
    if (mouseX !== null) {
      const dx = this.x - mouseX, dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        const force = (110 - dist) / 110;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
      }
    }
  }
  draw(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    c.fillStyle = this.accent
      ? `rgba(255,51,17,${this.o})`
      : `rgba(255,255,255,${this.o})`;
    c.fill();
  }
}

function initCanvas() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(canvas.offsetWidth, canvas.offsetHeight));
  }
}

function animateCanvas() {
  if (!ctx) return;
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  ctx.clearRect(0, 0, w, h);
  // connection lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - dist / CONNECT_DIST)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  particles.forEach(p => { p.update(w, h); p.draw(ctx); });
  requestAnimationFrame(animateCanvas);
}

if (canvas) {
  initCanvas();
  animateCanvas();
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });
  window.addEventListener('resize', () => {
    initCanvas();
  });
}

// ── TEXT SPLIT UTILITY ──
function splitWords(el) {
  const text = el.textContent;
  const html = el.innerHTML;
  // Preserve <br> and <span> tags
  const parts = html.split(/(<br\s*\/?>|<span[^>]*>.*?<\/span>)/gi);
  let result = '';
  parts.forEach(part => {
    if (part.match(/^<br/i) || part.match(/^<span/i)) {
      result += part;
    } else {
      result += part.split(/\s+/).filter(w => w).map(w =>
        `<span class="word"><span class="word-inner">${w}</span></span>`
      ).join(' ');
    }
  });
  el.innerHTML = result;
}

// ── HERO ANIMATIONS ──
function initHeroAnim() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  // Animate hero elements
  gsap.from('.hero-meta', { y: 20, opacity: 0, duration: .7, delay: .1, ease: 'power3.out' });
  gsap.from('.hero-title', { y: 30, opacity: 0, duration: .9, delay: .25, ease: 'power3.out' });
  gsap.from('.hero-lower', { y: 20, opacity: 0, duration: .7, delay: .5, ease: 'power3.out' });
  gsap.from('.scroll-hint', { opacity: 0, duration: .5, delay: .8 });
}

// ── SCROLL REVEALS ──
function initReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.rv').forEach(el => observer.observe(el));
}

// ── MANIFESTO PROGRESSIVE TEXT REVEAL ──
function initManifesto() {
  const manText = document.querySelector('.man-text');
  if (!manText) return;
  const raw = manText.innerHTML;
  // Split into words while preserving any spans
  const plainText = manText.textContent;
  const words = plainText.split(/\s+/).filter(w => w);

  // Check for "creative OS" to apply accent
  const emWords = ['creative', 'OS'];
  manText.innerHTML = words.map(w => {
    const isEm = emWords.includes(w);
    return `<span class="m-word${isEm ? ' em-word' : ''}">${w}</span>`;
  }).join(' ');

  const mWords = manText.querySelectorAll('.m-word');
  gsap.to(mWords, {
    scrollTrigger: {
      trigger: '#manifesto',
      start: 'top 70%',
      end: 'bottom 40%',
      scrub: 0.5,
    },
    stagger: 0.05,
    onUpdate: function() {
      const progress = this.progress();
      mWords.forEach((w, i) => {
        const wp = i / mWords.length;
        if (wp < progress) {
          w.classList.add('lit');
        }
      });
    }
  });
}

// ── COUNTER ANIMATION ──
function initCounters() {
  const statsSection = document.getElementById('impact');
  if (!statsSection) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(el => {
          const target = +el.dataset.count;
          const suffix = el.dataset.suffix || '';
          let cur = 0;
          const step = target / 45;
          const iv = setInterval(() => {
            cur = Math.min(cur + step, target);
            el.textContent = Math.round(cur) + suffix;
            if (cur >= target) clearInterval(iv);
          }, 32);
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

// ── GSAP PARALLAX ON WORK CARDS ──
gsap.utils.toArray('.work-card').forEach(card => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: .8,
    ease: 'power3.out'
  });
});

// ── FORM HANDLING ──
const mainForm = document.getElementById('mainform');
if (mainForm) {
  mainForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('fsub');
    btn.textContent = 'Sending...';
    btn.style.opacity = '.5';
    setTimeout(() => {
      btn.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    }, 1200);
  });
}

// ── MAGNETIC BUTTONS (desktop) ──
if (window.matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.12, y: y * 0.12, duration: .3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .4, ease: 'elastic.out(1,0.5)' });
    });
  });
}

// ── ROI CALCULATOR LOGIC ──
const slipLeads = document.getElementById('slip-leads');
const slipClose = document.getElementById('slip-close');
const slipAcv = document.getElementById('slip-acv');
const valLeads = document.getElementById('val-leads');
const valClose = document.getElementById('val-close');
const valAcv = document.getElementById('val-acv');
const roiTotal = document.getElementById('roi-total');
const roiDiff = document.getElementById('roi-diff');

function updateROI() {
  if (!slipLeads) return;
  const leads = parseInt(slipLeads.value);
  const closeRate = parseInt(slipClose.value) / 100;
  const acv = parseInt(slipAcv.value);

  valLeads.textContent = leads;
  valClose.textContent = (closeRate * 100).toFixed(0);
  valAcv.textContent = acv.toLocaleString();

  // Current baseline
  const currentRev = leads * closeRate * acv;

  // Graflex Lift (let's assume 3x more leads or 3x better close rate)
  const graflexRev = currentRev * 3;
  const addedRev = graflexRev - currentRev;

  // Animate numbers
  gsap.to(roiTotal, {
    innerHTML: graflexRev,
    duration: 0.5,
    snap: { innerHTML: 1 },
    onUpdate: function() { roiTotal.textContent = Number(roiTotal.textContent).toLocaleString(); }
  });
  
  gsap.to(roiDiff, {
    innerHTML: addedRev,
    duration: 0.5,
    snap: { innerHTML: 1 },
    onUpdate: function() { roiDiff.textContent = Number(roiDiff.textContent).toLocaleString(); }
  });
}

if (slipLeads) {
  slipLeads.addEventListener('input', updateROI);
  slipClose.addEventListener('input', updateROI);
  slipAcv.addEventListener('input', updateROI);
  updateROI(); // init
}

// ── AI WIDGET LOGIC ──
const aiToggle = document.getElementById('ai-toggle');
const aiPanel = document.getElementById('ai-panel');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiChat = document.getElementById('ai-chat');

if (aiToggle) {
  aiToggle.addEventListener('click', () => {
    aiPanel.classList.toggle('open');
    if (aiPanel.classList.contains('open')) aiInput.focus();
  });
  aiClose.addEventListener('click', () => aiPanel.classList.remove('open'));

  const submitMessage = () => {
    const text = aiInput.value.trim();
    if (!text) return;
    
    // User msg
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-msg user';
    userDiv.textContent = text;
    aiChat.appendChild(userDiv);
    aiInput.value = '';
    
    // Auto-scroll
    aiChat.scrollTop = aiChat.scrollHeight;

    // Simulate thinking...
    setTimeout(() => {
      const botDiv = document.createElement('div');
      botDiv.className = 'ai-msg bot';
      botDiv.innerHTML = "Processing request... As a high-end agency, Graflex specializes in building custom systems like the one you requested. Should I have Utkarsh prepare a tailored strategy for this?";
      aiChat.appendChild(botDiv);
      aiChat.scrollTop = aiChat.scrollHeight;
    }, 1200);
  };

  aiSend.addEventListener('click', submitMessage);
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitMessage();
  });
}

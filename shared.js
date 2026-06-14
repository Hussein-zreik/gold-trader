/* ═══════════════════════════════════════════════════
   FOREX DESK — SHARED JS
   Injects header + footer, handles theme toggle,
   mobile nav, and active nav link detection.
   ═══════════════════════════════════════════════════ */

(function(){

  /* ── CONFIG ── */
  const THEME_KEY = 'fxdesk_theme_v1';

  // Nav items: label, href, page identifier (matches filename without .html)
  const NAV_ITEMS = [
    { label:'Dashboard', href:'dashboard.html', id:'dashboard' },
    { label:'Journal',   href:'journal.html',   id:'journal'   },
    { label:'Portfolio', href:'portfolio.html',  id:'portfolio' },
    { label:'News',      href:'news.html',       id:'news'      },
    { label:'Calendar',  href:'calendar.html',   id:'calendar'  },
  ];

  // Detect current page from URL
  function currentPage(){
    const path = window.location.pathname;
    const file = path.split('/').pop().replace('.html','') || 'index';
    return file;
  }

  /* ── HEADER HTML ── */
  function buildHeader(){
    const page = currentPage();
    const isLanding = page === 'index' || page === '';

    const navLinks = NAV_ITEMS.map(item => {
      const active = item.id === page ? 'active' : '';
      return `<a href="${item.href}" class="nav-link ${active}" aria-current="${active ? 'page' : 'false'}">${item.label}</a>`;
    }).join('');

    const mobileNavLinks = NAV_ITEMS.map(item => {
      const active = item.id === page ? 'active' : '';
      return `<a href="${item.href}" class="nav-link ${active}">${item.label}</a>`;
    }).join('');

    // Right side: landing gets "Open Dashboard →", other pages get utility buttons
    const rightSide = isLanding
      ? `<a href="dashboard.html" class="nav-cta">Open Dashboard →</a>
         <button class="mobile-menu-btn" onclick="FXShared.toggleMobile()" aria-label="Toggle menu" aria-expanded="false" id="mobileMenuBtn">☰</button>`
      : `<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
           <span id="hdrTime" style="font-family:var(--mono);font-size:10px;color:var(--muted2);white-space:nowrap;">--:--:-- UTC</span>
           <button type="button" class="hdr-icon-btn" id="themeBtn" onclick="FXShared.toggleTheme()" aria-label="Toggle theme">🌙</button>
           <button class="mobile-menu-btn" onclick="FXShared.toggleMobile()" aria-label="Toggle menu" aria-expanded="false" id="mobileMenuBtn" style="display:block;margin-left:0;">☰</button>
         </div>`;

    return `
<header class="site-header" id="siteHeader" role="banner">
  <a href="index.html" class="logo" aria-label="Forex Desk home">
    <div class="logo-bars" aria-hidden="true">
      <div class="logo-bar b1"></div>
      <div class="logo-bar b2"></div>
      <div class="logo-bar b3"></div>
      <div class="logo-bar b4"></div>
      <div class="logo-bar b5"></div>
    </div>
    <div class="logo-divider" aria-hidden="true"></div>
    <div>
      <div class="logo-name">FOREX DESK</div>
      <div class="logo-sub">Precision Targeting · Unique Fintech</div>
    </div>
  </a>
  <nav class="site-nav" aria-label="Main navigation">${navLinks}</nav>
  ${rightSide}
</header>
<nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
  ${mobileNavLinks}
  <a href="dashboard.html" class="nav-cta">Open Dashboard →</a>
</nav>`;
  }

  /* ── FOOTER HTML ── */
  function buildFooter(){
    return `
<footer class="site-footer" role="contentinfo">
  <div class="footer-brand">FOREX DESK</div>
  <div class="footer-copy">© 2026 Forex Desk · Built for traders, by a trader</div>
  <nav class="footer-links" aria-label="Footer navigation">
    ${NAV_ITEMS.map(i=>`<a href="${i.href}">${i.label}</a>`).join('')}
  </nav>
</footer>`;
  }

  /* ── INJECT ── */
  function inject(){
    // Insert header before <body>'s first child
    const headerEl = document.createElement('div');
    headerEl.innerHTML = buildHeader();
    Array.from(headerEl.childNodes).forEach(n => {
      if(n.nodeType !== 3 || n.textContent.trim()) // skip empty text nodes
        document.body.insertBefore(n, document.body.firstChild);
    });

    // Insert footer before </body>
    const footerEl = document.createElement('div');
    footerEl.innerHTML = buildFooter();
    Array.from(footerEl.childNodes).forEach(n => {
      if(n.nodeType !== 3 || n.textContent.trim())
        document.body.appendChild(n);
    });
  }

  /* ── THEME ── */
  function applyTheme(dark){
    document.body.classList.toggle('light-mode', !dark);
    const btn = document.getElementById('themeBtn');
    if(btn) btn.textContent = dark ? '🌙' : '☀️';
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch(e){}
  }

  function initTheme(){
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
    applyTheme(saved !== 'light');
  }

  /* ── MOBILE NAV ── */
  function toggleMobile(){
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('mobileMenuBtn');
    if(!nav) return;
    const open = nav.classList.toggle('open');
    if(btn){ btn.setAttribute('aria-expanded', open); btn.textContent = open ? '✕' : '☰'; }
  }

  /* ── CLOCK (dashboard only) ── */
  function tickClock(){
    const el = document.getElementById('hdrTime');
    if(!el) return;
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2,'0');
    const mm = String(now.getUTCMinutes()).padStart(2,'0');
    const ss = String(now.getUTCSeconds()).padStart(2,'0');
    el.textContent = `${hh}:${mm}:${ss} UTC`;
  }

  /* ── CLOSE MOBILE ON OUTSIDE CLICK ── */
  document.addEventListener('click', function(e){
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('mobileMenuBtn');
    if(nav && nav.classList.contains('open') && !nav.contains(e.target) && btn && !btn.contains(e.target)){
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      btn.textContent = '☰';
    }
  });

  /* ── PUBLIC API ── */
  window.FXShared = {
    toggleTheme: function(){ applyTheme(document.body.classList.contains('light-mode')); },
    toggleMobile: toggleMobile,
  };

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', function(){
    inject();
    initTheme();
    // Start clock if on dashboard
    if(document.getElementById('hdrTime')){
      tickClock();
      setInterval(tickClock, 1000);
    }
  });

})();

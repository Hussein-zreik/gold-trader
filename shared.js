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

  const SEARCH_INDEX = [
    { title:'Dashboard', desc:'Live market prices — gold, silver, forex & crypto',   href:'dashboard.html', icon:'📊', tags:'market data prices live gold silver forex crypto charts widgets' },
    { title:'Journal',   desc:'Log trades and track performance over time',           href:'journal.html',   icon:'📓', tags:'trade log journal entries p&l profit loss win rate history analytics' },
    { title:'Portfolio', desc:'Open positions, live P&L and exposure overview',       href:'portfolio.html', icon:'💼', tags:'portfolio positions holdings equity balance exposure live tracker' },
    { title:'News',      desc:'Aggregated financial & economic news from 40 k+ sources', href:'news.html',   icon:'📰', tags:'news headlines financial economic market sentiment articles sources feed' },
    { title:'Calendar',  desc:'Economic events with impact ratings and forecasts',   href:'calendar.html',  icon:'📅', tags:'calendar events economic schedule releases forecast impact nfp cpi fed' },
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

    // Mobile-only page title (replaces the hidden nav on small screens)
    const currentItem = NAV_ITEMS.find(i => i.id === page);
    const mobilePageTitle = currentItem
      ? `<span class="hdr-page-title" aria-hidden="true">${currentItem.label}</span>`
      : '';

    // Right side: landing gets "Open Dashboard →", other pages get utility buttons
    const rightSide = isLanding
      ? `<a href="dashboard.html" class="nav-cta">Open Dashboard →</a>
         <button class="mobile-menu-btn" onclick="FXShared.toggleMobile()" aria-label="Toggle menu" aria-expanded="false" id="mobileMenuBtn">☰</button>`
      : `<div class="hdr-right">
           <div class="hdr-search" id="hdrSearch">
             <span class="hdr-search-icon" aria-hidden="true">&#9906;</span>
             <input type="search" class="hdr-search-input" id="hdrSearchInput" placeholder="Search…" autocomplete="off" spellcheck="false" aria-label="Search pages and features" aria-expanded="false" aria-controls="hdrSearchResults" aria-haspopup="listbox">
             <div class="hdr-search-results" id="hdrSearchResults" role="listbox" hidden></div>
             <span class="hdr-search-kbd" id="hdrSearchKbd" aria-hidden="true">/</span>
           </div>
           <button type="button" class="hdr-icon-btn mobile-search-btn" id="mobileSearchBtn" onclick="FXShared.toggleMobileSearch()" aria-label="Search" aria-expanded="false">🔍</button>
           <span id="hdrTime" style="font-family:var(--mono);font-size:10px;color:var(--muted2);white-space:nowrap;">--:--:-- UTC</span>
           <button type="button" class="hdr-icon-btn" id="themeBtn" onclick="FXShared.toggleTheme()" aria-label="Toggle theme">🌙</button>
           <button class="mobile-menu-btn" onclick="FXShared.toggleMobile()" aria-label="Toggle menu" aria-expanded="false" id="mobileMenuBtn">☰</button>
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
      <div class="logo-sub">GOLD · FOREX · MARKETS</div>
    </div>
  </a>
  <nav class="site-nav" aria-label="Main navigation">${navLinks}</nav>
  ${mobilePageTitle}
  ${rightSide}
</header>
<nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
  ${mobileNavLinks}
  <a href="dashboard.html" class="nav-cta">Open Dashboard →</a>
</nav>
${!isLanding ? `<div class="mobile-search-overlay" id="mobileSearchOverlay" hidden>
  <div class="mobile-search-overlay-row">
    <input type="search" class="mobile-search-overlay-input" id="mobileSearchOverlayInput" placeholder="Search pages and features…" autocomplete="off" spellcheck="false" aria-label="Search pages and features">
    <button type="button" class="mobile-search-close-btn" onclick="FXShared.toggleMobileSearch()" aria-label="Close search">✕</button>
  </div>
  <div class="mobile-search-overlay-results" id="mobileSearchOverlayResults"></div>
</div>` : ''}`;
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

  /* ── PWA ── */
  function initPWA(){
    // Manifest link
    if(!document.querySelector('link[rel="manifest"]')){
      var ml = document.createElement('link');
      ml.rel = 'manifest'; ml.href = 'manifest.json';
      document.head.appendChild(ml);
    }
    // Theme color meta
    if(!document.querySelector('meta[name="theme-color"]')){
      var tm = document.createElement('meta');
      tm.name = 'theme-color'; tm.content = '#04080F';
      document.head.appendChild(tm);
    }
    // Favicon
    if(!document.querySelector('link[rel="icon"]')){
      var fi = document.createElement('link');
      fi.rel = 'icon'; fi.type = 'image/svg+xml'; fi.href = 'favicon.svg';
      document.head.appendChild(fi);
    }
    // Apple touch icon
    if(!document.querySelector('link[rel="apple-touch-icon"]')){
      var ai = document.createElement('link');
      ai.rel = 'apple-touch-icon'; ai.href = 'favicon.svg';
      document.head.appendChild(ai);
    }
    // Service worker
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('sw.js').then(function(reg){
        reg.addEventListener('updatefound', function(){
          var w = reg.installing;
          if(w) w.addEventListener('statechange', function(){
            if(w.state === 'installed' && navigator.serviceWorker.controller){
              if(window.FXShared && FXShared.toast)
                FXShared.toast('App updated — reload for latest version', 'info', 5000);
            }
          });
        });
      }).catch(function(){});
    }
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
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    const tz = now.toLocaleTimeString('en-US',{timeZoneName:'short'}).split(' ').pop();
    el.textContent = `${hh}:${mm}:${ss} ${tz}`;
  }

  /* ── SEARCH ── */
  function searchItems(query){
    const q = query.trim().toLowerCase();
    if(!q) return [];
    return SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.tags.toLowerCase().includes(q)
    );
  }

  function renderSearchResults(results, container){
    container.innerHTML = '';
    if(!results.length){
      container.innerHTML = '<div class="search-no-results">No results for that query</div>';
    } else {
      results.forEach(function(item){
        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'search-result-item';
        a.setAttribute('role','option');
        a.innerHTML =
          '<span class="search-result-icon" aria-hidden="true">'+item.icon+'</span>'+
          '<div class="search-result-text">'+
            '<div class="search-result-title">'+item.title+'</div>'+
            '<div class="search-result-desc">'+item.desc+'</div>'+
          '</div>';
        container.appendChild(a);
      });
    }
    container.hidden = false;
  }

  function setupSearch(inp, res){
    if(!inp || !res) return;
    var focusIdx = -1;

    function refresh(){
      var matches = searchItems(inp.value);
      if(!inp.value.trim()){ close(); return; }
      renderSearchResults(matches, res);
      inp.setAttribute('aria-expanded','true');
      focusIdx = -1;
      syncFocus();
    }

    function syncFocus(){
      var items = res.querySelectorAll('.search-result-item');
      items.forEach(function(el,i){ el.classList.toggle('focused', i === focusIdx); });
    }

    function close(){
      res.hidden = true;
      inp.setAttribute('aria-expanded','false');
      focusIdx = -1;
    }

    inp.addEventListener('input', refresh);
    inp.addEventListener('focus', function(){
      var kbd = document.getElementById('hdrSearchKbd');
      if(kbd) kbd.style.opacity = '0';
      if(inp.value.trim()) refresh();
    });
    inp.addEventListener('blur', function(){
      setTimeout(function(){
        var kbd = document.getElementById('hdrSearchKbd');
        if(kbd) kbd.style.opacity = '';
      }, 200);
    });

    inp.addEventListener('keydown', function(e){
      var items = res.querySelectorAll('.search-result-item');
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        focusIdx = Math.min(focusIdx+1, items.length-1);
        syncFocus();
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        focusIdx = Math.max(focusIdx-1, -1);
        syncFocus();
      } else if(e.key === 'Enter'){
        if(focusIdx >= 0 && items[focusIdx]) window.location.href = items[focusIdx].href;
      } else if(e.key === 'Escape'){
        close(); inp.blur();
      }
    });

    document.addEventListener('click', function(e){
      if(!inp.contains(e.target) && !res.contains(e.target)) close();
    }, true);
  }

  function toggleMobileSearch(){
    var overlay = document.getElementById('mobileSearchOverlay');
    var btn     = document.getElementById('mobileSearchBtn');
    if(!overlay) return;
    var opening = overlay.hidden;
    overlay.hidden = !opening;
    if(btn) btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    if(opening){
      var inp = document.getElementById('mobileSearchOverlayInput');
      if(inp){ inp.value = ''; inp.focus(); }
      var res = document.getElementById('mobileSearchOverlayResults');
      if(res) res.innerHTML = '';
      // close hamburger nav if open
      var nav = document.getElementById('mobileNav');
      var hbtn = document.getElementById('mobileMenuBtn');
      if(nav && nav.classList.contains('open')){
        nav.classList.remove('open');
        if(hbtn){ hbtn.setAttribute('aria-expanded','false'); hbtn.textContent='☰'; }
      }
    }
  }

  function initSearch(){
    setupSearch(
      document.getElementById('hdrSearchInput'),
      document.getElementById('hdrSearchResults')
    );
    // "/" key focuses search
    document.addEventListener('keydown', function(e){
      if(e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey){
        var tag = (document.activeElement || {}).tagName || '';
        var inp = document.getElementById('hdrSearchInput');
        if(inp && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT'){
          e.preventDefault();
          inp.focus();
        }
      }
    });
    // Mobile overlay search (inline results, not absolute dropdown)
    var overlayInp = document.getElementById('mobileSearchOverlayInput');
    var overlayRes = document.getElementById('mobileSearchOverlayResults');
    if(overlayInp && overlayRes){
      overlayInp.addEventListener('input', function(){
        var matches = searchItems(overlayInp.value);
        if(!overlayInp.value.trim()){ overlayRes.innerHTML = ''; return; }
        overlayRes.innerHTML = '';
        if(!matches.length){
          overlayRes.innerHTML = '<div class="search-no-results">No results for that query</div>';
        } else {
          matches.forEach(function(item){
            var a = document.createElement('a');
            a.href = item.href;
            a.className = 'search-result-item';
            a.innerHTML =
              '<span class="search-result-icon" aria-hidden="true">'+item.icon+'</span>'+
              '<div class="search-result-text">'+
                '<div class="search-result-title">'+item.title+'</div>'+
                '<div class="search-result-desc">'+item.desc+'</div>'+
              '</div>';
            overlayRes.appendChild(a);
          });
        }
      });
      overlayInp.addEventListener('keydown', function(e){
        if(e.key === 'Escape'){
          var overlay = document.getElementById('mobileSearchOverlay');
          var btn = document.getElementById('mobileSearchBtn');
          if(overlay) overlay.hidden = true;
          if(btn){ btn.setAttribute('aria-expanded','false'); }
          overlayInp.blur();
        }
      });
    }
    // Close overlay on outside click
    document.addEventListener('click', function(e){
      var overlay = document.getElementById('mobileSearchOverlay');
      var btn = document.getElementById('mobileSearchBtn');
      if(overlay && !overlay.hidden && btn &&
         !overlay.contains(e.target) && !btn.contains(e.target)){
        overlay.hidden = true;
        btn.setAttribute('aria-expanded','false');
      }
    }, true);
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

  /* ── TOAST NOTIFICATIONS ── */
  var _toastStack = null;
  var _toastCount = 0;

  function initToast(){
    _toastStack = document.createElement('div');
    _toastStack.id = 'fx-toast-stack';
    _toastStack.setAttribute('aria-live', 'polite');
    _toastStack.setAttribute('aria-atomic', 'false');
    document.body.appendChild(_toastStack);
  }

  function showToast(msg, type, duration){
    if(!_toastStack) return;
    type = type || 'info';
    duration = duration || 3500;

    // limit to 3 visible toasts
    var existing = _toastStack.querySelectorAll('.fx-toast');
    if(existing.length >= 3) existing[0].remove();

    var icons = { success:'✓', error:'✕', info:'ℹ' };
    var t = document.createElement('div');
    t.className = 'fx-toast ' + type;
    t.setAttribute('role', 'status');
    t.innerHTML =
      '<span class="fx-toast-icon">' + (icons[type] || icons.info) + '</span>' +
      '<span class="fx-toast-msg">' + msg + '</span>';
    _toastStack.appendChild(t);
    _toastCount++;

    var id = setTimeout(function(){
      t.classList.add('leaving');
      t.addEventListener('animationend', function(){ t.remove(); }, { once: true });
    }, duration);

    t.addEventListener('click', function(){
      clearTimeout(id);
      t.classList.add('leaving');
      t.addEventListener('animationend', function(){ t.remove(); }, { once: true });
    });
  }

  /* ── PUBLIC API ── */
  window.FXShared = {
    toggleTheme: function(){ applyTheme(document.body.classList.contains('light-mode')); },
    toggleMobile: toggleMobile,
    toggleMobileSearch: toggleMobileSearch,
    toast: showToast,
  };

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', function(){
    inject();
    initTheme();
    initSearch();
    initToast();
    initPWA();
    // Start clock if on dashboard
    if(document.getElementById('hdrTime')){
      tickClock();
      setInterval(tickClock, 1000);
    }
  });

})();

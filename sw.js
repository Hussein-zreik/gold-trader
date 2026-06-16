/* Forex Desk — Service Worker (app-shell cache) */
const CACHE = 'fxdesk-v1';
const SHELL = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/journal.html',
  '/portfolio.html',
  '/news.html',
  '/calendar.html',
  '/shared.css',
  '/shared.js',
  '/manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Only cache-first for same-origin shell assets
  var url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;
  if(e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(function(cached){
      var network = fetch(e.request).then(function(res){
        if(res && res.status === 200){
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});

/* Forex Desk — Service Worker (app-shell cache) */
const CACHE = 'fxdesk-v2';
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
  '/manifest.json',
  '/favicon.svg',
  '/offline.html'
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
  var url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;
  if(e.request.method !== 'GET') return;

  // Navigation requests: serve from cache or fall back to offline page
  if(e.request.mode === 'navigate'){
    e.respondWith(
      caches.match(e.request).then(function(cached){
        return cached || fetch(e.request).catch(function(){
          return caches.match('/offline.html');
        });
      })
    );
    return;
  }

  // Shell assets: cache-first, update in background
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

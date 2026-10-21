// STools Service Worker - cache supaya pindah halaman terasa instan
// Naikkan angka VERSION tiap kali kamu update file HTML/CSS/JS penting
const VERSION = 'v1';
const CACHE = 'stools-' + VERSION;

// File inti yang di-cache saat pertama kali install
const PRECACHE = [
  '/',
  '/index.html',
  '/logo.jpg',
  '/fcm-helper.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Satu file gagal tidak boleh menggagalkan semuanya
      return Promise.all(PRECACHE.map(function(url) {
        return cache.add(url).catch(function() {});
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) {
        return k.startsWith('stools-') && k !== CACHE;
      }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Request ini JANGAN pernah di-cache (data live Firebase, auth, API)
function isLiveRequest(url) {
  return url.hostname.endsWith('firebasedatabase.app') ||
         url.hostname.endsWith('googleapis.com') ||
         url.hostname.endsWith('firebaseio.com') ||
         url.hostname.endsWith('firebaseapp.com') ||
         url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', function(e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;
  if (isLiveRequest(url)) return;

  const sameOrigin = url.origin === self.location.origin;
  const isFirebaseSDK = url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0;
  if (!sameOrigin && !isFirebaseSDK) return;

  // Stale-while-revalidate: tampil dari cache dulu (instan), update di belakang layar
  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(req, { ignoreSearch: false }).then(function(cached) {
        const network = fetch(req).then(function(res) {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            cache.put(req, res.clone());
          }
          return res;
        }).catch(function() { return cached; });
        return cached || network;
      });
    })
  );
});

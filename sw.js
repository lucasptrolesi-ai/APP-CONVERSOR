// Service Worker - Cache First Strategy com Network Fallback
const CACHE_NAME = 'trolesi-connect-v1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icon-192.svg',
  './icon-512.svg'
];

// Install - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(FILES);
    }).then(() => self.skipWaiting())
  );
});

// Activate - remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch - Cache First, fallback to Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        // Fallback para página offline se necessário
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

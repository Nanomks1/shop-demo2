const CACHE_NAME = 'mahaluna-v7-cache';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './core.js',
  './sections.js',
  './sections2.js',
  './repair2.js',
  './extras2.js',
  './v3.js',
  './v4.js',
  './v5.js',
  './v6.js',
  './v7.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

const CACHE = 'aziz-shop-v3-56';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './core.js',
  './icons.js',
  './topup.js',
  './invbase.js',
  './invphones.js',
  './invglass.js',
  './invpochette.js',
  './invacc.js',
  './invreport.js',
  './invround.js',
  './barcode.js',
  './invset.js',
  './repair.js',
  './report.js',
  './sync.js',
  './extra.js',
  './home.js',
  './users.js',
  './backup.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
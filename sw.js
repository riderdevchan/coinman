const CACHE_NAME = 'coinman-v1';
const ASSETS = [
  './',
  './manifest.json'
];

// ติดตั้งและเก็บ Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// เรียกใช้งานไฟล์จาก Cache เมื่อไม่มีเน็ต
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

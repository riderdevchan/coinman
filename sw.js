// เปลี่ยนเลขเวอร์ชันตรงนี้ทุกครั้งที่มีการอัปเดตโค้ดใหญ่ เพื่อบังคับล้างแคชเก่าบนมือถือผู้ใช้
const CACHE_NAME = 'coinman-cache-v2';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// ติดตั้ง Service Worker และดึงไฟล์ใหม่
self.addEventListener('install', event => {
  self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่อัปเดตทำงานทันที
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ล้างแคชเวอร์ชันเก่าทิ้งให้อัตโนมัติ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('ล้างแคชเวอร์ชันเก่าเรียบร้อย:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// กลยุทธ์ Network First: เช็กเน็ตดึงไฟล์ล่าสุดก่อน ถ้าไม่มีเน็ตค่อยดึงจากแคช
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // เมื่อดึงไฟล์จากเน็ตสำเร็จ ให้อัปเดตเก็บลงแคชไว้เผื่อออฟไลน์
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // ถ้าออฟไลน์/ไม่มีเน็ต ให้ดึงไฟล์จากแคชมาใช้นำทางก่อน
        return caches.match(event.request);
      })
  );
});

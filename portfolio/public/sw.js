self.addEventListener('install', (e) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('Service Worker activated');
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  return;
});
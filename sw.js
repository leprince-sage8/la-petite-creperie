/* ═══════════════════════════════════════════
   LA P'TITE CRÊPERIE — SERVICE WORKER (PWA)
   Cache les fichiers pour fonctionner hors ligne
   ═══════════════════════════════════════════ */

const CACHE_NAME = 'laptitecreperie-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/images/logo.jpg',
  '/images/favicon.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/pot-de-crepe.jpg',
  '/images/barquette.jpg',
  '/images/crepe-nature.jpg',
  '/images/galette.jpg',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap'
];

/* --- Installation : mise en cache des fichiers --- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* --- Activation : nettoyage des anciens caches --- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

/* --- Interception des requêtes : cache en priorité, réseau en secours --- */
self.addEventListener('fetch', (event) => {
  // On ne tente pas de cacher les requêtes POST (commandes WhatsApp, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // On met en cache les nouvelles ressources locales
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

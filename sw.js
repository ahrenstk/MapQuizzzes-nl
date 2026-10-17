const CACHE_NAME = 'mapquizzzes-2026-10-17';
const TILE_CACHE_NAME = 'mapquizzzes-tiles-v1';

const ASSETS_TO_CACHE = [
  './',
  'index.php',
  'css/leaflet.css',
  'js/leaflet.js',
  'js/piexifjs.js',
  'js/leaflet.polylineDecorator.js',
  'js/qrcode.min.js',
  'images/background.jpg',
  'images/pin.svg',
  'images/icon-192.png',
  'images/icon-512.png',
  'manifest.php',
  'instructions.html',
  'privacy.html',
  'legal.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const allowedCaches = [CACHE_NAME, TILE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!allowedCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);


  if (event.request.method !== 'GET' || url.searchParams.has('tour')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }


  if (url.host.includes('tile.openstreetmap.org') || url.host.includes('arcgisonline.com')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);

    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
    cache.put(event.request, networkResponse.clone());
}


          return networkResponse;
        } catch (error) {
          // Falls offline und nicht im Cache geladen
          return new Response('', { status: 503, statusText: 'Tile Offline' });
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

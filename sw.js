const CACHE_NAME = 'myshop-pwa-v24';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/product.html',
  '/cart.html',
  '/checkout.html',
  '/account.html',
  '/wishlist.html',
  '/track-order.html',
  '/invoice.html',
  '/css/style.css',
  '/js/api-client.js',
  '/js/main.js',
  '/js/cart.js',
  '/js/wishlist.js',
  '/js/checkout.js',
  '/js/user-system.js',
  '/js/i18n.js',
  '/locales/ar.json',
  '/locales/fr.json',
  '/locales/en.json',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. For modifying API requests (POST/PUT/DELETE) -> strictly Network Only
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. For GET API requests (e.g. /api/products, /api/wilayas) -> Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. For Static HTML/CSS/JS Assets -> Stale-while-revalidate / Cache First with network update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML navigation, fallback to cached index or shop
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match(event.request).then((cached) => cached || caches.match('/index.html'));
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        });

      return cachedResponse || fetchPromise;
    })
  );
});

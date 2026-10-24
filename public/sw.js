const CACHE_NAME = 'noor-quran-v5';
const API_CACHE_NAME = 'noor-quran-api-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/islamic_badge.jpg',
  '/islamic_avatar.jpg',
];

// Install: Pre-cache static shell files immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge obsolete caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Complete Offline-First with Navigation fallback and smart audio/API handling
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  // 1. Audio Streaming Requests: Live network streaming when online.
  // When offline, immediately return clean offline response rather than hanging or polluting storage cache.
  if (
    req.url.includes('.mp3') ||
    req.url.includes('everyayah.com') ||
    req.url.includes('mp3quran.net')
  ) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response('Audio streaming unavailable in offline mode', {
          status: 503,
          statusText: 'Service Unavailable (Offline)',
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );
    return;
  }

  // 2. Quran API Requests (api.alquran.cloud): Cache responses when online, so they are available offline!
  if (req.url.includes('api.alquran.cloud')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. SPA Navigation fallback: always return cached index.html when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = (await cache.match('/index.html')) || (await cache.match('/'));
        if (cachedIndex) return cachedIndex;
        const fallback = await caches.match('/index.html');
        return fallback || new Response('Offline', { status: 200, headers: { 'Content-Type': 'text/html' } });
      })
    );
    return;
  }

  // 4. Static assets, scripts, stylesheets, fonts, and images: Cache-first
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, clone).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 5. Handle Notification Clicks (focus open app or open root window)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 6. Handle client message to show notification from background/service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    if (self.registration && self.registration.showNotification) {
      self.registration.showNotification(title, options);
    }
  }
});


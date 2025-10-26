// Service Worker for Cache Management
const CACHE_NAME = 'freshvilla-v' + Date.now();
const VERSION_CHECK_INTERVAL = 30000; // Check every 30 seconds

// Install event - clear old caches
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker');
  self.skipWaiting(); // Force activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - always get fresh content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store'
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Check for updates periodically
setInterval(() => {
  fetch('/version.json?' + Date.now())
    .then(response => response.json())
    .then(data => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'VERSION_CHECK',
            version: data.version,
            buildTime: data.buildTime
          });
        });
      });
    })
    .catch(err => console.log('[SW] Version check failed:', err));
}, VERSION_CHECK_INTERVAL);

// Message from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

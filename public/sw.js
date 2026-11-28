// MarketBD Progressive Web App, Instant Asset Cache & Push Notification Service Worker
const CACHE_NAME = 'marketbd-app-v10';
const SHELL_PRECACHE = [
  '/logo.jpg',
  '/favicon.jpg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_PRECACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

function isBypassedRequest(url) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
  if (url.pathname.startsWith('/api/')) return true;
  // Never cache Vite dev modules, source files, or pre-bundled dependency chunks
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.startsWith('/@id/') ||
    /\.(tsx?|jsx?|mjs)$/i.test(url.pathname) ||
    url.searchParams.has('v') ||
    url.searchParams.has('t')
  ) {
    return true;
  }
  // Never intercept Firebase / Google APIs / OAuth traffic
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('accounts.google.com')
  ) {
    return true;
  }
  return false;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  if (isBypassedRequest(url)) return;

  // 1. Navigation requests: strictly Network-First (no stale HTML flash) with 5s offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => {
          if (res && res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match('/').then((cachedRoot) => cachedRoot || Response.error())
        )
    );
    return;
  }

  // 2. Same-origin hashed Vite bundles (/assets/*) and local static icons:
  // Cache-First for 0ms repeat launches on Android WebView
  if (url.origin === self.location.origin) {
    const isImmutableAsset = url.pathname.startsWith('/assets/');
    if (isImmutableAsset) {
      event.respondWith(
        caches.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
            }
            return res;
          });
        })
      );
      return;
    }

    // Other same-origin static files (/logo.jpg, /manifest.json, etc.): Stale-While-Revalidate
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // 3. Google Fonts CSS & font files: Stale-While-Revalidate so fonts never stall mobile WebView
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});

// Native Android & Web Push Notification Event Handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'MarketBD.Net',
    body: 'আপনার অ্যাকাউন্টে নতুন নোটিফিকেশন এসেছে।',
    icon: '/logo.jpg',
    badge: '/favicon.jpg',
    url: '/'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.jpg',
    badge: data.badge || '/favicon.jpg',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'দেখুন' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler - brings app/WebView to foreground
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

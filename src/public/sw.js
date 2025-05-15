const CACHE_NAME = "storyshare-v1";
const urlsToCache = [
  "/",
  "/app.bundle.js",
  "/styles.bundle.css",
  "/images/icons/icon_144x144.png",
  "/images/icons/icon_512x512.png",
  "/manifest.json",
];

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (response && response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (err) {
          console.warn(`[SW] Skipping ${url}:`, err.message);
        }
      }
    })
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch((err) => {
          console.warn("[SW] Failed to fetch root/index.html:", err.message);
          return caches.match(request);
        })
    );
    return;
  }

  // Untuk resource lainnya
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, networkResponse.clone()));
            }
          })
          .catch((err) => {
            console.warn(
              `[SW] Background fetch failed for ${request.url}:`,
              err.message
            );
          });

        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch((err) => {
          console.warn(
            `[SW] Network fetch failed for ${request.url}:`,
            err.message
          );
          return new Response("Offline or resource unavailable", {
            status: 503,
            statusText: "Offline",
          });
        });
    })
  );
});

// Push Notification
self.addEventListener("push", (event) => {
  const body = event.data?.text() ?? "Ada cerita baru!";
  const options = {
    body,
    icon: "/images/icons/icon_152x152.png",
    badge: "/images/icons/notification-alert-pngrepo-com.png",
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
  };

  event.waitUntil(
    self.registration.showNotification("StoryShare", options).catch((err) => {
      console.warn("Push notification error:", err);
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

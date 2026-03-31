/**
 * LearningLoop Service Worker
 *
 * Cache strategies:
 * - Static assets (JS/CSS/fonts): Cache-first, long TTL
 * - Pages (HTML): Network-first with offline fallback
 * - API responses: Network-only (always fresh)
 * - Audio/images from Wiro: Cache-first (expensive to regenerate)
 * - Offline: Custom /offline page
 */

const CACHE_VERSION = "ll-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const MEDIA_CACHE = `${CACHE_VERSION}-media`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

// Static assets to precache on install
const PRECACHE_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json",
];

// ─── INSTALL ────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[SW] Precache partial failure:", err);
      });
    })
  );
  // Activate immediately, don't wait for old SW to die
  self.skipWaiting();
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("ll-") && !key.startsWith(CACHE_VERSION))
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── FETCH ──────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension, etc.
  if (!url.protocol.startsWith("http")) return;

  // 1) API routes → network-only (always need fresh data)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 2) Audio/image media from external CDN (Wiro outputs) → cache-first
  if (isMediaUrl(url)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, 30 * 24 * 60 * 60));
    return;
  }

  // 3) Static assets (JS, CSS, fonts, icons) → cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 7 * 24 * 60 * 60));
    return;
  }

  // 4) Pages (HTML navigation) → network-first with offline fallback
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // 5) Everything else → network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ─── STRATEGIES ─────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName, maxAgeSec) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());

      // Limit media cache size (max 200 items)
      if (cacheName === MEDIA_CACHE) {
        limitCacheSize(cacheName, 200);
      }
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback page
    const offlinePage = await caches.match("/offline");
    if (offlinePage) return offlinePage;

    return new Response(
      "<html><body><h1>Offline</h1><p>Internet bağlantısı yok. Lütfen bağlantınızı kontrol edin.</p></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────

function isMediaUrl(url) {
  // Wiro CDN outputs or Supabase storage
  if (url.hostname.includes("wiro") || url.hostname.includes("supabase")) {
    return true;
  }
  // Audio/image file extensions
  const mediaExtensions = [".mp3", ".wav", ".webm", ".ogg", ".png", ".jpg", ".jpeg", ".webp"];
  return mediaExtensions.some((ext) => url.pathname.endsWith(ext));
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
}

async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    for (const key of toDelete) {
      await cache.delete(key);
    }
  }
}

// ─── MESSAGES ───────────────────────────────────────────────────────────

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }

  // Allow manual cache clearing
  if (event.data === "clearCaches") {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});

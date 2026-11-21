/* Freakin's Studio — Creative Office OS 2.0 Service Worker
 * Safe cache rules:
 * - Precache ONLY public offline shell & static PWA assets.
 * - NEVER cache /api/*, /dashboard*, /admin*, /auth*, /login*, /signup*, Supabase hosts, or non-GET requests.
 */

const CACHE_NAME = "freakins-os-shell-v1";
const STATIC_PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icon.svg",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
];

const BYPASS_PATH_PREFIXES = [
  "/api/",
  "/dashboard",
  "/admin",
  "/auth",
  "/login",
  "/signup",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Never intercept cross-origin requests (e.g., Supabase, Stripe, Puter, CDNs)
  if (url.origin !== self.location.origin) return;

  // Never cache or serve stale responses for authenticated/API/mutable routes
  if (
    BYPASS_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Navigation requests: network-first, fall back cleanly to /offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOffline = await caches.match("/offline");
        return (
          cachedOffline ||
          new Response(
            "Offline — Freakin's Studio Creative Office OS is offline.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            }
          )
        );
      })
    );
    return;
  }

  // Static public assets & Next static bundles: stale-while-revalidate safe strategy
  if (
    url.pathname.startsWith("/_next/static/") ||
    STATIC_PRECACHE_URLS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === "basic") {
              const copy = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, copy))
                .catch(() => undefined);
            }
            return response;
          })
          .catch(() => undefined);

        return cached || networkPromise;
      })
    );
  }
});

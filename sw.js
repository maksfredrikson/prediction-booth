// Offline cache. Network first, so a new version shows at once when online;
// the cached copy answers when the network is off or slow.
const CACHE = "prediction-booth-v14";
const ASSETS = [
  "./", "index.html", "survey.html", "scenarios.html", "about.html", "explore.html", "css/site.css",
  "js/content.js", "js/compose.js", "js/dots.js", "js/pattern.js", "js/scale.js", "js/store.js", "js/receipt.js",
  "js/chrome.js", "js/survey.js", "js/explore.js", "js/scenarios.js", "js/about.js", "js/invented.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await Promise.race([
        fetch(e.request, { cache: "no-cache" }),   // always ask the server first, so edits show at once
        new Promise((_, no) => setTimeout(() => no(new Error("slow")), 3000))
      ]);
      if (fresh && fresh.ok) cache.put(e.request, fresh.clone());
      return fresh;
    } catch (err) {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});

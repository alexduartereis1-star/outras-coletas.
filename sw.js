const CACHE_NAME = "outras-coletas-v5";
const CORE_ASSETS = ["./", "./index.html", "./pdf-coleta.js", "./manifest.json", "./icon-144.png"];
// Bibliotecas externas: guardadas para o app abrir (e escanear/gerar PDF) sem internet depois do primeiro uso
const CDN_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await Promise.all(CDN_ASSETS.map((u) => cache.add(new Request(u, { mode: "cors" })).catch(() => {})));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // O catálogo (Apps Script) nunca é cacheado aqui — o app guarda no IndexedDB
  if (req.url.includes("script.google.com") || req.url.includes("script.googleusercontent.com")) return;

  // Página: rede primeiro (pega versão nova assim que publicada), cache se estiver offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Demais arquivos: cache primeiro, rede como reserva (e guarda)
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});

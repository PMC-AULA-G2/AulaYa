// AULA — Service Worker
// Cachea el shell de la app para que funcione sin conexión (ver pantalla
// "Funcionamiento offline y online" del diseño: videos, ejercicios, juegos,
// Niko (SLM) y progreso deben seguir disponibles sin internet).

const CACHE_NAME = "aula-cache-v21";
// caché aparte para videos descargados a propósito por el usuario (ver
// downloadVideo() en js/app.js) — NO se pre-carga como CORE_ASSETS: el
// estudiante decide qué video guardar para verlo sin internet, porque los
// videos pesan más y el ancho de banda/almacenamiento rural es limitado.
const VIDEO_CACHE = "aula-videos-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/malla.js",
  "./js/app.js",
  "./js/slm_curriculum.js",
  "./js/tutor_engine.js",
  "./js/slm_runtime.js",
  "./js/microvideos.js",
  "./js/streak.js",
  "./js/config.js",
  "./data/microvideo_catalog.json",
  "./data/colegios_catalog_meta.json",
  "./data/aula_question_bank.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/aula-leaf-oficial.png",
  "./icons/niko/estado-saludo.png",
  "./icons/niko/estado-exito.png",
  "./icons/niko/estado-triste.png",
  "./icons/niko/estado-pensando.png",
  "./icons/niko/inter-celebracion.png",
  "./icons/niko/inter-explica.png",
  "./icons/niko/inter-motiva.png",
  "./icons/niko/inter-duda.png",
  "./icons/niko/saludo2.png",
  "./icons/niko/pulgar-arriba.png",
  "./icons/niko/celebracion-puno.png",
  "./icons/niko/salto-celebracion.png",
  "./icons/niko/calificacion-a.png",
  "./icons/niko/letrero-gracias.png",
  "./icons/niko/niko-completo.png",
  "./icons/niko/niko-2d.png",
  "./icons/niko/niko-hoja-momentos-1.png",
  "./icons/niko/niko-hoja-momentos-2.png",
  "./icons/niko/niko-hoja-momentos-3.png",
  "./icons/niko/niko-hoja-poses-1.png",
  "./icons/niko/niko-hoja-poses-2.png",
  "./icons/niko/niko-hoja-poses-3.png",
  "./icons/niko/niko-hoja-celebracion.png",
  "./icons/niko/niko-hoja-esperando.png",
  "./icons/niko/niko-hoja-feliz.png",
  "./icons/niko/niko-hoja-preguntando.png",
  "./icons/niko/niko-hoja-triste.png",
  "./icons/niko/hero-niko-completo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) =>
        k.startsWith("aula-cache-") && k !== CACHE_NAME
      ).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});


self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "AULA_PREFETCH_CORE") return;
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of CORE_ASSETS) {
        try {
          const req = new Request(url, {cache:"no-store"});
          const response = await fetch(req);
          if (response && response.ok) await cache.put(url, response.clone());
        } catch (e) {}
      }
    })
  );
});

// Los videos tienen su propia estrategia: solo se guardan en VIDEO_CACHE
// cuando el estudiante pulsa "Descargar" (downloadVideo() en js/app.js), no
// automáticamente al reproducirlos. Si ya está descargado, se sirve desde
// ahí incluso sin conexión; si no, va directo a la red.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  // Transformers.js keeps model/tokenizer files in its own cache. Do not
  // duplicate huge Hugging Face model responses in the app-shell cache.
  if (requestUrl.hostname === "huggingface.co" || requestUrl.hostname.endsWith(".huggingface.co") || requestUrl.hostname.endsWith(".xethub.hf.co")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.url.includes("/media/videos/")) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => cached || fetch(event.request))
      )
    );
    return;
  }

  // Cache-first evita volver a descargar bancos y catálogos pesados en cada visita.
  event.respondWith(
    caches.match(event.request, { ignoreSearch: false }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
    })
  );
});

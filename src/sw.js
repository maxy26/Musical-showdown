// "network-first": siempre intenta traer la versión más reciente del
// servidor primero; solo usa la copia guardada en caché si no hay
// conexión. Así el juego nunca se queda pegado en una versión vieja.
const CACHE_NAME = "musical-showdown-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/main.js",
  "./js/sound.js",
  "./js/router.js",
  "./js/state.js",
  "./js/gameLogic.js",
  "./js/groups.js",
  "./js/scoring.js",
  "./js/pairing.js",
  "./js/utils.js",
  "./js/data/songs.js",
  "./js/screens/menu.js",
  "./js/screens/config/index.js",
  "./js/screens/config/players.js",
  "./js/screens/config/modes.js",
  "./js/screens/config/presets.js",
  "./js/screens/config/valuePicker.js",
  "./js/screens/teamOrg.js",
  "./js/screens/round.js",
  "./js/screens/verify.js",
  "./js/screens/roundResult.js",
  "./js/screens/results.js",
  "./js/screens/modals.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./audio/click.wav",
  "./audio/tick.wav",
  "./audio/tick-urgent.wav",
  "./audio/ambient.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

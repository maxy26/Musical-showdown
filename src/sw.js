// "network-first": siempre intenta traer la versión más reciente del
// servidor primero; solo usa la copia guardada en caché si no hay
// conexión. Así el juego nunca se queda pegado en una versión vieja.
// Los scripts de build/ reemplazan este nombre por uno único en cada
// compilación (versión + fecha y hora), así cada build usa una caché nueva y
// "activate" borra las anteriores. En la web servida desde src/ queda este.
const CACHE_NAME = "musical-showdown-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./css/fuentes.css",
  "./fonts/fredoka.woff2",
  "./fonts/inter.woff2",
  "./fonts/nunito.woff2",
  "./fonts/unbounded.woff2",
  "./fonts/LICENCIAS.txt",
  "./js/main.js",
  "./js/sound.js",
  "./js/audio/catalogo.js",
  "./js/audio/motor.js",
  "./js/router.js",
  "./js/state.js",
  "./js/gameLogic.js",
  "./js/groups.js",
  "./js/scoring.js",
  "./js/podium.js",
  "./js/relay.js",
  "./js/pairing.js",
  "./js/utils.js",
  "./js/version.js",
  "./js/settings.js",
  "./js/plataforma.js",
  "./js/avisos.js",
  "./js/compartir.js",
  "./js/icons.js",
  "./js/tapFeedback.js",
  "./js/data/songs.js",
  "./js/screens/menu.js",
  "./js/screens/sheet.js",
  "./js/screens/modesManual.js",
  "./js/screens/config/index.js",
  "./js/screens/config/players.js",
  "./js/screens/config/modes.js",
  "./js/screens/config/alt2Options.js",
  "./js/screens/config/presets.js",
  "./js/screens/config/valuePicker.js",
  "./js/screens/teamOrg.js",
  "./js/screens/round.js",
  "./js/screens/verify.js",
  "./js/screens/roundResult.js",
  "./js/screens/results.js",
  "./js/screens/modals.js",
  "./js/screens/relayModals.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./audio/tick.wav",
  "./audio/tick-urgent.wav",
  "./audio/CREDITOS.txt",
  "./audio/musica/funky-disco.ogg",
  "./audio/musica/coffee-beans.mp3",
  "./audio/efectos/clic.ogg",
  "./audio/efectos/cristal.ogg",
  "./audio/efectos/nota.ogg",
  "./audio/efectos/interruptor.ogg",
  "./audio/efectos/ruleta.ogg",
  "./audio/efectos/aviso.ogg",
  "./audio/efectos/metal.ogg",
  "./audio/efectos/podio-piano.ogg",
  "./audio/efectos/aplausos.wav",
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

import { render } from "./router.js";
import { initSound } from "./sound.js";
import { applySettings } from "./settings.js";
import { initTapFeedback } from "./tapFeedback.js";
import { esAppInstalada } from "./plataforma.js";
import { revisarAvisosSeguido } from "./avisos.js";
import { avisosLlegaron } from "./screens/menu.js";
import { APP_VERSION } from "./version.js";

applySettings(); // antes del primer render: animaciones Sí/No guardadas en el dispositivo
render();
initSound();
initTapFeedback();
revisarAvisosSeguido(APP_VERSION, avisosLlegaron); // avisos nuevos con la app abierta

function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("loader-hide");
  setTimeout(() => loader.remove(), 500);
}

const minTime = new Promise((resolve) => setTimeout(resolve, 900));
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
Promise.all([minTime, fontsReady]).then(hideLoader);

// En la app de Android (Capacitor) o en el .exe los archivos ya vienen dentro
// de la app y el service worker sobra (ver plataforma.js).
if ("serviceWorker" in navigator) {
  if (esAppInstalada()) {
    // En Android, Capacitor no atiende las peticiones del service worker: si quedó
    // uno de una versión anterior, sus pedidos fallan y muestra la copia vieja
    // guardada (la app "no se actualiza"). Se borran el service worker y sus copias.
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
    if (window.caches) window.caches.keys().then((keys) => keys.forEach((k) => window.caches.delete(k))).catch(() => {});
  } else {
    // Web (PWA): el service worker permite jugar sin conexión.
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => console.error("SW error:", err));
    });
  }
}

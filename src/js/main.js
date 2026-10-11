import { render } from "./router.js";
import { initSound, esperarMusica } from "./sound.js";
import { applySettings } from "./settings.js";
import { initTapFeedback } from "./tapFeedback.js";
import { esAppInstalada } from "./plataforma.js";
import { revisarAvisosSeguido, agregarAvisoRecibido, idsSinLeer } from "./avisos.js";
import { avisosLlegaron } from "./screens/menu.js";
import { APP_VERSION } from "./version.js";
import { iniciarTeclado } from "./teclado.js";
import { iniciarNotificaciones } from "./notificaciones.js";
import { state } from "./state.js";

applySettings(); // antes del primer render: animaciones Sí/No guardadas en el dispositivo
render();
initSound();
initTapFeedback();
iniciarTeclado(); // flechas, Enter, Backspace y la lista del juego (teclado.js)
revisarAvisosSeguido(APP_VERSION, avisosLlegaron); // avisos nuevos con la app abierta

function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("loader-hide");
  setTimeout(() => loader.remove(), 500);
}

const minTime = new Promise((resolve) => setTimeout(resolve, 900));
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
// En la app instalada, la pantalla de carga se va cuando ya suena la música
// (como mucho 4 segundos; en la web la música espera el primer toque).
Promise.all([minTime, fontsReady, esperarMusica(4000)]).then(() => {
  hideLoader();
  // Android: la primera vez pide el permiso de notificaciones (notificaciones.js).
  // El aviso que trae una notificación se agrega a la campana (globito y campana
  // que se sacude); al abrir la app tocándola, se muestra la campana si se está
  // en el inicio.
  iniciarNotificaciones({
    alRecibir: (datos) => {
      const aviso = agregarAvisoRecibido(datos, APP_VERSION);
      if (aviso) avisosLlegaron(idsSinLeer([aviso]));
    },
    alTocar: () => {
      if (state.screen === "menu") document.querySelector("#btn-notifications")?.click();
    },
  });
});

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

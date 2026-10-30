import { render } from "./router.js";
import { initSound, esperarMusica } from "./sound.js";
import { applySettings, loadSettings } from "./settings.js";
import { initTapFeedback } from "./tapFeedback.js";
import { esAppInstalada, alCambiarPrimerPlano, iniciarPantallaCompleta } from "./plataforma.js";
import { revisarCompras, alCambiarPremium } from "./compras.js";
import { revisarAvisosSeguido, agregarAvisoRecibido, idsSinLeer } from "./avisos.js";
import { avisosLlegaron } from "./screens/menu.js";
import { APP_VERSION } from "./version.js";
import { iniciarTeclado } from "./teclado.js";
import { iniciarNotificaciones } from "./notificaciones.js";
import { state } from "./state.js";
import { iniciarEnlacesDeVinculo } from "./screens/vincular.js";
import { iniciarIconos } from "./iconosEmoji.js";

applySettings(); // antes del primer render: animaciones Sí/No guardadas en el dispositivo
iniciarIconos(); // antes del primer render: los emojis salen como íconos de Material Design
render();
initSound();
initTapFeedback();
iniciarTeclado(); // flechas, Enter, Backspace y la lista del juego (teclado.js)
iniciarPantallaCompleta(() => loadSettings().pantallaCompleta); // solo en la web, al primer toque
revisarAvisosSeguido(APP_VERSION, avisosLlegaron); // avisos nuevos con la app abierta
// Premium (compras.js): se pregunta a Google Play al abrir y al volver al juego;
// si cambia (compra o vencimiento), se redibuja fuera de la partida
alCambiarPremium(() => { if (["menu", "config"].includes(state.screen)) render(); });
revisarCompras();
alCambiarPrimerPlano((enFondo) => { if (!enFondo) revisarCompras(); });

function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("loader-hide");
  setTimeout(() => loader.remove(), 500);
}

const minTime = new Promise((resolve) => setTimeout(resolve, 1500)); // que se vea entera la bienvenida (styles.css, «Pantalla de carga»)
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
// En la app instalada, la pantalla de carga se va cuando ya suena la música
// (como mucho 4 segundos; en la web la música espera el primer toque).
Promise.all([minTime, fontsReady, esperarMusica(4000)]).then(() => {
  hideLoader();
  iniciarEnlacesDeVinculo(); // QR de la PC escaneado con la cámara del celular (vincular.js)
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

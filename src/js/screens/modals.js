import { state, resetState } from "../state.js";
import { efecto } from "../sound.js";
import { render } from "../router.js";
import { startTimer } from "../gameLogic.js";
import { el } from "../utils.js";
import { openSheet } from "./sheet.js";
import { buildModesManual, animateStory } from "./modesManual.js";
import { modeName } from "./config/modes.js";
import { hayAyudaModo, abrirAyudaModo } from "./ayudaModos.js";
import { modoOculto } from "../edicion.js";

/**
 * X para cerrar en la esquina superior derecha. Va solo en las ventanas que
 * informan y en la pausa (decisión del usuario, 01-10-2026); las ventanas que
 * piden una decisión (¿acertó?, relevo, confirmaciones) no la llevan.
 */
function addCloseButton(overlay, onClose) {
  const x = document.createElement("button");
  x.type = "button";
  x.className = "modal-close";
  x.setAttribute("aria-label", "Cerrar");
  x.textContent = "✕";
  x.onclick = onClose;
  overlay.querySelector(".modal").prepend(x);
}

/**
 * Detiene el reloj de la ronda mientras está abierta una ayuda (❓ o (?))
 * y devuelve la función que lo reanuda al cerrarla (usuario, 12-10-2026). Si la
 * ronda no está corriendo (otra pantalla, la cuenta inicial o ya en pausa), no
 * hace nada.
 */
export function pausarRondaMientras() {
  const r = state.round;
  if (state.screen !== "round" || r.phase !== "counting" || r.paused) return () => {};
  r.paused = true;
  return () => { if (state.screen === "round") r.paused = false; };
}

export function openPause() {
  clearInterval(state.round.timerId);
  state.round.paused = true;

  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal chica" style="text-align:center;">
    <div class="chica-icono">⏸</div>
    <h2 style="margin-bottom:18px;">Pausa</h2>
    <div class="btn-row" style="flex-direction:column;">
      <button class="btn btn-primary btn-block" id="continue">▶ Continuar</button>
      <button class="btn btn-secondary btn-block" id="help">❓ Ayuda</button>
      <button class="btn btn-danger btn-block" id="exit">🏠 Salir de la partida</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);

  const resume = () => {
    overlay.remove();
    state.round.paused = false;
    if (state.round.phase === "counting") startTimer();
  };
  overlay.querySelector("#continue").onclick = resume;
  addCloseButton(overlay, resume); // en la pausa, la X es lo mismo que "Continuar"
  overlay.querySelector("#help").onclick = () => openHelp();
  overlay.querySelector("#exit").onclick = () => {
    overlay.innerHTML = `<div class="modal chica" style="text-align:center;">
      <div class="chica-icono">🚪</div>
      <h2>¿Salir de la partida?</h2>
      <p class="small-note">Se pierde el progreso de esta partida.</p>
      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-secondary btn-block" id="no">No, continuar</button>
        <button class="btn btn-danger btn-block" id="yes">Sí, salir</button>
      </div>
    </div>`;
    overlay.querySelector("#no").onclick = resume; // sigue la ronda (antes quedaba en pausa)
    overlay.querySelector("#yes").onclick = () => {
      overlay.remove();
      clearInterval(state.round.timerId);
      // Vuelve a "Configurar partida" conservando todo lo elegido: jugadores,
      // tipo de batalla, modo, géneros, puntaje y tiempo (usuario, 08-10-2026).
      const config = state.config;
      resetState();
      state.config = config;
      state.screen = "config";
      render();
    };
  };
}

/**
 * Ayuda "Cómo se juega" (rediseño aprobado por el usuario sobre una maqueta,
 * 11-10-2026): un resumen breve y general del juego, con el mismo estilo que
 * "Modos de juego" (hoja e historieta). Lo que hace cada botón se explicará
 * en botoncitos de ayuda junto a cada uno (ver PENDIENTES.md).
 */
export function openHelp() {
  // Dentro de un modo (fuera del inicio), la ❓ explica ese modo (11-10-2026)
  const c = state.config;
  const reanudar = pausarRondaMientras(); // el reloj no corre mientras se lee la ayuda
  if (state.screen !== "menu" && hayAyudaModo(c.mode, c.battleType)) {
    abrirAyudaModo(c.mode, c.battleType, reanudar);
    return;
  }
  const body = el(`<div class="manual ayuda">
    <article class="manual-item">
      <p class="ayuda-linea">🎤 Sale una palabra: canta una canción que la tenga.</p>
    </article>

    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Una ronda</h3></div>
      <ol class="story story-4">${AYUDA_RONDA.map((s, n) => `
        <li class="frame"><span class="frame-num">${n + 1}</span>
          <span class="frame-art">${s.art}</span><span class="frame-text">${s.text}</span></li>`).join("")}
      </ol>
    </article>

    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Individual o Grupal</h3></div>
      <div class="manual-facts">
        <span class="manual-fact">👤 Individual: cada uno por su cuenta</span>
        <span class="manual-fact">👥 Grupal: por equipos (4 jugadores o más)</span>
      </div>
    </article>

    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Modos de juego</h3></div>
      ${AYUDA_MODOS.filter((m) => !modoOculto(m.id)).map((m) => `<div class="ayuda-modo"><b>${modeName(m.id)}</b><span>${m.text}</span></div>`).join("")}
      <div class="manual-actions"><button type="button" class="manual-choose pressable" id="help-modes">📖 Ver modos de juego</button></div>
    </article>

    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Cómo se gana</h3></div>
      <p class="ayuda-linea">🏆 Gana el primero que llega al puntaje objetivo.</p>
    </article>
  </div>`);
  // El manual de modos se abre solo para leer: desde la ayuda no se cambia el modo
  body.querySelector("#help-modes").onclick = () => openSheet({ title: "Modos de juego", body: buildModesManual({}) });
  openSheet({ title: "Cómo se juega", body, alCerrar: reanudar });
  animateStory(body.querySelector(".story"));
}

/** Las 4 viñetas de "Una ronda" (mismos efectos que el manual de modos). */
const AYUDA_RONDA = [
  { art: `<span class="fx-word">AMOR</span>`, text: "Sale la palabra" },
  { art: `<span class="fx-pop">🙋</span><span class="fx-mic">🎤</span>`, text: "Alguien canta una canción con esa palabra" },
  { art: `<span class="fx-pop">✅</span><span class="fx-pop fx-late">❌</span>`, text: "El moderador escucha y decide si es correcta" },
  { art: `<span class="fx-pop">✅</span><span class="fx-points fx-late">+100</span>`, text: "Si es correcta, suma puntos" },
];

/** Una línea por modo, sin nombrar a los otros (usuario, 11-10-2026). */
const AYUDA_MODOS = [
  { id: "clasico", text: "Sin reloj · 1 intento cada uno" },
  { id: "alternativo1", text: "Con reloj · se suma y se resta" },
  { id: "alternativo2", text: "Solo Grupal · tú eliges las reglas" },
];

/**
 * Ventana de advertencia propia (reemplaza al alert() nativo del navegador,
 * que se ve genérico y muestra la URL). Mismo estilo visual del resto del juego.
 */
export function showWarning(message) {
  efecto("aviso");
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal warning-modal chica" style="text-align:center;">
    <div class="warning-icon">⚠️</div>
    <p class="warning-text">${message}</p>
    <button class="btn btn-primary btn-block" id="warning-ok">Aceptar</button>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  const closeBtn = overlay.querySelector("#warning-ok");
  closeBtn.onclick = () => overlay.remove();
  addCloseButton(overlay, () => overlay.remove());
  closeBtn.focus();
}

/**
 * Aviso corto abajo de la pantalla que se va solo (por ejemplo, "Modo
 * elegido: Clásico"). Para avisos que el jugador debe leer y cerrar, usar
 * showWarning().
 */
export function showToast(message) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

/**
 * Ventana de confirmación propia (reemplaza al confirm() nativo del
 * navegador). Mismo diseño que "¿Salir de la partida?" en la pausa.
 * `onYes` solo se llama si se elige la opción afirmativa; "No" cierra sin más.
 */
export function showConfirm({ title, message = "", yesText = "Sí", noText = "No", onYes }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal warning-modal chica" style="text-align:center;">
    <div class="chica-icono">❓</div>
    <h2>${title}</h2>
    ${message ? `<p class="small-note">${message}</p>` : ""}
    <div class="btn-row" style="margin-top:16px;">
      <button class="btn btn-secondary btn-block" id="confirm-no">${noText}</button>
      <button class="btn btn-primary btn-block" id="confirm-yes">${yesText}</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  const noBtn = overlay.querySelector("#confirm-no");
  noBtn.onclick = () => overlay.remove();
  overlay.querySelector("#confirm-yes").onclick = () => {
    overlay.remove();
    onYes();
  };
  // El foco va a "No" para que un Enter accidental no confirme.
  noBtn.focus();
}

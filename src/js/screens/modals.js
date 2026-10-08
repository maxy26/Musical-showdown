import { state, resetState } from "../state.js";
import { efecto, efectoSuave } from "../sound.js";
import { render } from "../router.js";
import { startTimer } from "../gameLogic.js";

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

export function openPause() {
  clearInterval(state.round.timerId);
  state.round.paused = true;

  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal" style="text-align:center;">
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
    overlay.innerHTML = `<div class="modal" style="text-align:center;">
      <h2>¿Salir de la partida?</h2>
      <p class="small-note">El progreso de esta partida se perderá. Volverás a "Configurar partida" con los mismos jugadores y opciones.</p>
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

export function openHelp() {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal help-modal">
    <h2>Cómo se juega</h2>

    <p class="help-section-title">Durante la ronda</p>

    <div class="help-row">
      <div class="help-visual"><button class="name-btn mini" disabled>MICHAEL<span class="score">700 pts</span></button></div>
      <div class="help-text"><strong>Nombre y puntaje</strong>El moderador toca este botón para indicar quién va a responder.</div>
    </div>

    <div class="help-row">
      <div class="help-visual"><div class="progress-track mini"><div class="progress-fill" style="width:45%;background:linear-gradient(90deg,var(--pink),#FF8A65);"></div></div></div>
      <div class="help-text"><strong>Barra de progreso</strong>Qué tan cerca está ese jugador (o equipo) del puntaje objetivo.</div>
    </div>

    <div class="help-row">
      <div class="help-visual"><div class="clock mini">🕐 <span>18s</span></div></div>
      <div class="help-text"><strong>Reloj</strong>Tiempo restante para responder. En rojo cuando quedan 5 segundos o menos.</div>
    </div>

    <div class="help-row">
      <div class="help-visual"><div class="word mini">AMOR</div></div>
      <div class="help-text"><strong>Palabra de la ronda</strong>La canción que se cante debe contener esta palabra exacta.</div>
    </div>

    <div class="help-row">
      <div class="help-visual"><div class="multiplier mini">×2</div></div>
      <div class="help-text"><strong>Multiplicador</strong>Si aparece, los puntos de esa ronda se multiplican al acertar.</div>
    </div>

    <div class="help-row">
      <div class="help-visual"><button class="icon-btn mini" disabled>⏸ Pausa</button></div>
      <div class="help-text"><strong>Botón de pausa</strong>Detiene el tiempo y abre un menú con ayuda o salir de la partida.</div>
    </div>

    <p class="help-section-title">Verificando una canción</p>

    <div class="help-row">
      <div class="help-visual help-visual-wide">
        <input type="text" class="mini" disabled placeholder="Nombre o fragmento (mín. 3 letras)">
      </div>
      <div class="help-text"><strong>Buscar canción</strong>Mientras se escribe aparecen las canciones, por nombre o por el fragmento que se cantó. Hacen falta al menos 3 letras, y solo aparecen las canciones que llevan la palabra de la ronda.</div>
    </div>

    <div class="help-row">
      <div class="help-visual help-visual-wide">
        <div class="result-item mini" style="width:100%;">
          <div class="r-title">🎵 Amor</div>
          <div class="r-artist">Rocío Dúrcal</div>
        </div>
      </div>
      <div class="help-text"><strong>Resultado</strong>El moderador elige la canción correcta entre los resultados encontrados.</div>
    </div>

    <div class="help-row">
      <div class="help-visual help-visual-wide">
        <div class="btn-row" style="width:100%;">
          <button class="btn btn-danger mini" disabled>❌ Incorrecta</button>
          <button class="btn btn-primary mini" disabled>✅ Correcta</button>
        </div>
      </div>
      <div class="help-text"><strong>Decisión final</strong>El moderador confirma si la respuesta fue correcta o incorrecta.</div>
    </div>

    <p class="help-section-title">Cómo se gana</p>
    <p class="help-plain">El primer jugador (o equipo) que alcance o supere el puntaje objetivo gana la partida de inmediato. No hay empates ni desempates.</p>

    <button class="btn btn-primary btn-block" id="close" style="margin-top:14px;">Entendido</button>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  const cerrar = () => { efectoSuave("cerrar"); overlay.remove(); };
  overlay.querySelector("#close").onclick = cerrar;
  addCloseButton(overlay, cerrar);
  efecto("abrir");
}

/**
 * Ventana de advertencia propia (reemplaza al alert() nativo del navegador,
 * que se ve genérico y muestra la URL). Mismo estilo visual del resto del juego.
 */
export function showWarning(message) {
  efecto("aviso");
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal warning-modal" style="text-align:center;">
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
  overlay.innerHTML = `<div class="modal warning-modal" style="text-align:center;">
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

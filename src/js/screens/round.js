import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { finishRoundManual, attemptsLeft, relayCheck } from "../gameLogic.js";
import { openPause, showConfirm } from "./modals.js";
import { effectiveRoundTime, attemptsPerRound } from "./config/modes.js";
import { formatPoints } from "../scoring.js";
import { relayRules, relaysLeftThisRound } from "../relay.js";
import { openRelay, openRelayAdjust } from "./relayModals.js";
import { muteButtonHTML } from "../sound.js";
import { ICONS } from "../icons.js";
import { openSheet } from "./sheet.js";
import { settingsBody } from "./menu.js";
import { botonAyuda, conectarAyudas, abrirAyuda } from "./ayudaBotones.js";
import { puedeSerPantalla, puedeSerControl, hayControl } from "../vinculo.js";
import { abrirVincularPC, abrirCompartirPartida } from "./vincular.js";
import { empezarEscucha } from "../voz.js";
import { escuchaCanto } from "../edicion.js";
import { deshacerToque } from "./verify.js";

/** En Grupal, cada lado usa el color de su grupo (el mismo de "Organizar"). */
function groupColorClass(groupIndex) {
  return groupIndex === null || groupIndex === undefined ? "" : `group-color-${groupIndex % 5}`;
}

export function screenRound() {
  const r = state.round;
  const c = state.config;
  const roundTime = effectiveRoundTime(c); // Clásico: sin reloj
  const scoreA = state.scores[r.participantA];
  const scoreB = state.scores[r.participantB];
  const pctA = Math.max(0, Math.min(100, Math.round((scoreA / c.targetScore) * 100)));
  const pctB = Math.max(0, Math.min(100, Math.round((scoreB / c.targetScore) * 100)));

  // Relevo (Grupal, Alternativo 1 y 2): un símbolo por cada relevo de la
  // partida (encendidos los que le quedan), el botón "Relevo" y "±" para
  // agregar o quitar.
  const relays = relayRules(c);
  const limit = attemptsPerRound(c);
  function relayBar(side) {
    if (!relays) return "";
    const team = side === "A" ? r.participantA : r.participantB;
    const left = state.relays[team] ?? 0;
    const icons = Array.from({ length: relays.total }, (_, i) =>
      `<span class="relay-dot ${i < left ? "on" : ""}">🔁</span>`).join("");
    const extra = left > relays.total ? `<span class="relay-extra">+${left - relays.total}</span>` : "";
    // Alternativo 2: también cuántos le quedan en esta ronda (el total cuenta rondas).
    // Con 0 en total no hay relevos (relayRules devuelve null).
    const inRound = relays.lifeline
      ? `<span class="relay-round" title="Relevos que le quedan en esta ronda">Ronda: ${relaysLeftThisRound(r.relaysThisRound?.[side] || 0, left, relays.perRound)}</span>`
      : "";
    return `<div class="relay-bar">
      <span class="relay-icons" title="Relevos que le quedan (en total)">${icons}${extra}</span>${inRound}
      <button type="button" class="btn btn-secondary relay-btn" data-relay="${side}">Relevo</button>
      <button type="button" class="icon-btn icon-btn-round relay-adjust" data-relay-adjust="${side}" title="Agregar o quitar relevos">±</button>
      ${botonAyuda("relevoRonda")}
    </div>`;
  }

  /** Quién canta por el lado: el representante o, con el comodín, solo el nombre del compañero llamado. */
  function singerLine(side) {
    const name = r.sub?.[side] || (side === "A" ? r.showA : r.showB);
    return name ? `<div class="sub">${name}</div>` : "";
  }

  const root = el(`<div class="screen round-screen">
    <div class="top-bar">
      <div class="top-bar-izq"><button class="icon-btn icon-btn-round" id="pause" aria-label="Pausa">⏸</button></div>
      <div class="top-bar-actions">
        ${botonVincularRonda()}
        <button class="icon-btn icon-btn-round" id="help">❓</button>
        ${muteButtonHTML()}
        <button class="icon-btn icon-btn-round" id="round-settings" aria-label="Ajustes">${ICONS.settings()}</button>
      </div>
    </div>
    <div class="stage">
      <div class="side a ${groupColorClass(r.groupA)}">
        <button class="name-btn" id="btn-a">
          ${r.participantA}${singerLine("A")}
          <span class="score ${scoreA < 0 ? "score-negative" : ""}">${formatPoints(scoreA)} pts</span>
        </button>
        <div class="progress-track"><div class="progress-fill" style="width:${pctA}%;"></div></div>
        ${relayBar("A")}
      </div>

      <div class="center-stage con-esquina">
        ${r.phase === "intro" ? `
          <div class="round-loading">
            <div class="round-loading-mic">🎤</div>
            <div class="round-loading-title">${r.participantA} VS ${r.participantB}</div>
            <div class="loader-bar"><div class="loader-bar-fill round-loading-fill"></div></div>
          </div>
        ` : `
          <div class="clock reloj-grande ${roundTime > 0 ? "" : "sin-reloj"} ${roundTime > 0 && r.timeLeft <= 5 ? "warn" : ""}">🕐 <span>${roundTime > 0 ? r.timeLeft + "s" : "Sin tiempo"}</span></div>
          <div class="word-wrap">
            <div class="word">${r.word.toUpperCase()}</div>
            ${r.multiplier ? `<div class="multiplier">×${r.multiplier}</div>` : ""}
          </div>
          ${roundTime === 0 ? `<button class="btn btn-ghost" id="finish-round">⏹️ Finalizar ronda</button>` : ""}
        `}
      </div>

      <div class="side b ${groupColorClass(r.groupB)}">
        <button class="name-btn" id="btn-b">
          ${r.participantB}${singerLine("B")}
          <span class="score ${scoreB < 0 ? "score-negative" : ""}">${formatPoints(scoreB)} pts</span>
        </button>
        <div class="progress-track"><div class="progress-fill" style="width:${pctB}%;"></div></div>
        ${relayBar("B")}
      </div>
    </div>
  </div>`);

  ["A", "B"].forEach((side) => {
    const btn = root.querySelector(`#btn-${side.toLowerCase()}`);
    const left = attemptsLeft(side);
    if (r.phase !== "counting") {
      btn.disabled = true;
    } else if (left <= 0) {
      // Sin intentos en esta ronda (Clásico: 1; Alternativo 2: los elegidos).
      btn.disabled = true;
      btn.classList.add("attempt-used");
      btn.appendChild(el(`<span class="attempt-badge">${limit === 1 ? "Ya usó su intento" : "Sin intentos"}</span>`));
    } else {
      // Alternativo 2: cuántos intentos le quedan a ese lado.
      if (Number.isFinite(limit) && limit > 1) {
        btn.appendChild(el(`<span class="attempt-left">🎯 Quedan ${left}</span>`));
      }
      // Con un celular vinculado, los nombres se tocan en el celular (usuario, 12-10-2026)
      btn.classList.toggle("solo-control", hayControl());
      btn.onclick = () => { if (!hayControl()) openVerification(side); };
    }
  });

  root.querySelectorAll("[data-relay]").forEach((b) => {
    const side = b.dataset.relay;
    const { status } = relayCheck(side);
    if (r.phase !== "counting" || status === "blocked") {
      b.disabled = true;
    } else {
      if (status === "extra") b.classList.add("relay-btn-extra"); // relevo de más: con penalización
      b.onclick = () => openRelay(side);
    }
  });
  root.querySelectorAll("[data-relay-adjust]").forEach((b) => {
    b.onclick = () => openRelayAdjust(b.dataset.relayAdjust);
  });

  root.querySelector("#pause").onclick = () => openPause();
  const vincular = root.querySelector("#vincular");
  if (vincular) vincular.onclick = () => (puedeSerPantalla() ? abrirVincularPC() : abrirCompartirPartida());
  // ❓ de la ronda: explica la ronda (antes estaba en un (?) del centro; usuario, 12-10-2026)
  root.querySelector("#help").onclick = () => abrirAyuda("ronda");
  root.querySelector("#round-settings").onclick = () => openSheet({ title: "Ajustes", body: settingsBody(), side: "left" });
  const fr = root.querySelector("#finish-round");
  if (fr) fr.onclick = () => showConfirm({
    title: "¿Desean finalizar esta ronda?",
    noText: "No, seguir",
    yesText: "Sí, finalizar",
    onYes: finishRoundManual,
  });
  conectarAyudas(root); // botoncitos (?)

  return root;
}

/**
 * Botón de la ronda para vincular (usuario, 12-10-2026): en la PC muestra el QR y
 * el código para que el celular sea el control; en el celular, "Vincular" (igual que en la PC; usuario, 12-10-2026)
 * pasa la partida a la PC. El reloj se detiene mientras está abierto.
 */
function botonVincularRonda() {
  if (puedeSerPantalla()) return `<button class="icon-btn" id="vincular">📱 ${hayControl() ? "Vinculado" : "Vincular"}</button>`;
  if (puedeSerControl()) return `<button class="icon-btn" id="vincular">📱 Vincular</button>`;
  return "";
}

/** El celular vinculado pide el turno de un lado (vinculo.js): solo si ese lado puede tocar ahora. */
export function pedirTurno(side) {
  const r = state.round;
  if (state.screen !== "round" || r.phase !== "counting" || r.paused || attemptsLeft(side) <= 0) return;
  openVerification(side);
}

function openVerification(side) {
  // Para "← Volver" en "¡Ana canta!" (si se tocó sin querer): cómo estaba antes del toque
  state.round.antesDelToque = { attempted: { ...state.round.attempted }, answeredAt: { ...state.round.answeredAt } };
  state.round.paused = true;
  state.round.selected = side;
  state.round.attempted = { ...state.round.attempted, [side]: true }; // Alternativo 1: ya no puede pedir relevo
  // Velocidad para el MVP: segundos desde que apareció la palabra hasta que
  // se tocó el botón de este lado (lo toca el jugador que quiere cantar).
  state.round.answeredAt = { ...state.round.answeredAt, [side]: state.round.elapsed || 0 };
  state.verify = { query: "", results: [], selectedSong: null };
  state.screen = "verify";
  render();
  // 3 segundos escuchando: si nadie canta, vuelve a la ronda (voz.js; usuario, 12-10-2026)
  // Escuchar el canto es de pago (versión completa) y no está en la demo (edicion.js)
  if (escuchaCanto()) empezarEscucha({ conControl: hayControl(), alSilencio: deshacerToque });
}

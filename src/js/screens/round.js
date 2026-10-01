import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { finishRoundManual } from "../gameLogic.js";
import { openPause, openHelp, showConfirm } from "./modals.js";
import { modeName, effectiveRoundTime } from "./config/modes.js";
import { formatPoints } from "../scoring.js";
import { hasRelay, canRequestRelay } from "../relay.js";
import { openRelay, openRelayAdjust } from "./relayModals.js";

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

  // Relevo (solo Alternativo 1 – Grupal): 3 símbolos con los relevos que le
  // quedan al equipo, el botón "Relevo" y "±" para agregar o quitar.
  const relayOn = hasRelay(c.mode, c.battleType);
  function relayBar(side) {
    if (!relayOn) return "";
    const team = side === "A" ? r.participantA : r.participantB;
    const left = state.relays[team] ?? 0;
    const icons = Array.from({ length: Math.max(3, Math.min(left, 3)) }, (_, i) =>
      `<span class="relay-dot ${i < left ? "on" : ""}">🔁</span>`).join("");
    const extra = left > 3 ? `<span class="relay-extra">+${left - 3}</span>` : "";
    return `<div class="relay-bar">
      <span class="relay-icons" title="Relevos que le quedan">${icons}${extra}</span>
      <button type="button" class="btn btn-secondary relay-btn" data-relay="${side}">Relevo</button>
      <button type="button" class="icon-btn icon-btn-round relay-adjust" data-relay-adjust="${side}" title="Agregar o quitar relevos">±</button>
    </div>`;
  }

  const root = el(`<div class="screen">
    <div class="top-bar">
      <span class="panel-title">${c.battleType === "grupal" ? "MODO GRUPAL" : "MODO INDIVIDUAL"} · ${modeName(c.mode).toUpperCase()}</span>
      <div class="top-bar-actions">
        <button class="icon-btn" id="pause">⏸ Pausa</button>
        <button class="icon-btn icon-btn-round" id="help">❓</button>
      </div>
    </div>
    <div class="stage">
      <div class="side a ${groupColorClass(r.groupA)}">
        <button class="name-btn" id="btn-a">
          ${r.participantA}${r.showA ? `<div class="sub">${r.showA}</div>` : ""}
          <span class="score ${scoreA < 0 ? "score-negative" : ""}">${formatPoints(scoreA)} pts</span>
        </button>
        <div class="progress-track"><div class="progress-fill" style="width:${pctA}%;"></div></div>
        ${relayBar("A")}
      </div>

      <div class="center-stage">
        ${r.phase === "intro" ? `
          <div class="round-loading">
            <div class="round-loading-mic">🎤</div>
            <div class="round-loading-title">${r.participantA} VS ${r.participantB}</div>
            <div class="loader-bar"><div class="loader-bar-fill round-loading-fill"></div></div>
          </div>
        ` : `
          <div class="clock ${roundTime > 0 && r.timeLeft <= 5 ? "warn" : ""}">🕐 <span>${roundTime > 0 ? r.timeLeft + "s" : "Sin tiempo"}</span></div>
          <div class="word-wrap">
            <div class="word">${r.word.toUpperCase()}</div>
            ${r.multiplier ? `<div class="multiplier">×${r.multiplier}</div>` : ""}
          </div>
          ${roundTime === 0 ? `<button class="btn btn-ghost" id="finish-round">⏹️ Finalizar ronda</button>` : ""}
        `}
      </div>

      <div class="side b ${groupColorClass(r.groupB)}">
        <button class="name-btn" id="btn-b">
          ${r.participantB}${r.showB ? `<div class="sub">${r.showB}</div>` : ""}
          <span class="score ${scoreB < 0 ? "score-negative" : ""}">${formatPoints(scoreB)} pts</span>
        </button>
        <div class="progress-track"><div class="progress-fill" style="width:${pctB}%;"></div></div>
        ${relayBar("B")}
      </div>
    </div>
  </div>`);

  const failed = r.failed || {};
  ["A", "B"].forEach((side) => {
    const btn = root.querySelector(`#btn-${side.toLowerCase()}`);
    if (r.phase !== "counting") {
      btn.disabled = true;
    } else if (failed[side]) {
      // Clásico: ya usó su único intento en esta ronda.
      btn.disabled = true;
      btn.classList.add("attempt-used");
      btn.appendChild(el(`<span class="attempt-badge">Ya usó su intento</span>`));
    } else {
      btn.onclick = () => openVerification(side);
    }
  });

  root.querySelectorAll("[data-relay]").forEach((b) => {
    const side = b.dataset.relay;
    if (r.phase !== "counting" || !canRequestRelay(r, side)) b.disabled = true;
    else b.onclick = () => openRelay(side);
  });
  root.querySelectorAll("[data-relay-adjust]").forEach((b) => {
    b.onclick = () => openRelayAdjust(b.dataset.relayAdjust);
  });

  root.querySelector("#pause").onclick = () => openPause();
  root.querySelector("#help").onclick = () => openHelp();
  const fr = root.querySelector("#finish-round");
  if (fr) fr.onclick = () => showConfirm({
    title: "¿Desean finalizar esta ronda?",
    noText: "No, seguir",
    yesText: "Sí, finalizar",
    onYes: finishRoundManual,
  });

  return root;
}

function openVerification(side) {
  state.round.paused = true;
  state.round.selected = side;
  state.round.attempted = { ...state.round.attempted, [side]: true }; // ya no puede pedir relevo
  // Velocidad para el MVP: segundos desde que apareció la palabra hasta que
  // se tocó el botón de este lado (hoy lo toca el moderador).
  state.round.answeredAt = { ...state.round.answeredAt, [side]: state.round.elapsed || 0 };
  state.verify = { query: "", results: [], selectedSong: null };
  state.screen = "verify";
  render();
}

import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { finishRoundManual, attemptsLeft, relayCheck } from "../gameLogic.js";
import { openPause, openHelp, showConfirm } from "./modals.js";
import { modeName, effectiveRoundTime, attemptsPerRound } from "./config/modes.js";
import { formatPoints } from "../scoring.js";
import { relayRules, relaysLeftThisRound } from "../relay.js";
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
    const inRound = relays.lifeline
      ? `<span class="relay-round" title="Relevos que le quedan en esta ronda">Ronda: ${relaysLeftThisRound(r.relaysThisRound?.[side] || 0, left, relays.perRound)}</span>`
      : "";
    return `<div class="relay-bar">
      <span class="relay-icons" title="Relevos que le quedan (en total)">${icons}${extra}</span>${inRound}
      <button type="button" class="btn btn-secondary relay-btn" data-relay="${side}">Relevo</button>
      <button type="button" class="icon-btn icon-btn-round relay-adjust" data-relay-adjust="${side}" title="Agregar o quitar relevos">±</button>
    </div>`;
  }

  /** Quién canta por el lado: el representante o, con el comodín, el compañero llamado. */
  function singerLine(side) {
    const show = side === "A" ? r.showA : r.showB;
    const sub = r.sub?.[side];
    if (sub) return `<div class="sub">🔁 ${sub} <span class="sub-note">por ${show}</span></div>`;
    return show ? `<div class="sub">${show}</div>` : "";
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
          ${r.participantA}${singerLine("A")}
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
      btn.onclick = () => openVerification(side);
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
  state.round.attempted = { ...state.round.attempted, [side]: true }; // Alternativo 1: ya no puede pedir relevo
  // Velocidad para el MVP: segundos desde que apareció la palabra hasta que
  // se tocó el botón de este lado (hoy lo toca el moderador).
  state.round.answeredAt = { ...state.round.answeredAt, [side]: state.round.elapsed || 0 };
  state.verify = { query: "", results: [], selectedSong: null };
  state.screen = "verify";
  render();
}

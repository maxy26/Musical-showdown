import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { finishRoundManual } from "../gameLogic.js";
import { openPause, openHelp, showConfirm } from "./modals.js";
import { muteButtonHTML, bindMuteButtons } from "../sound.js";
import { modeName } from "./config/modes.js";

export function screenRound() {
  const r = state.round;
  const c = state.config;
  const scoreA = state.scores[r.participantA];
  const scoreB = state.scores[r.participantB];
  const pctA = Math.min(100, Math.round((scoreA / c.targetScore) * 100));
  const pctB = Math.min(100, Math.round((scoreB / c.targetScore) * 100));

  const root = el(`<div class="screen">
    <div class="top-bar">
      <span class="panel-title">${c.battleType === "grupal" ? "MODO GRUPAL" : "MODO INDIVIDUAL"} · ${modeName(c.mode).toUpperCase()}</span>
      <div class="top-bar-actions">
        <button class="icon-btn" id="pause">⏸ Pausa</button>
        <button class="icon-btn icon-btn-round" id="help">❓</button>
        ${muteButtonHTML()}
      </div>
    </div>
    <div class="stage">
      <div class="side a">
        <button class="name-btn" id="btn-a">
          ${r.participantA}${r.showA ? `<div class="sub">${r.showA}</div>` : ""}
          <span class="score">${scoreA} pts</span>
        </button>
        <div class="progress-track"><div class="progress-fill" style="width:${pctA}%;"></div></div>
      </div>

      <div class="center-stage">
        ${r.phase === "intro" ? `
          <div class="round-loading">
            <div class="round-loading-mic">🎤</div>
            <div class="round-loading-title">${r.participantA} VS ${r.participantB}</div>
            <div class="loader-bar"><div class="loader-bar-fill round-loading-fill"></div></div>
          </div>
        ` : `
          <div class="clock ${c.roundTime > 0 && r.timeLeft <= 5 ? "warn" : ""}">🕐 <span>${c.roundTime > 0 ? r.timeLeft + "s" : "Sin tiempo"}</span></div>
          <div class="word-wrap">
            <div class="word">${r.word.toUpperCase()}</div>
            ${r.multiplier ? `<div class="multiplier">×${r.multiplier}</div>` : ""}
          </div>
          ${c.roundTime === 0 ? `<button class="btn btn-ghost" id="finish-round">⏹️ Finalizar ronda</button>` : ""}
        `}
      </div>

      <div class="side b">
        <button class="name-btn" id="btn-b">
          ${r.participantB}${r.showB ? `<div class="sub">${r.showB}</div>` : ""}
          <span class="score">${scoreB} pts</span>
        </button>
        <div class="progress-track"><div class="progress-fill" style="width:${pctB}%;"></div></div>
      </div>
    </div>
  </div>`);

  if (r.phase === "counting") {
    root.querySelector("#btn-a").onclick = () => openVerification("A");
    root.querySelector("#btn-b").onclick = () => openVerification("B");
  } else {
    root.querySelector("#btn-a").disabled = true;
    root.querySelector("#btn-b").disabled = true;
  }

  root.querySelector("#pause").onclick = () => openPause();
  root.querySelector("#help").onclick = () => openHelp();
  bindMuteButtons(root);
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
  state.verify = { query: "", results: [], selectedSong: null };
  state.screen = "verify";
  render();
}

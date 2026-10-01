import { state, resetState } from "../state.js";
import { el, escapeHtml } from "../utils.js";
import { render } from "../router.js";
import { startNextRound, resetMatchTracking } from "../gameLogic.js";
import { formatPoints } from "../scoring.js";
import { buildPodium, pickMvp } from "../podium.js";
import { groupName } from "../groups.js";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };
// Orden en pantalla: 2.º a la izquierda, 1.º al centro (más alto), 3.º a la derecha.
const STEP_ORDER = [2, 1, 3];

/**
 * Pantalla final: ganador, podio de los 3 mejores puestos (los empatados
 * comparten el puesto; en Grupal, con el MVP de cada grupo) y "Ver más" con
 * el resto. Reglas: CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3.
 */
export function screenResults() {
  const c = state.config;
  const grupal = c.battleType === "grupal";
  const { steps, rest } = buildPodium(state.scores);
  const pts = (n) => `<span class="${n < 0 ? "score-negative" : ""}">${formatPoints(n)} pts</span>`;

  // Grupal: jugadores de cada grupo, para calcular su MVP.
  const playersOf = (name) => {
    const i = state.groups.findIndex((g, gi) => groupName(g, gi, c.groupTerm) === name);
    return i >= 0 ? state.groups[i].players : [];
  };
  const mvpLine = (name) => {
    if (!grupal) return "";
    const mvp = pickMvp(playersOf(name), state.contrib, state.answerTimes);
    return mvp.length ? `<div class="podium-mvp">⭐ MVP: ${mvp.map(escapeHtml).join(" y ")}</div>` : "";
  };

  const stepHtml = (place) => {
    const step = steps.find((s) => s.place === place);
    if (!step) return "";
    return `<div class="podium-step podium-${place}">
      <div class="podium-medal">${MEDALS[place]}</div>
      ${step.entries.map((e) => `<div class="podium-entry">
        <div class="podium-name">${escapeHtml(e.name)}</div>
        <div class="podium-points">${pts(e.points)}</div>
        ${mvpLine(e.name)}
      </div>`).join("")}
      <div class="podium-block">${place}</div>
    </div>`;
  };

  const root = el(`<div class="screen">
    <div class="card result-banner">
      <div class="panel-title">GANADOR</div>
      <div class="big" style="font-size:32px;">${escapeHtml(state.winner)}</div>
      <div class="pts" style="color:var(--gold);">${formatPoints(state.scores[state.winner])} pts</div>
      <div class="podium">${STEP_ORDER.map(stepHtml).join("")}</div>
      ${rest.length ? `
      <button class="btn btn-ghost" id="ver-mas" style="margin-top:6px;">Ver más</button>
      <div id="others" class="hidden" style="margin-top:14px;text-align:left;">
        ${rest.map((r) => `<div class="others-row">
          <span>${r.place}. ${escapeHtml(r.name)}</span>${pts(r.points)}</div>`).join("")}
      </div>` : ""}
      <div class="btn-row" style="margin-top:22px;justify-content:center;">
        <button class="btn btn-primary" id="again">Jugar de nuevo</button>
        <button class="btn btn-secondary" id="menu">Volver al menú</button>
      </div>
    </div>
  </div>`);

  const verMas = root.querySelector("#ver-mas");
  if (verMas) verMas.onclick = () => root.querySelector("#others").classList.toggle("hidden");
  root.querySelector("#again").onclick = () => {
    Object.keys(state.scores).forEach((k) => (state.scores[k] = 0));
    state.usedSongs = [];
    resetMatchTracking();
    if (grupal) {
      state.screen = "team-org";
    } else {
      startNextRound();
    }
    render();
  };
  root.querySelector("#menu").onclick = () => {
    resetState();
    render();
  };

  return root;
}

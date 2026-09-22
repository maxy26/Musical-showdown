import { state, resetState } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { startNextRound } from "../gameLogic.js";

export function screenResults() {
  const c = state.config;
  const others = Object.keys(state.scores)
    .filter((k) => k !== state.winner)
    .sort((a, b) => state.scores[b] - state.scores[a]);

  const root = el(`<div class="screen">
    <div class="card result-banner">
      <div class="panel-title">GANADOR</div>
      <div class="big" style="font-size:32px;">${state.winner}</div>
      <div class="pts" style="color:var(--gold);">${state.scores[state.winner]} pts</div>
      <button class="btn btn-ghost" id="ver-mas" style="margin-top:6px;">Ver más</button>
      <div id="others" class="hidden" style="margin-top:14px;text-align:left;">
        ${others
          .map(
            (o) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
          <span>${o}</span><span>${state.scores[o]} pts</span></div>`
          )
          .join("")}
      </div>
      <div class="btn-row" style="margin-top:22px;justify-content:center;">
        <button class="btn btn-primary" id="again">Jugar de nuevo</button>
        <button class="btn btn-secondary" id="menu">Volver al menú</button>
      </div>
    </div>
  </div>`);

  root.querySelector("#ver-mas").onclick = () => root.querySelector("#others").classList.toggle("hidden");
  root.querySelector("#again").onclick = () => {
    Object.keys(state.scores).forEach((k) => (state.scores[k] = 0));
    state.usedSongs = [];
    if (c.battleType === "grupal") {
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

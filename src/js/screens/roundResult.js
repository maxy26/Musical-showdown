import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { startNextRound } from "../gameLogic.js";

export function screenRoundResultIncorrect() {
  const root = el(`<div class="screen">
    <div class="card result-banner">
      <div class="big">❌ Respuesta incorrecta</div>
      <p class="small-note">La canción no queda bloqueada. El intento no otorga puntos. Puede volver a intentar cualquier participante de esta ronda.</p>
      <button class="btn btn-primary" id="continue">Continuar ronda</button>
    </div>
  </div>`);
  root.querySelector("#continue").onclick = () => {
    state.round.paused = false;
    state.screen = "round";
    render();
  };
  return root;
}

export function screenRoundResult() {
  const r = state.round;
  const c = state.config;
  let content;
  if (r.lastResult.type === "timeout") {
    content = `<div class="big">⏰ ¡Tiempo agotado!</div><p class="panel-title">Sin ganador · +0 puntos</p>`;
  } else if (r.lastResult.type === "finished") {
    content = `<div class="big">⏹️ Ronda finalizada</div><p class="panel-title">Sin ganador · +0 puntos</p>`;
  } else {
    content = `<div class="big">✅ ¡Correcto!</div>
      <div class="pts" style="color:var(--gold);">+${r.lastResult.pts}</div>
      <p class="panel-title">${r.lastResult.who}: ${r.lastResult.newScore - r.lastResult.pts} → ${r.lastResult.newScore}</p>`;
  }

  const root = el(`<div class="screen"><div class="card result-banner">${content}
    <button class="btn btn-primary" id="next" style="margin-top:10px;">Siguiente enfrentamiento</button>
  </div></div>`);

  root.querySelector("#next").onclick = () => {
    const winner = Object.keys(state.scores).find((k) => state.scores[k] >= c.targetScore);
    if (winner) {
      state.winner = winner;
      state.screen = "results";
    } else {
      startNextRound();
    }
    render();
  };
  return root;
}

import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { startNextRound, attemptsLeft } from "../gameLogic.js";
import { formatPoints, formatDelta } from "../scoring.js";

export function screenRoundResultIncorrect() {
  const r = state.round;
  const who = r.lastResult.who;
  const other = who === r.participantA ? r.participantB : r.participantA;
  const left = r.lastResult.left;
  const otherCanTry = attemptsLeft(who === r.participantA ? "B" : "A") > 0;
  // Clásico: 1 intento por lado; Alternativo 1: ilimitados; Alternativo 2: los elegidos.
  let note;
  if (!Number.isFinite(left)) {
    note = "El intento no otorga puntos. Puede volver a intentar cualquier participante de esta ronda.";
  } else if (left > 0) {
    note = `A ${who} le ${left === 1 ? "queda 1 intento" : `quedan ${left} intentos`} en esta ronda.`;
  } else {
    note = `${who} ya no tiene intentos en esta ronda.${otherCanTry ? ` Ahora solo puede intentarlo ${other}.` : ""}`;
  }
  const root = el(`<div class="screen">
    <div class="card result-banner">
      <div class="big">❌ Respuesta incorrecta</div>
      <p class="small-note">${note}</p>
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
  const result = r.lastResult;
  const changes = result.changes || [];
  const anyLoss = changes.some((ch) => ch.delta < 0);
  // Una línea por lado con su cambio de puntos (solo si alguien ganó o perdió).
  const lines = changes.some((ch) => ch.delta !== 0) ? `<div class="score-changes">${changes.map((ch) => `
      <div class="score-change">
        <span>${ch.who}</span>
        <span>${formatPoints(ch.newScore - ch.delta)} → <b class="${ch.newScore < 0 ? "score-negative" : ""}">${formatPoints(ch.newScore)}</b>
          <span class="delta ${ch.delta < 0 ? "delta-negative" : ch.delta > 0 ? "delta-positive" : ""}">${formatDelta(ch.delta)}</span></span>
      </div>`).join("")}</div>` : "";
  let content;
  if (result.type === "timeout") {
    content = `<div class="big">⏰ ¡Tiempo agotado!</div>
      <p class="panel-title">Sin ganador · ${anyLoss ? "los dos restan la mitad del valor de la ronda" : "+0 puntos"}</p>${lines}`;
  } else if (result.type === "both-failed") {
    content = `<div class="big">❌ Nadie acertó</div>
      <p class="panel-title">Los dos agotaron sus intentos · ${anyLoss ? "los dos restan la mitad del valor de la ronda" : "+0 puntos"}</p>${lines}`;
  } else if (result.type === "finished") {
    content = `<div class="big">⏹️ Ronda finalizada</div>
      <p class="panel-title">Sin ganador · ${anyLoss ? "los dos restan la mitad del valor de la ronda" : "+0 puntos"}</p>${lines}`;
  } else {
    content = `<div class="big">✅ ¡Correcto!</div>
      <div class="pts" style="color:var(--gold);">+${result.pts}</div>${lines}`;
  }

  const root = el(`<div class="screen"><div class="card result-banner">${content}
    <button class="btn btn-primary" id="next" style="margin-top:10px;">Siguiente enfrentamiento</button>
  </div></div>`);

  root.querySelector("#next").onclick = () => {
    // Gana el que llegó al objetivo; si con la penalización del relevo llegaron
    // varios, el que tiene más puntos.
    const reached = Object.keys(state.scores).filter((k) => state.scores[k] >= c.targetScore);
    const winner = reached.sort((x, y) => state.scores[y] - state.scores[x])[0];
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

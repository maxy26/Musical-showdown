import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { startNextRound, attemptsLeft } from "../gameLogic.js";
import { formatPoints, formatDelta } from "../scoring.js";

/**
 * Cómo quedan los puntos (usuario, 12-10-2026: "más animado y notable, y cómo
 * quedan"): una fila por jugador o equipo con lo que ganó o perdió (aparece de
 * golpe) y su puntaje, que sube o baja hasta el nuevo valor.
 * `cambios`: [{ who, delta, newScore }].
 */
function tablaPuntos(cambios) {
  return `<div class="puntos-ronda">${cambios.map((ch) => `
    <div class="puntos-fila ${ch.delta > 0 ? "sube" : ch.delta < 0 ? "baja" : "igual"}">
      <span class="puntos-nombre">${ch.who}</span>
      <span class="puntos-delta">${ch.delta === 0 ? "±0" : formatDelta(ch.delta)}</span>
      <span class="puntos-total"><b class="${ch.newScore < 0 ? "score-negative" : ""}" data-desde="${ch.newScore - ch.delta}" data-hasta="${ch.newScore}">${formatPoints(ch.newScore - ch.delta)}</b> pts</span>
    </div>`).join("")}</div>`;
}

/** Los puntajes cuentan desde el valor anterior hasta el nuevo. */
function animarPuntos(root) {
  root.querySelectorAll("[data-hasta]").forEach((b) => {
    const desde = Number(b.dataset.desde), hasta = Number(b.dataset.hasta);
    if (desde === hasta) return;
    const inicio = Date.now() + 450; // después de que aparece el +/−
    const paso = () => {
      const t = Math.min(1, Math.max(0, (Date.now() - inicio) / 900));
      const suave = 1 - (1 - t) ** 3;
      b.textContent = formatPoints(Math.round(desde + (hasta - desde) * suave));
      b.classList.toggle("score-negative", Number(b.textContent.replace(/[^\d-]/g, "")) < 0);
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}

export function screenRoundResultIncorrect() {
  const r = state.round;
  const who = r.lastResult.who;
  const other = who === r.participantA ? r.participantB : r.participantA;
  const left = r.lastResult.left;
  const otherCanTry = attemptsLeft(who === r.participantA ? "B" : "A") > 0;
  // Clásico: 1 intento por lado; Alternativo 1: ilimitados; Alternativo 2: los elegidos.
  let note;
  if (!Number.isFinite(left)) {
    note = "Pueden volver a intentarlo.";
  } else if (left > 0) {
    note = `${who}: ${left === 1 ? "1 intento más" : `${left} intentos más`}`;
  } else {
    note = otherCanTry ? `Turno de ${other}` : `${who} ya no tiene intentos`;
  }
  // Cómo quedan los dos (al fallar no cambian los puntos)
  const quedan = [r.participantA, r.participantB].map((n) => ({ who: n, delta: 0, newScore: state.scores[n] ?? 0 }));
  const root = el(`<div class="screen">
    <div class="card result-banner">
      <div class="big">❌ Respuesta incorrecta</div>
      <p class="small-note">${note}</p>
      ${tablaPuntos(quedan)}
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
  // Una fila por lado: lo que ganó o perdió y cómo queda (también con ±0)
  const lines = changes.length ? tablaPuntos(changes) : "";
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

  animarPuntos(root);
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

import { state } from "../state.js";
import { escapeHtml } from "../utils.js";
import { render } from "../router.js";
import { useRelay, relayCheck } from "../gameLogic.js";
import { adjustRelays, relayRules, relayPenaltyChanges } from "../relay.js";
import { formatDelta } from "../scoring.js";
import { showConfirm, showToast } from "./modals.js";

/**
 * Ventanas del relevo (Grupal, Alternativo 1 y 2; reglas en
 * CONTEXTO-MUSICAL-SHOWDOWN.md sección 3):
 *   - Pedir relevo: el reloj se pausa solo, se elige a un compañero del equipo
 *     en una lista y se confirma; la ronda sigue con el mismo tiempo.
 *   - Relevo de más (sin relevos o pasado del máximo por ronda): antes sale un
 *     aviso con los puntos exactos. Si se confirma, el relevo se aplica igual y
 *     en ese momento el equipo resta la mitad y el rival suma esa mitad.
 *   - Agregar o quitar relevos de un equipo, con confirmación.
 */

function teamOf(side) {
  const r = state.round;
  const g = side === "A" ? r.groupA : r.groupB;
  return { name: side === "A" ? r.participantA : r.participantB, players: state.groups[g].players };
}

/** Botón "Relevo" de un lado. */
export function openRelay(side) {
  const r = state.round;
  const check = relayCheck(side);
  if (check.status === "blocked") return;
  r.paused = true; // el reloj se pausa solo mientras se elige
  const resume = () => { state.round.paused = false; render(); };

  if (check.status === "extra") {
    const team = teamOf(side).name;
    const other = side === "A" ? r.participantB : r.participantA;
    const penalty = relayPenaltyChanges(side, r.multiplier);
    const rules = relayRules(state.config);
    const title = check.reason === "total"
      ? "🚫 Ya usaron todos sus relevos"
      : `🚫 Ya usaron ${rules.perRound === 1 ? "su relevo" : `sus ${rules.perRound} relevos`} de esta ronda`;
    showConfirm({
      title,
      message: `Pueden usar otro, pero en este momento <b>${formatDelta(penalty[side])} puntos</b> para ${escapeHtml(team)} y <b>${formatDelta(penalty[side === "A" ? "B" : "A"])} puntos</b> para ${escapeHtml(other)}. La ronda sigue.`,
      noText: "Cancelar",
      yesText: "Usarlo igual",
      onYes: () => pickMate(side, true, resume),
    });
    // "Cancelar" cierra la ventana: hay que volver a poner en marcha la ronda.
    document.querySelector("#confirm-no").addEventListener("click", resume);
    return;
  }
  pickMate(side, false, resume);
}

/** Lista para elegir al compañero que entra (o responde, con el comodín) y confirmar. */
function pickMate(side, extra, resume) {
  const r = state.round;
  const team = teamOf(side);
  const rules = relayRules(state.config);
  const current = side === "A" ? r.showA : r.showB; // el representante (o, en Alternativo 1, el que canta ahora)
  const mates = team.players.filter((p) => p !== current);
  const left = state.relays[team.name] || 0;
  const question = rules.lifeline
    ? `${escapeHtml(current)} pide ayuda. ¿Quién responde esta vez?`
    : `${escapeHtml(current)} pide ayuda. ¿Quién canta en su lugar?`;
  const hint = extra
    ? "Relevo de más: no gasta del total y se aplica la penalización."
    : `Les quedan ${left} relevo${left === 1 ? "" : "s"}. Al confirmar se gasta uno.`;
  let chosen = null;
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal relay-modal" style="text-align:center;">
    <h2>🔁 Relevo de ${escapeHtml(team.name)}</h2>
    <p class="small-note" style="margin-top:0;">${question}</p>
    <div class="chip-group relay-mates">${mates.map((p) => `<button type="button" class="chip" data-mate="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join("")}</div>
    <p class="field-hint">${hint}</p>
    <div class="btn-row" style="margin-top:16px;">
      <button class="btn btn-secondary btn-block" id="relay-cancel">Cancelar</button>
      <button class="btn btn-primary btn-block" id="relay-ok" disabled>Confirmar relevo</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  overlay.querySelectorAll("[data-mate]").forEach((b) => (b.onclick = () => {
    chosen = b.dataset.mate;
    overlay.querySelectorAll("[data-mate]").forEach((x) => x.classList.toggle("active", x === b));
    overlay.querySelector("#relay-ok").disabled = false;
  }));
  overlay.querySelector("#relay-cancel").onclick = () => { overlay.remove(); resume(); };
  overlay.querySelector("#relay-ok").onclick = () => {
    if (!chosen) return;
    overlay.remove();
    const penalty = useRelay(side, chosen);
    if (penalty) {
      showToast(`🚫 Relevo de más: ${penalty.map((ch) => `${ch.who} ${formatDelta(ch.delta)}`).join(" · ")}`);
    }
    resume();
  };
}

/** Botón "±": agregar o quitar relevos de un equipo (entre 0 y el total de la partida). */
export function openRelayAdjust(side) {
  const r = state.round;
  const team = teamOf(side);
  const max = relayRules(state.config)?.total ?? 0;
  let value = state.relays[team.name] || 0;
  r.paused = true;
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal relay-modal" style="text-align:center;">
    <h2>Relevos de ${escapeHtml(team.name)}</h2>
    <div class="relay-adjust-row">
      <button type="button" class="step-btn" id="relay-minus" aria-label="Quitar un relevo">−</button>
      <span class="relay-adjust-value" id="relay-value">${value}</span>
      <button type="button" class="step-btn" id="relay-plus" aria-label="Agregar un relevo">+</button>
    </div>
    <p class="field-hint">Por ejemplo, para devolver un relevo usado por error. Máximo ${max} por partida.</p>
    <div class="btn-row" style="margin-top:16px;">
      <button class="btn btn-secondary btn-block" id="relay-cancel">Cancelar</button>
      <button class="btn btn-primary btn-block" id="relay-save">Confirmar</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  const show = () => {
    overlay.querySelector("#relay-value").textContent = value;
    overlay.querySelector("#relay-minus").disabled = value === 0;
    overlay.querySelector("#relay-plus").disabled = value >= max;
  };
  overlay.querySelector("#relay-minus").onclick = () => { value = adjustRelays(value, -1, max); show(); };
  overlay.querySelector("#relay-plus").onclick = () => { value = adjustRelays(value, 1, max); show(); };
  const close = () => { overlay.remove(); state.round.paused = false; render(); };
  overlay.querySelector("#relay-cancel").onclick = close;
  overlay.querySelector("#relay-save").onclick = () => { state.relays[team.name] = value; close(); };
  show();
}

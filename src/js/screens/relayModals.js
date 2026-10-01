import { state } from "../state.js";
import { escapeHtml } from "../utils.js";
import { render } from "../router.js";
import { useRelay, applyRelayPenalty } from "../gameLogic.js";
import { adjustRelays, RELAYS_PER_TEAM, relayPenaltyChanges } from "../relay.js";
import { formatDelta } from "../scoring.js";
import { showConfirm } from "./modals.js";

/**
 * Ventanas del relevo (Alternativo 1 – Grupal; reglas en
 * CONTEXTO-MUSICAL-SHOWDOWN.md sección 3):
 *   - Pedir relevo: el reloj se pausa solo, el jugador elige a un compañero de
 *     su equipo en una lista y confirma; la ronda sigue con el mismo tiempo.
 *     Sin relevos disponibles se puede pedir igual, pero se aplica la
 *     penalización (con confirmación).
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
  const team = teamOf(side);
  const left = state.relays[team.name] || 0;
  r.paused = true; // el reloj se pausa solo mientras se elige
  const resume = () => { state.round.paused = false; render(); };

  if (left === 0) {
    // Relevo prohibido (ya usaron los 3): se avisa a qué se someten antes de confirmar.
    const other = side === "A" ? r.participantB : r.participantA;
    const penalty = relayPenaltyChanges(side, r.multiplier);
    showConfirm({
      title: "🚫 Ya usaron sus 3 relevos",
      message: `Si ${escapeHtml(team.name)} usa un 4.º relevo, pierde la ronda: <b>${formatDelta(penalty[side])} puntos</b> para ${escapeHtml(team.name)} y <b>${formatDelta(penalty[side === "A" ? "B" : "A"])} puntos</b> para ${escapeHtml(other)}, sin cantar.`,
      noText: "Cancelar",
      yesText: "Usarlo igual",
      onYes: () => applyRelayPenalty(side),
    });
    // "Cancelar" cierra la ventana: hay que volver a poner en marcha la ronda.
    document.querySelector("#confirm-no").addEventListener("click", resume);
    return;
  }

  const singer = side === "A" ? r.showA : r.showB;
  const mates = team.players.filter((p) => p !== singer);
  let chosen = null;
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal relay-modal" style="text-align:center;">
    <h2>🔁 Relevo de ${escapeHtml(team.name)}</h2>
    <p class="small-note" style="margin-top:0;">${escapeHtml(singer)} pide ayuda. ¿Quién canta en su lugar?</p>
    <div class="chip-group relay-mates">${mates.map((p) => `<button type="button" class="chip" data-mate="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join("")}</div>
    <p class="field-hint">Les quedan ${left} relevo${left === 1 ? "" : "s"}. Al confirmar se gasta uno.</p>
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
    useRelay(side, chosen);
    resume();
  };
}

/** Botón "±": agregar o quitar relevos de un equipo (entre 0 y 3, el máximo por partida). */
export function openRelayAdjust(side) {
  const r = state.round;
  const team = teamOf(side);
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
    <p class="field-hint">Por ejemplo, para devolver un relevo usado por error. Máximo ${RELAYS_PER_TEAM} por partida.</p>
    <div class="btn-row" style="margin-top:16px;">
      <button class="btn btn-secondary btn-block" id="relay-cancel">Cancelar</button>
      <button class="btn btn-primary btn-block" id="relay-save">Confirmar</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  const show = () => {
    overlay.querySelector("#relay-value").textContent = value;
    overlay.querySelector("#relay-minus").disabled = value === 0;
    overlay.querySelector("#relay-plus").disabled = value === RELAYS_PER_TEAM;
  };
  overlay.querySelector("#relay-minus").onclick = () => { value = adjustRelays(value, -1); show(); };
  overlay.querySelector("#relay-plus").onclick = () => { value = adjustRelays(value, 1); show(); };
  const close = () => { overlay.remove(); state.round.paused = false; render(); };
  overlay.querySelector("#relay-cancel").onclick = close;
  overlay.querySelector("#relay-save").onclick = () => { state.relays[team.name] = value; close(); };
  show();
}

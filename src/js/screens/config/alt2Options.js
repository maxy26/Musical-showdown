import { el } from "../../utils.js";
import { alt2Options, ALT2_LIMITS, ALL_MULTIPLIERS } from "./modes.js";
import { maxRelaysPerRound } from "../../relay.js";

/**
 * Opciones de Alternativo 2 en "Configurar partida" (usuario, 03-10-2026):
 * una fila por opción con "Sí / No" o "− N +", y la ventanita de relevos.
 * Las explicaciones de cada opción irán en su propio botón de ayuda (pendiente).
 */

/** Botones "Sí / No" de una opción. */
function yesNo(key, on) {
  return `<div class="yesno" role="radiogroup" data-yesno="${key}">
    <button type="button" role="radio" data-value="on" class="${on ? "active" : ""}" aria-checked="${on}">Sí</button>
    <button type="button" role="radio" data-value="off" class="${on ? "" : "active"}" aria-checked="${!on}">No</button>
  </div>`;
}

/** Control "− N +". */
function stepper(id, value, label) {
  return `<div class="stepper" data-stepper="${id}">
    <button type="button" data-step="-1" aria-label="Menos ${label}">−</button>
    <output>${value}</output>
    <button type="button" data-step="1" aria-label="Más ${label}">+</button>
  </div>`;
}

/** Texto de la fila de relevos: "3 en total · 1 por ronda" o "Sin relevos". */
export function relaySummary(o) {
  return o.relaysTotal === 0 ? "Sin relevos" : `${o.relaysTotal} en total · ${o.relaysPerRound} por ronda`;
}

/** Filas de las opciones de Alternativo 2 (van dentro de `.opts`). */
export function alt2RowsHTML(c) {
  const o = alt2Options(c);
  return `
    <div class="opt-row"><span>✨ Multiplicadores</span>${yesNo("multipliers", c.multipliers.length > 0)}</div>
    <div class="opt-row"><span>🎯 Intentos</span>${stepper("attempts", o.attempts, "intentos")}</div>
    <div class="opt-row"><span>😢 El perdedor resta</span>${yesNo("loserLoses", o.loserLoses)}</div>
    <div class="opt-row"><span>⌛ Si nadie acierta, ambos restan</span>${yesNo("noneLoseHalf", o.noneLoseHalf)}</div>
    <div class="opt-row"><span>🔁 Relevos por equipo</span>
      <button type="button" class="relay-open pressable" id="relay-settings">${relaySummary(o)} ✎</button></div>`;
}

/** Guarda un cambio de las opciones de Alternativo 2 (los relevos por ronda no pasan de los intentos). */
function saveAlt2(c, patch) {
  const next = { ...alt2Options(c), ...patch };
  if (next.relaysTotal > 0) {
    next.relaysPerRound = Math.min(Math.max(1, next.relaysPerRound), maxRelaysPerRound(next.relaysTotal, next.attempts));
  }
  c.alt2 = next;
}

/** Conecta las filas de Alternativo 2; `rerender` vuelve a dibujar la pantalla. */
export function bindAlt2Options(root, c, rerender) {
  root.querySelectorAll("[data-yesno]").forEach((group) => {
    group.querySelectorAll("button").forEach((b) => (b.onclick = () => {
      const on = b.dataset.value === "on";
      const key = group.dataset.yesno;
      if (key === "multipliers") c.multipliers = on ? [...ALL_MULTIPLIERS] : [];
      else saveAlt2(c, { [key]: on });
      rerender();
    }));
  });
  const attempts = root.querySelector('[data-stepper="attempts"]');
  if (attempts) {
    const [min, max] = ALT2_LIMITS.attempts;
    const value = alt2Options(c).attempts;
    attempts.querySelectorAll("[data-step]").forEach((b) => {
      const next = value + Number(b.dataset.step);
      b.disabled = next < min || next > max;
      b.onclick = () => { saveAlt2(c, { attempts: next }); rerender(); };
    });
  }
  const relayBtn = root.querySelector("#relay-settings");
  if (relayBtn) relayBtn.onclick = () => openRelaySettings(c, rerender);
}

/**
 * Ventanita de relevos: total de la partida (0 a 7; 0 = sin relevos) y máximo
 * por ronda (de 1 hasta el total y hasta los intentos). "Listo" guarda.
 */
function openRelaySettings(c, rerender) {
  const o = alt2Options(c);
  const draft = { total: o.relaysTotal, perRound: o.relaysPerRound };
  const [minTotal, maxTotal] = ALT2_LIMITS.relaysTotal;
  const overlay = el(`<div class="modal-backdrop">
    <div class="modal warning-modal relay-settings">
      <button type="button" class="modal-close" aria-label="Cerrar">✕</button>
      <h2>🔁 Relevos por equipo</h2>
      <div class="opt-row"><span>En total (toda la partida)</span>${stepper("total", draft.total, "relevos en total")}</div>
      <div class="opt-row"><span>Como máximo por ronda</span>${stepper("perRound", draft.perRound, "relevos por ronda")}</div>
      <div class="btn-row" style="margin-top:14px;">
        <button type="button" class="btn btn-secondary" id="relay-settings-cancel" style="flex:1;">Cancelar</button>
        <button type="button" class="btn btn-primary" id="relay-settings-ok" style="flex:1;">Listo</button>
      </div>
    </div>
  </div>`);
  const paint = () => {
    const maxPerRound = maxRelaysPerRound(draft.total, o.attempts);
    if (draft.total > 0) draft.perRound = Math.min(Math.max(1, draft.perRound), maxPerRound);
    const total = overlay.querySelector('[data-stepper="total"]');
    const perRound = overlay.querySelector('[data-stepper="perRound"]');
    total.querySelector("output").textContent = draft.total;
    perRound.querySelector("output").textContent = draft.total === 0 ? "—" : draft.perRound;
    total.querySelector('[data-step="-1"]').disabled = draft.total <= minTotal;
    total.querySelector('[data-step="1"]').disabled = draft.total >= maxTotal;
    perRound.querySelector('[data-step="-1"]').disabled = draft.total === 0 || draft.perRound <= 1;
    perRound.querySelector('[data-step="1"]').disabled = draft.total === 0 || draft.perRound >= maxPerRound;
  };
  overlay.querySelectorAll('[data-stepper="total"] [data-step]').forEach((b) => (b.onclick = () => {
    draft.total += Number(b.dataset.step);
    paint();
  }));
  overlay.querySelectorAll('[data-stepper="perRound"] [data-step]').forEach((b) => (b.onclick = () => {
    draft.perRound += Number(b.dataset.step);
    paint();
  }));
  const close = () => overlay.remove();
  overlay.querySelector(".modal-close").onclick = close;
  overlay.querySelector("#relay-settings-cancel").onclick = close;
  overlay.querySelector("#relay-settings-ok").onclick = () => {
    saveAlt2(c, { relaysTotal: draft.total, relaysPerRound: draft.perRound });
    close();
    rerender();
  };
  document.getElementById("app").appendChild(overlay);
  paint();
}

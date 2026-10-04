/**
 * Relevo (reglas del usuario del 29-09 al 03-10-2026, CONTEXTO-MUSICAL-SHOWDOWN.md
 * sección 3). Funciones puras. Solo en Grupal.
 *
 *   - Alternativo 1: 3 relevos por equipo en la partida y 1 por ronda. El que
 *     entra reemplaza al que pidió el relevo por el resto de la ronda; se pide
 *     antes de que ese lado responda.
 *   - Alternativo 2: el total (0 a 7) y el máximo por ronda se eligen en la
 *     configuración. Funciona como el comodín de llamada: el compañero responde
 *     en lugar del representante (gasta un intento del lado) y, si falla, el
 *     turno vuelve al representante, que puede pedir otro.
 *   - Relevo de más (sin relevos en el total o pasado del máximo por ronda): se
 *     puede usar, con aviso. Se aplica igual y en ese momento el equipo resta la
 *     mitad del valor de la ronda y el rival suma esa misma mitad; la ronda
 *     sigue. Pasarse del máximo por ronda no gasta del total.
 */
import { roundValue } from "./scoring.js";
import { alt2Options } from "./screens/config/modes.js";

/** Relevos de Alternativo 1 (fijos). */
export const RELAYS_PER_TEAM = 3;
export const ALT1_RELAYS_PER_ROUND = 1;

/**
 * Reglas del relevo de la partida, o null si no hay relevo.
 * @returns {{total: number, perRound: number, lifeline: boolean} | null}
 *   `lifeline` = estilo comodín de llamada (Alternativo 2)
 */
export function relayRules(config) {
  if (config.battleType !== "grupal") return null;
  if (config.mode === "alternativo1") {
    return { total: RELAYS_PER_TEAM, perRound: ALT1_RELAYS_PER_ROUND, lifeline: false };
  }
  if (config.mode === "alternativo2") {
    const o = alt2Options(config);
    if (o.relaysTotal <= 0) return null; // 0 = sin relevos
    return { total: o.relaysTotal, perRound: o.relaysPerRound, lifeline: true };
  }
  return null;
}

/** Relevos de un equipo después de agregar (+1) o quitar (−1): entre 0 y `max`. */
export function adjustRelays(current, delta, max = RELAYS_PER_TEAM) {
  return Math.min(max, Math.max(0, current + delta));
}

/**
 * Máximo de relevos por ronda que se puede elegir: de 1 hasta el total y hasta
 * los intentos (cada relevo gasta un intento).
 */
export function maxRelaysPerRound(total, attempts) {
  return Math.max(1, Math.min(total, attempts));
}

/**
 * Qué pasa si este lado pide un relevo ahora:
 *   - "blocked": no se puede (el botón queda desactivado).
 *   - "ok": relevo normal; gasta uno del total.
 *   - "extra": relevo de más (sin relevos o pasado del máximo por ronda); se
 *     puede usar con aviso y penalización. `reason` dice cuál de los dos.
 * @param {object} p
 * @param {object} p.round - state.round (attempted, relaysThisRound, sub)
 * @param {"A"|"B"} p.side
 * @param {number} p.left - relevos que le quedan al equipo
 * @param {{total: number, perRound: number, lifeline: boolean}} p.rules
 * @param {number} p.attemptsLeft - intentos que le quedan al lado en la ronda
 * @returns {{status: "blocked"|"ok"|"extra", reason?: "total"|"round"}}
 */
export function relayStatus({ round, side, left, rules, attemptsLeft }) {
  if (rules.lifeline) {
    // Comodín: no mientras un compañero llamado todavía no responde, ni sin intentos.
    if (round.sub?.[side] || attemptsLeft <= 0) return { status: "blocked" };
  } else if (round.attempted?.[side]) {
    // Alternativo 1: solo antes de que ese lado responda.
    return { status: "blocked" };
  }
  if (left <= 0) return { status: "extra", reason: "total" };
  if ((round.relaysThisRound?.[side] || 0) >= rules.perRound) return { status: "extra", reason: "round" };
  return { status: "ok" };
}

/**
 * Penalización del relevo de más: el equipo que lo usa resta la mitad del valor
 * de la ronda y el rival suma esa misma mitad (con ×3: −150 y +150).
 * @param {"A"|"B"} offenderSide
 */
export function relayPenaltyChanges(offenderSide, multiplier) {
  const half = roundValue(multiplier) / 2;
  return offenderSide === "A" ? { A: -half, B: half } : { A: half, B: -half };
}

/** ¿Este relevo gasta uno del total? El normal sí; el de más, no (ya se pagó con puntos). */
export function relayUsesTotal(status) {
  return status === "ok";
}

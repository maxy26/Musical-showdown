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
 *   - Conteo (usuario, 04-10-2026): el total cuenta las RONDAS en las que el
 *     equipo usa relevos. Apenas usa el primero de la ronda se descuenta 1 del
 *     total, y en esa misma ronda puede usar los que le faltan hasta el máximo
 *     por ronda sin descontar más. En la ronda siguiente el máximo por ronda se
 *     restaura si todavía le quedan en el total. Ejemplo: 5 en total y 3 por
 *     ronda; usa 2 en una ronda → le quedan 4 en total (y 1 más en esa ronda).
 *     En Alternativo 1 (3 y 1) es lo mismo que "cada relevo gasta uno".
 *   - Relevo de más (sin relevos en el total al empezar a usarlos en la ronda,
 *     o pasado del máximo por ronda): se puede usar, con aviso. Se aplica igual
 *     y en ese momento el equipo resta la mitad del valor de la ronda y el
 *     rival suma esa misma mitad; la ronda sigue. No gasta del total.
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
 * Máximo de relevos por ronda que se puede elegir: de 1 hasta los intentos
 * (cada relevo gasta un intento). Ya no depende del total, que cuenta rondas.
 */
export function maxRelaysPerRound(attempts) {
  return Math.max(1, attempts);
}

/**
 * Qué pasa si este lado pide un relevo ahora:
 *   - "blocked": no se puede (el botón queda desactivado).
 *   - "ok": relevo normal. Si es el primero de la ronda, gasta uno del total
 *     (`usesTotal`); los siguientes de la misma ronda, no.
 *   - "extra": relevo de más (sin relevos en el total o pasado del máximo por
 *     ronda); se puede usar con aviso y penalización. `reason` dice cuál.
 * @param {object} p
 * @param {object} p.round - state.round (attempted, relaysThisRound = relevos
 *   normales usados en la ronda, sub)
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
  const usedThisRound = round.relaysThisRound?.[side] || 0;
  if (usedThisRound === 0) {
    // Primer relevo de la ronda: abre la ronda y gasta uno del total.
    return left <= 0 ? { status: "extra", reason: "total" } : { status: "ok", usesTotal: true };
  }
  if (usedThisRound >= rules.perRound) return { status: "extra", reason: "round" };
  return { status: "ok", usesTotal: false };
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

/**
 * Relevos normales que le quedan a un lado en esta ronda: si ya abrió la ronda,
 * los que le faltan del máximo; si no, el máximo completo (o 0 si no le quedan
 * en el total).
 */
export function relaysLeftThisRound(usedThisRound, left, perRound) {
  if (usedThisRound > 0) return Math.max(0, perRound - usedThisRound);
  return left > 0 ? perRound : 0;
}

/**
 * Relevo: comodín de Alternativo 1 – Grupal (reglas definidas por el usuario
 * el 29 y 30-09-2026, CONTEXTO-MUSICAL-SHOWDOWN.md sección 3). Funciones puras.
 *
 *   - 3 relevos por equipo para toda la partida, sin recuperarse. Se pueden
 *     agregar o quitar con un botón (sin máximo; no baja de 0).
 *   - Como mucho 1 por equipo y por ronda, y se pide antes de responder.
 *   - Si se usa sin tener relevos: ese equipo resta la mitad del valor de la
 *     ronda y el otro suma el valor completo sin cantar; la ronda termina.
 */
import { roundValue } from "./scoring.js";

export const RELAYS_PER_TEAM = 3;

/** ¿El modo y el tipo de batalla tienen relevo? Solo Alternativo 1 – Grupal. */
export function hasRelay(mode, battleType) {
  return mode === "alternativo1" && battleType === "grupal";
}

/** Relevos de un equipo después de agregar (+1) o quitar (−1): nunca menos de 0. */
export function adjustRelays(current, delta) {
  return Math.max(0, current + delta);
}

/**
 * ¿Puede este lado pedir relevo ahora? Solo si en esta ronda todavía no lo usó
 * y todavía no respondió. (Si no le quedan relevos, igual puede pedirlo, pero
 * recibe la penalización: ver relayPenaltyChanges.)
 */
export function canRequestRelay(round, side) {
  return !round.relayUsed?.[side] && !round.attempted?.[side];
}

/**
 * Penalización por usar un relevo sin tener: el que lo usó resta la mitad del
 * valor de la ronda y el otro suma el valor completo (con ×2: −100 y +200).
 * @param {"A"|"B"} offenderSide
 */
export function relayPenaltyChanges(offenderSide, multiplier) {
  const value = roundValue(multiplier);
  return offenderSide === "A" ? { A: -value / 2, B: value } : { A: value, B: -value / 2 };
}

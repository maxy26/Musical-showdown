/**
 * Puntos de cada ronda según el modo (reglas definidas por el usuario,
 * CONTEXTO-MUSICAL-SHOWDOWN.md sección 3). Funciones puras para poder probarlas.
 *
 * Valor de la ronda: 100 puntos, o 100 × el multiplicador si salió uno.
 *   - Clásico (y Alternativo 2 mientras no tenga reglas): el que acierta suma
 *     el valor; nadie resta.
 *   - Alternativo 1: el que acierta suma el valor y el que pierde la ronda resta
 *     ese mismo valor, siempre (aunque no haya intentado). Si nadie acierta, los
 *     dos restan la mitad. Los puntajes pueden quedar negativos, sin límite.
 */

export const BASE_POINTS = 100;

/** Valor de la ronda: 100 × multiplicador (sin multiplicador, 100). */
export function roundValue(multiplier) {
  return BASE_POINTS * (multiplier || 1);
}

/**
 * Cambio de puntos de cada lado al terminar la ronda.
 * @param {string} mode - "clasico" | "alternativo1" | "alternativo2"
 * @param {"A"|"B"|null} winnerSide - quién acertó (null = nadie)
 * @param {number|null} multiplier
 * @returns {{A: number, B: number}}
 */
export function roundScoreChanges(mode, winnerSide, multiplier) {
  const value = roundValue(multiplier);
  if (mode === "alternativo1") {
    if (winnerSide === "A") return { A: value, B: -value };
    if (winnerSide === "B") return { A: -value, B: value };
    return { A: -value / 2, B: -value / 2 };
  }
  if (winnerSide === "A") return { A: value, B: 0 };
  if (winnerSide === "B") return { A: 0, B: value };
  return { A: 0, B: 0 };
}

/** Puntos para mostrar: los negativos con el signo menos tipográfico ("−200"). */
export function formatPoints(points) {
  return points < 0 ? `−${Math.abs(points)}` : String(points);
}

/** Cambio de puntos para mostrar, siempre con signo ("+200", "−100", "±0"). */
export function formatDelta(delta) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return "±0";
}

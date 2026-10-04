/**
 * Puntos de cada ronda según el modo (reglas definidas por el usuario,
 * CONTEXTO-MUSICAL-SHOWDOWN.md sección 3). Funciones puras para poder probarlas.
 *
 * Valor de la ronda: 100 puntos, o 100 × el multiplicador si salió uno. Primero
 * se calcula el valor y después se suma o resta.
 *   - Clásico: el que acierta suma el valor; nadie resta.
 *   - Alternativo 1: el que acierta suma el valor y el que pierde la ronda resta
 *     ese mismo valor, siempre (aunque no haya intentado). Si nadie acierta, los
 *     dos restan la mitad. Los puntajes pueden quedar negativos, sin límite.
 *   - Alternativo 2: el que acierta suma el valor; si se eligió, el perdedor
 *     resta lo mismo, y si se eligió, cuando nadie acierta los dos restan la
 *     mitad (ver scoringRules en config/modes.js).
 */

/** Reglas de puntos fijas de Clásico y Alternativo 1 (Alternativo 2 las elige el usuario). */
const MODE_RULES = {
  clasico: { loserLoses: false, noneLoseHalf: false },
  alternativo1: { loserLoses: true, noneLoseHalf: true },
  alternativo2: { loserLoses: false, noneLoseHalf: false },
};

export const BASE_POINTS = 100;

/** Valor de la ronda: 100 × multiplicador (sin multiplicador, 100). */
export function roundValue(multiplier) {
  return BASE_POINTS * (multiplier || 1);
}

/**
 * Cambio de puntos de cada lado al terminar la ronda.
 * @param {string|{loserLoses: boolean, noneLoseHalf: boolean}} rules - el modo
 *   ("clasico" | "alternativo1" | "alternativo2") o sus reglas (scoringRules)
 * @param {"A"|"B"|null} winnerSide - quién acertó (null = nadie)
 * @param {number|null} multiplier
 * @returns {{A: number, B: number}}
 */
export function roundScoreChanges(rules, winnerSide, multiplier) {
  const { loserLoses, noneLoseHalf } = typeof rules === "string" ? MODE_RULES[rules] || MODE_RULES.clasico : rules;
  const value = roundValue(multiplier);
  const lose = loserLoses ? -value : 0;
  if (winnerSide === "A") return { A: value, B: lose };
  if (winnerSide === "B") return { A: lose, B: value };
  const half = noneLoseHalf ? -value / 2 : 0;
  return { A: half, B: half };
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

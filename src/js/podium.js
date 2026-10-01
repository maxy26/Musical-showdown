/**
 * Podio y MVP de la pantalla final (reglas definidas por el usuario el
 * 30-09-2026, CONTEXTO-MUSICAL-SHOWDOWN.md sección 3). Funciones puras.
 *
 *   - Podio en todos los modos: los 3 mejores puestos, con nombres y puntos.
 *     Los empatados comparten el puesto. Los demás van en "Ver más".
 *   - Grupal: cada grupo del podio muestra su MVP, el jugador que más puntos
 *     le aportó; si empatan, el que respondió más rápido en promedio.
 */

export const PODIUM_PLACES = 3;

/**
 * Clasificación por puntos, de mayor a menor. Los empatados comparten el
 * puesto y el siguiente puntaje distinto ocupa el puesto que sigue
 * (500, 300, 300, 100 → puestos 1, 2, 2, 3).
 * @param {Object<string, number>} scores
 * @returns {{place: number, name: string, points: number}[]}
 */
export function ranking(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let place = 0, last = null;
  return sorted.map(([name, points]) => {
    if (points !== last) { place++; last = points; }
    return { place, name, points };
  });
}

/**
 * Divide la clasificación en el podio (puestos 1 a 3, agrupados por puesto)
 * y el resto (del puesto 4 en adelante, para "Ver más").
 */
export function buildPodium(scores) {
  const ranked = ranking(scores);
  const steps = [];
  for (let p = 1; p <= PODIUM_PLACES; p++) {
    const entries = ranked.filter((r) => r.place === p);
    if (entries.length) steps.push({ place: p, entries });
  }
  return { steps, rest: ranked.filter((r) => r.place > PODIUM_PLACES) };
}

const averageOf = (list) => (list && list.length ? list.reduce((a, b) => a + b, 0) / list.length : Infinity);

/**
 * MVP de un grupo: el que más puntos le aportó. Si empatan, el que respondió
 * más rápido en promedio (en segundos, en sus aciertos). Si siguen empatados,
 * se muestran todos.
 * @param {string[]} players - jugadores del grupo
 * @param {Object<string, number>} contrib - puntos aportados por cada jugador
 * @param {Object<string, number[]>} answerTimes - segundos de cada acierto
 * @returns {string[]} uno o más nombres
 */
export function pickMvp(players, contrib, answerTimes) {
  if (!players.length) return [];
  const points = (p) => contrib[p] || 0;
  const best = Math.max(...players.map(points));
  let tied = players.filter((p) => points(p) === best);
  if (tied.length > 1) {
    const fastest = Math.min(...tied.map((p) => averageOf(answerTimes[p])));
    tied = tied.filter((p) => averageOf(answerTimes[p]) === fastest);
  }
  return tied;
}

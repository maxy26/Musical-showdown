/**
 * Orden de los duelos de Alternativo 1 (reglas definidas por el usuario en
 * CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3). Sin ventaja para nadie: se sigue
 * un orden fijo y, al terminarlo, el ciclo se repite hasta que alguien llegue
 * al puntaje objetivo. Funciones puras (sin DOM) para poder probarlas.
 */

const BYE = -1; // "descansa" cuando la cantidad es impar

/**
 * Todos contra todos por tandas, "primero contra último": en cada tanda el
 * primero queda fijo y los demás giran una posición (como en los torneos).
 * Con cantidad impar se agrega un descanso en el medio, así en la primera
 * tanda descansa el del medio (con 9: 1v9, 2v8, 3v7, 4v6 y descansa el 5).
 * Devuelve las tandas; cada una es una lista de duelos [i, j] (posiciones
 * desde 0).
 */
export function roundRobinRounds(n) {
  const list = Array.from({ length: n }, (_, i) => i);
  if (n % 2) list.splice(Math.ceil(n / 2), 0, BYE);
  const rounds = [];
  for (let t = 0; t < list.length - 1; t++) {
    const duels = [];
    for (let i = 0; i < list.length / 2; i++) {
      const a = list[i], b = list[list.length - 1 - i];
      if (a !== BYE && b !== BYE) duels.push([a, b]);
    }
    rounds.push(duels);
    list.splice(1, 0, list.pop()); // giran todos menos el primero
  }
  return rounds;
}

/** Todos los duelos del ciclo, en orden (con 10: 1v10, 2v9, 3v8, 4v7, 5v6, 1v9, …). */
export function roundRobinSequence(n) {
  return roundRobinRounds(n).flat();
}

/**
 * Orden de los grupos que se enfrentan (Alternativo 1 – Grupal):
 *   - 2 grupos: siempre G1 vs G2.
 *   - 3 grupos: G1 vs G3 → G1 vs G2 → G2 vs G3 (orden elegido por el usuario).
 *   - 4 o más: primero contra último que rota, igual que en Individual.
 */
export function groupOrderSequence(groupCount) {
  if (groupCount === 2) return [[0, 1]];
  if (groupCount === 3) return [[0, 2], [0, 1], [1, 2]];
  return roundRobinSequence(groupCount);
}

/** Memoria de Alternativo 1 – Grupal: último jugador de cada grupo y parejas ya vistas. */
export function newGroupMemory() {
  return { last: {}, faced: [] };
}

const pairKey = (a, b) => [a, b].sort().join("|");

/**
 * Jugadores de un duelo entre los grupos `ga` y `gb` (Alternativo 1 – Grupal):
 * dentro de cada grupo se turnan en orden (sale el que menos ha jugado,
 * empezando después del último que jugó), y el rival es el siguiente del otro
 * grupo con quien todavía no se haya enfrentado. Así, con el tiempo, cada
 * jugador se enfrenta a todos los de los otros grupos; cuando ya se vieron
 * todas las parejas, el ciclo empieza de nuevo.
 *
 * @param {string[][]} groups - jugadores de cada grupo, en orden
 * @param {Object<string, number>} played - veces que jugó cada jugador (se actualiza)
 * @param {{last: Object, faced: string[]}} memory - ver newGroupMemory (se actualiza)
 * @returns {[string, string]} jugador de `ga` y jugador de `gb`
 */
export function pickGroupDuelPlayers(groups, ga, gb, played, memory) {
  const times = (p) => played[p] || 0;
  function next(g, rival) {
    const players = groups[g];
    const last = memory.last[g] ?? -1;
    const min = Math.min(...players.map(times));
    const inOrder = players
      .map((_, i) => players[(last + 1 + i) % players.length])
      .filter((p) => times(p) === min);
    if (rival) {
      const fresh = inOrder.find((p) => !memory.faced.includes(pairKey(p, rival)));
      if (fresh) return fresh;
    }
    return inOrder[0];
  }
  const pa = next(ga, null);
  const pb = next(gb, pa);
  for (const [g, p] of [[ga, pa], [gb, pb]]) {
    played[p] = times(p) + 1;
    memory.last[g] = groups[g].indexOf(p);
  }
  memory.faced.push(pairKey(pa, pb));
  // Si ya se enfrentaron todas las parejas posibles entre grupos, se reinicia el ciclo.
  let total = 0;
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) total += groups[i].length * groups[j].length;
  }
  if (new Set(memory.faced).size >= total) memory.faced = [];
  return [pa, pb];
}

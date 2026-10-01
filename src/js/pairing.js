/**
 * Cómo se eligen los duelos (reglas definidas por el usuario en
 * CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3). Funciones puras (sin DOM) para
 * poder probarlas.
 *
 *   - Alternativo 1: orden fijo, sin ventaja; al terminarlo, el ciclo se
 *     repite hasta que alguien llegue al puntaje objetivo.
 *   - Clásico: sorteo por fases (al azar / con ventaja para los que van por
 *     debajo del promedio), siempre con equilibrio de partidos. Sirve igual
 *     para jugadores (Individual) y para grupos (Grupal).
 */

// ===================== Clásico =====================

const CLASSIC_FIRST_RANDOM = 3; // los 3 primeros duelos, al azar
const CLASSIC_PHASE_LENGTH = 3; // luego: 3 con ventaja → 3 al azar → …
const BALANCE_RATIO = 0.6; // equilibrio: todos con al menos el 60 % del promedio

/** Memoria de Clásico: fases, último duelo y quién se enfrentó con quién. */
export function newClassicMemory() {
  return { played: 0, phase: "inicio", left: 0, lastPair: null, faced: {} };
}

const average = (values) => values.reduce((a, b) => a + b, 0) / (values.length || 1);

/**
 * ¿Hay equilibrio de puntos? Sí, si todos tienen al menos el 60 % del
 * promedio (como "aprobar" con 3.0 sobre 5.0). Con promedio 0, sí.
 */
export function isBalanced(scores) {
  const avg = average(scores);
  return avg === 0 || scores.every((s) => s >= BALANCE_RATIO * avg);
}

/**
 * Tipo del próximo duelo de Clásico ("azar" o "ventaja"), y avanza las fases:
 *   1. Los 3 primeros: al azar.
 *   2. Con desequilibrio: 3 con ventaja → 3 al azar → 3 con ventaja → …
 *   3. En cuanto hay equilibrio se corta la fase y queda solo al azar; si
 *      reaparece el desequilibrio, empieza de inmediato la ventaja.
 */
export function nextClassicMode(memory, balanced) {
  memory.played++;
  if (memory.played <= CLASSIC_FIRST_RANDOM) return "azar";
  if (balanced) {
    memory.phase = "libre";
    memory.left = 0;
    return "azar";
  }
  if (memory.phase !== "ventaja" && memory.phase !== "azar") {
    memory.phase = "ventaja"; // viene del inicio o del equilibrio: ventaja de inmediato
    memory.left = CLASSIC_PHASE_LENGTH;
  } else if (memory.left === 0) {
    memory.phase = memory.phase === "ventaja" ? "azar" : "ventaja";
    memory.left = CLASSIC_PHASE_LENGTH;
  }
  memory.left--;
  return memory.phase;
}

function pickRandom(list, random) {
  return list[Math.floor(random() * list.length)];
}

function pickWeighted(list, weights, random) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < list.length; i++) {
    r -= weights[i];
    if (r < 0) return list[i];
  }
  return list[list.length - 1];
}

/**
 * Elige el duelo de Clásico entre `participants` (jugadores o grupos).
 *   - Equilibrio de partidos: los dos salen de los que llevan menos duelos
 *     (si en el nivel más bajo hay uno solo, el rival sale del siguiente).
 *   - "ventaja": uno sale de los que están por debajo del promedio, con más
 *     probabilidad cuanto más lejos del promedio; su rival, al azar entre los
 *     que están en el promedio o por encima.
 *   - No repite el duelo anterior, salvo que esos dos ya se hayan enfrentado
 *     con todos los demás en esta vuelta (o no haya otra opción).
 *
 * @param {object} o
 * @param {string[]} o.participants
 * @param {Object<string, number>} o.scores
 * @param {Object<string, number>} o.matches - duelos jugados por cada uno
 * @param {object} o.memory - ver newClassicMemory (usa lastPair y faced)
 * @param {"azar"|"ventaja"} o.mode
 * @returns {[string, string]}
 */
export function pickClassicPair({ participants, scores, matches, memory, mode, random = Math.random }) {
  const played = (p) => matches[p] || 0;
  const score = (p) => scores[p] || 0;
  const avg = average(participants.map(score));

  // Los que llevan menos duelos, sin contar a `exclude`.
  function leastPlayed(exclude) {
    const rest = participants.filter((p) => !exclude.includes(p));
    const min = Math.min(...rest.map(played));
    return rest.filter((p) => played(p) === min);
  }

  // Primero: en "ventaja", uno de los que van por debajo del promedio.
  const pool1 = leastPlayed([]);
  const below = pool1.filter((p) => score(p) < avg);
  const a = mode === "ventaja" && below.length
    ? pickWeighted(below, below.map((p) => avg - score(p)), random)
    : pickRandom(pool1, random);

  // Rival: entre los que menos duelos llevan. Se evita repetir el duelo
  // anterior solo si hay otro con los mismos duelos (el equilibrio de
  // partidos manda) y si esos dos no se enfrentaron ya con todos los demás.
  const facedAll = (p) => participants.every((q) => q === p || (memory.faced[p] || []).includes(q));
  let pool2 = leastPlayed([a]);
  const last = memory.lastPair;
  if (last && last.includes(a)) {
    const other = last[0] === a ? last[1] : last[0];
    const others = pool2.filter((p) => p !== other);
    if (others.length && !(facedAll(a) && facedAll(other))) pool2 = others;
  }
  const atOrAbove = pool2.filter((p) => score(p) >= avg);
  const b = mode === "ventaja" && atOrAbove.length ? pickRandom(atOrAbove, random) : pickRandom(pool2, random);
  return [a, b];
}

/**
 * Anota el duelo en la memoria de Clásico (último duelo y quién enfrentó a
 * quién). "Enfrentarse con todos" se cuenta por vuelta (decisión del usuario,
 * 29-09-2026): cuando todos ya se enfrentaron con todos, la cuenta empieza de
 * nuevo, para que se sigan evitando las repeticiones seguidas.
 */
export function recordClassicDuel(memory, a, b, participants) {
  memory.lastPair = [a, b];
  for (const [x, y] of [[a, b], [b, a]]) {
    memory.faced[x] = memory.faced[x] || [];
    if (!memory.faced[x].includes(y)) memory.faced[x].push(y);
  }
  const everyoneFacedAll = participants.every((p) => (memory.faced[p] || []).length >= participants.length - 1);
  if (everyoneFacedAll) memory.faced = {}; // nueva vuelta
}

// ===================== Alternativo 1 =====================

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

/**
 * Relevo (Alternativo 1 – Grupal): `requester` del grupo `g` le pasa el turno
 * a `substitute`. Para los emparejamientos cuenta el que entró: el duelo pasa
 * a ser substitute vs rival, y requester no cuenta como que cantó (definido por
 * el usuario el 30-09-2026).
 * @param {string[][]} groups - jugadores de cada grupo, en orden
 * @param {Object<string, number>} played - veces que jugó cada jugador (se actualiza)
 * @param {{last: Object, faced: string[]}} memory - ver newGroupMemory (se actualiza)
 */
export function applyRelayToMemory(groups, g, requester, substitute, rival, played, memory) {
  played[requester] = Math.max(0, (played[requester] || 0) - 1);
  played[substitute] = (played[substitute] || 0) + 1;
  const i = memory.faced.lastIndexOf(pairKey(requester, rival));
  if (i >= 0) memory.faced.splice(i, 1);
  memory.faced.push(pairKey(substitute, rival));
  memory.last[g] = groups[g].indexOf(substitute);
}

/**
 * Grupos del modo Grupal (reglas en CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3):
 * cantidad de grupos, reparto de jugadores, nombres y quién juega cada duelo.
 * Funciones puras (sin DOM) para poder probarlas desde Node.
 *
 * Un grupo es { players: string[], customName: string }. customName vacío
 * significa que usa el nombre predeterminado ("Equipo 1", "Grupo 2"…).
 */
import { shuffleArray } from "./utils.js";

/** Cómo se llaman los grupos. Viene elegido "Equipos". */
export const GROUP_TERMS = {
  equipo: { singular: "Equipo", plural: "Equipos" },
  grupo: { singular: "Grupo", plural: "Grupos" },
};
export const DEFAULT_GROUP_TERM = "equipo";
export const MIN_GROUPS = 2;
export const MIN_PLAYERS_PER_GROUP = 2;

/** Cantidad máxima de grupos: cada grupo necesita 2 o más jugadores. */
export function maxGroups(playerCount) {
  return Math.max(MIN_GROUPS, Math.floor(playerCount / MIN_PLAYERS_PER_GROUP));
}

/** Opciones válidas para la lista de cantidad de grupos (de 2 a la mitad de los jugadores). */
export function groupCountOptions(playerCount) {
  const opts = [];
  for (let n = MIN_GROUPS; n <= maxGroups(playerCount); n++) opts.push(n);
  return opts;
}

/**
 * Tamaño de cada grupo: lo más parejos posible, y los jugadores que sobran
 * van a los últimos grupos (10 jugadores en 3 grupos -> [3, 3, 4]).
 */
export function groupSizes(playerCount, groupCount) {
  const base = Math.floor(playerCount / groupCount);
  const extra = playerCount % groupCount;
  return Array.from({ length: groupCount }, (_, i) => base + (i >= groupCount - extra ? 1 : 0));
}

/** Reparte los jugadores al azar en `groupCount` grupos (nombres predeterminados). */
export function distributeRandom(players, groupCount, shuffle = shuffleArray) {
  const mixed = shuffle([...players]);
  let start = 0;
  return groupSizes(players.length, groupCount).map((size) => {
    const group = { players: mixed.slice(start, start + size), customName: "" };
    start += size;
    return group;
  });
}

/** Nombre predeterminado de un grupo: "Equipo 1", "Grupo 3"… */
export function defaultGroupName(term, index) {
  return `${(GROUP_TERMS[term] || GROUP_TERMS[DEFAULT_GROUP_TERM]).singular} ${index + 1}`;
}

/** Nombre que se muestra: el editado o, si está vacío, el predeterminado. */
export function groupName(group, index, term) {
  return group.customName || defaultGroupName(term, index);
}

/**
 * Jugador que representa al grupo en un duelo: al azar entre los que menos
 * han participado, para que todos canten una cantidad parecida de veces.
 * `sang[nombre]` = veces que ya participó.
 */
export function pickRepresentative(players, sang, random = Math.random) {
  const times = (p) => sang[p] || 0;
  const min = Math.min(...players.map(times));
  const least = players.filter((p) => times(p) === min);
  return least[Math.floor(random() * least.length)];
}

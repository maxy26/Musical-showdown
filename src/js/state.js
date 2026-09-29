/**
 * Estado global de la partida. Se expone como un objeto mutable único
 * (`state`) para que todas las pantallas lean/escriban el mismo estado,
 * y `resetState()` para reiniciarlo (nueva partida / volver al menú).
 */
function freshState() {
  return {
    screen: "menu",
    config: {
      players: ["", ""],
      battleType: "individual", // individual | grupal
      mode: "clasico", // clasico | alternativo1 | alternativo2 (reglas: CONTEXTO, sección 3)
      genres: ["pop"],
      targetScore: 2000,
      targetScoreMode: "preset", // "preset" | "custom"
      roundTime: 30, // 0 = sin tiempo
      roundTimeMode: "preset", // "preset" | "custom"
      multipliers: [2, 3, 4, 5], // los 4 fijos, con un solo interruptor (instrucción 20)
      groupCount: 2, // modo Grupal: cantidad de grupos
      groupTerm: "equipo", // modo Grupal: "equipo" | "grupo" (ver groups.js)
    },
    groups: [], // modo Grupal: [{ players: [...], customName: "" }] (ver groups.js)
    scores: {}, // nombre del jugador o del grupo -> puntaje
    matchCounts: {}, // nombre del jugador o del grupo -> duelos jugados (equilibrio de partidos)
    singCounts: {}, // modo Grupal: nombre del jugador -> veces que representó a su grupo
    usedSongs: [], // claves "titulo|letra" bloqueadas durante la partida
    round: {
      participantA: null, // jugador (Individual) o nombre del grupo (Grupal)
      participantB: null,
      showA: null, // jugador que representa al grupo A en este duelo (solo Grupal)
      showB: null,
      word: null,
      multiplier: null,
      timeLeft: 0,
      timerId: null,
      paused: false,
      phase: "intro", // intro | counting
      selected: null, // "A" | "B", quién está respondiendo
      lastResult: null,
    },
    verify: { query: "", results: [], selectedSong: null },
    teamSelectedPlayer: null,
    winner: null,
  };
}

export const state = freshState();

export function resetState() {
  Object.assign(state, freshState());
}

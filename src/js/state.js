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
      mode: "clasico", // TODO: alternativo1 y alternativo2 pendientes de reglas
      genres: ["pop"],
      targetScore: 2000,
      targetScoreMode: "preset", // "preset" | "custom"
      roundTime: 30, // 0 = sin tiempo
      roundTimeMode: "preset", // "preset" | "custom"
      multipliers: [2, 3],
    },
    teams: { a: [], b: [] },
    scores: {}, // nombre/equipo -> puntaje
    usedSongs: [], // claves "titulo|letra" bloqueadas durante la partida
    round: {
      participantA: null,
      participantB: null,
      showA: null, // participante mostrado por el equipo A (solo grupal)
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
    configEditing: null, // "target" | "time": caja personalizada abierta en la configuración

    winner: null,
  };
}

export const state = freshState();

export function resetState() {
  Object.assign(state, freshState());
}

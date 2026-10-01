// Modos disponibles según el tipo de batalla.
// - Individual: solo se muestran Clásico y Alternativo 1 (Alternativo 2 no aparece).
// - Grupal: se muestran los tres modos, todos libres de seleccionar.
// Reglas de cada modo: CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3.
// TODO: Alternativo 2 todavía no tiene reglas propias (combinará Alternativo 1 y Clásico).

// ---------- Qué usa cada modo (definido por el usuario el 30-09-2026) ----------
// - Clásico: SIN reloj (la ronda termina al acertar, si fallan los dos o con
//   "Finalizar ronda") y SIN multiplicadores.
// - Alternativo 1: tiempo por ronda OBLIGATORIO (no existe "Sin tiempo") y
//   multiplicadores que se activan o desactivan.
// - Alternativo 2: mientras no tenga reglas, queda como estaba antes (tiempo
//   con "Sin tiempo" y multiplicadores).

/** ¿El modo tiene tiempo por ronda (y su lista en la configuración)? */
export function usesRoundTime(modeId) {
  return modeId !== "clasico";
}

/** ¿Se puede elegir "Sin tiempo"? En Alternativo 1, no. */
export function allowsNoTime(modeId) {
  return modeId !== "alternativo1";
}

/** ¿El modo tiene multiplicadores (y su selector en la configuración)? */
export function usesMultipliers(modeId) {
  return modeId !== "clasico";
}

/** Tiempo por ronda que se usa de verdad en la partida (0 = sin reloj). */
export function effectiveRoundTime(config) {
  return usesRoundTime(config.mode) ? config.roundTime : 0;
}

/** Multiplicadores que pueden salir de verdad en la partida. */
export function effectiveMultipliers(config) {
  return usesMultipliers(config.mode) ? config.multipliers : [];
}

/** Tiempo que se pone al pasar a un modo sin "Sin tiempo" si estaba elegido "Sin tiempo". */
export const DEFAULT_ROUND_TIME = 30;

// Nombre visible de cada modo. El id es interno (sin tildes ni espacios);
// en pantalla siempre se muestra este nombre.
const MODE_NAMES = {
  clasico: "Clásico",
  alternativo1: "Alternativo 1",
  alternativo2: "Alternativo 2",
};

/** Nombre visible de un modo a partir de su id ("clasico" -> "Clásico"). */
export function modeName(id) {
  return MODE_NAMES[id] || id;
}

function mode(id) {
  return { id, label: `🎮 ${modeName(id)}`, enabled: true };
}

export function modesFor(battleType) {
  if (battleType === "individual") {
    return [mode("clasico"), mode("alternativo1")];
  }
  return [mode("clasico"), mode("alternativo1"), mode("alternativo2")];
}

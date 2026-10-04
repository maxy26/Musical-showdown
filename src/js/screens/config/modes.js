// Modos disponibles según el tipo de batalla.
// - Individual: solo se muestran Clásico y Alternativo 1 (Alternativo 2 no aparece).
// - Grupal: se muestran los tres modos, todos libres de seleccionar.
// Reglas de cada modo: CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3.

// ---------- Qué usa cada modo (usuario, 30-09 y 03-10-2026) ----------
// - Clásico: SIN reloj (la ronda termina al acertar, si fallan los dos o con
//   "Finalizar ronda"), SIN multiplicadores y 1 intento.
// - Alternativo 1: tiempo por ronda OBLIGATORIO (no existe "Sin tiempo"),
//   multiplicadores SIEMPRE activos (desde el 03-10-2026 no se desactivan) e
//   intentos ilimitados.
// - Alternativo 2 (solo Grupal): todo se elige en la configuración: tiempo o
//   "Sin tiempo", con o sin multiplicadores, intentos (1 a 10), si el perdedor
//   resta, si cuando nadie acierta los dos restan la mitad, y los relevos.

/** Los multiplicadores que pueden salir en una ronda. */
export const ALL_MULTIPLIERS = [2, 3, 4, 5];

/** Valores de entrada de las opciones de Alternativo 2 (usuario, 03-10-2026). */
export const ALT2_DEFAULTS = {
  attempts: 5, // intentos del jugador de cada equipo en la ronda (1 a 10)
  loserLoses: false, // el perdedor resta lo mismo que gana el ganador
  noneLoseHalf: false, // si nadie acierta, los dos restan la mitad
  relaysTotal: 3, // relevos por equipo en toda la partida (0 a 7)
  relaysPerRound: 1, // relevos como máximo por ronda (1 hasta el total y los intentos)
};
export const ALT2_LIMITS = { attempts: [1, 10], relaysTotal: [0, 7] };

/** ¿El modo tiene tiempo por ronda (y su lista en la configuración)? */
export function usesRoundTime(modeId) {
  return modeId !== "clasico";
}

/** ¿Se puede elegir "Sin tiempo"? En Alternativo 1, no. */
export function allowsNoTime(modeId) {
  return modeId !== "alternativo1";
}

/** ¿El modo tiene multiplicadores? Clásico no. */
export function usesMultipliers(modeId) {
  return modeId !== "clasico";
}

/** ¿Se pueden activar o desactivar los multiplicadores? Solo en Alternativo 2. */
export function hasMultiplierChoice(modeId) {
  return modeId === "alternativo2";
}

/** Tiempo por ronda que se usa de verdad en la partida (0 = sin reloj). */
export function effectiveRoundTime(config) {
  return usesRoundTime(config.mode) ? config.roundTime : 0;
}

/** Multiplicadores que pueden salir de verdad en la partida. */
export function effectiveMultipliers(config) {
  if (!usesMultipliers(config.mode)) return [];
  return hasMultiplierChoice(config.mode) ? config.multipliers : ALL_MULTIPLIERS;
}

/** Opciones de Alternativo 2 de la configuración, con los valores de entrada si faltan. */
export function alt2Options(config) {
  return { ...ALT2_DEFAULTS, ...(config.alt2 || {}) };
}

/** Intentos de cada lado en una ronda: Clásico 1, Alternativo 1 sin límite, Alternativo 2 los elegidos. */
export function attemptsPerRound(config) {
  if (config.mode === "clasico") return 1;
  if (config.mode === "alternativo2") return alt2Options(config).attempts;
  return Infinity;
}

/**
 * Cómo se reparten los puntos al terminar la ronda (ver scoring.js):
 * `loserLoses` = el perdedor resta lo mismo que gana el ganador;
 * `noneLoseHalf` = si nadie acierta, los dos restan la mitad.
 */
export function scoringRules(config) {
  if (config.mode === "alternativo1") return { loserLoses: true, noneLoseHalf: true };
  if (config.mode === "alternativo2") {
    const o = alt2Options(config);
    return { loserLoses: o.loserLoses, noneLoseHalf: o.noneLoseHalf };
  }
  return { loserLoses: false, noneLoseHalf: false };
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

// Modos disponibles según el tipo de batalla.
// - Individual: solo se muestran Clásico y Alternativo 1 (Alternativo 2 no aparece).
// - Grupal: se muestran los tres modos, todos libres de seleccionar.
// TODO: reglas exactas de Alternativo 1 y Alternativo 2 aún pendientes de definir.

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

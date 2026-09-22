// Modos disponibles según el tipo de batalla.
// - Individual: solo se muestran Clásico y Alternativo 1 (Alternativo 2 no aparece).
// - Grupal: se muestran los tres modos, todos libres de seleccionar.
// TODO: reglas exactas de Alternativo 1 y Alternativo 2 aún pendientes de definir.
export function modesFor(battleType) {
  if (battleType === "individual") {
    return [
      { id: "clasico", label: "🎮 Clásico", enabled: true },
      { id: "alternativo1", label: "🎮 Alternativo 1", enabled: true },
    ];
  }
  return [
    { id: "clasico", label: "🎮 Clásico", enabled: true },
    { id: "alternativo1", label: "🎮 Alternativo 1", enabled: true },
    { id: "alternativo2", label: "🎮 Alternativo 2", enabled: true },
  ];
}

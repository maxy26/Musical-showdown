// Puntaje objetivo predeterminado: de 500 en 500 hasta 5000.
export const TARGET_SCORE_PRESETS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

// Tiempo por ronda predeterminado: de 5 en 5 hasta 60 segundos ("1 min"), más "Sin tiempo".
// La personalización (1 a 2 minutos + segundos libres) se maneja aparte, igual que el puntaje.
export const ROUND_TIME_PRESETS = [
  { value: 0, label: "Sin tiempo" },
  { value: 5, label: "5 seg" },
  { value: 10, label: "10 seg" },
  { value: 15, label: "15 seg" },
  { value: 20, label: "20 seg" },
  { value: 25, label: "25 seg" },
  { value: 30, label: "30 seg" },
  { value: 35, label: "35 seg" },
  { value: 40, label: "40 seg" },
  { value: 45, label: "45 seg" },
  { value: 50, label: "50 seg" },
  { value: 55, label: "55 seg" },
  { value: 60, label: "1 min" },
];

/** Formatea segundos totales como "1 min 30 seg", "45 seg", "2 min (máximo)", etc. */
export function formatCustomTime(totalSeconds) {
  if (totalSeconds === 0) return "Sin tiempo";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} seg`;
  if (s === 0) return m === 2 ? "2 min (máximo)" : `${m} min`;
  return `${m} min ${s} seg`;
}

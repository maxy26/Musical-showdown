/**
 * Preferencias del jugador que se guardan en el dispositivo (no son parte de
 * la partida): "Animaciones" y cada tipo de sonido (música de fondo, efectos
 * de los botones y reloj), todos "Sí / No" desde la tuerca del inicio.
 *
 * Las animaciones van SIEMPRE encendidas por defecto, aunque Windows o el
 * celular pidan "reducir el movimiento" (decisión del usuario, 01-10-2026):
 * quien prefiera apagarlas lo hace desde la tuerca de la pantalla de inicio.
 *
 * Sin efectos al cargar el módulo: main.js llama a applySettings() al iniciar.
 */
const STORAGE_KEY = "musical-showdown:ajustes";
const DEFAULTS = {
  animations: true,
  music: true, // música de fondo
  effects: true, // clic de los botones (y futuros efectos especiales)
  clock: true, // tic-tac del reloj de la ronda
  musicVol: 70, // volumen de la música (0 a 100; 0 es lo mismo que "No")
  effectsVol: 70, // volumen de los efectos (0 a 100)
  countdown: 3, // segundos de la cuenta antes de cada ronda (0 = No; si no, de 3 a 7)
};

/** Lee las preferencias guardadas; si no hay o el almacenamiento falla, usa las predeterminadas. */
export function loadSettings(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULTS, ...(saved && typeof saved === "object" ? saved : {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Guarda un cambio (por ejemplo { animations: false }) y lo aplica. */
export function saveSetting(patch, storage = globalThis.localStorage) {
  const next = { ...loadSettings(storage), ...patch };
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Modo privado o almacenamiento bloqueado: se aplica igual, solo que no se recuerda.
  }
  applySettings(next);
  return next;
}

/** Aplica las preferencias a la página (el CSS apaga las animaciones con data-anim="off"). */
export function applySettings(settings = loadSettings()) {
  document.documentElement.dataset.anim = settings.animations ? "on" : "off";
}

/**
 * Cuenta antes de cada ronda (usuario, 06-10-2026): 0 (No) o de 3 a 7 segundos.
 * Al bajar de 3 pasa a "No"; al subir desde "No" pasa a 3.
 */
export const CUENTA_MIN = 3;
export const CUENTA_MAX = 7;
/** Lleva un valor guardado (por ejemplo, de una versión de prueba) al rango permitido. */
export function cuentaValida(v) {
  if (!(v > 0)) return 0;
  return Math.min(CUENTA_MAX, Math.max(CUENTA_MIN, Math.round(v)));
}
/** Valor de la cuenta después de tocar − (paso < 0) o + (paso > 0). */
export function ajustarCuenta(actual, paso) {
  const v = cuentaValida(actual);
  if (paso < 0) return v <= CUENTA_MIN ? 0 : v - 1;
  return v === 0 ? CUENTA_MIN : Math.min(CUENTA_MAX, v + 1);
}

/**
 * Al tocar un nombre, ¿de verdad alguien canta? (usuario, 12-10-2026)
 *
 * Al tocar un nombre sale "¡X canta!" y el reloj se ve detenido. Por dentro
 * sigue corriendo más lento (a mitad de velocidad) durante 3 segundos mientras
 * el micrófono escucha:
 *   - si oye una voz, sigue "¡X canta!" como siempre (el reloj queda detenido);
 *   - si no oye nada, vuelve a la ronda (como "← Volver") y el reloj sigue
 *     normal, con lo que corrió despacio ya descontado.
 * El micrófono es el del celular si hay uno vinculado (lo manda por vinculo.js)
 * y, si no, el del mismo dispositivo. Sin micrófono o sin permiso, se queda en
 * "¡X canta!" como antes.
 * Solo se consulta dentro de funciones: se puede importar desde Node (pruebas).
 */
import { state } from "./state.js";
import { escucharVoz } from "./microfono.js";
import { effectiveRoundTime } from "./screens/config/modes.js";

export const SEGUNDOS_ESCUCHA = 3;
/** A qué velocidad corre el reloj (por dentro) mientras se escucha. */
export const VELOCIDAD_LENTA = 0.5;
/** Si el control vinculado no contesta, se sigue como si hubiera voz. */
const ESPERA_MAXIMA = 20_000;

let espera = null; // { toque, inicio, plazo }

/** Segundos que se descuentan del reloj por el tiempo que corrió despacio. */
export function descuentoLento(segundosEscuchados) {
  return Math.floor(Math.min(SEGUNDOS_ESCUCHA, Math.max(0, segundosEscuchados)) * VELOCIDAD_LENTA);
}

/**
 * Empieza a escuchar justo después de tocar un nombre (round.js). Con un
 * celular vinculado (`conControl`), escucha el celular: ve `escuchando` en lo
 * que le manda la PC y contesta con `resultadoVoz`. `alSilencio()` vuelve a
 * la ronda.
 */
export function empezarEscucha({ conControl = false, alSilencio }) {
  const r = state.round;
  r.toque = (r.toque || 0) + 1;
  r.escuchando = true;
  const toque = r.toque;
  clearTimeout(espera?.plazo);
  const plazo = setTimeout(() => resultadoVoz("voz", toque), ESPERA_MAXIMA);
  plazo.unref?.(); // en Node (pruebas) no deja el proceso esperando
  espera = { toque, inicio: Date.now(), alSilencio, plazo };
  if (!conControl) escucharVoz(SEGUNDOS_ESCUCHA, () => !esperando(toque)).then((res) => resultadoVoz(res, toque));
}

/** ¿Se sigue esperando el resultado de este toque? */
function esperando(toque) {
  const r = state.round;
  return Boolean(espera) && espera.toque === toque && r.toque === toque && r.escuchando && state.screen === "verify";
}

/**
 * Llega lo que oyó el micrófono ("voz", "silencio", "sin-microfono"). Solo
 * cuenta si se sigue en "¡X canta!" del mismo toque (si el moderador ya eligió
 * ✅ / ❌ o "Volver", no hace nada).
 */
export function resultadoVoz(resultado, toque = state.round.toque) {
  if (!esperando(toque)) return;
  const r = state.round;
  const { inicio, alSilencio, plazo } = espera;
  clearTimeout(plazo);
  espera = null;
  r.escuchando = false;
  if (effectiveRoundTime(state.config) > 0) {
    r.timeLeft = Math.max(1, r.timeLeft - descuentoLento((Date.now() - inicio) / 1000));
  }
  if (resultado === "silencio") alSilencio?.();
}

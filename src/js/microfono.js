/**
 * Escuchar si alguien canta (usuario, 12-10-2026; ver voz.js). Solo mide el
 * volumen de lo que entra por el micrófono: no graba, no guarda ni manda el
 * sonido a ningún lado, y no se escucha por los parlantes.
 * Solo se usa dentro de funciones: se puede importar desde Node (pruebas).
 */

/** Volumen (0 a 1) desde el que se considera voz, y cuánto tiempo seguido tiene que durar. */
export const UMBRAL_VOZ = 0.04;
export const VOZ_MINIMA_MS = 250;

let contexto = null;

/** Volumen de un pedazo de sonido (raíz cuadrática media de las muestras). */
export function volumenDe(muestras) {
  let suma = 0;
  for (const m of muestras) suma += m * m;
  return muestras.length ? Math.sqrt(suma / muestras.length) : 0;
}

/**
 * Cuenta la voz que se va oyendo: suma el tiempo con volumen alto y, en el
 * silencio, va restando la mitad (así un ruido corto no cuenta como voz).
 * Devuelve el acumulado nuevo.
 */
export function acumularVoz(acumulado, volumen, pasoMs) {
  return volumen >= UMBRAL_VOZ ? acumulado + pasoMs : Math.max(0, acumulado - pasoMs / 2);
}

/**
 * Escucha durante `segundos` (desde que el micrófono está listo). Resuelve con
 * "voz" apenas oye a alguien, "silencio" si no oye nada y "sin-microfono" si no
 * hay micrófono o no se dio el permiso. `cancelado()` corta antes.
 */
export async function escucharVoz(segundos = 3, cancelado = () => false) {
  let flujo;
  try {
    flujo = await window.navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch {
    return "sin-microfono";
  }
  try {
    contexto ??= new window.AudioContext();
    if (contexto.state === "suspended") await contexto.resume().catch(() => {});
    const fuente = contexto.createMediaStreamSource(flujo);
    const analizador = contexto.createAnalyser();
    analizador.fftSize = 1024;
    fuente.connect(analizador); // no se conecta a los parlantes
    const muestras = new Float32Array(analizador.fftSize);
    const PASO = 50;
    const fin = Date.now() + segundos * 1000;
    let acumulado = 0;
    const resultado = await new Promise((resolve) => {
      const mirar = () => {
        if (cancelado()) { resolve("cancelado"); return; }
        analizador.getFloatTimeDomainData(muestras);
        acumulado = acumularVoz(acumulado, volumenDe(muestras), PASO);
        if (acumulado >= VOZ_MINIMA_MS) { resolve("voz"); return; }
        if (Date.now() >= fin) { resolve("silencio"); return; }
        setTimeout(mirar, PASO);
      };
      mirar();
    });
    fuente.disconnect();
    return resultado;
  } catch {
    return "sin-microfono";
  } finally {
    flujo.getTracks().forEach((t) => t.stop());
  }
}

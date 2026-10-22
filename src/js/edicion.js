/**
 * Ediciones del juego y lo que se cobra (usuario, 13-10-2026). `EDICION`
 * (version.js) la escribe build/stamp.js al compilar:
 *   - "demo": la demo gratis de la Microsoft Store (`--demo`). Solo Clásico se
 *     juega; Alternativo 1 se ve con 🔒 y el enlace a la versión completa;
 *     Alternativo 2 no aparece; no escucha el canto (solo "Buscar canción").
 *   - "completa": la versión completa (GitHub y tiendas). La app es gratis; se
 *     cobra Alternativo 2 y escuchar el canto (los 3 segundos y la futura IA
 *     que reconoce la canción). Sin la compra, no se escucha el canto. Los
 *     anuncios van solo en el celular.
 *   - "personal": la copia del dueño (`npm run build:personal`): todo abierto,
 *     sin anuncios ni Premium. No se publica.
 *   - vacío: desarrollo y pruebas (src/ sin compilar): todo abierto.
 * Lo de pago viene con la suscripción Premium (compras.js; Google Play).
 */
import { EDICION } from "./version.js";
import { tieneCompra, esPremium } from "./compras.js";

/** Modo que se puede jugar en la demo, y modo que la demo ni muestra. */
export const MODOS_DEMO = ["clasico"];
export const MODOS_OCULTOS_DEMO = ["alternativo2"];
/** Lo que se cobra en la versión completa. */
export const DE_PAGO = { modos: ["alternativo2"], voz: true };

export function esDemo(edicion = EDICION) {
  return edicion === "demo";
}

/** ¿Este modo no aparece en esta edición? (la demo no muestra Alternativo 2) */
export function modoOculto(modo, edicion = EDICION) {
  return esDemo(edicion) && MODOS_OCULTOS_DEMO.includes(modo);
}

/** ¿Este modo se ve pero no se puede jugar? */
export function modoBloqueado(modo, edicion = EDICION) {
  if (esDemo(edicion)) return !MODOS_DEMO.includes(modo);
  if (edicion === "completa") return DE_PAGO.modos.includes(modo) && !tieneCompra(modo);
  return false;
}

/** ¿Se escucha el canto al tocar un nombre? (de pago en la versión completa; nunca en la demo) */
export function escuchaCanto(edicion = EDICION) {
  if (esDemo(edicion)) return false;
  if (edicion === "completa") return tieneCompra("voz");
  return true;
}

/** ¿Esta edición lleva anuncios? Solo la versión completa en el celular, y sin Premium. */
export function conAnuncios(edicion = EDICION, enCelular = Boolean(globalThis.window?.Capacitor?.isNativePlatform?.())) {
  return edicion === "completa" && enCelular && !tieneCompra("sinAnuncios"); // Premium quita los anuncios
}

/**
 * ¿Se ve el juego "con Premium"? (insignia ⭐ PREMIUM en el inicio, "Premium
 * activo" en Ajustes, Alternativo 2 con ⭐; usuario, 13-10-2026). En la
 * versión completa, cuando se pagó; la copia personal del dueño, siempre.
 */
export function premiumActivo(edicion = EDICION) {
  return edicion === "personal" || (edicion === "completa" && esPremium());
}

/**
 * Compras dentro del juego (usuario, 13-10-2026): una sola app gratis con
 * **Premium** adentro. La suscripción "premium" de Google Play desbloquea el
 * modo Alternativo 2, escuchar el canto (y la futura IA) y quita los anuncios.
 * El precio y los planes se configuran en la consola de Google Play
 * (ComprasPlugin.java los lee); el juego no guarda precios.
 *
 * Por ahora solo en la app de Android. Lo último que se supo se guarda en el
 * dispositivo para que Premium funcione sin internet, y se vuelve a preguntar
 * a Google Play al abrir el juego y al volver a él.
 * Solo se consulta dentro de funciones: se puede importar desde Node (pruebas).
 */
import { nativo } from "./plataforma.js";

export const PRODUCTO_PREMIUM = "premium";
/** Lo que desbloquea Premium. */
export const INCLUYE_PREMIUM = ["alternativo2", "voz", "sinAnuncios"];
const GUARDADO = "ms-premium";

let premium = null; // null = todavía no se leyó lo guardado
const avisar = new Set();

function leerGuardado() {
  try { return globalThis.localStorage?.getItem(GUARDADO) === "1"; } catch { return false; }
}

function fijarPremium(activo) {
  const cambio = activo !== esPremium();
  premium = activo;
  try { globalThis.localStorage?.setItem(GUARDADO, activo ? "1" : "0"); } catch { /* sin almacenamiento */ }
  if (cambio) avisar.forEach((fn) => fn(activo));
}

/** ¿Tiene Premium activo? */
export function esPremium() {
  if (premium === null) premium = leerGuardado();
  return premium;
}

/** ¿Se compró esto? ("alternativo2", "voz" o "sinAnuncios": todo viene con Premium) */
export function tieneCompra(cosa) {
  return INCLUYE_PREMIUM.includes(cosa) && esPremium();
}

/** ¿Se puede comprar desde esta copia del juego? (por ahora, la app de Android) */
export function comprasDisponibles() {
  return Boolean(globalThis.window?.Capacitor?.isNativePlatform?.());
}

/** Avisa cuando Premium se activa o se vence (para redibujar la pantalla). */
export function alCambiarPremium(fn) {
  avisar.add(fn);
}

/** Pregunta a Google Play si la suscripción sigue activa. */
export async function revisarCompras() {
  if (!comprasDisponibles()) return esPremium();
  try {
    const r = await nativo("Compras", "consultar");
    fijarPremium((r.activos || []).includes(PRODUCTO_PREMIUM));
  } catch {
    // sin conexión con Google Play: se queda con lo último que se supo
  }
  return esPremium();
}

/** Planes de Premium con el precio en la moneda del jugador: [{ plan, precio, periodo, prueba, token }]. */
export async function planesPremium() {
  const r = await nativo("Compras", "productos", { id: PRODUCTO_PREMIUM });
  return ordenarPlanes(r.planes || []);
}

/**
 * Un plan por período (mensual, anual…): si hay una oferta con prueba gratis
 * se usa esa; si no, el plan base. Primero el más corto.
 */
export function ordenarPlanes(planes) {
  const porPeriodo = new Map();
  for (const p of planes) {
    const antes = porPeriodo.get(p.periodo);
    if (!antes || (p.prueba && !antes.prueba)) porPeriodo.set(p.periodo, p);
  }
  const meses = (periodo) => ({ P1W: 0.25, P1M: 1, P3M: 3, P6M: 6, P1Y: 12 }[periodo] ?? 99);
  return [...porPeriodo.values()].sort((a, b) => meses(a.periodo) - meses(b.periodo));
}

/** Abre el pago de Google Play. Resuelve con true si quedó Premium; rechaza con "cancelada", "error"… */
export async function comprarPremium(plan) {
  const r = await nativo("Compras", "comprar", { producto: plan.producto || PRODUCTO_PREMIUM, token: plan.token });
  fijarPremium((r.activos || []).includes(PRODUCTO_PREMIUM));
  return esPremium();
}

/** "P1M" → "al mes", "P1Y" → "al año"… */
export function textoPeriodo(periodo) {
  return { P1W: "a la semana", P1M: "al mes", P3M: "cada 3 meses", P6M: "cada 6 meses", P1Y: "al año" }[periodo] || "";
}

/** "P7D" → "7 días gratis", "P1M" → "1 mes gratis". */
export function textoPrueba(periodo) {
  const m = /^P(\d+)([DWMY])$/.exec(periodo || "");
  if (!m) return "";
  const n = Number(m[1]);
  const unidad = { D: ["día", "días"], W: ["semana", "semanas"], M: ["mes", "meses"], Y: ["año", "años"] }[m[2]];
  return `${n} ${unidad[n === 1 ? 0 : 1]} gratis`;
}

/** Página de Google Play para ver o cancelar la suscripción. */
export const ADMINISTRAR_SUSCRIPCION = "https://play.google.com/store/account/subscriptions";

/** Solo para pruebas: olvida lo guardado. */
export function _reiniciarPremium(activo = null) {
  premium = activo;
}

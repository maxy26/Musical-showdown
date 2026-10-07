/**
 * Avisos de la campana (pedido del usuario, 07-10-2026). Salen de dos lugares
 * de GitHub (gratis, repositorio público):
 *   - Actualizaciones: las versiones publicadas (Releases) más nuevas que la
 *     instalada. Se crean al subir una etiqueta v*, ver .github/workflows/compilar.yml.
 *   - Novedades y promociones: el archivo avisos/avisos.json del repositorio,
 *     que se edita cuando se quiera publicar algo.
 * Sin internet se muestran los últimos avisos guardados. Los avisos vistos se
 * marcan como leídos al abrir el panel (el globito de la campana desaparece).
 *
 * Solo se toca la red y el almacenamiento dentro de funciones: el módulo se
 * puede importar desde Node (pruebas).
 */

export const URL_VERSIONES = "https://api.github.com/repos/maxy26/Musical-showdown/releases?per_page=5";
export const URL_AVISOS = "https://raw.githubusercontent.com/maxy26/Musical-showdown/main/avisos/avisos.json";
const CLAVE_GUARDADOS = "musical-showdown:avisos";
const CLAVE_LEIDOS = "musical-showdown:avisos-leidos";

export const TIPOS = {
  version: { icono: "⬆️", nombre: "Actualización" },
  novedad: { icono: "✨", nombre: "Novedad" },
  promo: { icono: "🎁", nombre: "Promoción" },
};

/** Compara versiones "1.10" / "v1.8.2": > 0 si `a` es más nueva que `b`. */
export function compararVersiones(a, b) {
  const pa = String(a).replace(/^v/i, "").split(".").map(Number);
  const pb = String(b).replace(/^v/i, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

/** "Hoy", "Ayer", "Hace 3 días", "Hace 2 semanas"… a partir de una fecha ISO. */
export function fechaRelativa(iso, ahora = new Date()) {
  const dias = Math.floor((Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) -
    Date.UTC(...iso.slice(0, 10).split("-").map((n, i) => (i === 1 ? n - 1 : +n)))) / 86400000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 14) return "Hace 1 semana";
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
  if (dias < 60) return "Hace 1 mes";
  return `Hace ${Math.floor(dias / 30)} meses`;
}

/** Versiones publicadas (respuesta de GitHub) más nuevas que la instalada → avisos. */
export function avisosDeVersiones(releases, versionInstalada) {
  return (Array.isArray(releases) ? releases : [])
    .filter((r) => !r.draft && !r.prerelease && compararVersiones(r.tag_name, versionInstalada) > 0)
    .slice(0, 1) // solo la más nueva
    .map((r) => ({
      id: "version-" + r.tag_name,
      tipo: "version",
      fecha: (r.published_at || "").slice(0, 10),
      titulo: `Versión ${r.tag_name.replace(/^v/i, "")} disponible`,
      texto: (r.body || "Hay una versión nueva del juego.").split("\n").find((l) => l.trim()) || "",
      boton: { texto: "⬇️ Descargar", url: r.html_url },
    }));
}

/** Avisos del archivo avisos.json, solo los que tienen lo necesario. */
export function avisosDelArchivo(lista) {
  return (Array.isArray(lista) ? lista : [])
    .filter((a) => a && a.id && TIPOS[a.tipo] && a.titulo && /^\d{4}-\d{2}-\d{2}/.test(a.fecha || ""))
    .map((a) => ({ id: String(a.id), tipo: a.tipo, fecha: a.fecha.slice(0, 10), titulo: a.titulo, texto: a.texto || "",
      boton: a.boton?.texto && a.boton?.url ? { texto: a.boton.texto, url: a.boton.url } : null }));
}

/** Junta y ordena (los más nuevos arriba). */
export function unirAvisos(...listas) {
  return listas.flat().sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---------- Red y almacenamiento ----------
function leer(clave, porDefecto) {
  try { return JSON.parse(window.localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
}
function guardar(clave, valor) {
  try { window.localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ }
}
async function traer(url) {
  const control = new window.AbortController();
  const espera = setTimeout(() => control.abort(), 6000);
  try {
    const r = await window.fetch(url, { signal: control.signal, cache: "no-store" });
    if (!r.ok) throw new Error(url + ": " + r.status);
    return await r.json();
  } finally {
    clearTimeout(espera);
  }
}

let estado = null; // { avisos, sinRed }
/**
 * Trae los avisos (una vez por sesión, salvo `forzar`). Si no hay internet,
 * devuelve los últimos guardados con `sinRed: true`.
 */
export async function cargarAvisos(versionInstalada, forzar = false) {
  if (estado && !forzar) return estado;
  const [versiones, archivo] = await Promise.allSettled([traer(URL_VERSIONES), traer(URL_AVISOS)]);
  if (versiones.status === "rejected" && archivo.status === "rejected") {
    estado = { avisos: leer(CLAVE_GUARDADOS, []), sinRed: true };
    return estado;
  }
  const guardados = leer(CLAVE_GUARDADOS, []);
  const deVersiones = versiones.status === "fulfilled" ? avisosDeVersiones(versiones.value, versionInstalada)
    : guardados.filter((a) => a.tipo === "version");
  const delArchivo = archivo.status === "fulfilled" ? avisosDelArchivo(archivo.value)
    : guardados.filter((a) => a.tipo !== "version");
  estado = { avisos: unirAvisos(deVersiones, delArchivo), sinRed: false };
  guardar(CLAVE_GUARDADOS, estado.avisos);
  return estado;
}
/** Avisos ya cargados (o los guardados, si todavía no se cargaron). */
export function avisosActuales() {
  return estado || { avisos: leer(CLAVE_GUARDADOS, []), sinRed: false };
}
export function idsSinLeer(avisos) {
  const leidos = leer(CLAVE_LEIDOS, []);
  return avisos.filter((a) => !leidos.includes(a.id)).map((a) => a.id);
}
export function marcarLeidos(avisos) {
  guardar(CLAVE_LEIDOS, [...new Set([...leer(CLAVE_LEIDOS, []), ...avisos.map((a) => a.id)])]);
}

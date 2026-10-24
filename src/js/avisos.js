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
import { tiendaActual } from "./tienda.js";
import { esDemo } from "./edicion.js";

export const URL_VERSIONES = "https://api.github.com/repos/maxy26/Musical-showdown/releases?per_page=5";
export const URL_AVISOS = "https://raw.githubusercontent.com/maxy26/Musical-showdown/main/avisos/avisos.json";
const CLAVE_GUARDADOS = "musical-showdown:avisos";
const CLAVE_LEIDOS = "musical-showdown:avisos-leidos";
const CLAVE_RECIBIDOS = "musical-showdown:avisos-recibidos"; // [{ aviso, recibido }] (ver agregarAvisoRecibido)

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

/** Primera línea con texto de las notas de una versión, sin títulos ni marcas de Markdown. */
function primeraLinea(texto) {
  const linea = String(texto || "").split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#"));
  return (linea || "").replace(/^[-+*] /, "").replace(/[*_`]/g, "").trim();
}

/**
 * Aviso de una versión publicada. Lo usan la campana (versiones de GitHub) y la
 * notificación de la versión nueva (build/notificar.js), con el mismo id: así
 * el aviso no se repite cuando llega por los dos lados.
 */
export function avisoDeVersion({ tag, fecha, texto, url, tienda = tiendaActual() }) {
  return {
    id: "version-" + tag,
    tipo: "version",
    fecha: String(fecha || "").slice(0, 10),
    titulo: `Versión ${tag.replace(/^v/i, "")} disponible`,
    texto: texto || "Hay una versión nueva del juego.",
    // Instalado desde una tienda: la actualización se baja de la tienda (tienda.js)
    boton: tienda
      ? { texto: `🛍️ Abrir la ${tienda.nombre}`, url: tienda.enlace }
      : { texto: "⬇️ Descargar", url: url || `https://github.com/maxy26/Musical-showdown/releases/tag/${tag}` },
    importante: true, // las actualizaciones siempre son importantes (salen fuera de la app)
  };
}

/** Versiones publicadas (respuesta de GitHub) más nuevas que la instalada → avisos. */
export function avisosDeVersiones(releases, versionInstalada) {
  return (Array.isArray(releases) ? releases : [])
    .filter((r) => !r.draft && !r.prerelease && compararVersiones(r.tag_name, versionInstalada) > 0)
    .slice(0, 1) // solo la más nueva
    .map((r) => avisoDeVersion({ tag: r.tag_name, fecha: r.published_at, texto: primeraLinea(r.body), url: r.html_url }));
}

/** Avisos del archivo avisos.json, solo los que tienen lo necesario. */
export function avisosDelArchivo(lista) {
  return (Array.isArray(lista) ? lista : [])
    .filter((a) => a && a.id && TIPOS[a.tipo] && a.titulo && /^\d{4}-\d{2}-\d{2}/.test(a.fecha || ""))
    .map((a) => ({ id: String(a.id), tipo: a.tipo, fecha: a.fecha.slice(0, 10), titulo: a.titulo, texto: a.texto || "",
      boton: a.boton?.texto && a.boton?.url ? { texto: a.boton.texto, url: a.boton.url } : null,
      importante: a.importante === true }));
}

/**
 * Avisos importantes del archivo que no estaban en la versión anterior (o que
 * antes no eran importantes): son los que se envían como notificación fuera de
 * la app (build/notificar.js). Así cada uno se envía una sola vez.
 */
export function importantesNuevos(antes, ahora) {
  const yaEnviados = new Set(avisosDelArchivo(antes).filter((a) => a.importante).map((a) => a.id));
  return avisosDelArchivo(ahora).filter((a) => a.importante && !yaEnviados.has(a.id));
}

/** Junta y ordena (los más nuevos arriba). */
export function unirAvisos(...listas) {
  return listas.flat().sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---------- Avisos que llegan dentro de una notificación (usuario, 11-10-2026) ----------
// La notificación trae el aviso completo (build/notificar.js) y la app lo agrega
// a la campana al recibirla, sin esperar a GitHub (avisos.json puede tardar unos
// minutos en verse). Se guardan HORAS_RECIBIDOS horas; después manda lo que
// diga GitHub (si el aviso se borró de avisos.json, deja de verse).
export const HORAS_RECIBIDOS = 24;

/** El aviso que viene en una notificación (texto JSON) → aviso, o null si no sirve. */
export function avisoRecibido(datos) {
  let a;
  try { a = typeof datos === "string" ? JSON.parse(datos) : datos; } catch { return null; }
  if (!a || !a.id || !TIPOS[a.tipo] || !a.titulo || !/^\d{4}-\d{2}-\d{2}/.test(a.fecha || "")) return null;
  return { id: String(a.id), tipo: a.tipo, fecha: a.fecha.slice(0, 10), titulo: a.titulo, texto: a.texto || "",
    boton: a.boton?.texto && a.boton?.url ? { texto: a.boton.texto, url: a.boton.url } : null, importante: true };
}

/**
 * Suma a `avisos` los recibidos por notificación que todavía valen: de menos de
 * HORAS_RECIBIDOS horas, que no estén ya en la lista y, si son de una versión,
 * más nueva que la instalada.
 */
export function unirConRecibidos(avisos, recibidos, versionInstalada, ahora = Date.now()) {
  const ids = new Set(avisos.map((a) => a.id));
  const extra = (Array.isArray(recibidos) ? recibidos : [])
    .filter((r) => r && r.aviso && ahora - r.recibido < HORAS_RECIBIDOS * 3600 * 1000 && !ids.has(r.aviso.id))
    .filter((r) => r.aviso.tipo !== "version" || compararVersiones(r.aviso.id.replace(/^version-/, ""), versionInstalada) > 0)
    .map((r) => r.aviso);
  return extra.length ? unirAvisos(avisos, extra) : avisos;
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
  const [versiones, archivo] = await Promise.allSettled([
    esDemo() ? Promise.resolve([]) : traer(URL_VERSIONES), // la demo de la Store se actualiza sola: sin avisos de versiones de GitHub
    traer(URL_AVISOS),
  ]);
  const recibidos = leer(CLAVE_RECIBIDOS, []);
  if (versiones.status === "rejected" && archivo.status === "rejected") {
    estado = { avisos: unirConRecibidos(leer(CLAVE_GUARDADOS, []), recibidos, versionInstalada), sinRed: true };
    return estado;
  }
  const guardados = leer(CLAVE_GUARDADOS, []);
  const deVersiones = versiones.status === "fulfilled" ? avisosDeVersiones(versiones.value, versionInstalada)
    : guardados.filter((a) => a.tipo === "version");
  const delArchivo = archivo.status === "fulfilled" ? avisosDelArchivo(archivo.value)
    : guardados.filter((a) => a.tipo !== "version");
  const deGitHub = unirAvisos(deVersiones, delArchivo);
  guardar(CLAVE_GUARDADOS, deGitHub); // los recibidos por notificación se guardan aparte
  estado = { avisos: unirConRecibidos(deGitHub, recibidos, versionInstalada), sinRed: false };
  return estado;
}

/**
 * Agrega a la campana el aviso que llegó dentro de una notificación. Devuelve el
 * aviso si quedó en la campana (no, por ejemplo, si es de una versión que ya
 * está instalada), o null.
 */
export function agregarAvisoRecibido(datos, versionInstalada) {
  const aviso = avisoRecibido(datos);
  if (!aviso) return null;
  const ahora = Date.now();
  const recibidos = leer(CLAVE_RECIBIDOS, [])
    .filter((r) => r?.aviso && r.aviso.id !== aviso.id && ahora - r.recibido < HORAS_RECIBIDOS * 3600 * 1000);
  recibidos.push({ aviso, recibido: ahora });
  guardar(CLAVE_RECIBIDOS, recibidos);
  const actual = avisosActuales();
  estado = { ...actual, avisos: unirConRecibidos(actual.avisos, recibidos, versionInstalada, ahora) };
  return estado.avisos.some((a) => a.id === aviso.id) ? aviso : null;
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

// ---------- Revisión mientras la app está abierta (usuario, 08-10-2026) ----------
// Sin un servidor propio no se pueden "empujar" los avisos al instante: el juego
// revisa solo cada MINUTOS_REVISION minutos con la app a la vista, y además
// apenas vuelve internet o se vuelve a la app. GitHub permite 60 consultas por
// hora sin cuenta: con al menos 1 minuto entre revisiones no se llega al límite.
// (avisos.json puede tardar hasta unos 5 minutos en verse por la caché de GitHub.)
export const MINUTOS_REVISION = 3;
const MINIMO_ENTRE_REVISIONES = 60 * 1000;
let revisando = false;
let ultimaRevision = 0;

/** IDs sin leer que aparecieron entre dos listas de avisos (los que "llegaron"). */
export function avisosNuevos(sinLeerAntes, sinLeerAhora) {
  const antes = new Set(sinLeerAntes);
  return sinLeerAhora.filter((id) => !antes.has(id));
}

/** Empieza a revisar los avisos solo; `alLlegar(ids)` recibe los que llegaron. */
export function revisarAvisosSeguido(versionInstalada, alLlegar) {
  if (revisando) return;
  revisando = true;
  const revisar = async () => {
    if (Date.now() - ultimaRevision < MINIMO_ENTRE_REVISIONES) return;
    ultimaRevision = Date.now();
    const antes = idsSinLeer(avisosActuales().avisos);
    const { avisos, sinRed } = await cargarAvisos(versionInstalada, true);
    if (sinRed) return;
    alLlegar(avisosNuevos(antes, idsSinLeer(avisos)));
  };
  const intentar = () => { revisar().catch(() => {}); };
  window.setInterval(() => { if (!document.hidden) intentar(); }, MINUTOS_REVISION * 60 * 1000);
  window.addEventListener("online", intentar);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) intentar(); });
}

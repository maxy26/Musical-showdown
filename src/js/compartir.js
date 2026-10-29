/**
 * Compartir el juego desde el podio (pedido del usuario, 08-10-2026; maqueta
 * aprobada). Arma una imagen del podio (1080 × 1350, formato de redes sociales)
 * con el logo, el ganador, los 3 primeros puestos e invitación con el enlace
 * de descarga, y la comparte:
 *   - Android (app): menú de compartir con los complementos Share y Filesystem
 *     de Capacitor (la vista web de Android no tiene el de la web).
 *   - Celular en la web: menú de compartir del navegador.
 *   - PC: guarda la imagen en Descargas y copia el texto con el enlace.
 * El enlace es la página de descargas de GitHub mientras el juego no esté en
 * una tienda oficial.
 *
 * Nada toca el DOM al cargar el módulo.
 */
import { tiendaActual } from "./tienda.js";
import { esDemo } from "./edicion.js";
import { buildPodium } from "./podium.js";
import { formatPoints } from "./scoring.js";
import { nativo } from "./plataforma.js";
import { dibujarIcono } from "./iconosEmoji.js";

// Desde una tienda, el enlace es el de la tienda (tienda.js). La demo de la Store
// no manda a descargar por fuera: sin su Store ID no lleva enlace (usuario, 21-10-2026).
const SIN_ENLACE = esDemo() && !tiendaActual();
export const ENLACE_DESCARGA = SIN_ENLACE ? "" : tiendaActual()?.enlace || "https://github.com/maxy26/Musical-showdown/releases";
/** Última línea del texto compartido; sin enlace, dónde buscar el juego. */
export function lineaDeDescarga(enlace) {
  return enlace ? `Descárgalo gratis: ${enlace}` : "Búscalo gratis en la Microsoft Store";
}
export const TEXTO_COMPARTIR = `🎤 ¡Jugamos Musical Showdown! Una palabra, y a cantar la canción que la tenga.\n${lineaDeDescarga(ENLACE_DESCARGA)}`;

const C = { texto: "#F4F4F8" }; // color de texto por defecto de texto()

function cargarImagen(src) {
  return new Promise((ok, mal) => { const i = new window.Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
}
function redondeado(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/** Escribe un texto centrado, achicando la letra si no cabe en `ancho`. */
function texto(ctx, t, x, y, { tam, peso = 700, fuente = "Fredoka", color = C.texto, ancho = 900 } = {}) {
  let s = tam;
  do { ctx.font = `${peso} ${s}px ${fuente}`; s -= 2; } while (ctx.measureText(t).width > ancho && s > 14);
  ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(t, x, y);
}
/** Como `texto`, con un ícono de Material Design a la izquierda (iconosEmoji.js). */
function textoConIcono(ctx, icono, colorIcono, t, x, y, op) {
  const tam = op.tam, ancho = Math.min(op.ancho || 900, (() => { ctx.font = `${op.peso || 700} ${tam}px ${op.fuente || "Fredoka"}`; return ctx.measureText(t).width; })());
  const total = tam + tam * 0.3 + ancho;
  dibujarIcono(ctx, icono, x - total / 2 + tam / 2, y - tam * 0.36, tam * 1.05, colorIcono);
  texto(ctx, t, x - total / 2 + tam * 1.3 + ancho / 2, y, op);
}

/** Combinaciones de colores del fondo que se pueden elegir al compartir: [nombre, resplandores, degradado del texto]. */
export const TEMAS_IMAGEN = {
  noche: { nombre: "Noche", luces: ["#8B6CFF", "#FF5FA2", "#38BDF8"], texto: ["#8B6CFF", "#FF5FA2"] },
  oceano: { nombre: "Océano", luces: ["#3B82F6", "#22D3EE", "#8B6CFF"], texto: ["#38BDF8", "#818CF8"] },
  atardecer: { nombre: "Atardecer", luces: ["#FF7A45", "#FF5FA2", "#FFC857"], texto: ["#FFB547", "#FF5F7E"] },
  bosque: { nombre: "Bosque", luces: ["#10B981", "#22D3EE", "#A3E635"], texto: ["#34D399", "#22D3EE"] },
  fuego: { nombre: "Fuego", luces: ["#EF4444", "#F97316", "#A855F7"], texto: ["#F97316", "#EF4444"] },
};
/**
 * Dibuja la imagen del podio al estilo "Escenario nocturno" (usuario, 29-10-2026). `tema` es un id de
 * TEMAS_IMAGEN o { luces: [3 colores], texto: [2 colores] } ("Mis colores"). `mvpDe(nombre)` devuelve los MVP de
 * un grupo (vacío en Individual). Devuelve { blob, url } (PNG).
 */
export async function imagenDelPodio({ scores, winner, mvpDe = () => [], tema = "noche" }) {
  const T = typeof tema === "object" ? tema : TEMAS_IMAGEN[tema] || TEMAS_IMAGEN.noche; // objeto: colores personalizados
  await Promise.all(["800 40px Inter", "900 40px Inter", "600 40px Inter"].map((f) => document.fonts.load(f)));
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const N = { violeta: "#8B6CFF", rosa: "#FF5FA2", texto: "#F4F4F8", tenue: "#A9ABC2", oro: "#FFC857", plata: "#C9D1E6", bronce: "#E39A5B" };
  const grad = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, T.texto[0]); g.addColorStop(1, T.texto[1]); return g; };
  const brillo = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, col.slice(0, 7) + "00"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  ctx.fillStyle = "#0B0D17"; ctx.fillRect(0, 0, W, H);
  brillo(230, 260, 620, T.luces[0] + "8C"); brillo(880, 330, 560, T.luces[1] + "6B"); brillo(620, 1180, 620, T.luces[2] + "52");
  const fino = N.tenue;
  try { ctx.drawImage(await cargarImagen("icons/icon-192.png"), W / 2 - 60, 56, 120, 120); } catch { /* sin logo */ }
  // "Musical" en blanco y "Showdown" en degradado
  ctx.font = "900 62px Inter"; ctx.textBaseline = "alphabetic";
  const a = ctx.measureText("Musical ").width, b = ctx.measureText("Showdown").width, x0 = W / 2 - (a + b) / 2;
  ctx.textAlign = "left"; ctx.fillStyle = N.texto; ctx.fillText("Musical ", x0, 252);
  ctx.fillStyle = grad(x0 + a, x0 + a + b); ctx.fillText("Showdown", x0 + a, 252);
  ctx.letterSpacing = "8px";
  textoConIcono(ctx, "trophy", N.oro, "GANADOR", W / 2, 350, { tam: 32, fuente: "Inter", peso: 700, color: fino });
  ctx.letterSpacing = "0px";
  ctx.font = "900 100px Inter";
  const wn = Math.min(ctx.measureText(winner).width, 940);
  texto(ctx, winner, W / 2, 452, { tam: 100, fuente: "Inter", peso: 900, color: grad(W / 2 - wn / 2, W / 2 + wn / 2), ancho: 940 });
  texto(ctx, `${formatPoints(scores[winner])} pts`, W / 2, 520, { tam: 44, fuente: "Inter", peso: 700, color: N.texto });
  // Podio de vidrio teñido de oro, plata y bronce
  const { steps } = buildPodium(scores);
  const alto = { 1: 300, 2: 220, 3: 160 }, color = { 1: N.oro, 2: N.plata, 3: N.bronce };
  const base = 1090, anchoCol = 290;
  [[2, 95], [1, 395], [3, 695]].forEach(([p, x]) => {
    const paso = steps.find((s) => s.place === p);
    if (!paso) return;
    const top = base - alto[p];
    const t = ctx.createLinearGradient(0, top, 0, base); t.addColorStop(0, color[p] + "55"); t.addColorStop(1, color[p] + "0A");
    if (p === 1) { ctx.shadowColor = color[p] + "99"; ctx.shadowBlur = 60; }
    ctx.fillStyle = "#FFFFFF0F"; redondeado(ctx, x, top, anchoCol, alto[p], 26); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = t; redondeado(ctx, x, top, anchoCol, alto[p], 26); ctx.fill();
    ctx.strokeStyle = color[p] + "AA"; ctx.lineWidth = 3; redondeado(ctx, x, top, anchoCol, alto[p], 26); ctx.stroke();
    texto(ctx, String(p), x + anchoCol / 2, top + alto[p] / 2 + 40, { tam: 110, fuente: "Inter", peso: 900, color: color[p] });
    let y = top - 30;
    [...paso.entries].reverse().forEach((e) => {
      const mvp = mvpDe(e.name);
      if (mvp.length) { textoConIcono(ctx, "star", N.oro, `MVP: ${mvp.join(" y ")}`, x + anchoCol / 2, y, { tam: 24, fuente: "Inter", peso: 700, color: fino, ancho: 240 }); y -= 36; }
      texto(ctx, `${formatPoints(e.points)} pts`, x + anchoCol / 2, y, { tam: 30, fuente: "Inter", peso: 600, color: fino, ancho: 270 }); y -= 44;
      texto(ctx, e.name, x + anchoCol / 2, y, { tam: 44, fuente: "Inter", peso: 800, color: N.texto, ancho: 270 }); y -= 56;
    });
    dibujarIcono(ctx, "military_tech", x + anchoCol / 2, y - 28, 72, color[p]);
  });
  // Invitación y enlace en un panel de vidrio
  ctx.fillStyle = "#FFFFFF12"; redondeado(ctx, 60, 1140, W - 120, 160, 32); ctx.fill();
  ctx.strokeStyle = "#FFFFFF26"; ctx.lineWidth = 2; redondeado(ctx, 60, 1140, W - 120, 160, 32); ctx.stroke();
  textoConIcono(ctx, "mic", T.texto[1], "¡Juega Musical Showdown!", W / 2, 1205, { tam: 44, fuente: "Inter", peso: 800, color: N.texto });
  texto(ctx, SIN_ENLACE ? lineaDeDescarga("") : `Descárgalo gratis: ${tiendaActual()?.corto || "github.com/maxy26/Musical-showdown"}`, W / 2, 1262, { tam: 28, fuente: "Inter", peso: 600, color: fino, ancho: 900 });
  const blob = await new Promise((ok) => cv.toBlob(ok, "image/png"));
  return { blob, url: window.URL.createObjectURL(blob) };
}

/** Nombre del archivo, con fecha y hora para no pisar uno anterior. */
export function nombreDelArchivo(fecha = new Date()) {
  const d = (n) => String(n).padStart(2, "0");
  return `musical-showdown-podio-${fecha.getFullYear()}-${d(fecha.getMonth() + 1)}-${d(fecha.getDate())}-${d(fecha.getHours())}${d(fecha.getMinutes())}.png`;
}

/** ¿Hay menú de compartir (app de Android o navegador del celular)? En PC, no. */
export function hayMenuCompartir() {
  if (window.Capacitor?.isNativePlatform?.()) return true;
  const enPC = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  return !enPC && typeof window.navigator.canShare === "function";
}

function aBase64(blob) {
  return new Promise((ok, mal) => {
    const r = new window.FileReader();
    r.onload = () => ok(String(r.result).split(",")[1]);
    r.onerror = mal;
    r.readAsDataURL(blob);
  });
}

/**
 * Comparte la imagen y el texto. Devuelve "compartido", "cancelado" o
 * "guardado" (PC: imagen en Descargas y texto copiado).
 */
export async function compartirPodio({ blob, url }) {
  const nombre = nombreDelArchivo();
  if (window.Capacitor?.isNativePlatform?.()) {
    // Android: la imagen se guarda un momento en la caché de la app y se comparte
    const { uri } = await nativo("Filesystem", "writeFile", { path: nombre, data: await aBase64(blob), directory: "CACHE" });
    try {
      await nativo("Share", "share", { title: "Musical Showdown", text: TEXTO_COMPARTIR, files: [uri], dialogTitle: "Compartir el podio" });
      return "compartido";
    } catch {
      return "cancelado";
    }
  }
  const archivo = new window.File([blob], nombre, { type: "image/png" });
  if (hayMenuCompartir() && window.navigator.canShare({ files: [archivo] })) {
    try {
      await window.navigator.share({ files: [archivo], text: TEXTO_COMPARTIR });
      return "compartido";
    } catch {
      return "cancelado";
    }
  }
  // PC: descargar la imagen (en el .exe va directo a Descargas) y copiar el texto
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  try { await window.navigator.clipboard.writeText(TEXTO_COMPARTIR); } catch { /* sin portapapeles */ }
  return "guardado";
}

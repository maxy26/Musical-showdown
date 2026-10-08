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
import { buildPodium } from "./podium.js";
import { formatPoints } from "./scoring.js";
import { nativo } from "./plataforma.js";

export const ENLACE_DESCARGA = "https://github.com/maxy26/Musical-showdown/releases";
export const TEXTO_COMPARTIR = `🎤 ¡Jugamos Musical Showdown! Una palabra, y a cantar la canción que la tenga.\nDescárgalo gratis: ${ENLACE_DESCARGA}`;

const C = { fondo: "#141833", brillo: "#3a2f7a", oro: "#FFD23F", rosa: "#FF5C7A", turquesa: "#2EC4B6", texto: "#F5F0FF", tenue: "#B9B4D9", bloque: "#2b3166" };

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

/**
 * Dibuja la imagen del podio. `mvpDe(nombre)` devuelve los MVP de un grupo
 * (vacío en Individual). Devuelve { blob, url } (PNG).
 */
export async function imagenDelPodio({ scores, winner, mvpDe = () => [] }) {
  await Promise.all(["700 40px Fredoka", "800 40px Nunito"].map((f) => document.fonts.load(f)));
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  // Fondo de escenario con luces
  const g = ctx.createRadialGradient(W / 2, 0, 50, W / 2, 200, 1100);
  g.addColorStop(0, C.brillo); g.addColorStop(0.75, C.fondo); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  [[220, C.rosa], [540, C.oro], [860, C.turquesa]].forEach(([x, col]) => {
    const l = ctx.createLinearGradient(x, 0, x, 900); l.addColorStop(0, col + "40"); l.addColorStop(1, col + "00");
    ctx.fillStyle = l; ctx.beginPath(); ctx.moveTo(x - 40, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 180, 900); ctx.lineTo(x - 180, 900); ctx.fill();
  });
  // Logo y nombre del juego
  try { ctx.drawImage(await cargarImagen("icons/icon-192.png"), W / 2 - 70, 50, 140, 140); } catch { /* sin logo */ }
  texto(ctx, "Musical Showdown", W / 2, 260, { tam: 64 });
  // Ganador
  texto(ctx, "🏆 GANADOR", W / 2, 360, { tam: 38, fuente: "Nunito", peso: 800, color: C.tenue });
  texto(ctx, winner, W / 2, 450, { tam: 92, color: C.oro });
  texto(ctx, `${formatPoints(scores[winner])} pts`, W / 2, 520, { tam: 46, fuente: "Nunito", peso: 800 });
  // Podio: 2.º a la izquierda, 1.º al centro, 3.º a la derecha
  const { steps } = buildPodium(scores);
  const alto = { 1: 300, 2: 220, 3: 160 }, medalla = { 1: "🥇", 2: "🥈", 3: "🥉" }, color = { 1: C.oro, 2: "#C9D1E6", 3: "#E39A5B" };
  const base = 1090, anchoCol = 300;
  [[2, 90], [1, 390], [3, 690]].forEach(([p, x]) => {
    const paso = steps.find((s) => s.place === p);
    if (!paso) return;
    const top = base - alto[p];
    ctx.fillStyle = C.bloque; redondeado(ctx, x, top, anchoCol, alto[p], 24); ctx.fill();
    ctx.fillStyle = color[p]; redondeado(ctx, x, top, anchoCol, 14, 7); ctx.fill();
    texto(ctx, String(p), x + anchoCol / 2, top + alto[p] / 2 + 40, { tam: 110, color: color[p] + "cc" });
    let y = top - 30;
    [...paso.entries].reverse().forEach((e) => {
      const mvp = mvpDe(e.name);
      if (mvp.length) { texto(ctx, `⭐ MVP: ${mvp.join(" y ")}`, x + anchoCol / 2, y, { tam: 24, fuente: "Nunito", peso: 800, color: C.tenue, ancho: 280 }); y -= 36; }
      texto(ctx, `${formatPoints(e.points)} pts`, x + anchoCol / 2, y, { tam: 30, fuente: "Nunito", peso: 800, color: C.tenue, ancho: 280 }); y -= 44;
      texto(ctx, e.name, x + anchoCol / 2, y, { tam: 44, ancho: 280 }); y -= 56;
    });
    texto(ctx, medalla[p], x + anchoCol / 2, y - 6, { tam: 64 });
  });
  // Invitación y enlace
  ctx.fillStyle = "#00000055"; redondeado(ctx, 60, 1140, W - 120, 160, 32); ctx.fill();
  texto(ctx, "🎤 ¡Juega Musical Showdown!", W / 2, 1205, { tam: 46, color: C.oro });
  texto(ctx, "Descárgalo gratis: github.com/maxy26/Musical-showdown", W / 2, 1265, { tam: 30, fuente: "Nunito", peso: 800, color: C.texto, ancho: 900 });
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

/**
 * Íconos de Material Design en lugar de los emojis (usuario, 25-10-2026: en las
 * tres apps, también en las ayudas). El código sigue escribiendo el emoji, que
 * funciona como nombre del ícono; al dibujarse la pantalla, `iniciarIconos()`
 * cambia cada emoji por su ícono SVG (del color del texto, o del de su clase).
 * Así no hay que tocar cada pantalla, y los textos para compartir (WhatsApp)
 * siguen con emojis. La imagen del podio usa `dibujarIcono` (compartir.js).
 */
import { ICONOS_MATERIAL } from "./iconosMaterial.js";

/** emoji → [ícono de Material Symbols, clase de color (opcional)] */
export const EMOJI_A_ICONO = {
  "✅": ["check_circle", "mi-ok"], "❌": ["cancel", "mi-mal"], "🎤": ["mic"], "🙋": ["emoji_people"],
  "🙋‍♂️": ["person"], "👥": ["group"], "🔁": ["repeat"], "⭐": ["star", "mi-oro"], "❓": ["help"],
  "📱": ["smartphone"], "▶": ["play_arrow"], "▶️": ["play_arrow"], "🔒": ["lock"],
  "⚠️": ["warning", "mi-aviso"], "⚠": ["warning", "mi-aviso"], "🔊": ["volume_up"], "🔇": ["volume_off"],
  "🔈": ["volume_mute"], "🏆": ["trophy", "mi-oro"], "♂️": ["male"], "🚫": ["block", "mi-mal"],
  "⏱️": ["timer"], "📺": ["tv"], "⏹️": ["stop_circle"], "🔎": ["search"], "✨": ["auto_awesome", "mi-oro"],
  "⌛": ["hourglass_empty"], "⏳": ["hourglass_top"], "🎯": ["target"], "😢": ["sentiment_dissatisfied"],
  "📞": ["call"], "👤": ["person"], "⚙️": ["settings"], "🕐": ["schedule"], "🙅": ["timer_off"],
  "☝️": ["counter_1"], "♾️": ["all_inclusive"], "😄": ["sentiment_very_satisfied"], "😎": ["mood"],
  "🤩": ["sentiment_excited"], "🙂": ["sentiment_satisfied"], "➕": ["add"], "➖": ["remove"],
  "🎮": ["sports_esports"], "⏰": ["alarm"], "📡": ["wifi_off"], "📤": ["share"], "⬆️": ["upgrade"],
  "⬇️": ["download"], "🎁": ["redeem"], "🛍️": ["shopping_bag"], "👆": ["touch_app"], "🛡️": ["shield"],
  "🗑": ["delete"], "🔄": ["refresh"], "🔔": ["notifications"], "🚪": ["logout"], "🏠": ["home"],
  "📖": ["menu_book"], "🎶": ["queue_music"], "🎵": ["music_note"], "💾": ["save"], "✍️": ["edit_note"],
  "📲": ["send_to_mobile"], "📷": ["photo_camera"], "🔗": ["link"], "⏸": ["pause"], "⏸️": ["pause"],
  "✏️": ["edit"], "🎲": ["casino"], "🥇": ["military_tech", "mi-oro"], "🥈": ["military_tech", "mi-plata"],
  "🥉": ["military_tech", "mi-bronce"],
};

// Un emoji con sus modificadores (FE0F) y uniones (ZWJ), p. ej. "🙋‍♂️"
const EMOJI = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;
// Donde un <svg> no se puede poner
const SIN_ICONOS = new Set(["OPTION", "TEXTAREA", "TITLE", "SCRIPT", "STYLE"]);

/** Ícono por su emoji (o undefined si no tiene uno). */
export function iconoDe(emoji) {
  return EMOJI_A_ICONO[emoji] || EMOJI_A_ICONO[emoji.replace(/️/g, "")] || EMOJI_A_ICONO[emoji + "️"];
}

/** Caja y trazo de un ícono (casi todos vienen en la caja "0 -960 960 960"). */
function datosDe(nombre) {
  const d = ICONOS_MATERIAL[nombre];
  return Array.isArray(d) ? d : ["0 -960 960 960", d];
}

/** <svg> de un ícono de Material Symbols. */
export function svgIcono(nombre, clase = "") {
  const [caja, d] = datosDe(nombre);
  return `<svg class="mi ${clase}" viewBox="${caja}" aria-hidden="true"><path d="${d}"/></svg>`;
}

/** Cambia los emojis de un nodo de texto por íconos. */
function cambiarTexto(nodo) {
  const padre = nodo.parentNode;
  if (!padre || SIN_ICONOS.has(padre.nodeName) || padre.closest?.("svg")) return;
  const t = nodo.nodeValue;
  EMOJI.lastIndex = 0; // matchAll empieza donde quedó la búsqueda anterior
  let html = "", desde = 0, cambio = false;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  for (const m of t.matchAll(EMOJI)) {
    const ic = iconoDe(m[0]);
    if (!ic) continue;
    html += esc(t.slice(desde, m.index)) + svgIcono(ic[0], ic[1]);
    desde = m.index + m[0].length;
    cambio = true;
  }
  if (!cambio) return;
  const plantilla = document.createElement("template");
  plantilla.innerHTML = html + esc(t.slice(desde));
  padre.replaceChild(plantilla.content, nodo);
}

/** Cambia los emojis de un nodo y de todo lo que tiene adentro. */
export function cambiarEmojis(raiz) {
  if (raiz.nodeType === 3) { cambiarTexto(raiz); return; }
  if (raiz.nodeType !== 1 && raiz.nodeType !== 11) return;
  const recorrido = document.createTreeWalker(raiz, 4); // solo textos
  const textos = [];
  while (recorrido.nextNode()) textos.push(recorrido.currentNode);
  textos.forEach(cambiarTexto);
}

/** Desde aquí, todo lo que se dibuje en la página sale con íconos (main.js). */
export function iniciarIconos() {
  cambiarEmojis(document.body);
  new window.MutationObserver((cambios) => {
    for (const c of cambios) {
      if (c.type === "characterData") cambiarTexto(c.target);
      else c.addedNodes.forEach(cambiarEmojis);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}

/** Dibuja un ícono en un canvas, centrado en (x, y), de `tam` píxeles. */
export function dibujarIcono(ctx, nombre, x, y, tam, color) {
  const [caja, d] = datosDe(nombre);
  const [x0, y0, ancho] = caja.split(" ").map(Number);
  ctx.save();
  ctx.translate(x - tam / 2, y - tam / 2);
  ctx.scale(tam / ancho, tam / ancho);
  ctx.translate(-x0, -y0);
  ctx.fillStyle = color;
  ctx.fill(new window.Path2D(d));
  ctx.restore();
}

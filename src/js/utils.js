/** Crea un elemento DOM a partir de una cadena HTML. */
export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Baraja un arreglo en el mismo sitio (Fisher-Yates). */
export function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Normaliza texto para comparar: minúsculas, sin tildes ni diéresis
 * ("Corazón" -> "corazon"), pero conservando la ñ, porque en español
 * "año" y "ano" son palabras distintas.
 */
export function normalizeText(s) {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/ñ/g, "\u0001")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0001/g, "ñ");
}

/**
 * Igual que normalizeText, pero además cambia signos de puntuación por
 * espacios y junta los espacios repetidos. Sirve para buscar un fragmento
 * cantado sin que importen las comas o los saltos de línea de la letra.
 */
export function normalizeForSearch(s) {
  return normalizeText(s).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Escapa los caracteres especiales de HTML. */
export function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

/**
 * Devuelve `text` como HTML seguro, con cada aparición de `word` como palabra
 * completa envuelta en <mark>. No distingue mayúsculas ni tildes: "corazon"
 * resalta "Corazón", pero "amor" no resalta el "amor" de "amores".
 */
export function highlightWord(text, word) {
  const target = normalizeText(word);
  let html = "";
  let last = 0;
  for (const m of text.matchAll(/[\p{L}\p{M}\p{N}]+/gu)) {
    if (normalizeText(m[0]) !== target) continue;
    html += escapeHtml(text.slice(last, m.index)) + "<mark>" + escapeHtml(m[0]) + "</mark>";
    last = m.index + m[0].length;
  }
  return html + escapeHtml(text.slice(last));
}

/** Elige un elemento de `items` con probabilidad proporcional a `weights`. */
export function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

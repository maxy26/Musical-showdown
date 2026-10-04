/**
 * Animación de selección (pedido del usuario, 04-10-2026): el botón o la
 * casilla que se toca crece un poco y vuelve, para que se note lo elegido.
 *
 * Muchos botones vuelven a dibujar la pantalla al tocarlos (Sí/No, géneros,
 * interruptor…), así que el botón tocado ya no existe cuando termina el toque.
 * Por eso se busca en la pantalla nueva el botón equivalente (mismo tipo, mismo
 * texto y mismos datos) y se anima ese. Si el toque lleva a otra pantalla, no
 * hay equivalente y no se anima nada.
 *
 * Con "Animaciones: No" (html[data-anim="off"]) el CSS apaga la animación.
 * Sin efectos al cargar el módulo: main.js llama a initTapFeedback().
 */

/** Elementos que se animan al elegirlos. */
const TAPPABLE = "button, .chip, .home-card, .manual-item.is-selectable, .result-item, .team-member, [role=button]";

function describe(node) {
  if (!node) return "";
  const data = Object.entries(node.dataset || {}).sort().map(([k, v]) => `${k}=${v}`).join("&");
  return `${node.tagName}|${node.id}|${data}`;
}

/**
 * "Firma" de un elemento para reconocerlo después de volver a dibujar la
 * pantalla: el elemento, su texto y el grupo donde está (así el "Sí" de una
 * opción no se confunde con el "Sí" de otra).
 */
function signature(node) {
  return `${describe(node)}|${node.textContent.trim()}^${describe(node.parentElement)}`;
}

function pop(node) {
  node.classList.remove("tap-pop");
  void node.offsetWidth; // reinicia la animación si se toca dos veces seguidas
  node.classList.add("tap-pop");
  node.addEventListener("animationend", () => node.classList.remove("tap-pop"), { once: true });
}

export function initTapFeedback() {
  // Se escucha en <body> al final del clic: para entonces la pantalla ya se redibujó.
  document.addEventListener("click", (e) => {
    const tapped = e.target.closest?.(TAPPABLE);
    if (!tapped || tapped.disabled) return;
    if (tapped.isConnected) { pop(tapped); return; }
    const sig = signature(tapped);
    const twin = [...document.querySelectorAll(TAPPABLE)].find((n) => signature(n) === sig);
    if (twin) pop(twin);
  });
}

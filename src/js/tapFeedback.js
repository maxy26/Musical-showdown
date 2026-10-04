/**
 * Animación al tocar (pedido del usuario, 04-10-2026): una onda dorada que sale
 * del punto que se tocó en cualquier botón o casilla. La onda se dibuja aparte
 * (en <body>, con posición fija), así que se sigue viendo aunque al tocar se
 * vuelva a dibujar la pantalla (por ejemplo, al elegir "Sí" o un género). El
 * "hundirse" al presionar está en el CSS (:active).
 *
 * Con "Animaciones: No" (html[data-anim="off"]) no se dibuja nada.
 * Sin efectos al cargar el módulo: main.js llama a initTapFeedback().
 */

/** Elementos que reaccionan al toque. */
const TAPPABLE = "button, .chip, .home-card, .manual-item.is-selectable, .result-item, .team-member, [role=button]";

export function initTapFeedback() {
  document.addEventListener("pointerdown", (e) => {
    if (document.documentElement.dataset.anim === "off") return;
    const target = e.target.closest(TAPPABLE);
    if (!target || target.disabled) return;
    const ripple = document.createElement("span");
    ripple.className = "tap-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
    setTimeout(() => ripple.remove(), 700); // por si la animación no llega a terminar
  });
}

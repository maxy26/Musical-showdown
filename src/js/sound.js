/**
 * Gestor de sonido del juego: clic de botones, música ambiental en loop,
 * y ticks del reloj (normal / últimos 5 segundos).
 *
 * Los navegadores bloquean el autoplay de audio hasta que hay una
 * interacción real del usuario, por eso el ambiente arranca recién en el
 * primer clic dentro de la app (ver initSound más abajo).
 *
 * Nota de diseño: todo lo que toca `localStorage`/`Audio`/`document` vive
 * detrás de funciones (inicialización perezosa), nunca en el nivel
 * superior del módulo. Así este archivo se puede importar con seguridad
 * desde Node (tests, herramientas de build) sin necesitar un navegador.
 */

const MUTE_KEY = "musical-showdown-muted";

let muted = null; // null = todavía no se leyó localStorage
let ambientStarted = false;
let sounds = null; // objetos <audio>, creados la primera vez que hacen falta

function isMuted() {
  if (muted === null) {
    muted = typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
  }
  return muted;
}

function getSounds() {
  if (!sounds) {
    const ambient = new Audio("audio/ambient.mp3");
    ambient.loop = true;
    ambient.volume = 0.35;
    sounds = {
      click: new Audio("audio/click.wav"),
      tick: new Audio("audio/tick.wav"),
      tickUrgent: new Audio("audio/tick-urgent.wav"),
      ambient,
    };
  }
  return sounds;
}

function playFresh(audioEl) {
  if (isMuted()) return;
  // clona el nodo para permitir sonidos superpuestos (clics rápidos seguidos)
  const node = audioEl.cloneNode();
  node.volume = audioEl.volume || 1;
  node.play().catch(() => {});
}

export function playClick() {
  playFresh(getSounds().click);
}

export function playTick(urgent) {
  playFresh(urgent ? getSounds().tickUrgent : getSounds().tick);
}

export function startAmbient() {
  if (isMuted() || ambientStarted) return;
  ambientStarted = true;
  getSounds().ambient.play().catch(() => {});
}

export { isMuted };

export function setMuted(value) {
  muted = value;
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  if (muted) {
    getSounds().ambient.pause();
  } else {
    ambientStarted = false; // se reintentará en el próximo clic
    startAmbient();
  }
  updateMuteButtons();
}

function updateMuteButtons() {
  document.querySelectorAll(".mute-btn").forEach((btn) => {
    btn.textContent = muted ? "🔇" : "🔊";
    btn.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
  });
}

/** Markup del botón de silencio, mismo estilo que el botón de ayuda (❓). */
export function muteButtonHTML() {
  const m = isMuted();
  return `<button type="button" class="icon-btn icon-btn-round mute-btn" aria-label="${m ? "Activar sonido" : "Silenciar"}">${m ? "🔇" : "🔊"}</button>`;
}

/** Engancha el/los botón(es) de silencio recién renderizados dentro de `root`. */
export function bindMuteButtons(root) {
  root.querySelectorAll(".mute-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      setMuted(!isMuted());
    };
  });
}

/** Engancha los clics globales (sonido de botón + arranque del ambiente). */
export function initSound() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("button")) playClick();
    startAmbient();
  });
}

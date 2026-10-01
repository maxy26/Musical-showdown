/**
 * Gestor de sonido del juego: clic de botones, música ambiental en loop,
 * y ticks del reloj (normal / últimos 5 segundos).
 *
 * Cada tipo de sonido se enciende o apaga en Ajustes (tuerca del inicio,
 * settings.js): música de fondo, efectos (clic de botones) y reloj. El botón
 * 🔊 de las pantallas se quitó el 01-10-2026 (pedido del usuario).
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

import { loadSettings } from "./settings.js";

let ambientStarted = false;
let sounds = null; // objetos <audio>, creados la primera vez que hacen falta

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

/** ¿Está encendido este tipo de sonido en Ajustes? ("music" | "effects" | "clock") */
function kindOn(kind) {
  return loadSettings()[kind] !== false;
}

function playFresh(audioEl, kind) {
  if (!kindOn(kind)) return;
  // clona el nodo para permitir sonidos superpuestos (clics rápidos seguidos)
  const node = audioEl.cloneNode();
  node.volume = audioEl.volume || 1;
  node.play().catch(() => {});
}

export function playClick() {
  playFresh(getSounds().click, "effects");
}

export function playTick(urgent) {
  playFresh(urgent ? getSounds().tickUrgent : getSounds().tick, "clock");
}

export function startAmbient() {
  if (!kindOn("music") || ambientStarted) return;
  ambientStarted = true;
  getSounds().ambient.play().catch(() => {});
}

/**
 * Aplica un cambio de Ajustes a la música que ya está sonando: si se apagó, la
 * pausa; si se encendió, vuelve a sonar.
 */
export function refreshMusic() {
  ambientStarted = false;
  if (kindOn("music")) startAmbient();
  else if (sounds) sounds.ambient.pause();
}

/** Engancha los clics globales (sonido de botón + arranque del ambiente). */
export function initSound() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("button")) playClick();
    startAmbient();
  });
}

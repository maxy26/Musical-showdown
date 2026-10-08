/**
 * Sonido del juego: qué suena en cada momento. El motor (audio/motor.js) hace
 * el trabajo con Web Audio y audio/catalogo.js dice qué archivos usa cada efecto.
 *
 * - Música: Funky Disco en el inicio y la configuración; Coffee Beans en las
 *   rondas (cada ronda nueva repite la entrada; en los últimos 5 segundos se
 *   acelera); en el podio se detiene y suena la felicitación.
 * - En Ajustes (settings.js) cada tipo tiene "Sí / No" y, la música y los
 *   efectos, una barra de volumen: volumen 0 es lo mismo que "No".
 * - El botón 🔊 de configuración, grupos y ronda solo quita o pone la música
 *   (usuario, 05-10-2026): al volver, sigue desde donde iba.
 *
 * En la app de Android y en el .exe la música empieza apenas se abre (usuario,
 * 07-10-2026; Capacitor y Electron permiten el sonido automático). En la web los
 * navegadores no dejan sonar nada hasta el primer toque: ahí arranca con el
 * primer clic (ver initSound).
 *
 * Nada toca `document` ni el audio al cargar el módulo (inicialización
 * perezosa): se puede importar desde Node en las pruebas.
 */

import { loadSettings, saveSetting } from "./settings.js";
import { EFECTOS, MAS_FUERTE, MUSICA, TICK } from "./audio/catalogo.js";
import { esAppInstalada, alCambiarPrimerPlano } from "./plataforma.js";
import { tocar, musica, pararMusica, pausarMusica, acelerar, precargar, usarVolumenes, volumenMusica, congelarAudio } from "./audio/motor.js";

/** Volumen de Ajustes (0 a 100) de "music" o "effects". */
export function volumen(kind) {
  const v = loadSettings()[kind + "Vol"];
  return typeof v === "number" ? v : 70;
}
/** ¿Suena este tipo? ("music" | "effects" | "clock"). "No" o volumen 0 lo apagan. */
function kindOn(kind) {
  return loadSettings()[kind] !== false && (kind === "clock" || volumen(kind) > 0);
}

const RONDAS = ["round", "round-intro", "verify", "round-result", "round-result-incorrect"];
let pantalla = "menu";
let arrancada = false; // la música empieza con el primer toque
let musicaEncendida = true;
let ultimoEfecto = 0; // para que un mismo toque no suene dos veces
let pendiente = null;

/** Efecto de un momento del juego ("acertar", "aviso", "abrir"…; ver catalogo.js). */
export function efecto(id) {
  if (!kindOn("effects")) return;
  ultimoEfecto = Date.now();
  sonar(EFECTOS[id], MAS_FUERTE[id]);
}
/** Toca sin que un error de sonido (archivo que no carga, etc.) afecte al juego. */
function sonar(notas, extra = 1) {
  tocar(notas, extra).catch((err) => console.warn("Sonido:", err));
}
/** Igual, pero cede el lugar si el mismo toque ya tiene un sonido más importante (elegir). */
export function efectoSuave(id) {
  clearTimeout(pendiente);
  ultimoEfecto = Date.now();
  pendiente = setTimeout(() => { if (kindOn("effects")) sonar(EFECTOS[id]); }, 0);
}
export function playClick() { efecto("clic"); }
/** Ruleta de puntaje y tiempo: suena cada número que pasa. */
export function ruleta() { if (kindOn("effects")) sonar(EFECTOS.ruleta); }
/** Cuenta antes de la ronda: `n` > 0 es cada número; 0 es el final (más fuerte). */
export function cuenta(n) {
  if (!kindOn("clock")) return;
  if (n > 0) sonar(EFECTOS.cuenta);
  else sonar(EFECTOS.cuentaFinal, MAS_FUERTE.cuentaFinal);
}
/** Se acabó el tiempo de la ronda. */
export function finTiempo() { efecto("fin"); }
/** Tic del reloj; en los últimos 5 segundos también se acelera la música. */
export function playTick(urgent) {
  if (kindOn("clock")) sonar([{ f: TICK[urgent ? 1 : 0] }]);
  if (urgent) acelerar(true);
}

// ---------- Música ----------
function musicaDePantalla() {
  if (!arrancada || !kindOn("music") || pantalla === "results") return;
  musica(RONDAS.includes(pantalla) ? MUSICA.ronda : MUSICA.menu).catch((err) => console.warn("Música:", err));
  if (pantalla !== "round") acelerar(false);
}
/** router.js avisa cada vez que se dibuja una pantalla. */
export function onScreen(screen) {
  const llegaAlPodio = screen === "results" && pantalla !== "results";
  pantalla = screen;
  if (llegaAlPodio) { // se detiene la música y suena la felicitación, una vez
    pararMusica(600);
    efecto("podio");
    return;
  }
  musicaDePantalla();
}
/** Cada ronda nueva repite la entrada de la música. */
export function nuevaRonda() {
  if (arrancada && kindOn("music")) musica(MUSICA.ronda, true).catch((err) => console.warn("Música:", err));
}
function arrancar() {
  if (arrancada) return;
  arrancada = true;
  musicaDePantalla();
}
/** Aplica un cambio de Ajustes o del botón 🔊 a la música (y a su volumen). */
export function refreshMusic() {
  const on = kindOn("music");
  if (on !== musicaEncendida) {
    musicaEncendida = on;
    if (arrancada) { if (on) musicaDePantalla(); else pausarMusica(); }
  }
  volumenMusica();
  pintarBotonesMusica();
}

// ---------- Botón 🔊 (solo la música) ----------
export function muteButtonHTML() {
  const on = kindOn("music");
  return `<button type="button" class="icon-btn icon-btn-round mute-btn" aria-label="${on ? "Quitar la música" : "Poner la música"}" title="Música de fondo">${on ? "🔊" : "🔇"}</button>`;
}
function pintarBotonesMusica() {
  const on = kindOn("music");
  document.querySelectorAll(".mute-btn").forEach((b) => {
    b.textContent = on ? "🔊" : "🔇";
    b.setAttribute("aria-label", on ? "Quitar la música" : "Poner la música");
  });
}
function alternarMusica() {
  const encender = !kindOn("music");
  // Si estaba en 0, al encender vuelve a un volumen que se oiga
  saveSetting(encender && volumen("music") === 0 ? { music: true, musicVol: 50 } : { music: encender });
  refreshMusic();
}

// ---------- Toques ----------
const ELEGIR = "[data-battle], .manual-item.is-selectable, .manual-choose, [data-genre]";
const INTERRUPTOR = "[data-setting], [data-yesno] button, [data-step], #relay-minus, #relay-plus";
const CLIC = "button, select, #players-list input, input[type=text], #battle-card, .opt-row.row-click";

/** Engancha los toques globales: sonido de cada control y arranque de la música. */
export function initSound() {
  musicaEncendida = kindOn("music");
  usarVolumenes(() => ({ efectos: volumen("effects") / 100, musica: volumen("music") / 100 }));
  precargar(Object.values(EFECTOS).concat(TICK.map((f) => [{ f }])), Object.values(MUSICA));
  if (esAppInstalada()) arrancar(); // la música suena apenas se abre la app
  // Al salir de la app sin cerrarla no suena nada; al volver sigue donde iba
  alCambiarPrimerPlano((enSegundoPlano) => congelarAudio(enSegundoPlano));
  document.addEventListener("click", (e) => {
    arrancar();
    if (e.target.closest(".mute-btn")) { alternarMusica(); efecto("interruptor"); return; }
    if (!kindOn("effects")) return;
    if (e.target.closest(".manual-toggle")) return playClick();
    if (e.target.closest(ELEGIR)) { clearTimeout(pendiente); return efecto("elegir"); }
    if (Date.now() - ultimoEfecto < 80) return; // este toque ya sonó con su propio efecto
    if (e.target.closest(INTERRUPTOR)) return efecto("interruptor");
    if (e.target.closest(CLIC)) playClick();
  });
  // Elegir una opción de una lista (puntaje, tiempo…) también suena
  document.addEventListener("change", (e) => {
    if (e.target.matches("select") && kindOn("effects")) playClick();
  });
}

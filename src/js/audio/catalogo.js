/**
 * Sonidos del juego, elegidos por el usuario en la "mesa de sonidos" (pruebas
 * del 04 al 06-10-2026). Son grabaciones de uso libre (CC0); los autores están
 * en audio/CREDITOS.txt.
 *
 * Cada efecto es una lista de notas {f, rate, t, g, lp}:
 *   f: archivo · rate: velocidad (sube o baja el tono) · t: segundos desde el
 *   comienzo · g: volumen relativo · lp: filtro que quita brillo (Hz).
 * El motor (motor.js) iguala todos los efectos al mismo volumen.
 */

const E = "audio/efectos/";
const CLIC = E + "clic.ogg", CRISTAL = E + "cristal.ogg", NOTA = E + "nota.ogg", METAL = E + "metal.ogg";
export const TICK = ["audio/tick.wav", "audio/tick-urgent.wav"];

export const MUSICA = {
  menu: "audio/musica/funky-disco.ogg", // inicio y configuración
  ronda: "audio/musica/coffee-beans.mp3", // rondas
};
/**
 * Bucle sin corte de Coffee Beans (segundos): del 0,88 al 36,08 dura justo 44
 * pulsos, así la repetición cae a tiempo. Se mezclan 0,3 s del final con el comienzo.
 */
export const BUCLES = { [MUSICA.ronda]: [0.882, 36.084] };
/** Duración de la entrada de la música (filtro que se abre con barrido de subida). */
export const ENTRADA_SEGUNDOS = 4;

/** Semitonos → velocidad de reproducción. */
const st = (n) => 2 ** (n / 12);
/** Melodía con un solo sonido: [semitono, segundo] → notas. */
const melodia = (f, pares, extra = {}) => pares.map(([n, t]) => ({ f, rate: st(n), t, ...extra }));
const seguidas = (notas, paso) => notas.map((n, i) => [n, i * paso]);

export const EFECTOS = {
  // Clic de los botones: presionar y soltar
  clic: [{ f: CLIC }, { f: CLIC, t: 0.075, g: 0.7, rate: 1.3 }],
  // Elegir modo, tipo de batalla o géneros: cristal doble suave
  elegir: melodia(CRISTAL, [[0, 0], [7, 0.11]], { g: 0.55, lp: 3000 }),
  // El moderador confirma la canción: escala alegre / escala que se apaga
  acertar: melodia(NOTA, seguidas([0, 2, 4, 7, 9, 12], 0.07), { g: 0.55, lp: 3000 }),
  fallar: melodia(NOTA, seguidas([12, 10, 7, 3, 0], 0.1), { g: 0.5, lp: 2200 }),
  // Sí / No, + / − y botón 🔊
  interruptor: [{ f: E + "interruptor.ogg", rate: 0.8 }],
  // Cada número que pasa en la ruleta de puntaje y tiempo
  ruleta: [{ f: E + "ruleta.ogg", g: 0.6 }],
  // Ventanas de aviso
  aviso: [{ f: E + "aviso.ogg", rate: 1.3, g: 0.55 }],
  // Abrir / cerrar ventanas (Modos, Ajustes, ayuda…)
  abrir: melodia(METAL, [[0, 0], [7, 0.08]]),
  cerrar: melodia(METAL, [[7, 0], [0, 0.08]]),
  // Relevo de más (con penalización). El relevo normal suena con el clic.
  falla: melodia(NOTA, [[-6, 0], [-6, 0.11], [-12, 0.22]]),
  // Se acabó el tiempo de la ronda: tics que bajan
  fin: [0, 0.12, 0.24].map((t, i) => ({ f: TICK[0], t, rate: st(-i * 4) })),
  // Cuenta antes de la ronda: 3, 2 y 1 con cristal; el final, cristal y metal más fuerte
  cuenta: [{ f: CRISTAL }],
  cuentaFinal: [{ f: CRISTAL, rate: st(5) }, { f: METAL, g: 0.8 }],
  // Podio: jingle de victoria con piano y aplausos
  podio: [{ f: E + "podio-piano.ogg" }, { f: E + "aplausos.wav", t: 1.2, g: 0.5 }],
};

/** Algunos efectos suenan más fuerte que el nivel común (el final de la cuenta, 50 %). */
export const MAS_FUERTE = { cuentaFinal: 1.5 };

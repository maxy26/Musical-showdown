/**
 * Motor de sonido (Web Audio). Lo usa sound.js; las pantallas no lo llaman directo.
 *
 * - Efectos: cada sonido se mide una vez y se lleva a un mismo NIVEL, para que
 *   todos se oigan igual (pedido del usuario, 06-10-2026). Los clics, que son
 *   golpes muy cortos, se suben más; un limitador suave evita que saturen.
 * - Música: cada canción se iguala a NIVEL_MUSICA (por debajo de los efectos),
 *   entra con un filtro que se abre y un barrido de subida, puede repetirse en
 *   bucle sin corte, acelerarse en los últimos 5 segundos y pausarse.
 * - Los efectos nunca bajan el volumen de la música ni al revés.
 *
 * Todo se crea la primera vez que hace falta (inicialización perezosa): el
 * módulo se puede importar desde Node (pruebas) sin navegador.
 */

import { BUCLES, ENTRADA_SEGUNDOS } from "./catalogo.js";

export const NIVEL = 0.13; // nivel común de los efectos
export const NIVEL_MUSICA = 0.07; // nivel de la música al 100 %
const CRUCE = 0.3; // segundos que se mezclan el final y el comienzo de un bucle

// Volumen de 0 a 1 de cada tipo; sound.js lo toma de Ajustes.
let fuenteVolumen = () => ({ efectos: 1, musica: 1 });
export function usarVolumenes(fn) { fuenteVolumen = fn; }
const volEfectos = () => fuenteVolumen().efectos;
const volMusica = () => fuenteVolumen().musica;

/** ¿Hay audio? (no en Node, donde corren las pruebas) */
export const hayAudio = () => typeof window !== "undefined" && "AudioContext" in window;

let ctx = null;
function audio() {
  if (!ctx) ctx = new window.AudioContext();
  return ctx;
}
/** Los navegadores no dejan sonar nada hasta el primer toque del usuario. */
export async function despertar() {
  const c = audio();
  if (congelado) return; // fuera de la app no se reactiva (ver congelarAudio)
  if (c.state !== "running") await c.resume();
}

/**
 * Fuera de la app (segundo plano) no suena nada (usuario, 08-10-2026): el audio
 * se congela y al volver sigue desde el mismo punto.
 */
let congelado = false;
export function congelarAudio(si) {
  congelado = si;
  if (!ctx) return;
  (si ? ctx.suspend() : ctx.resume()).catch(() => {});
}
export const estadoAudio = () => ctx?.state ?? "sin-iniciar";

// ---------- Archivos ----------
/**
 * Lee un archivo como bytes. En la versión de Windows el juego se sirve con
 * app:// (ver platforms/desktop/main.js); si fetch no está disponible, se usa
 * XMLHttpRequest.
 */
async function leer(url) {
  try {
    const r = await window.fetch(url);
    if (r.ok) return await r.arrayBuffer();
  } catch { /* se intenta de la otra forma */ }
  return new Promise((resolve, reject) => {
    const x = new window.XMLHttpRequest();
    x.open("GET", url);
    x.responseType = "arraybuffer";
    x.onload = () => (x.response ? resolve(x.response) : reject(new Error("Sin datos: " + url)));
    x.onerror = () => reject(new Error("No se pudo leer: " + url));
    x.send();
  });
}
const buffers = new Map();
export function buffer(f) {
  if (!buffers.has(f)) buffers.set(f, leer(f).then((bytes) => audio().decodeAudioData(bytes)));
  return buffers.get(f);
}

// ---------- Efectos ----------
let limitador = null;
function salidaEfectos() {
  if (!limitador) {
    const c = audio();
    limitador = c.createDynamicsCompressor();
    limitador.threshold.value = -1; limitador.knee.value = 2; limitador.ratio.value = 20;
    limitador.attack.value = 0.001; limitador.release.value = 0.08;
    limitador.connect(c.destination);
  }
  return limitador;
}
/** Conecta una nota (fuente → filtro opcional → volumen → destino) y la programa. */
function conectar(c, b, n, ganancia, destino, inicio) {
  const src = c.createBufferSource();
  src.buffer = b;
  src.playbackRate.value = n.rate || 1;
  const g = c.createGain();
  g.gain.value = ganancia * (n.g || 1);
  let salida = src;
  if (n.lp) {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = n.lp;
    salida = src.connect(lp);
  }
  salida.connect(g).connect(destino);
  src.start(inicio + (n.t || 0));
}
/**
 * Mide un efecto una vez: lo "graba" sin sonido y toma su parte más fuerte
 * (promedio en ventanas de 30 ms) y su pico. Devuelve la ganancia que lo deja
 * en NIVEL (hasta el doble del máximo; el limitador contiene el pico).
 */
const niveles = new Map();
function ganancia(notas) {
  const key = JSON.stringify(notas);
  if (!niveles.has(key)) niveles.set(key, (async () => {
    const sr = 44100, bufs = await Promise.all(notas.map((n) => buffer(n.f)));
    const largo = Math.max(...notas.map((n, i) => (n.t || 0) + bufs[i].duration / (n.rate || 1))) + 0.05;
    const off = new window.OfflineAudioContext(1, Math.ceil(largo * sr), sr);
    notas.forEach((n, i) => conectar(off, bufs[i], n, 1, off.destination, 0));
    const d = (await off.startRendering()).getChannelData(0);
    const ventana = Math.round(sr * 0.03), paso = Math.round(sr * 0.01);
    let pico = 0, rms = 0;
    for (let i = 0; i < d.length; i++) pico = Math.max(pico, Math.abs(d[i]));
    for (let i = 0; i + ventana <= d.length; i += paso) {
      let e = 0;
      for (let k = i; k < i + ventana; k++) e += d[k] * d[k];
      rms = Math.max(rms, Math.sqrt(e / ventana));
    }
    return Math.min(NIVEL / Math.max(rms, 1e-4), 2 / Math.max(pico, 1e-4));
  })());
  return niveles.get(key);
}
/** Toca un efecto (lista de notas) al nivel común; `extra` lo sube o baja (1 = igual). */
export async function tocar(notas, extra = 1) {
  const vol = volEfectos() * extra;
  if (vol <= 0 || !hayAudio() || congelado) return;
  await despertar();
  const c = audio(), [g, bufs] = await Promise.all([ganancia(notas), Promise.all(notas.map((n) => buffer(n.f)))]);
  const inicio = c.currentTime + 0.02;
  notas.forEach((n, i) => conectar(c, bufs[i], n, vol * g, salidaEfectos(), inicio));
}
/** Carga y mide de antemano, para que el primer sonido no llegue tarde. */
export function precargar(efectos, musicas) {
  if (!hayAudio()) return;
  efectos.forEach((notas) => ganancia(notas).catch(() => {}));
  musicas.forEach((f) => (BUCLES[f] ? bufferBucle(f) : buffer(f)).catch(() => {}));
}

// ---------- Música ----------
/** Copia de la canción recortada al bucle, con el final mezclado con el comienzo. */
function bufferBucle(f) {
  const key = f + "|bucle";
  if (!buffers.has(key)) buffers.set(key, buffer(f).then((b) => {
    const [ini, fin] = BUCLES[f], sr = b.sampleRate;
    const i0 = Math.round(ini * sr), i1 = Math.round(fin * sr), x = Math.round(CRUCE * sr), n = i1 - i0;
    const out = audio().createBuffer(b.numberOfChannels, n, sr);
    for (let canal = 0; canal < b.numberOfChannels; canal++) {
      const d = b.getChannelData(canal), o = out.getChannelData(canal);
      o.set(d.subarray(i0, i1));
      for (let k = 0; k < x; k++) { // cruce de potencia constante
        const t = k / x;
        o[n - x + k] = d[i1 - x + k] * Math.cos(t * Math.PI / 2) + d[i0 - x + k] * Math.sin(t * Math.PI / 2);
      }
    }
    return out;
  }));
  return buffers.get(key);
}
/** Ganancia que deja la canción en NIVEL_MUSICA (según su parte fuerte típica). */
const normas = new Map();
function normaMusica(f, b) {
  if (!normas.has(f)) {
    const d = b.getChannelData(0), ventana = Math.round(b.sampleRate * 0.5), niveles = [];
    for (let i = 0; i + ventana <= d.length; i += ventana) {
      let e = 0;
      for (let k = i; k < i + ventana; k += 4) e += d[k] * d[k];
      niveles.push(Math.sqrt(e / (ventana / 4)));
    }
    niveles.sort((a, b2) => a - b2);
    normas.set(f, NIVEL_MUSICA / Math.max(niveles[Math.floor(niveles.length * 0.9)] || 0.1, 1e-3));
  }
  return normas.get(f);
}

let pista = null; // { f, src, lp, gain, t0, off0, norm }
let pedida = null; // canción pedida (puede estar cargándose)
let pausada = null; // { f, pos } de la canción que se quitó con el botón 🔊
const volPista = (p) => volMusica() * (p?.norm ?? 1);
const posicion = (p) => (p.off0 + (audio().currentTime - p.t0)) % p.src.buffer.duration;

/** Barrido de ruido que sube durante la entrada (como en los shows). */
function barrido(t0, seg) {
  const c = audio(), n = Math.round(c.sampleRate * seg), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = b;
  const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2;
  bp.frequency.setValueAtTime(400, t0); bp.frequency.exponentialRampToValueAtTime(9000, t0 + seg);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.15 * volMusica()), t0 + seg);
  g.gain.setValueAtTime(0, t0 + seg);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t0); src.stop(t0 + seg);
}
/** Entrada: la canción empieza apagada y se va destapando, con el barrido de subida. */
function entrada(p) {
  const c = audio(), t0 = c.currentTime + 0.05, seg = ENTRADA_SEGUNDOS, vol = Math.max(0.0001, volPista(p));
  for (const a of [p.lp.frequency, p.gain.gain, p.src.playbackRate]) a.cancelScheduledValues(t0);
  p.src.playbackRate.setValueAtTime(1, t0);
  p.lp.frequency.setValueAtTime(250, t0); p.lp.frequency.exponentialRampToValueAtTime(20000, t0 + seg);
  p.gain.gain.setValueAtTime(vol * 0.5, t0); p.gain.gain.linearRampToValueAtTime(vol, t0 + seg);
  barrido(t0, seg);
}
/**
 * Pone la canción `f`. Si ya suena, no la reinicia (con `repetirEntrada` le
 * vuelve a hacer la entrada). Si es la que se pausó con 🔊, sigue desde donde iba.
 */
export async function musica(f, repetirEntrada = false) {
  if (!hayAudio()) return;
  if (pedida === f) {
    if (repetirEntrada && pista?.f === f) entrada(pista);
    return;
  }
  const sigue = pausada?.f === f ? pausada.pos : null;
  pausada = null;
  soltarPista(500);
  pedida = f;
  await despertar();
  const c = audio(), b = await (BUCLES[f] ? bufferBucle(f) : buffer(f));
  if (pedida !== f) return; // mientras cargaba se pidió otra o se paró
  const src = c.createBufferSource(); src.buffer = b; src.loop = true;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 20000;
  const gain = c.createGain();
  src.connect(lp).connect(gain).connect(c.destination);
  const t0 = c.currentTime + 0.05;
  pista = { f, src, lp, gain, t0, off0: sigue ?? 0, norm: normaMusica(f, b) };
  if (sigue !== null) { // vuelve suave desde donde iba
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(volPista(pista), t0 + 0.4);
  } else entrada(pista);
  src.start(t0, sigue ?? 0);
}
function soltarPista(ms) {
  if (!pista) return;
  const p = pista; pista = null;
  const t = audio().currentTime;
  p.gain.gain.cancelScheduledValues(t);
  p.gain.gain.setValueAtTime(p.gain.gain.value, t);
  p.gain.gain.linearRampToValueAtTime(0, t + ms / 1000 + 0.01);
  setTimeout(() => { try { p.src.stop(); } catch { /* ya parada */ } }, ms + 60);
}
export function pararMusica(ms = 0) { pedida = null; soltarPista(ms); }
/** Quita la música (botón 🔊, "No" o volumen 0): se detiene y al volver sigue donde iba. */
export function pausarMusica() {
  if (pista) pausada = { f: pista.f, pos: posicion(pista) };
  pararMusica(250);
}
/** Aplica un cambio de volumen a la canción que suena. */
export function volumenMusica() {
  if (!pista) return;
  const t = audio().currentTime;
  pista.gain.gain.cancelScheduledValues(t);
  pista.gain.gain.setValueAtTime(volPista(pista), t);
}
/** Últimos 5 segundos: más rápida y más aguda. `false` la devuelve a la normalidad. */
export function acelerar(si = true) {
  if (!pista) return;
  const r = pista.src.playbackRate, t = audio().currentTime;
  r.cancelScheduledValues(t);
  r.setValueAtTime(r.value, t);
  r.linearRampToValueAtTime(si ? 1.25 : 1, t + 0.3);
}

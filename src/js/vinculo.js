/**
 * Partida en dos dispositivos vinculados: celular + PC (12-10-2026; diseño en
 * PENDIENTES.md). La PC (el .exe) es la "pantalla grande": muestra el tiempo,
 * la palabra, los puntajes, los relevos y "¡Ana canta!". El celular (la app de
 * Android) es el control: los dos botones de los jugadores, la pausa y,
 * mientras alguien canta, ❌ / ✅, "Buscar canción" y "← Volver".
 *
 * Se conectan dentro de la misma red Wi-Fi, sin internet. La PC abre una
 * conexión (platforms/desktop/main.js, por el puente `window.vinculoPC` de
 * preload.js) con un código de 6 números que cambia cada minuto. El celular
 * entra de tres formas:
 *   - escaneando el QR de la PC (desde el juego o con la cámara del celular:
 *     el QR es un enlace que abre la app);
 *   - escribiendo el código: el celular busca en la red la PC que lo tiene
 *     (VinculoPlugin.java);
 *   - al revés, si la partida está en el celular: "Compartir partida" muestra
 *     un código, se escribe en la PC y la partida pasa a la PC.
 * La PC le manda al celular lo que hay en pantalla (`armarEstado`) y el
 * celular le manda lo que se toca (`ACCIONES`).
 *
 * Solo se consulta dentro de funciones: se puede importar desde Node (pruebas).
 */
import { state } from "./state.js";
import { attemptsLeft, currentSinger, relayCheck, resolveAnswer, finishRoundManual, startTimer } from "./gameLogic.js";
import { effectiveRoundTime } from "./screens/config/modes.js";
import { relayRules } from "./relay.js";
import { render } from "./router.js";
import { deshacerToque } from "./screens/verify.js";
import { pedirTurno } from "./screens/round.js";
import { openPause, pausarRondaMientras } from "./screens/modals.js";
import { musicaActiva, alternarMusica } from "./sound.js";
import { nativo } from "./plataforma.js";
import { resultadoVoz } from "./voz.js";

/** Lo que el celular puede pedirle a la PC. */
export const ACCIONES = ["tocar", "relevo", "pausa", "continuar", "correcta", "incorrecta", "volver", "finalizar", "siguiente", "silencio", "ayudaAbierta", "ayudaCerrada", "voz"];

/** Puerto de la PC (si está ocupado, main.js usa otro y lo pone en el QR). */
export const PUERTO = 47821;

/** Cada cuánto cambia el código de vinculación (el de la PC lo cambia main.js). */
export const VIGENCIA_CODIGO = 60_000;

/**
 * Dirección del QR. Es un enlace normal para que la cámara del celular lo abra
 * fuera del juego: si la app está instalada, Android la abre directo
 * (AndroidManifest.xml); si no, se abre la página docs/vincular/ de GitHub
 * Pages, que lleva a abrirla o a descargarla.
 */
export const ENLACE_VINCULAR = "https://maxy26.github.io/Musical-showdown/vincular/";

// ---------- Códigos y QR ----------

/** Código nuevo de 6 números, distinto del anterior. */
export function nuevoCodigo(anterior = "") {
  let c;
  do c = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0"); while (c === anterior);
  return c;
}

/** "482913" → "482 913" (más fácil de leer y de dictar). */
export function codigoLegible(c) {
  return String(c || "").replace(/^(\d{3})(\d{3})$/, "$1 $2");
}

/** Lo que escribió el jugador, solo con los números ("482 913" → "482913"); null si no son 6. */
export function limpiarCodigo(texto) {
  const c = String(texto || "").replace(/\D/g, "");
  return c.length === 6 ? c : null;
}

/** Texto del QR: el enlace con las direcciones de la PC, el puerto y el código. */
export function textoQR({ ips, puerto, codigo }) {
  return `${ENLACE_VINCULAR}?ips=${ips.join(",")}&p=${puerto}&c=${codigo}`;
}

/** Lee el QR (o el enlace) de la PC. Devuelve { ips, puerto, codigo } o null si no es de Musical Showdown. */
export function leerQR(texto) {
  const t = String(texto || "").trim();
  if (!t.startsWith(ENLACE_VINCULAR)) return null;
  const p = new URLSearchParams(t.slice(ENLACE_VINCULAR.length).replace(/^\?/, ""));
  const ips = (p.get("ips") || "").split(",").filter((ip) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip));
  const puerto = Number(p.get("p"));
  const codigo = limpiarCodigo(p.get("c"));
  if (!ips.length || !Number.isInteger(puerto) || puerto <= 0 || !codigo) return null;
  return { ips, puerto, codigo };
}

// ---------- Lo que ve el celular ----------

/**
 * Lo que la PC le manda al celular: en qué pantalla está y lo necesario para
 * dibujar el control. `ventana` = "pausa" si está abierta la pausa, "otra" si
 * hay otra ventana abierta en la PC (relevo, ayuda, confirmación) o null.
 * `extras`: lo que sale de la pantalla de la PC (la cuenta antes de la ronda,
 * si suena la música). El modo y la batalla van para las ayudas del celular.
 */
export function armarEstado(ventana = null, extras = {}) {
  const s = state;
  const base = { tipo: "estado", pantalla: s.screen, ventana, modo: s.config.mode, batalla: s.config.battleType, ...extras };
  const r = s.round;
  if (!r || !["round", "round-intro", "verify", "round-result", "round-result-incorrect"].includes(s.screen)) {
    return s.screen === "results" ? { ...base, ganador: s.winner || null } : base;
  }
  const c = s.config;
  const conReloj = effectiveRoundTime(c) > 0;
  const relevos = relayRules(c);
  const lado = (side) => {
    const nombre = side === "A" ? r.participantA : r.participantB;
    const libre = s.screen === "round" && r.phase === "counting" && !ventana;
    const quedan = attemptsLeft(side);
    return {
      nombre,
      canta: r.sub?.[side] || (side === "A" ? r.showA : r.showB) || null,
      puntos: s.scores[nombre] ?? 0,
      grupo: side === "A" ? r.groupA ?? null : r.groupB ?? null,
      puede: libre && quedan > 0,
      sinIntentos: r.phase === "counting" && quedan <= 0,
      relevos: relevos ? (s.relays[nombre] ?? 0) : null,
      puedeRelevo: Boolean(relevos) && libre && relayCheck(side).status !== "blocked",
    };
  };
  const estado = {
    ...base,
    fase: r.phase,
    conReloj,
    tiempo: conReloj ? r.timeLeft : null,
    palabra: r.word || "",
    generos: c.genres,
    A: lado("A"),
    B: lado("B"),
  };
  if (s.screen === "verify" && r.selected) {
    estado.canta = { lado: r.selected, nombre: currentSinger(r.selected) };
    // El celular escucha 3 segundos si alguien canta (voz.js)
    estado.escuchando = Boolean(r.escuchando);
    estado.toque = r.toque || 0;
  }
  if (s.screen === "round-result-incorrect") estado.resultado = { tipo: "incorrect", quien: r.lastResult?.who };
  if (s.screen === "round-result") estado.resultado = { tipo: r.lastResult?.type, quien: r.lastResult?.who || null };
  return estado;
}

/** La partida entera, para pasarla del celular a la PC (sin el reloj, que es de cada dispositivo). */
export function copiaDePartida() {
  const copia = JSON.parse(JSON.stringify(state));
  copia.round.timerId = null;
  copia.verify = { query: "", results: [], selectedSong: null };
  return copia;
}

// ---------- PC: pantalla grande ----------

const pc = { conectado: false, alCambiar: null, alCodigo: null, alTraspaso: null, ultimo: "", observador: null, reanudarAyuda: null };

/** ¿Hay un celular conectado como control? (la pantalla "¡Ana canta!" lo usa). */
export function hayControl() {
  return pc.conectado;
}

/** ¿Este juego puede ser la pantalla grande? (solo el .exe de PC). */
export function puedeSerPantalla() {
  return typeof window !== "undefined" && Boolean(window.vinculoPC);
}

/** Qué ventana hay abierta ahora en la PC (ver armarEstado). */
function ventanaAbierta() {
  const app = document.getElementById("app");
  if (app.querySelector(".modal-backdrop #exit")) return "pausa";
  if (app.querySelector(".modal-backdrop, .sheet-back")) return "otra";
  return null;
}

/** Manda al celular cómo está la pantalla (solo si cambió algo). */
function enviarEstado(forzar = false) {
  if (!pc.conectado) return;
  const cuenta = document.querySelector(".cuenta-capa:not(.is-closing) .cuenta-num")?.textContent || null;
  const estado = armarEstado(ventanaAbierta(), { cuenta, musica: musicaActiva() });
  const texto = JSON.stringify(estado);
  if (!forzar && texto === pc.ultimo) return;
  pc.ultimo = texto;
  window.vinculoPC.enviar(estado);
}

/** Hace clic en un botón de la pantalla, si está y se puede tocar. */
function clic(selector) {
  const b = document.querySelector(`#app ${selector}`);
  if (b && !b.disabled) b.click();
}

/** Lo que tocó el celular, hecho en la PC como si se tocara ahí. */
function hacerAccion(datos = {}) {
  const { accion, lado } = datos;
  if (!ACCIONES.includes(accion)) return;
  const pantalla = state.screen;
  const ventana = ventanaAbierta();
  const ladoOk = lado === "A" || lado === "B";
  if (accion === "tocar" && ladoOk && !ventana) pedirTurno(lado);
  else if (accion === "relevo" && ladoOk && pantalla === "round" && !ventana) clic(`[data-relay="${lado}"]`);
  else if (accion === "pausa" && pantalla === "round" && state.round.phase === "counting" && !ventana) openPause();
  else if (accion === "continuar") {
    if (ventana === "pausa") clic(".modal-backdrop #continue");
    else if (pantalla === "round-result-incorrect") clic("#continue");
  } else if ((accion === "correcta" || accion === "incorrecta") && pantalla === "verify" && !ventana) {
    resolveAnswer(accion === "correcta");
  } else if (accion === "volver" && pantalla === "verify" && !ventana) deshacerToque();
  else if (accion === "finalizar" && ["round", "verify"].includes(pantalla) && state.round.phase === "counting") {
    document.querySelectorAll("#app .modal-backdrop").forEach((m) => m.remove()); // el celular ya preguntó
    finishRoundManual();
  } else if (accion === "silencio") alternarMusica();
  else if (accion === "voz") resultadoVoz(datos.resultado, datos.toque);
  else if (accion === "ayudaAbierta") pc.reanudarAyuda = pausarRondaMientras(); // el celular lee una ayuda: el reloj se detiene
  else if (accion === "ayudaCerrada") { pc.reanudarAyuda?.(); pc.reanudarAyuda = null; }
  else if (accion === "siguiente") {
    if (pantalla === "round-result") clic("#next");
    else if (pantalla === "round-result-incorrect") clic("#continue");
  }
}

/**
 * La partida llegó del celular ("Compartir partida"): la PC sigue desde el
 * mismo punto. Si estaban en la ronda, queda en pausa para que sigan cuando
 * estén listos.
 */
function recibirPartida(copia) {
  clearInterval(state.round?.timerId);
  document.querySelectorAll("#app .modal-backdrop, #app .sheet-back").forEach((m) => m.remove());
  Object.assign(state, copia);
  state.round.timerId = null;
  render();
  if (state.round.phase === "counting" && ["round", "verify"].includes(state.screen)) {
    if (state.screen === "round") openPause();
    else startTimer(); // "¡X canta!": el reloj sigue parado hasta que se decida
  }
  pc.alTraspaso?.();
}

/**
 * Abre la conexión de la PC (botón "📱 Vincular" de la ronda o "Seguir una
 * partida del celular"). Devuelve { ips, puerto, codigo, vence } para el QR.
 * `alCambiar(conectado)` avisa cuando el celular se conecta o se va;
 * `alCodigo(datos)`, cuando cambia el código (cada minuto).
 */
export async function abrirComoPantalla({ alCambiar, alCodigo, alTraspaso } = {}) {
  Object.assign(pc, { alCambiar, alCodigo, alTraspaso });
  if (!pc.observador) {
    // Cualquier cambio en la pantalla (otra pantalla, una ventana, el reloj) se le manda al celular
    let pendiente = null;
    pc.observador = new window.MutationObserver(() => {
      clearTimeout(pendiente);
      pendiente = setTimeout(() => enviarEstado(), 40);
    });
    // Todo el documento: la cuenta antes de la ronda va fuera de #app
    pc.observador.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.vinculoPC.alRecibir((msg) => {
      if (msg?.tipo === "accion") hacerAccion(msg);
      if (msg?.tipo === "partida" && msg.partida?.round) recibirPartida(msg.partida);
    });
    window.vinculoPC.alCambiar(({ conectado }) => {
      pc.conectado = conectado;
      if (conectado) enviarEstado(true);
      pc.alCambiar?.(conectado);
      // "¡Ana canta!" muestra u oculta ❌ / ✅ según haya control
      if (state.screen === "verify") render();
    });
    window.vinculoPC.alCambiarCodigo((datos) => pc.alCodigo?.(datos));
  }
  return window.vinculoPC.abrir();
}

/** La PC espera al celular que muestra este código (su partida pasa a la PC). */
export function esperarPartidaDelCelular(codigo) {
  return window.vinculoPC.esperar(codigo);
}

/** Corta la conexión (botón "Desvincular" de la PC). */
export async function cerrarComoPantalla() {
  pc.conectado = false;
  await window.vinculoPC?.cerrar();
}

// ---------- Celular: control ----------

const GUARDADO = "ms-vinculo";
let cel = { ws: null, estado: null, alEstado: null, alCortar: null, datos: null };

/** ¿Este juego puede ser el control? (solo la app de Android). */
export function puedeSerControl() {
  return typeof window !== "undefined" && Boolean(window.Capacitor?.isNativePlatform?.());
}

/** Lo último que mandó la PC (la pantalla "control" lo dibuja). */
export function estadoPantalla() {
  return cel.estado;
}

/** La última PC a la que se conectó (para "Reconectar"), o null. */
export function ultimaPC() {
  try { return JSON.parse(localStorage.getItem(GUARDADO)); } catch { return null; }
}

/** Intenta conectarse a una dirección. Resuelve con el WebSocket ya aceptado. */
function probar(ip, puerto, codigo, llave) {
  return new Promise((resolve, reject) => {
    let ws;
    try { ws = new window.WebSocket(`ws://${ip}:${puerto}`); } catch (e) { reject(e); return; }
    const plazo = setTimeout(() => { ws.close(); reject(new Error("sin-respuesta")); }, 4000);
    ws.onopen = () => ws.send(JSON.stringify({ tipo: "hola", pin: codigo, llave, dispositivo: "celular" }));
    ws.onerror = () => { clearTimeout(plazo); reject(new Error("sin-respuesta")); };
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      clearTimeout(plazo);
      if (msg.tipo === "bienvenido") resolve({ ws, llave: msg.llave || null });
      else if (msg.tipo === "rechazado") { ws.close(); reject(new Error(msg.motivo || "codigo")); }
    };
  });
}

/**
 * Se conecta a la PC (QR o código). Prueba cada dirección hasta que una
 * responda. Rechaza con Error("codigo" | "ocupado" | "sin-respuesta").
 * `alEstado(estado)` recibe cada cambio de la pantalla grande; `alCortar()`, si
 * se pierde la conexión.
 */
export async function conectarComoControl({ ips, puerto, codigo, llave = null }, { alEstado, alCortar }) {
  desconectarControl();
  let ultimoError = new Error("sin-respuesta");
  for (const ip of ips) {
    try {
      // La llave la da la PC al conectarse: sirve para "Reconectar" aunque el código ya haya cambiado
      const r = await probar(ip, puerto, codigo, llave);
      const ws = r.ws;
      cel = { ws, estado: null, alEstado, alCortar, datos: { ips: [ip, ...ips.filter((x) => x !== ip)], puerto, codigo, llave: r.llave || llave } };
      try { localStorage.setItem(GUARDADO, JSON.stringify(cel.datos)); } catch { /* sin almacenamiento */ }
      ws.onmessage = (e) => {
        let msg;
        try { msg = JSON.parse(e.data); } catch { return; }
        if (msg.tipo === "estado") { cel.estado = msg; cel.alEstado?.(msg); }
      };
      ws.onclose = () => {
        if (cel.ws !== ws) return;
        cel.ws = null;
        cel.alCortar?.();
      };
      return;
    } catch (e) {
      ultimoError = e;
      if (e.message === "codigo" || e.message === "ocupado") break; // la PC respondió: no seguir probando
    }
  }
  throw ultimoError;
}

/**
 * Busca en la red Wi-Fi la PC que tiene este código (VinculoPlugin.java grita
 * "MSV1 BUSCAR 123456" y la PC contesta). Devuelve { ips, puerto, codigo }.
 */
export async function buscarPC(codigo, segundos = 6) {
  try {
    const r = await nativo("Vinculo", "buscar", { mensaje: `MSV1 BUSCAR ${codigo}`, esperado: `MSV1 AQUI ${codigo} `, segundos });
    return { ips: [r.ip], puerto: Number(r.respuesta.split(" ")[3]) || PUERTO, codigo };
  } catch {
    throw new Error("sin-respuesta");
  }
}

/**
 * "Compartir partida": el celular grita su código por la red hasta que una PC
 * lo escriba y conteste. Devuelve { ips, puerto } de esa PC, o null si se
 * canceló. `codigoActual()` da el código vigente (cambia cada minuto).
 */
export async function esperarPC(codigoActual, cancelado) {
  while (!cancelado()) {
    const codigo = codigoActual();
    try {
      const r = await nativo("Vinculo", "buscar", { mensaje: `MSV1 COMPARTE ${codigo}`, esperado: `MSV1 PC ${codigo} `, segundos: 4 });
      if (cancelado()) return null;
      return { ips: [r.ip], puerto: Number(r.respuesta.split(" ")[3]) || PUERTO, codigo };
    } catch {
      // nadie contestó todavía: se vuelve a gritar (con el código de ese momento)
    }
  }
  return null;
}

/** ¿El celular está conectado a la PC? */
export function controlConectado() {
  return Boolean(cel.ws && cel.ws.readyState === 1);
}

/** Manda lo que se tocó en el celular. */
export function enviarAccion(accion, datos = {}) {
  if (controlConectado()) cel.ws.send(JSON.stringify({ tipo: "accion", accion, ...datos }));
}

/** Le pasa la partida del celular a la PC ("Compartir partida"). */
export function enviarPartida() {
  if (controlConectado()) cel.ws.send(JSON.stringify({ tipo: "partida", partida: copiaDePartida() }));
}

/** Deja de ser control (botón "Desvincular" del celular). */
export function desconectarControl() {
  const ws = cel.ws;
  cel = { ws: null, estado: null, alEstado: null, alCortar: null, datos: null };
  if (ws) ws.close();
}

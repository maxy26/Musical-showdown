import { state } from "../state.js";
import { el, escapeHtml } from "../utils.js";
import { render } from "../router.js";
import { showConfirm } from "./modals.js";
import { abrirBusqueda } from "./verify.js";
import { openSheet } from "./sheet.js";
import { settingsBody } from "./menu.js";
import { ICONS } from "../icons.js";
import { escucharVoz } from "../microfono.js";
import { SEGUNDOS_ESCUCHA } from "../voz.js";
import { botonAyuda, conectarAyudas, abrirAyuda } from "./ayudaBotones.js";
import { estadoPantalla, enviarAccion, enviarPartida, controlConectado, desconectarControl, conectarComoControl, ultimaPC } from "../vinculo.js";

/**
 * El celular como control de la pantalla grande (partida en dos dispositivos,
 * etapa 1, 12-10-2026; ver vinculo.js). Se dibuja con lo que manda la PC:
 *   - Arriba, como en la ronda: pausa, ❓ (la ayuda de la ronda), 🔊 (la música
 *     de la PC) y Ajustes (ahí está "Desvincular").
 *   - Ronda: solo los dos botones de los jugadores a pantalla completa (el de
 *     arriba girado, para el que está enfrente). La palabra, el tiempo, los
 *     puntajes y los relevos se ven en la pantalla grande.
 *   - Mientras alguien canta: "Finalizar ronda" (sin tiempo), ❌ / ✅, "Buscar
 *     canción" y "← Volver". Quién canta, la palabra y el tiempo se ven solo en
 *     la pantalla grande (usuario, 12-10-2026).
 *   - La cuenta antes de cada ronda, la pausa, el resultado y el fin de la partida.
 * Lo demás (configurar, organizar, el podio) se hace en la pantalla grande.
 */

/** Color de cada lado: el del grupo en Grupal, si no, el del lado (igual que en la PC). */
function colorDe(lado, datos) {
  return datos.grupo === null || datos.grupo === undefined ? `canta-lado-${lado.toLowerCase()}` : `group-color-${datos.grupo % 5}`;
}

/** Botón de un jugador (ronda). */
function botonJugador(lado, e) {
  const d = e[lado];
  return `<div class="control-lado control-lado-${lado.toLowerCase()} ${colorDe(lado, d)}">
    <button class="control-jugador" data-tocar="${lado}" ${d.puede ? "" : "disabled"}>
      <span class="control-nombre">${escapeHtml(d.nombre)}</span>
      ${d.canta && d.canta !== d.nombre ? `<span class="sub">${escapeHtml(d.canta)}</span>` : ""}
      ${d.sinIntentos ? `<span class="attempt-badge">Sin intentos</span>` : ""}
    </button>
  </div>`;
}

/** Lo que se ve según la pantalla de la PC. */
function contenido(e) {
  if (!e) return `<div class="control-aviso"><div class="control-icono">📺</div><p>Conectado. Esperando a la pantalla grande…</p></div>`;
  // Cuenta antes de la ronda: el mismo número que en la pantalla grande
  if (e.cuenta) return `<div class="control-aviso"><div class="cuenta-num control-cuenta">${escapeHtml(e.cuenta)}</div></div>`;
  if (e.ventana === "pausa") return `<div class="control-aviso">
      <div class="control-icono">⏸</div><h2>Pausa</h2>
      <button class="btn btn-primary btn-block" data-accion="continuar">▶ Continuar</button>
    </div>`;
  if (e.ventana === "otra") return `<div class="control-aviso"><div class="control-icono">📺</div><p>Hay una ventana abierta en la pantalla grande.</p></div>`;

  switch (e.pantalla) {
    case "round":
    case "round-intro":
      if (e.fase !== "counting") return `<div class="control-aviso"><div class="control-icono">🎤</div><p>${escapeHtml(e.A.nombre)} VS ${escapeHtml(e.B.nombre)}</p></div>`;
      return `<div class="control-ronda">
        ${botonJugador("A", e)}
        ${botonJugador("B", e)}
      </div>`;
    case "verify": {
      const lado = e.canta?.lado || "A";
      return `<div class="control-canta con-esquina ${colorDe(lado, e[lado])}">
        ${botonAyuda("decision", true)}
        <div class="control-icono">🎤</div>
        ${e.conReloj ? "" : `<button class="btn btn-ghost" data-accion="finalizar">⏹️ Finalizar ronda</button>`}
        <div class="canta-botones">
          <button class="btn btn-danger btn-block" data-accion="incorrecta">❌ Incorrecta</button>
          <button class="btn btn-primary btn-block" data-accion="correcta">✅ Correcta</button>
        </div>
        <div class="canta-extra">
          <button class="btn btn-ghost" data-accion="volver">← Volver</button>
          <button class="btn btn-secondary" id="buscar">🔎 Buscar canción</button>
        </div>
      </div>`;
    }
    case "round-result-incorrect":
      return `<div class="control-aviso"><div class="control-icono">❌</div><h2>Respuesta incorrecta</h2>
        <button class="btn btn-primary btn-block" data-accion="siguiente">Continuar ronda</button></div>`;
    case "round-result": {
      const titulos = { correct: "✅ ¡Correcto!", timeout: "⏰ ¡Tiempo agotado!", "both-failed": "❌ Nadie acertó", finished: "⏹️ Ronda finalizada" };
      return `<div class="control-aviso"><h2>${titulos[e.resultado?.tipo] || ""}</h2>
        <button class="btn btn-primary btn-block" data-accion="siguiente">Siguiente enfrentamiento</button></div>`;
    }
    case "results":
      return `<div class="control-aviso"><div class="control-icono">🏆</div>
        <h2>${e.ganador ? `¡Ganó ${escapeHtml(e.ganador)}!` : "Partida terminada"}</h2><p>Miren el podio en la pantalla grande.</p></div>`;
    default:
      return `<div class="control-aviso"><div class="control-icono">📺</div>
        <p>Conectado a la pantalla grande. Preparen la partida ahí: cuando empiece, este celular será el control.</p></div>`;
  }
}

/** Para las ayudas del celular: el modo y la batalla de la partida de la PC. */
function usarModoDeLaPC(e) {
  if (e?.modo) state.config.mode = e.modo;
  if (e?.batalla) state.config.battleType = e.batalla;
}

export function screenControl() {
  const e = estadoPantalla();
  const conectado = controlConectado();
  const enRonda = Boolean(e) && e.pantalla === "round" && e.fase === "counting" && !e.ventana && !e.cuenta;
  const root = el(`<div class="screen control-screen">
    <div class="control-top">
      <span class="control-estado">${conectado ? "📺 Conectado" : "⚠️ Sin conexión"}</span>
      <div class="top-bar-actions">
        <button class="icon-btn" data-accion="pausa" ${conectado && enRonda ? "" : "disabled"}>⏸ Pausa</button>
        <button class="icon-btn icon-btn-round" id="ayuda" aria-label="Ayuda">❓</button>
        <button class="icon-btn icon-btn-round" data-accion="silencio" aria-label="Música de la pantalla grande" ${conectado ? "" : "disabled"}>${e?.musica === false ? "🔇" : "🔊"}</button>
        <button class="icon-btn icon-btn-round" id="ajustes" aria-label="Ajustes">${ICONS.settings()}</button>
      </div>
    </div>
    ${conectado ? contenido(e) : `<div class="control-aviso">
      <div class="control-icono">📡</div><h2>Se perdió la conexión</h2>
      <p>Revisen que los dos estén en la misma red Wi-Fi y que el juego siga abierto en la PC.</p>
      ${ultimaPC() ? `<button class="btn btn-primary btn-block" id="reconectar">🔄 Reconectar</button>` : ""}
      <button class="btn btn-ghost btn-block" id="salir">Volver al inicio</button>
    </div>`}
  </div>`);

  root.querySelectorAll("[data-tocar]").forEach((b) => (b.onclick = () => enviarAccion("tocar", { lado: b.dataset.tocar })));
  root.querySelectorAll("[data-accion]").forEach((b) => (b.onclick = () => {
    const accion = b.dataset.accion;
    if (accion !== "finalizar") { enviarAccion(accion); return; }
    showConfirm({ title: "¿Desean finalizar esta ronda?", noText: "No, seguir", yesText: "Sí, finalizar", onYes: () => enviarAccion("finalizar") });
  }));
  // ❓: la ayuda de la ronda, como en la pantalla grande; mientras se lee, el reloj de la PC se detiene
  root.querySelector("#ayuda").onclick = () => {
    usarModoDeLaPC(e);
    enviarAccion("ayudaAbierta");
    abrirAyuda("ronda", { alCerrar: () => enviarAccion("ayudaCerrada") });
  };
  root.querySelector("#ajustes").onclick = () => openSheet({ title: "Ajustes", body: settingsBody(), side: "left" });
  const buscar = root.querySelector("#buscar");
  if (buscar) buscar.onclick = () => {
    // La búsqueda se hace en el celular, con la palabra y los géneros de la partida de la PC
    state.config.genres = e.generos;
    state.round = { ...state.round, word: e.palabra };
    state.verify = { query: "", results: [], selectedSong: null };
    abrirBusqueda();
  };
  // (?) de "Correcta o Incorrecta": con el modo de la partida de la PC
  root.querySelectorAll("[data-ayuda]").forEach(() => usarModoDeLaPC(e));
  conectarAyudas(root);
  const reconectar = root.querySelector("#reconectar");
  if (reconectar) reconectar.onclick = () => {
    reconectar.disabled = true;
    reconectar.textContent = "Conectando…";
    entrarComoControl(ultimaPC()).catch(() => render());
  };
  const salir = root.querySelector("#salir");
  if (salir) salir.onclick = salirDelControl;
  return root;
}

/** "Desvincular" (en Ajustes del celular): pregunta y vuelve al inicio. */
export function preguntarDesvincular() {
  showConfirm({
    title: "¿Dejar de usar el celular como control?",
    yesText: "Sí, desvincular",
    noText: "No",
    onYes: salirDelControl,
  });
}
/** Vuelve al inicio del celular. */
function salirDelControl() {
  desconectarControl();
  state.screen = "menu";
  render();
}

/**
 * Se conecta a la PC y pasa a la pantalla de control. Cada cambio de la PC
 * redibuja el control; si solo cambió el tiempo, actualiza el reloj (así no se
 * cierra la búsqueda ni parpadea la pantalla).
 * Con `compartir`, antes le pasa a la PC la partida de este celular (su reloj
 * se detiene: desde ahora la partida corre en la PC).
 */
export async function entrarComoControl(datos, { compartir = false } = {}) {
  let anterior = null;
  let escuchado = 0; // último toque que ya se escuchó
  await conectarComoControl(datos, {
    alEstado: (e) => {
      // Tocaron un nombre: el micrófono del celular escucha 3 segundos si alguien canta (voz.js)
      if (e.pantalla === "verify" && e.escuchando && e.toque !== escuchado) {
        const toque = e.toque;
        escuchado = toque;
        escucharVoz(SEGUNDOS_ESCUCHA, () => estadoPantalla()?.toque !== toque || !estadoPantalla()?.escuchando)
          .then((resultado) => { if (resultado !== "cancelado") enviarAccion("voz", { resultado, toque }); });
      }
      if (state.screen !== "control") return;
      const sinTiempo = JSON.stringify({ ...e, tiempo: null });
      const reloj = document.querySelector(".control-reloj");
      if (sinTiempo === anterior) {
        // Solo cambió el tiempo: no se redibuja (en la ronda, el control ni lo muestra)
        if (reloj) {
          reloj.classList.toggle("warn", e.tiempo <= 5);
          reloj.querySelector("span").textContent = e.tiempo + "s";
        }
        return;
      }
      anterior = sinTiempo;
      render();
    },
    alCortar: () => { if (state.screen === "control") render(); },
  });
  if (compartir) {
    clearInterval(state.round.timerId);
    enviarPartida();
  }
  state.screen = "control";
  render();
}

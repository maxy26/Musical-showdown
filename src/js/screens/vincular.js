import { el } from "../utils.js";
import { state } from "../state.js";
import { render } from "../router.js";
import { openSheet } from "./sheet.js";
import { pausarRondaMientras, showWarning } from "./modals.js";
import qrcode from "../lib/qrcode.js";
import jsQR from "../lib/jsqr.js";
import {
  abrirComoPantalla, cerrarComoPantalla, esperarPartidaDelCelular, hayControl, textoQR, leerQR,
  codigoLegible, limpiarCodigo, nuevoCodigo, buscarPC, esperarPC, VIGENCIA_CODIGO,
} from "../vinculo.js";
import { entrarComoControl } from "./control.js";
import { nativo } from "../plataforma.js";

/**
 * Ventanas para vincular el celular con la PC (partida en dos dispositivos,
 * 12-10-2026; ver vinculo.js). Los dos tienen que estar en la misma red
 * Wi-Fi; no hace falta internet.
 *   - PC, en la ronda: "📱 Vincular" muestra el QR y el código (cambia cada
 *     minuto). El reloj se detiene mientras está abierta.
 *   - Celular, en el inicio (a la izquierda de Ajustes): escanear el QR de la
 *     PC o escribir su código.
 *   - Celular, en la ronda: "📱 Vincular" muestra un código para escribirlo en
 *     la PC; la partida pasa a la PC y el celular queda de control.
 *   - PC, en el inicio: escribir el código del celular para seguir su partida.
 */

/** Por qué no se pudo conectar, para mostrarlo. */
const ERRORES = {
  codigo: "El código no es correcto o ya cambió. Revisa el que se ve en la otra pantalla.",
  ocupado: "La PC ya tiene otro celular conectado.",
  "sin-respuesta": "No se encontró la PC. Revisa que los dos estén en la misma red Wi-Fi y que la PC muestre el código (botón \"📱 Vincular\" de la ronda).",
};

/** Código grande con un relojito circular al lado que se vacía hasta que cambie (sin números, usuario 29-10-2026). */
const CODIGO_HTML = `<div class="vincular-codigo">
    <div class="vincular-codigo-fila">
      <span class="vincular-codigo-num"></span>
      <svg class="vincular-reloj" viewBox="0 0 46 46" aria-hidden="true">
        <defs><linearGradient id="vincular-reloj-color" x1="0" x2="1"><stop offset="0" stop-color="#8B6CFF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs>
        <circle class="fondo" cx="23" cy="23" r="19"/><circle class="avance" cx="23" cy="23" r="19" pathLength="100"/>
      </svg>
    </div>
    <span class="vincular-codigo-nota">Cambia cada minuto</span>
  </div>`;

/** Pinta el código y vacía el relojito hasta que cambie. */
function pintarCodigo(body, codigo, vence) {
  body.querySelector(".vincular-codigo-num").textContent = codigoLegible(codigo);
  const avance = body.querySelector(".vincular-reloj .avance");
  const queda = Math.max(0, vence - Date.now());
  avance.style.transition = "none";
  avance.style.strokeDashoffset = String(100 - (queda / VIGENCIA_CODIGO) * 100);
  void avance.getBoundingClientRect();
  avance.style.transition = `stroke-dashoffset ${queda}ms linear`;
  avance.style.strokeDashoffset = "100";
}

/** PC, en la ronda: QR y código para que el celular sea el control. */
export function abrirVincularPC() {
  const reanudar = pausarRondaMientras();
  const body = el(`<div class="vincular">
    <p class="ayuda-linea">📱 Usa tu celular como control: los botones de los jugadores, ❌ / ✅ y la pausa.</p>
    <ol class="vincular-pasos">
      <li>Conecta el celular y esta PC a la <b>misma red Wi-Fi</b> (no hace falta internet).</li>
      <li>Escanea el código con la cámara del celular, o en el juego del celular toca <b>Escanear</b> (al lado de Ajustes) y escribe el código.</li>
    </ol>
    <div class="vincular-qr" aria-label="Código QR para vincular"><div class="loader-bar"><div class="loader-bar-fill"></div></div></div>
    ${CODIGO_HTML}
    <p class="vincular-estado"></p>
    <button type="button" class="btn btn-danger btn-block" id="desvincular" hidden>Desvincular celular</button>
  </div>`);
  const estado = body.querySelector(".vincular-estado");
  const boton = body.querySelector("#desvincular");
  let cerrar = () => {};
  const pintarEstado = (conectado, recien = false) => {
    estado.textContent = conectado ? "✅ Celular conectado. Ya pueden jugar." : "⏳ Esperando al celular…";
    estado.classList.toggle("is-ok", conectado);
    boton.hidden = !conectado;
    const etiqueta = document.querySelector("#app #vincular");
    if (etiqueta) {
      etiqueta.textContent = conectado ? "📱 Vinculado" : "📱 Vincular";
      etiqueta.classList.toggle("vinculado", conectado);
    }
    if (conectado && recien) setTimeout(() => cerrar(), 1200); // se cierra sola y la ronda sigue
  };
  const pintarQR = (datos) => {
    const qr = body.querySelector(".vincular-qr");
    if (!datos.ips.length) {
      qr.innerHTML = "";
      estado.textContent = "⚠️ Esta PC no está conectada a ninguna red. Conéctala al Wi-Fi (o por cable al mismo módem).";
      return false;
    }
    const codigo = qrcode(0, "M");
    codigo.addData(textoQR(datos));
    codigo.make();
    qr.innerHTML = codigo.createSvgTag({ cellSize: 6, margin: 3 });
    pintarCodigo(body, datos.codigo, datos.vence);
    return true;
  };
  boton.onclick = async () => {
    await cerrarComoPantalla();
    pintarEstado(false);
    abrir(); // vuelve a esperar a un celular (con un código nuevo)
  };

  async function abrir() {
    try {
      const datos = await abrirComoPantalla({
        alCambiar: (conectado) => pintarEstado(conectado, true),
        alCodigo: (d) => { if (body.isConnected) pintarQR(d); },
      });
      if (pintarQR(datos)) pintarEstado(hayControl());
    } catch (e) {
      console.warn("Vincular:", e);
      body.querySelector(".vincular-qr").innerHTML = "";
      estado.textContent = "⚠️ No se pudo abrir la conexión en esta PC.";
    }
  }
  // Al cerrar, la ronda se vuelve a dibujar: muestra (o quita) "Los nombres se tocan en el celular"
  cerrar = openSheet({ title: "Vincular celular", body, alCerrar: () => { reanudar(); if (state.screen === "round") render(); } });
  abrir();
}

/** PC, en el inicio: escribir el código del celular para seguir su partida. */
export function abrirSeguirPartidaCelular() {
  const body = el(`<div class="vincular">
    <p class="ayuda-linea">📲 ¿La partida empezó en el celular? Síguela aquí, en la pantalla grande.</p>
    <ol class="vincular-pasos">
      <li>Conecta el celular y esta PC a la <b>misma red Wi-Fi</b> (no hace falta internet).</li>
      <li>En la ronda del celular, toca <b>📱 Vincular</b>.</li>
      <li>Escribe aquí el código que aparece.</li>
    </ol>
    <div class="field"><label for="v-codigo">Código del celular</label>
      <input type="text" id="v-codigo" class="vincular-campo" inputmode="numeric" enterkeyhint="go" maxlength="7" autocomplete="off" placeholder="000 000"></div>
    <button type="button" class="btn btn-primary btn-block" id="conectar">Conectar</button>
    <p class="vincular-estado" hidden></p>
  </div>`);
  const estado = body.querySelector(".vincular-estado");
  const boton = body.querySelector("#conectar");
  const mostrar = (texto) => { estado.textContent = texto; estado.hidden = !texto; };
  let plazo = null;
  const cerrar = openSheet({ title: "Seguir partida del celular", body, alCerrar: () => clearTimeout(plazo) });
  const conectar = async () => {
    const codigo = limpiarCodigo(body.querySelector("#v-codigo").value);
    if (!codigo) { mostrar("El código tiene 6 números."); return; }
    boton.disabled = true;
    mostrar("⏳ Buscando el celular…");
    try {
      await abrirComoPantalla({ alTraspaso: () => cerrar() });
      await esperarPartidaDelCelular(codigo);
      clearTimeout(plazo);
      plazo = setTimeout(() => {
        boton.disabled = false;
        mostrar("No se encontró el celular. Revisa el código (cambia cada minuto) y que los dos estén en la misma red Wi-Fi.");
      }, 20_000);
    } catch (e) {
      console.warn("Vincular:", e);
      boton.disabled = false;
      mostrar("⚠️ No se pudo abrir la conexión en esta PC.");
    }
  };
  boton.onclick = conectar;
  body.querySelector("#v-codigo").addEventListener("keydown", (e) => { if (e.key === "Enter") conectar(); });
}

/** Celular, en el inicio: escanear el QR de la PC o escribir su código. */
export function abrirEscanear() {
  const body = el(`<div class="vincular">
    <p class="ayuda-linea">📺 Usa este celular como control de la partida que se ve en la PC.</p>
    <ol class="vincular-pasos">
      <li>Conecta el celular y la PC a la <b>misma red Wi-Fi</b> (no hace falta internet).</li>
      <li>En la ronda de la PC, toca <b>📱 Vincular</b>.</li>
      <li>Escanea el código QR o escribe el código de 6 números.</li>
    </ol>
    <button type="button" class="btn btn-primary btn-block" id="escanear">📷 Escanear el código QR</button>
    <div class="vincular-camara" hidden><video playsinline muted></video><div class="vincular-mira"></div></div>
    <div class="field"><label for="v-codigo">O escribe el código</label>
      <input type="text" id="v-codigo" class="vincular-campo" inputmode="numeric" enterkeyhint="go" maxlength="7" autocomplete="off" placeholder="000 000"></div>
    <button type="button" class="btn btn-secondary btn-block" id="conectar">Conectar</button>
    <p class="vincular-error" role="alert" hidden></p>
  </div>`);
  const error = body.querySelector(".vincular-error");
  const camara = body.querySelector(".vincular-camara");
  const video = camara.querySelector("video");
  const boton = body.querySelector("#conectar");
  let flujo = null;
  let ocupado = false;

  const apagarCamara = () => {
    flujo?.getTracks().forEach((t) => t.stop());
    flujo = null;
    camara.hidden = true;
  };
  const cerrar = openSheet({ title: "Escanear partida", body, alCerrar: apagarCamara });
  const mostrarError = (texto) => { error.textContent = texto; error.hidden = !texto; };

  /** `datos`: { ips, puerto, codigo } del QR, o solo { codigo } (se busca la PC en la red). */
  async function conectar(datos) {
    if (ocupado) return;
    ocupado = true;
    mostrarError("");
    boton.disabled = true;
    boton.textContent = datos.ips ? "Conectando…" : "Buscando la PC…";
    try {
      await entrarComoControl(datos.ips ? datos : await buscarPC(datos.codigo));
      apagarCamara();
      cerrar();
    } catch (e) {
      mostrarError(ERRORES[e.message] || ERRORES["sin-respuesta"]);
    } finally {
      ocupado = false;
      boton.disabled = false;
      boton.textContent = "Conectar";
    }
  }

  boton.onclick = () => {
    const codigo = limpiarCodigo(body.querySelector("#v-codigo").value);
    if (!codigo) { mostrarError("El código tiene 6 números."); return; }
    conectar({ codigo });
  };
  // La tecla "→" / Enter del teclado conecta directo (la ventana puede quedar tapada por el teclado)
  body.querySelector("#v-codigo").addEventListener("keydown", (e) => { if (e.key === "Enter") boton.click(); });

  body.querySelector("#escanear").onclick = async () => {
    mostrarError("");
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    } catch {
      mostrarError("No se pudo usar la cámara. Revisa el permiso o escribe el código.");
      return;
    }
    camara.hidden = false;
    video.srcObject = flujo;
    await video.play().catch(() => {});
    const lienzo = document.createElement("canvas");
    const ctx = lienzo.getContext("2d", { willReadFrequently: true });
    // Busca el QR en la imagen de la cámara unas 4 veces por segundo
    const mirar = () => {
      if (!flujo) return;
      if (video.videoWidth && !ocupado) {
        lienzo.width = video.videoWidth;
        lienzo.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const img = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
        const leido = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (leido) {
          const datos = leerQR(leido.data);
          if (datos) conectar(datos);
          else mostrarError("Ese código no es de Musical Showdown.");
        }
      }
      setTimeout(mirar, 250);
    };
    mirar();
  };
}

/**
 * Celular, en la ronda: "Compartir partida". Muestra un código (cambia cada
 * minuto); al escribirlo en la PC, la partida pasa a la PC y este celular
 * queda de control. El reloj se detiene mientras la ventana está abierta.
 */
export function abrirCompartirPartida() {
  const reanudar = pausarRondaMientras();
  const body = el(`<div class="vincular">
    <p class="ayuda-linea">📺 Sigue esta partida en la PC: la PC será la pantalla grande y este celular, el control.</p>
    <ol class="vincular-pasos">
      <li>Conecta el celular y la PC a la <b>misma red Wi-Fi</b> (no hace falta internet).</li>
      <li>En el inicio del juego de la PC, toca el botón de la izquierda de Ajustes.</li>
      <li>Escribe este código:</li>
    </ol>
    ${CODIGO_HTML}
    <p class="vincular-estado">⏳ Esperando a la PC…</p>
  </div>`);
  let cancelado = false;
  let codigo = nuevoCodigo();
  let vence = Date.now() + VIGENCIA_CODIGO;
  const cambio = setInterval(() => {
    codigo = nuevoCodigo(codigo);
    vence = Date.now() + VIGENCIA_CODIGO;
    pintarCodigo(body, codigo, vence);
  }, VIGENCIA_CODIGO);
  const cerrar = openSheet({
    title: "Vincular con la PC",
    body,
    alCerrar: () => { cancelado = true; clearInterval(cambio); reanudar(); },
  });
  pintarCodigo(body, codigo, vence); // ya en pantalla, para que la barra arranque llena

  (async () => {
    const pc = await esperarPC(() => codigo, () => cancelado);
    if (!pc) return;
    const estado = body.querySelector(".vincular-estado");
    estado.textContent = "🔗 Pasando la partida a la PC…";
    try {
      await entrarComoControl(pc, { compartir: true });
      cancelado = true;
      clearInterval(cambio);
      cerrar();
    } catch {
      estado.textContent = "⚠️ No se pudo pasar la partida. Vuelve a intentarlo.";
    }
  })();
}

/**
 * QR escaneado con la cámara del celular, fuera del juego (usuario, 12-10-2026):
 * el enlace abre la app (AndroidManifest.xml) y aquí se sigue con la
 * vinculación, tanto si la app estaba cerrada (getLaunchUrl) como si ya estaba
 * abierta (appUrlOpen). Solo en la app de Android.
 */
export function iniciarEnlacesDeVinculo() {
  const C = window.Capacitor;
  if (!C?.isNativePlatform?.()) return;
  let ultimo = "";
  const abrir = async (url) => {
    const datos = leerQR(url);
    if (!datos || url === ultimo) return;
    ultimo = url;
    try {
      await entrarComoControl(datos);
    } catch (e) {
      showWarning(ERRORES[e.message] || ERRORES["sin-respuesta"]);
    }
  };
  nativo("App", "getLaunchUrl").then((r) => r?.url && abrir(r.url)).catch(() => {});
  C.nativeCallback?.("App", "addListener", { eventName: "appUrlOpen" }, (datos) => datos?.url && abrir(datos.url));
}
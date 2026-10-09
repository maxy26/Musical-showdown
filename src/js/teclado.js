/**
 * Moverse por el juego con el teclado (pedido del usuario, 08-10-2026):
 *   - Las flechas recorren toda la pantalla y van hacia donde apuntan (↓ al
 *     control de abajo, → al de la derecha…). Dentro de una ventana abierta
 *     (Ajustes, avisos, confirmaciones, la ruleta) solo recorren esa ventana.
 *   - Enter es como un clic: botones, tarjetas, listas desplegables (las abre),
 *     la ruleta…
 *   - En un nombre: al llegar con las flechas se puede escribir; Enter apaga y
 *     vuelve a encender la edición. Las flechas siguen moviéndose entre
 *     controles (→ llega a la ✕ del jugador).
 *   - Backspace es "volver" (fuera de un nombre que se está escribiendo).
 *   - Las listas desplegables usan una lista propia del juego, también con el
 *     mouse y en el celular.
 * Nada se hace al cargar el módulo: se activa con iniciarTeclado().
 */

/** Controles que se pueden recorrer con las flechas. */
const CONTROLES = [
  "button:not([disabled])", "select", "input[type=text]", "input[type=range]", "a[href]",
  "[data-battle]", ".manual-item.is-selectable", "#battle-card", "[tabindex='0']",
].join(", ");

/** Ventana abierta más arriba (si hay), o la pantalla. */
function zonaActiva() {
  const ventanas = [...document.querySelectorAll(".modal-backdrop, .sheet-back:not(.is-closing)")];
  return ventanas.length ? ventanas[ventanas.length - 1] : document.getElementById("app");
}

function visible(el) {
  if (el.closest("[hidden], .hidden") || el.getAttribute("aria-hidden") === "true") return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function controlesDe(zona) {
  return [...zona.querySelectorAll(CONTROLES)]
    .filter(visible)
    // Una tarjeta que tiene un botón adentro (la de "Jugar") no se marca aparte
    .filter((el) => !el.querySelector(CONTROLES));
}

/** Primer control del contenido (sin los botones de arriba), para la primera flecha. */
function primero(candidatos) {
  return candidatos.find((el) => !el.closest(".top-bar, .home-header, .sheet-head")) || candidatos[0];
}

/**
 * El control más cercano en una dirección ("arriba", "abajo", "izquierda",
 * "derecha"): debe estar de ese lado y se prefiere el más alineado.
 * `cajas` son rectángulos {x, y, w, h}; devuelve el índice o -1.
 */
export function vecinoEn(direccion, desde, cajas) {
  const vertical = direccion === "arriba" || direccion === "abajo";
  const signo = direccion === "abajo" || direccion === "derecha" ? 1 : -1;
  // Bordes en el eje del movimiento (inicio/fin) y en el eje de lado
  const ini = (c) => (vertical ? c.y : c.x), fin = (c) => (vertical ? c.y + c.h : c.x + c.w);
  const lIni = (c) => (vertical ? c.x : c.y), lFin = (c) => (vertical ? c.x + c.w : c.y + c.h);
  const centroLado = (c) => (lIni(c) + lFin(c)) / 2;
  let mejor = -1, mejorPuntos = Infinity;
  cajas.forEach((c, i) => {
    if (c === desde) return;
    // Distancia hacia adelante, de borde a borde (debe estar de ese lado)
    const adelante = signo > 0 ? ini(c) - fin(desde) : ini(desde) - fin(c);
    const centro = signo * ((ini(c) + fin(c)) / 2 - (ini(desde) + fin(desde)) / 2);
    if (centro <= 2 || adelante < -Math.min(c.h, desde.h) / 2) return;
    // ¿Se tocan en el eje de lado? (está "en línea")
    const enLinea = lIni(c) < lFin(desde) && lFin(c) > lIni(desde);
    if (!vertical && !enLinea) return; // ← → solo van a lo que está en la misma línea
    const lado = Math.abs(centroLado(c) - centroLado(desde));
    const puntos = (enLinea ? 0 : 100000) + Math.max(adelante, 0) * 4 + lado;
    if (puntos < mejorPuntos) { mejorPuntos = puntos; mejor = i; }
  });
  return mejor;
}

/**
 * "Firma" de un control para volver a encontrarlo cuando la pantalla se vuelve a
 * dibujar (por ejemplo, al tocar un género o "Añadir jugador").
 */
function firma(el) {
  const d = el.dataset;
  return [el.tagName, el.id, d.genre, d.battle, d.setting, d.value, d.step, d.yesno, d.stepper, d.relay, d.idx,
    el.getAttribute("placeholder"), el.closest("[data-stepper],[data-yesno],[data-setting]")?.outerHTML.length ? "" : el.textContent.trim().slice(0, 30)].join("|");
}
let ultimaFirma = null;
function recuperar(zona) {
  if (!ultimaFirma) return null;
  return controlesDe(zona).find((el) => firma(el) === ultimaFirma) || null;
}

/**
 * Botón que equivale a "volver" con Backspace (usuario, 08-10-2026): en una
 * ventana, el que la cierra o cancela (nunca "Incorrecta"); en la pantalla,
 * "← Inicio" / "← Configuración"; en la ronda abre la Pausa; en el podio,
 * "Volver al inicio"; en el resultado de una ronda no hace nada.
 */
const VOLVER_EN_VENTANA = ".sheet-close, .modal-close, #picker-cancel, #confirm-no, #relay-cancel, #relay-settings-cancel, #warning-ok, #close";
function botonVolver(zona) {
  if (zona.id === "app") {
    return zona.querySelector("#back, #pause") || (zona.querySelector(".podium") ? zona.querySelector("#menu") : null);
  }
  return [...zona.querySelectorAll(VOLVER_EN_VENTANA)].find(visible) || null;
}

// ---------- Lista propia del juego ----------
// La lista desplegable normal la dibuja el sistema y las teclas no le llegan al
// juego (Backspace no la cerraría). Por eso se usa siempre esta lista, con el
// diseño del juego: con el teclado (↑ ↓ recorren, Enter elige, Backspace / Esc
// cierran sin cambiar nada), con el mouse y en el celular (usuario, 08-10-2026).
let lista = null; // { caja, select, botones, i }
function abrirLista(select) {
  const opciones = [...select.options].filter((o) => !o.disabled && !o.hidden);
  if (!opciones.length) return;
  ultimaFirma = firma(select);
  const caja = document.createElement("div");
  caja.className = "lista-teclado";
  caja.setAttribute("role", "listbox");
  caja.innerHTML = opciones.map((o) => `<button type="button" role="option" class="lista-opcion">${o.textContent}</button>`).join("");
  document.body.appendChild(caja);
  // Debajo de la lista original o, si no cabe, del lado con más espacio. Nunca
  // la tapa (así un segundo toque sobre ella la cierra); si es larga, se desplaza.
  const r = select.getBoundingClientRect();
  caja.style.minWidth = r.width + "px";
  caja.style.left = Math.max(8, Math.min(r.left, window.innerWidth - caja.offsetWidth - 8)) + "px";
  const espacioAbajo = window.innerHeight - r.bottom - 14, espacioArriba = r.top - 14;
  const haciaAbajo = caja.offsetHeight <= espacioAbajo || espacioAbajo >= espacioArriba;
  const espacio = haciaAbajo ? espacioAbajo : espacioArriba;
  caja.style.maxHeight = Math.max(espacio, 120) + "px";
  caja.style.top = (haciaAbajo ? r.bottom + 6 : r.top - 6 - caja.offsetHeight) + "px";
  const botones = [...caja.children];
  lista = { caja, select, opciones, botones, i: Math.max(0, opciones.findIndex((o) => o.selected)) };
  botones.forEach((b, i) => {
    b.onclick = () => elegirDeLista(i);
    b.onmouseenter = () => { lista.i = i; pintarLista(); };
  });
  pintarLista();
}
function pintarLista() {
  lista.botones.forEach((b, i) => b.classList.toggle("is-marcada", i === lista.i));
  lista.botones[lista.i].scrollIntoView({ block: "nearest" });
}
function cerrarLista() {
  if (!lista) return;
  const { caja, select } = lista;
  lista = null;
  caja.remove();
  // Con el teclado la marca vuelve a la lista; con el mouse no queda marcada
  if (conTeclado()) select.focus({ preventScroll: true });
  else select.blur();
}
const conTeclado = () => document.documentElement.classList.contains("con-teclado");
function elegirDeLista(i) {
  const { select, opciones } = lista;
  cerrarLista();
  if (select.value === opciones[i].value) return;
  select.value = opciones[i].value;
  select.dispatchEvent(new window.Event("change", { bubbles: true }));
  // Elegir redibuja la pantalla: la marca vuelve a la misma lista (si no se abrió otra ventana)
  setTimeout(() => {
    if (!conTeclado() || document.activeElement !== document.body) return;
    const el = recuperar(zonaActiva());
    if (el) marcar(el);
  }, 0);
}
function teclaEnLista(e) {
  const k = e.key;
  if (k === "ArrowDown" || k === "ArrowRight") lista.i = Math.min(lista.botones.length - 1, lista.i + 1);
  else if (k === "ArrowUp" || k === "ArrowLeft") lista.i = Math.max(0, lista.i - 1);
  else if (k === "Enter") { e.preventDefault(); e.stopPropagation(); elegirDeLista(lista.i); return; }
  else if (k === "Backspace" || k === "Escape" || k === "Tab") { e.preventDefault(); e.stopPropagation(); cerrarLista(); return; }
  else return;
  e.preventDefault(); e.stopPropagation();
  pintarLista();
}

/** Lista desplegable que está bajo el toque (o la de la fila tocada, en PC). */
function listaBajo(e) {
  const fila = e.target.closest(".opt-row.row-click");
  if (fila?.querySelector("select")) return fila.querySelector("select");
  return [...zonaActiva().querySelectorAll("select")].find((s) => {
    const r = s.getBoundingClientRect();
    return visible(s) && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }) || null;
}

const DIRECCIONES = { ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha" };

function marcar(el) {
  ultimaFirma = firma(el);
  el.focus({ preventScroll: false });
  el.scrollIntoView({ block: "nearest", inline: "nearest" });
  // Un nombre se puede escribir apenas se llega con las flechas
  if (el.matches("input[type=text]")) { el.readOnly = false; el.classList.remove("edicion-pausada"); }
}

function alPresionar(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (lista) { teclaEnLista(e); return; }
  const zona = zonaActiva();
  if (!zona) return;
  const actual = document.activeElement;
  const enZona = actual && zona.contains(actual) && actual.matches(CONTROLES) ? actual : null;
  const ruleta = zona.querySelector(".picker-modal");

  // ---------- Backspace = volver ----------
  // Escribiendo un nombre solo borra letras, aunque el nombre esté vacío; en
  // cualquier otro lado hace lo mismo que el botón de volver (usuario, 08-10-2026).
  if (e.key === "Backspace") {
    const escribiendo = actual && actual.matches("input[type=text], textarea") && !actual.readOnly;
    if (escribiendo) return;
    const volver = botonVolver(zona);
    if (volver) { e.preventDefault(); volver.click(); }
    return;
  }

  // ---------- Enter ----------
  if (e.key === "Enter" && ruleta && !enZona?.matches("button")) return; // la ruleta confirma sola
  if (e.key === "Enter" && enZona) {
    if (enZona.matches("input[type=text]")) {
      // Enter apaga / enciende la edición del nombre
      e.preventDefault();
      enZona.readOnly = !enZona.readOnly;
      enZona.classList.toggle("edicion-pausada", enZona.readOnly);
      return;
    }
    if (enZona.matches("select")) {
      e.preventDefault();
      abrirLista(enZona);
      return;
    }
    // Botones, tarjetas y filas: Enter = clic (se evita el clic propio del navegador
    // para que no cuente dos veces)
    e.preventDefault();
    // Al eliminar un jugador (✕), la marca pasa al nombre anterior: nunca queda
    // sobre otra ✕, para que un segundo Enter no borre a otro jugador
    const borrado = enZona.dataset.remove;
    enZona.click();
    if (borrado !== undefined) {
      setTimeout(() => {
        const nombres = document.querySelectorAll("#players-list input");
        const anterior = nombres[Math.min(Number(borrado) - 1, nombres.length - 1)];
        if (anterior) marcar(anterior);
      }, 0);
      return;
    }
    // Si la pantalla se volvió a dibujar, la marca vuelve al mismo control
    setTimeout(() => {
      const z = zonaActiva();
      if (z && !(document.activeElement && z.contains(document.activeElement) && document.activeElement !== document.body)) {
        const igual = recuperar(z);
        if (igual) marcar(igual);
      }
    }, 0);
    return;
  }

  const direccion = DIRECCIONES[e.key];
  if (!direccion) return;
  // En la ruleta todas las flechas cambian el valor (valuePicker.js):
  // ↑ y ← bajan, ↓ y → suben (usuario, 08-10-2026)
  if (ruleta) return;
  // En un nombre, ← → también se mueven entre controles (así → llega directo a
  // la ✕ para eliminar al jugador, sin Enter; usuario, 08-10-2026).
  // En una barra de volumen, ← → la mueven.
  if (enZona && (direccion === "izquierda" || direccion === "derecha") && enZona.matches("input[type=range]")) return;

  const candidatos = controlesDe(zona);
  if (!candidatos.length) return;
  e.preventDefault(); // las flechas no cambian la lista ni mueven la página
  if (!enZona) { marcar(recuperar(zona) || primero(candidatos)); return; }
  const cajas = candidatos.map((el) => {
    // Una lista de una fila de opciones ("Puntaje objetivo") cuenta como toda la fila
    const fila = el.matches("select") ? el.closest(".opt-row") : null;
    const r = (fila || el).getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const desde = candidatos.indexOf(enZona);
  // Si el control con foco no se recorre (por ejemplo, tras un clic), se empieza de nuevo
  if (desde < 0) { marcar(recuperar(zona) || primero(candidatos)); return; }
  const i = vecinoEn(direccion, cajas[desde], cajas);
  if (i >= 0) marcar(candidatos[i]);
}

let iniciado = false;
let recienCerrada = null; // lista que se acaba de cerrar con un toque (segundo clic)
export function iniciarTeclado() {
  if (iniciado) return;
  iniciado = true;
  // Se escucha antes que el resto (fase de captura) para decidir primero
  window.addEventListener("keydown", alPresionar, true);
  // Se marca con borde solo cuando se usa el teclado
  window.addEventListener("keydown", (e) => { if (e.key.startsWith("Arrow") || e.key === "Enter" || e.key === "Tab") document.documentElement.classList.add("con-teclado"); }, true);
  window.addEventListener("pointerdown", (e) => {
    document.documentElement.classList.remove("con-teclado");
    // Al volver al teclado, la primera flecha sigue desde lo último que se tocó
    const tocado = e.target.closest?.(CONTROLES);
    if (tocado && !tocado.closest(".lista-teclado")) ultimaFirma = firma(tocado);
    // Tocar afuera la cierra; si se tocó su misma lista, el clic no la vuelve a abrir
    recienCerrada = null;
    if (lista && !lista.caja.contains(e.target)) { recienCerrada = lista.select; cerrarLista(); e.preventDefault(); }
  }, true);
  // Con el mouse o el dedo también se abre la lista del juego (las listas no
  // reciben toques, ver styles.css): sobre la lista o, en PC, en toda su fila
  window.addEventListener("click", (e) => {
    if (lista || e.target.closest(".lista-teclado")) return;
    const select = listaBajo(e);
    const segundoClic = select && select === recienCerrada;
    recienCerrada = null;
    if (!select || segundoClic) return;
    e.preventDefault();
    abrirLista(select);
  }, true);
}

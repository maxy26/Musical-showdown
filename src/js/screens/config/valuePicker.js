import { ruleta } from "../../sound.js";

/**
 * Selector de rueda para elegir un valor personalizado (puntaje objetivo o
 * tiempo por ronda), como los de los relojes y alarmas del teléfono: los
 * valores forman una columna; el elegido queda al centro, resaltado, y los
 * vecinos se ven más tenues.
 *   - Android (táctil): deslizar el dedo. Si se lanza rápido, la rueda sigue
 *     girando un poco y se detiene justo sobre un valor. Tocar un valor
 *     visible lo lleva al centro.
 *   - PC: flechas ↑ ↓ del teclado (también rueda del mouse o arrastrar).
 *   - Enter o el botón "Listo" confirman; Esc o "Cancelar" salen sin cambios.
 */

/** Lleva `v` al múltiplo de `step` más cercano, dentro de [min, max]. */
export function clampStep(v, min, max, step) {
  return Math.min(max, Math.max(min, Math.round(v / step) * step));
}

/** Lista de valores de la rueda, de menor a mayor. */
export function wheelValues(min, max, step) {
  const values = [];
  for (let v = min; v <= max; v += step) values.push(v);
  return values;
}

const ITEM_H = 44; // alto de cada fila en px (debe coincidir con .wheel-item)
const VISIBLE = 5; // filas visibles; la del centro es la elegida
const MOMENTUM_MS = 220; // cuánto "sigue girando" la rueda al lanzarla
const MIN_FLING = 0.012; // filas por ms: más lento que esto es arrastrar, no lanzar
const MAX_SPEED = 0.06; // velocidad máxima en filas por ms

/**
 * Posición (índice) donde se detiene la rueda al soltarla. Si el dedo se
 * soltó rápido (un "lanzamiento"), la rueda sigue girando en proporción a la
 * velocidad; si se arrastró despacio, se queda en la fila más cercana.
 */
export function snapIndex(offset, velocity, count) {
  const push = Math.abs(velocity) >= MIN_FLING ? velocity * MOMENTUM_MS : 0;
  return Math.min(count - 1, Math.max(0, Math.round(offset + push)));
}
const TAP_PX = 6; // un movimiento menor a esto se toma como toque

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {number} opts.value - valor inicial
 * @param {number} opts.min
 * @param {number} opts.max
 * @param {number} opts.step
 * @param {(v: number) => string} opts.formatItem - texto corto de cada fila
 * @param {string} [opts.unit] - unidad junto a la fila central (ej. "pts")
 * @param {(v: number) => string} opts.describe - texto bajo la rueda (ej. "1 min 25 seg")
 * @param {(v: number) => void} opts.onAccept
 * @param {() => void} [opts.onCancel]
 */
export function openValuePicker({ title, value, min, max, step, formatItem, unit = "", describe, onAccept, onCancel }) {
  const values = wheelValues(min, max, step);
  const startIndex = values.indexOf(clampStep(value, min, max, step));
  let ultimoSonado = startIndex; // suena cada número que pasa por el centro
  let offset = startIndex; // posición de la rueda en filas (puede ser fraccionaria)

  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal picker-modal" role="dialog" aria-label="${title}">
    <h2>${title}</h2>
    <div class="wheel" tabindex="0" role="spinbutton" aria-valuemin="${min}" aria-valuemax="${max}"
         style="height:${ITEM_H * VISIBLE}px;">
      <div class="wheel-band" style="top:${ITEM_H * 2}px;height:${ITEM_H}px;"></div>
      <div class="wheel-track">${values.map((v) => `<div class="wheel-item">${formatItem(v)}</div>`).join("")}</div>
      ${unit ? `<div class="wheel-unit" style="top:${ITEM_H * 2}px;line-height:${ITEM_H}px;">${unit}</div>` : ""}
    </div>
    <p class="wheel-caption"></p>
    <p class="picker-hint">Desliza la rueda o usa las flechas ↑ ↓ · Enter para confirmar</p>
    <div class="btn-row picker-actions">
      <button type="button" class="btn btn-secondary" id="picker-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="picker-ok">Listo</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);

  const wheel = overlay.querySelector(".wheel");
  const track = overlay.querySelector(".wheel-track");
  const items = [...track.children];
  const caption = overlay.querySelector(".wheel-caption");

  const selectedIndex = () => Math.min(values.length - 1, Math.max(0, Math.round(offset)));
  const selectedValue = () => values[selectedIndex()];

  function paint() {
    track.style.transform = `translateY(${(2 - offset) * ITEM_H}px)`;
    items.forEach((item, i) => {
      const d = Math.abs(i - offset);
      item.classList.toggle("selected", d < 0.5);
      if (d > 3) { item.style.opacity = 0; return; }
      item.style.opacity = String(Math.max(0.15, 1 - d * 0.32));
      item.style.transform = `scale(${Math.max(0.72, 1 - d * 0.1)})`;
    });
    if (selectedIndex() !== ultimoSonado) { ultimoSonado = selectedIndex(); ruleta(); }
    const v = selectedValue();
    caption.textContent = describe(v);
    wheel.setAttribute("aria-valuenow", v);
    wheel.setAttribute("aria-valuetext", describe(v));
  }

  // Animación suave hasta una fila (se interrumpe si empieza otro gesto).
  // `goal` es la fila hacia la que se va: las flechas y la rueda del mouse
  // suman desde ahí, para no perder pasos si se presionan muy seguido.
  let animToken = 0;
  let goal = startIndex;
  function animateTo(index, duration = 260) {
    const target = Math.min(values.length - 1, Math.max(0, index));
    goal = target;
    const from = offset;
    const token = ++animToken;
    let start = null;
    function frame(t) {
      if (token !== animToken) return;
      if (start === null) start = t;
      const k = Math.min(1, (t - start) / duration);
      offset = from + (target - from) * (1 - Math.pow(1 - k, 3)); // desaceleración suave
      paint();
      if (k < 1) requestAnimationFrame(frame);
      else { offset = target; paint(); }
    }
    requestAnimationFrame(frame);
    // Respaldo: si el navegador no dibuja cuadros (teléfono lento, pestaña en
    // segundo plano), al terminar el tiempo la rueda queda igual en su destino.
    setTimeout(() => {
      if (token !== animToken || offset === target) return;
      offset = target;
      paint();
    }, duration + 60);
  }
  const stopAnimation = () => { animToken++; };

  // ---------- Deslizar (dedo o mouse) ----------
  let drag = null;
  wheel.addEventListener("pointerdown", (e) => {
    stopAnimation();
    goal = selectedIndex();
    drag = { y0: e.clientY, off0: offset, lastY: e.clientY, lastT: e.timeStamp, speed: 0, moved: 0 };
    wheel.classList.add("dragging");
    if (wheel.setPointerCapture) {
      try { wheel.setPointerCapture(e.pointerId); } catch { /* sin captura, sigue funcionando */ }
    }
  });
  wheel.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dy = drag.y0 - e.clientY; // hacia arriba = positivo = valores mayores
    drag.moved = Math.max(drag.moved, Math.abs(dy));
    offset = Math.min(values.length - 1, Math.max(0, drag.off0 + dy / ITEM_H));
    const dt = Math.max(16, e.timeStamp - drag.lastT);
    const speed = (drag.lastY - e.clientY) / ITEM_H / dt;
    drag.speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
    drag.lastY = e.clientY;
    drag.lastT = e.timeStamp;
    paint();
  });
  function endDrag(e) {
    if (!drag) return;
    const d = drag;
    drag = null;
    wheel.classList.remove("dragging");
    if (d.moved < TAP_PX) {
      // Toque: lleva al centro el valor tocado.
      const rect = wheel.getBoundingClientRect();
      const rowFromCenter = (e.clientY - rect.top - ITEM_H * 2.5) / ITEM_H;
      animateTo(Math.round(offset + rowFromCenter));
      return;
    }
    animateTo(snapIndex(offset, d.speed, values.length), 380);
  }
  wheel.addEventListener("pointerup", endDrag);
  wheel.addEventListener("pointercancel", endDrag);

  // ---------- Rueda del mouse: una fila por "clic" de la rueda ----------
  let wheelAccum = 0;
  wheel.addEventListener("wheel", (e) => {
    e.preventDefault();
    wheelAccum += e.deltaY;
    if (Math.abs(wheelAccum) < 40) return;
    const rows = Math.sign(wheelAccum);
    wheelAccum = 0;
    animateTo(goal + rows, 160);
  }, { passive: false });

  // ---------- Teclado y botones ----------
  function close() {
    stopAnimation();
    document.removeEventListener("keydown", onKey);
    overlay.remove();
  }
  // Si la rueda todavía está girando, se confirma el valor donde va a parar.
  function accept() { const v = values[drag ? selectedIndex() : goal]; close(); onAccept(v); }
  function cancel() { close(); if (onCancel) onCancel(); }
  function onKey(e) {
    const moves = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (e.key in moves) { e.preventDefault(); animateTo(goal + moves[e.key], 150); }
    else if (e.key === "Home") { e.preventDefault(); animateTo(0); }
    else if (e.key === "End") { e.preventDefault(); animateTo(values.length - 1); }
    // Enter confirma, salvo si el foco está en un botón (ej. "Cancelar").
    else if (e.key === "Enter" && e.target.tagName !== "BUTTON") { e.preventDefault(); accept(); }
    else if (e.key === "Escape") { e.preventDefault(); cancel(); }
  }
  document.addEventListener("keydown", onKey);
  overlay.querySelector("#picker-ok").onclick = accept;
  overlay.querySelector("#picker-cancel").onclick = cancel;

  paint();
  wheel.focus();
  return { accept, cancel, value: () => values[goal] };
}

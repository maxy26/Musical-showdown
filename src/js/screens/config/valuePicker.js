/**
 * Ventana para elegir un valor personalizado (puntaje objetivo o tiempo por
 * ronda). Pensada para funcionar igual en Android (táctil) y en Windows:
 *   - Deslizar el dedo (o arrastrar con el mouse) hacia arriba o abajo sobre
 *     el valor lo sube o lo baja.
 *   - Botones ▲ / ▼; mantenerlos presionados avanza rápido.
 *   - Rueda del mouse y flechas del teclado; Enter acepta y Esc cancela.
 *   - Atajos opcionales (ej. "+500" o "1:30").
 * "Cancelar" no cambia nada; "Aceptar" llama a onAccept con el valor elegido.
 */

/** Lleva `v` al múltiplo de `step` más cercano, dentro de [min, max]. */
export function clampStep(v, min, max, step) {
  return Math.min(max, Math.max(min, Math.round(v / step) * step));
}

// Píxeles que hay que deslizar para avanzar un paso.
const DRAG_PX_PER_STEP = 22;

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {number} opts.value - valor inicial
 * @param {number} opts.min
 * @param {number} opts.max
 * @param {number} opts.step
 * @param {(v: number) => string} opts.format - HTML del valor en grande
 * @param {string} opts.rangeText - texto de ayuda con el rango permitido
 * @param {{label: string, apply: (v: number) => number}[]} [opts.quick] - atajos
 * @param {(v: number) => void} opts.onAccept
 * @param {() => void} [opts.onCancel]
 */
export function openValuePicker({ title, value, min, max, step, format, rangeText, quick = [], onAccept, onCancel }) {
  let current = clampStep(value, min, max, step);

  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal picker-modal" role="dialog" aria-label="${title}">
    <h2>${title}</h2>
    <button type="button" class="picker-arrow" data-dir="1" aria-label="Subir">▲</button>
    <div class="picker-value" tabindex="0" role="spinbutton"
         aria-valuemin="${min}" aria-valuemax="${max}"></div>
    <button type="button" class="picker-arrow" data-dir="-1" aria-label="Bajar">▼</button>
    ${quick.length ? `<div class="picker-quick">${quick.map((q, i) =>
      `<button type="button" class="chip" data-quick="${i}">${q.label}</button>`).join("")}</div>` : ""}
    <p class="picker-hint">Desliza el valor hacia arriba o abajo, o usa ▲ ▼ · ${rangeText}</p>
    <div class="btn-row picker-actions">
      <button type="button" class="btn btn-secondary" id="picker-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="picker-ok">Aceptar</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);

  const valueEl = overlay.querySelector(".picker-value");
  function show() {
    valueEl.innerHTML = format(current);
    valueEl.setAttribute("aria-valuenow", current);
    overlay.querySelectorAll(".picker-arrow").forEach((b) => {
      b.disabled = b.dataset.dir === "1" ? current >= max : current <= min;
    });
  }
  function bump(steps) {
    current = clampStep(current + steps * step, min, max, step);
    show();
  }

  // Botones ▲ / ▼: un paso al tocar; mantenidos, se repite rápido.
  let wait, repeat;
  const stopRepeat = () => { clearTimeout(wait); clearInterval(repeat); };
  overlay.querySelectorAll(".picker-arrow").forEach((btn) => {
    const dir = Number(btn.dataset.dir);
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      stopRepeat();
      bump(dir);
      wait = setTimeout(() => { repeat = setInterval(() => bump(dir), 70); }, 380);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stopRepeat));
  });

  // Deslizar sobre el valor: hacia arriba sube, hacia abajo baja.
  let dragStartY = null;
  let dragStartValue = current;
  valueEl.addEventListener("pointerdown", (e) => {
    dragStartY = e.clientY;
    dragStartValue = current;
    valueEl.classList.add("dragging");
    if (valueEl.setPointerCapture) {
      try { valueEl.setPointerCapture(e.pointerId); } catch { /* sin captura, sigue funcionando */ }
    }
  });
  valueEl.addEventListener("pointermove", (e) => {
    if (dragStartY === null) return;
    const steps = Math.round((dragStartY - e.clientY) / DRAG_PX_PER_STEP);
    const next = clampStep(dragStartValue + steps * step, min, max, step);
    if (next !== current) { current = next; show(); }
  });
  const endDrag = () => { dragStartY = null; valueEl.classList.remove("dragging"); };
  ["pointerup", "pointercancel"].forEach((ev) => valueEl.addEventListener(ev, endDrag));

  // Rueda del mouse (Windows).
  valueEl.addEventListener("wheel", (e) => {
    e.preventDefault();
    bump(e.deltaY < 0 ? 1 : -1);
  }, { passive: false });

  overlay.querySelectorAll("[data-quick]").forEach((b) => {
    b.onclick = () => {
      current = clampStep(quick[Number(b.dataset.quick)].apply(current), min, max, step);
      show();
    };
  });

  function close() {
    stopRepeat();
    document.removeEventListener("keydown", onKey);
    overlay.remove();
  }
  function accept() { close(); onAccept(current); }
  function cancel() { close(); if (onCancel) onCancel(); }
  function onKey(e) {
    if (e.key === "ArrowUp") { e.preventDefault(); bump(1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); bump(-1); }
    // Enter acepta, salvo si el foco está en un botón (ej. "Cancelar").
    else if (e.key === "Enter" && e.target.tagName !== "BUTTON") { e.preventDefault(); accept(); }
    else if (e.key === "Escape") { e.preventDefault(); cancel(); }
  }
  document.addEventListener("keydown", onKey);
  overlay.querySelector("#picker-ok").onclick = accept;
  overlay.querySelector("#picker-cancel").onclick = cancel;

  show();
  valueEl.focus();
  return { accept, cancel };
}

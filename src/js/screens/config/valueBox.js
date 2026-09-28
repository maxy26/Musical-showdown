/**
 * Caja de valor reutilizable: un <input> dentro de un .value-box con dos
 * flechas (▲▼) como hermanas. Se usa tanto para el puntaje objetivo como
 * para minutos/segundos del tiempo por ronda, evitando duplicar la misma
 * lógica de "flechas + escribir + Enter para confirmar" en cada caso.
 *
 * @param {HTMLElement} root - contenedor donde buscar el input (por id).
 * @param {string} inputId - id del <input> (sin el "#").
 * @param {object} opts
 * @param {() => number} opts.get - lee el valor actual.
 * @param {(v: number) => void} opts.set - aplica el nuevo valor (puede
 *        ignorarlo si está bloqueado, ver ejemplo de segundos en config).
 * @param {number} opts.step - cuánto suma/resta cada flecha.
 * @param {(v: number) => number} opts.clamp - normaliza/limita un valor.
 * @param {() => void} [opts.onCommit] - se llama después de cada cambio
 *        confirmado (flecha, Enter o blur).
 * @param {() => void} [opts.onEnter] - se llama al presionar Enter, después
 *        de confirmar el valor (típico: cerrar la caja personalizada).
 */
export function bindValueBox(root, inputId, { get, set, step, clamp, onCommit, onEnter }) {
  const input = root.querySelector(`#${inputId}`);
  if (!input) return null;
  const box = input.closest(".value-box");

  function refresh() {
    input.value = get();
  }

  function commit(raw) {
    set(clamp(raw));
    refresh();
    if (onCommit) onCommit();
  }

  box.querySelector('[data-dir="up"]').onclick = () => commit(get() + step);
  box.querySelector('[data-dir="down"]').onclick = () => commit(get() - step);

  // Lee lo escrito; si no hay ningún número, conserva el valor actual.
  // (Antes se usaba "|| get()", que descartaba el 0 como si fuera vacío.)
  function typedValue() {
    const n = parseInt(input.value.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? get() : n;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    commit(typedValue());
    input.blur();
    if (onEnter) onEnter();
  });
  input.addEventListener("blur", () => {
    commit(typedValue());
  });

  refresh();
  return { commit, refresh };
}

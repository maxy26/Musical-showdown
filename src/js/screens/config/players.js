import { el, titleCaseName } from "../../utils.js";

/** Largo máximo de un nombre (jugadores y grupos), para que quepa en la ronda. */
export const MAX_NAME_LENGTH = 20;

/**
 * Espacios de jugador con los que empieza la lista y que no se pueden borrar:
 * 2 en Individual y 4 en Grupal (lo mínimo para jugar; usuario, 04-10-2026).
 */
export function minPlayerRows(battleType) {
  return battleType === "grupal" ? 4 : 2;
}

/** Completa la lista con espacios vacíos hasta el mínimo del tipo de batalla. */
export function padPlayers(players, battleType) {
  const min = minPlayerRows(battleType);
  return players.length >= min ? players : [...players, ...Array(min - players.length).fill("")];
}

/**
 * Al cambiar el tipo de batalla: deja los nombres escritos (en su orden) y
 * espacios vacíos solo hasta el mínimo, así Individual vuelve a 2 espacios y
 * Grupal a 4 (usuario, 07-10-2026).
 */
export function fitPlayers(players, battleType) {
  return padPlayers(players.filter((p) => p.trim().length > 0), battleType);
}

/** Cuenta cuántos campos de jugador tienen texto realmente escrito (no vacíos). */
export function countTypedPlayers(players) {
  return players.filter((p) => p.trim().length > 0).length;
}

/** Nombre limpio: sin espacios al inicio ni al final, ni espacios dobles. */
export function cleanName(name) {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Posiciones de los nombres repetidos (los campos vacíos no cuentan). Dos
 * jugadores no pueden llamarse igual: los puntos se guardan por nombre.
 */
export function duplicateNameIndexes(names) {
  const seen = new Map();
  names.forEach((n, i) => {
    const key = cleanName(n);
    if (!key) return;
    seen.set(key, [...(seen.get(key) || []), i]);
  });
  return new Set([...seen.values()].filter((idx) => idx.length > 1).flat());
}

/**
 * Wire completo de la sección "Jugadores": alta/baja de filas, primera letra
 * de cada palabra en mayúscula al escribir (titleCaseName), y la nota en vivo
 * de Grupal (se necesitan 4+ jugadores escritos). El tipo de batalla se elige
 * en el inicio y aquí nunca se cambia solo (opción A del usuario, 01-10-2026).
 */
export function initPlayersSection(root, c) {
  function refreshGroupAvailability() {
    const typed = countTypedPlayers(c.players);
    const note = root.querySelector("#group-note");
    const cuenta = root.querySelector("#players-count");
    if (cuenta) cuenta.textContent = typed;
    if (!note) return;
    note.hidden = !(c.battleType === "grupal" && typed < 4);
    note.textContent = `Para jugar en Grupal se necesitan al menos 4 jugadores (llevas ${typed}).`;
  }

  // Nombres repetidos: los campos se marcan en rojo y aparece un mensaje
  // antes del botón "Añadir jugador". Mientras haya repetidos no se puede
  // confirmar la configuración (ver index.js).
  function refreshDuplicates() {
    const dup = duplicateNameIndexes(c.players);
    root.querySelectorAll("#players-list input").forEach((inp, i) => {
      inp.classList.toggle("input-error", dup.has(i));
    });
    const msg = root.querySelector("#players-error");
    if (msg) {
      const names = [...new Set([...dup].map((i) => cleanName(c.players[i])))];
      msg.hidden = dup.size === 0;
      msg.textContent = names.length === 1
        ? `⚠ Hay dos jugadores llamados "${names[0]}". Cada jugador necesita un nombre distinto.`
        : `⚠ Hay nombres repetidos (${names.join(", ")}). Cada jugador necesita un nombre distinto.`;
    }
    return dup.size > 0;
  }

  // Lista numerada con alto fijo que se desplaza por dentro, así la pantalla no
  // se alarga con muchos jugadores (diseño B elegido por el usuario, 10-10-2026).
  // `alFinal`: al agregar un jugador, la lista baja hasta el espacio nuevo.
  function renderPlayers(alFinal = false) {
    const list = root.querySelector("#players-list");
    list.innerHTML = "";
    c.players.forEach((p, i) => {
      const row = el(`<div class="player-row">
        <span class="player-num">${i + 1}</span>
        <input type="text" value="${p}" placeholder="Jugador ${i + 1}" maxlength="${MAX_NAME_LENGTH}" data-idx="${i}">
        ${i >= minPlayerRows(c.battleType) ? `<button class="remove-btn" data-remove="${i}">✕</button>` : `<span class="remove-space"></span>`}
      </div>`);
      row.querySelector("input").oninput = (e) => {
        const pos = e.target.selectionStart;
        e.target.value = titleCaseName(e.target.value);
        e.target.setSelectionRange(pos, pos);
        c.players[i] = e.target.value;
        refreshGroupAvailability();
        refreshDuplicates();
      };
      const removeBtn = row.querySelector("[data-remove]");
      if (removeBtn) {
        removeBtn.onclick = () => {
          c.players.splice(i, 1);
          renderPlayers();
          refreshGroupAvailability();
        };
      }
      list.appendChild(row);
    });
    if (alFinal) {
      list.scrollTop = list.scrollHeight;
      list.lastElementChild.querySelector("input").focus({ preventScroll: true });
    }
    list.onscroll = () => updateScrollShadows(list);
    requestAnimationFrame(() => updateScrollShadows(list)); // cuando ya está en pantalla
    refreshDuplicates();
  }
  renderPlayers();

  // Difuminado arriba / abajo cuando quedan nombres fuera de la vista
  function updateScrollShadows(list) {
    list.classList.toggle("more-above", list.scrollTop > 2);
    list.classList.toggle("more-below", list.scrollTop + list.clientHeight < list.scrollHeight - 2);
  }

  root.querySelector("#add-player").onclick = () => {
    c.players.push("");
    renderPlayers(true);
    refreshGroupAvailability();
  };

  return { refreshGroupAvailability, refreshDuplicates };
}

import { el, titleCaseName } from "../../utils.js";

/** Largo máximo de un nombre (jugadores y grupos), para que quepa en la ronda. */
export const MAX_NAME_LENGTH = 20;

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
 * de cada palabra en mayúscula al escribir (titleCaseName), y
 * habilitar/deshabilitar el modo Grupal en vivo
 * (se necesitan 4+ jugadores escritos). `onBattleTypeForcedIndividual` se
 * llama si había Grupal seleccionado y dejó de alcanzar para 4 jugadores,
 * para que quien llama pueda re-renderizar la pantalla completa.
 */
export function initPlayersSection(root, c, onBattleTypeForcedIndividual) {
  function refreshGroupAvailability() {
    const typed = countTypedPlayers(c.players);
    const ok = typed >= 4;
    const groupChip = root.querySelector('[data-battle="grupal"]');
    const note = root.querySelector("#group-note");
    if (groupChip) {
      groupChip.disabled = !ok;
      groupChip.style.opacity = ok ? "" : ".4";
      groupChip.style.cursor = ok ? "" : "not-allowed";
    }
    if (note) {
      note.style.display = ok ? "none" : "block";
      note.textContent = `Necesitas al menos 4 jugadores escritos para jugar en grupo (llevas ${typed}).`;
    }
    if (!ok && c.battleType === "grupal") {
      c.battleType = "individual";
      onBattleTypeForcedIndividual();
    }
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

  function renderPlayers() {
    const list = root.querySelector("#players-list");
    list.innerHTML = "";
    c.players.forEach((p, i) => {
      const row = el(`<div class="player-row">
        <input type="text" value="${p}" placeholder="Jugador ${i + 1}" maxlength="${MAX_NAME_LENGTH}" data-idx="${i}">
        ${i >= 2 ? `<button class="remove-btn" data-remove="${i}">✕</button>` : ""}
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
    refreshDuplicates();
  }
  renderPlayers();

  root.querySelector("#add-player").onclick = () => {
    c.players.push("");
    renderPlayers();
    refreshGroupAvailability();
  };

  return { refreshGroupAvailability, refreshDuplicates };
}

import { el } from "../../utils.js";

/** Cuenta cuántos campos de jugador tienen texto realmente escrito (no vacíos). */
export function countTypedPlayers(players) {
  return players.filter((p) => p.trim().length > 0).length;
}

/**
 * Wire completo de la sección "Jugadores": alta/baja de filas, mayúsculas
 * automáticas al escribir, y habilitar/deshabilitar el modo Grupal en vivo
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

  function renderPlayers() {
    const list = root.querySelector("#players-list");
    list.innerHTML = "";
    c.players.forEach((p, i) => {
      const row = el(`<div class="player-row">
        <input type="text" value="${p}" placeholder="Jugador ${i + 1}" data-idx="${i}">
        ${i >= 2 ? `<button class="remove-btn" data-remove="${i}">✕</button>` : ""}
      </div>`);
      row.querySelector("input").oninput = (e) => {
        const pos = e.target.selectionStart;
        e.target.value = e.target.value.toUpperCase();
        e.target.setSelectionRange(pos, pos);
        c.players[i] = e.target.value;
        refreshGroupAvailability();
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
  }
  renderPlayers();

  root.querySelector("#add-player").onclick = () => {
    c.players.push("");
    renderPlayers();
    refreshGroupAvailability();
  };

  return { refreshGroupAvailability };
}

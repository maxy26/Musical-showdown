import { state } from "../state.js";
import { el, escapeHtml, titleCaseName } from "../utils.js";
import { render } from "../router.js";
import { startNextRound, resetMatchTracking } from "../gameLogic.js";
import { openHelp, showWarning, showConfirm } from "./modals.js";
import { muteButtonHTML } from "../sound.js";
import { GROUP_TERMS, groupCountOptions, distributeRandom, groupName, defaultGroupName } from "../groups.js";
import { MAX_NAME_LENGTH, cleanName, duplicateNameIndexes } from "./config/players.js";

/**
 * Organizar grupos (modo Grupal). Reglas en CONTEXTO-MUSICAL-SHOWDOWN.md,
 * sección 3 → "Organización de grupos":
 *   - Lista de cantidad (de 2 a la mitad de los jugadores; cambiarla reparte
 *     de nuevo al azar y devuelve los nombres a los predeterminados) y lista
 *     "Equipos"/"Grupos" (cambiarla devuelve los nombres a los predeterminados).
 *   - Tocar el título de una tarjeta permite editar el nombre (máx. 20 letras,
 *     primera letra de cada palabra en mayúscula; vacío = predeterminado).
 *     No se permiten nombres repetidos: se marcan en rojo y no deja confirmar.
 *   - Tocar un jugador y luego un jugador de otro grupo: si ese grupo tiene
 *     menos jugadores, se mueve; si tienen los mismos, se intercambian.
 */
export function screenTeamOrg() {
  const c = state.config;
  const term = GROUP_TERMS[c.groupTerm];
  const plural = term.plural.toLowerCase();
  const singular = term.singular.toLowerCase();
  const allPlayers = () => state.groups.flatMap((g) => g.players);
  const names = () => state.groups.map((g, i) => groupName(g, i, c.groupTerm));
  const options = groupCountOptions(allPlayers().length);

  const root = el(`<div class="screen">
    <div class="top-bar"><h2>Organizar ${plural}</h2><div class="top-bar-actions"><button class="icon-btn" id="back">← Configuración</button><button class="icon-btn icon-btn-round" id="help">❓</button>${muteButtonHTML()}</div></div>
    <div class="card">
      <div class="config-2col">
        <div class="field">
          <label>Cantidad de ${plural}</label>
          <select id="group-count">
            ${options.map((n) => `<option value="${n}" ${n === state.groups.length ? "selected" : ""}>${n} ${plural}</option>`).join("")}
          </select>
          <p class="field-hint">De ${options[0]} a ${options[options.length - 1]} ${plural}: cada ${singular} necesita al menos 2 jugadores.</p>
        </div>
        <div class="field">
          <label>Se llaman</label>
          <select id="group-term">
            ${Object.entries(GROUP_TERMS).map(([id, t]) => `<option value="${id}" ${id === c.groupTerm ? "selected" : ""}>${t.plural}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="teams-grid" id="groups"></div>
      <p class="field-error" id="group-names-error" hidden></p>
      <p class="small-note">Toca un jugador y luego a alguien de otro ${singular} para intercambiarlos, o toca el ${singular} (fuera de los nombres) para moverlo ahí. Toca el nombre de un ${singular} para cambiarlo.</p>
      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-secondary" id="reshuffle">🎲 Volver a organizar</button>
        <button class="btn btn-primary" id="confirm-teams" style="margin-left:auto;">🔒 Confirmar ${plural}</button>
      </div>
    </div>
  </div>`);

  // ---------- Nombres repetidos ----------
  function refreshNameErrors() {
    const dup = duplicateNameIndexes(names());
    root.querySelectorAll(".team-card h3").forEach((h, i) => h.classList.toggle("title-error", dup.has(i)));
    const msg = root.querySelector("#group-names-error");
    const repeated = [...new Set([...dup].map((i) => names()[i]))];
    msg.hidden = dup.size === 0;
    msg.textContent = `⚠ Hay dos ${plural} llamados "${repeated.join('", "')}". Cada ${singular} necesita un nombre distinto.`;
    return dup.size > 0;
  }

  // ---------- Tarjetas ----------
  function renderGroups() {
    const grid = root.querySelector("#groups");
    grid.innerHTML = "";
    state.groups.forEach((group, gi) => {
      const card = el(`<div class="team-card group-color-${gi % 5}">
        <h3 class="group-title" title="Toca para cambiar el nombre">${escapeHtml(groupName(group, gi, c.groupTerm))} <span class="edit-hint">✏️</span></h3>
        <div class="members"></div>
      </div>`);
      card.querySelector("h3").onclick = (e) => { e.stopPropagation(); editName(card, gi); };
      // Tocar el grupo (fuera de los nombres) mueve ahí al jugador elegido, sin intercambiar.
      card.onclick = () => {
        const current = state.teamSelectedPlayer;
        if (!current || current.group === gi) return;
        movePlayer(current.name, current.group, gi);
        state.teamSelectedPlayer = null;
        renderGroups();
      };

      const members = card.querySelector(".members");
      group.players.forEach((name, pi) => {
        const sel = state.teamSelectedPlayer;
        const selected = sel && sel.name === name && sel.group === gi;
        const item = el(`<div class="team-member ${selected ? "selected" : ""}">
          <span class="num">${pi + 1}.</span> ${escapeHtml(name)}
        </div>`);
        item.onclick = (e) => {
          e.stopPropagation(); // no cuenta como tocar el grupo
          const current = state.teamSelectedPlayer;
          if (selected) state.teamSelectedPlayer = null;
          else if (!current || current.group === gi) state.teamSelectedPlayer = { name, group: gi };
          else {
            swapPlayers(current.name, current.group, gi, name);
            state.teamSelectedPlayer = null;
          }
          renderGroups();
        };
        members.appendChild(item);
      });
      grid.appendChild(card);
    });
    refreshNameErrors();
  }

  // Editar el nombre tocando el título: se convierte en un campo para escribir.
  function editName(card, gi) {
    const group = state.groups[gi];
    const h3 = card.querySelector("h3");
    const input = el(`<input type="text" class="group-name-input" maxlength="${MAX_NAME_LENGTH}"
      value="${escapeHtml(groupName(group, gi, c.groupTerm))}" placeholder="${defaultGroupName(c.groupTerm, gi)}">`);
    h3.replaceWith(input);
    input.focus();
    input.select();
    input.oninput = () => {
      const pos = input.selectionStart;
      input.value = titleCaseName(input.value);
      input.setSelectionRange(pos, pos);
    };
    let done = false;
    const commit = () => {
      if (done) return;
      done = true;
      const value = cleanName(input.value);
      // Vacío o igual al predeterminado: se queda con el predeterminado.
      group.customName = value && value !== defaultGroupName(c.groupTerm, gi) ? value : "";
      renderGroups();
    };
    input.onblur = commit;
    input.onkeydown = (e) => {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
    };
  }

  // Tocar un jugador y luego a otro de otro grupo: se intercambian esos dos.
  function swapPlayers(name, from, to, target) {
    const src = state.groups[from].players;
    const dst = state.groups[to].players;
    src[src.indexOf(name)] = target;
    dst[dst.indexOf(target)] = name;
  }

  // Tocar un jugador y luego el grupo (fuera de los nombres): se mueve sin
  // intercambiar, siempre que su grupo quede con al menos 2 jugadores.
  function movePlayer(name, from, to) {
    const src = state.groups[from].players;
    if (src.length <= 2) {
      showWarning(`Cada ${singular} necesita al menos 2 jugadores.`);
      return;
    }
    src.splice(src.indexOf(name), 1);
    state.groups[to].players.push(name);
  }

  // ---------- Listas de cantidad y nombre ----------
  // Cambiar la cantidad reinicia todo: nuevo reparto al azar y nombres
  // predeterminados (se mantiene "Equipos"/"Grupos" tal como está elegido).
  root.querySelector("#group-count").onchange = (e) => {
    c.groupCount = parseInt(e.target.value, 10);
    state.groups = distributeRandom(allPlayers(), c.groupCount); // customName vacío = predeterminado
    state.teamSelectedPlayer = null;
    render();
  };
  root.querySelector("#group-term").onchange = (e) => {
    c.groupTerm = e.target.value;
    state.groups.forEach((g) => { g.customName = ""; }); // vuelven a "Equipo 1"/"Grupo 1"…
    render();
  };

  root.querySelector("#reshuffle").onclick = () => {
    const customNames = state.groups.map((g) => g.customName);
    state.groups = distributeRandom(allPlayers(), state.groups.length);
    state.groups.forEach((g, i) => { g.customName = customNames[i]; });
    state.teamSelectedPlayer = null;
    renderGroups();
  };
  root.querySelector("#back").onclick = () => { state.screen = "config"; render(); };
  root.querySelector("#help").onclick = () => openHelp();
  root.querySelector("#confirm-teams").onclick = () => {
    if (refreshNameErrors()) {
      root.querySelector("#group-names-error").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    showConfirm({
      title: `¿Confirmar ${plural}?`,
      message: "Ya no se podrán mover jugadores durante la partida.",
      noText: "No, seguir editando",
      yesText: "Sí, confirmar",
      onYes: () => {
        state.scores = {};
        names().forEach((n) => { state.scores[n] = 0; });
        resetMatchTracking();
        startNextRound();
        render();
      },
    });
  };

  renderGroups();
  return root;
}

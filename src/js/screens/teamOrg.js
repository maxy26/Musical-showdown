import { state } from "../state.js";
import { el, shuffleArray } from "../utils.js";
import { render } from "../router.js";
import { startNextRound } from "../gameLogic.js";
import { openHelp, showWarning } from "./modals.js";
import { muteButtonHTML, bindMuteButtons } from "../sound.js";

export function screenTeamOrg() {
  const root = el(`<div class="screen">
    <div class="top-bar"><h2>Organizar equipos</h2><div class="top-bar-actions"><button class="icon-btn" id="back">← Configuración</button><button class="icon-btn icon-btn-round" id="help">❓</button>${muteButtonHTML()}</div></div>
    <div class="card">
      <div class="teams-grid">
        <div class="team-card team-a"><h3>EQUIPO 1</h3><div id="team-a"></div></div>
        <div class="team-card team-b"><h3>EQUIPO 2</h3><div id="team-b"></div></div>
      </div>
      <p class="small-note">Toca un jugador y luego el equipo al que quieres moverlo.</p>
      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-secondary" id="reshuffle">🎲 Volver a organizar</button>
        <button class="btn btn-primary" id="confirm-teams" style="margin-left:auto;">🔒 Confirmar equipos</button>
      </div>
    </div>
  </div>`);

  function renderTeams() {
    ["a", "b"].forEach((key) => {
      const box = root.querySelector(`#team-${key}`);
      box.innerHTML = "";
      state.teams[key].forEach((name, i) => {
        const selected = state.teamSelectedPlayer && state.teamSelectedPlayer.name === name && state.teamSelectedPlayer.team === key;
        const item = el(`<div class="team-member ${selected ? "selected" : ""}">
          <span class="num">${i + 1}.</span> ${name}
        </div>`);
        item.onclick = () => {
          if (selected) {
            state.teamSelectedPlayer = null;
          } else if (!state.teamSelectedPlayer) {
            state.teamSelectedPlayer = { name, team: key };
          } else {
            movePlayerToTeam(state.teamSelectedPlayer.name, state.teamSelectedPlayer.team, key);
            state.teamSelectedPlayer = null;
          }
          renderTeams();
        };
        box.appendChild(item);
      });
    });
  }

  // Los tamaños de los equipos no pueden cambiar: si tienen el mismo
  // tamaño, se intercambian posiciones; si no, se mueve sin más.
  function movePlayerToTeam(name, fromKey, toKey) {
    if (fromKey === toKey) return;
    const fromArr = state.teams[fromKey];
    const toArr = state.teams[toKey];
    if (fromArr.length === toArr.length) {
      const idxFrom = fromArr.indexOf(name);
      const swapped = toArr[0];
      toArr[0] = name;
      fromArr[idxFrom] = swapped;
    } else if (toArr.length < fromArr.length) {
      fromArr.splice(fromArr.indexOf(name), 1);
      toArr.push(name);
    } else {
      showWarning("Ese equipo ya está lleno.");
    }
  }

  root.querySelector("#reshuffle").onclick = () => {
    const all = [...state.teams.a, ...state.teams.b];
    const sizeA = state.teams.a.length;
    shuffleArray(all);
    state.teams.a = all.slice(0, sizeA);
    state.teams.b = all.slice(sizeA);
    state.teamSelectedPlayer = null;
    renderTeams();
  };
  root.querySelector("#back").onclick = () => { state.screen = "config"; render(); };
  root.querySelector("#help").onclick = () => openHelp();
  bindMuteButtons(root);
  root.querySelector("#confirm-teams").onclick = () => {
    if (confirm("¿Confirmar equipos? Ya no se podrán mover jugadores durante la partida.")) {
      startNextRound();
      render();
    }
  };

  renderTeams();
  return root;
}

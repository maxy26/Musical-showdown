import { state } from "../../state.js";
import { GENRES, genreName } from "../../data/songs.js";
import { el } from "../../utils.js";
import { render } from "../../router.js";
import { startNextRound } from "../../gameLogic.js";
import { openHelp, showWarning } from "../modals.js";
import { muteButtonHTML, bindMuteButtons } from "../../sound.js";
import { TARGET_SCORE_PRESETS, ROUND_TIME_PRESETS, formatCustomTime } from "./presets.js";
import { modesFor } from "./modes.js";
import { countTypedPlayers, initPlayersSection } from "./players.js";
import { bindValueBox } from "./valueBox.js";

export function screenConfig() {
  const c = state.config;

  // Si el modo actual ya no está disponible para el tipo de batalla elegido, se reinicia a Clásico.
  const available = modesFor(c.battleType);
  if (!available.find((m) => m.id === c.mode && m.enabled)) c.mode = "clasico";

  const typedCount = countTypedPlayers(c.players);
  const canGroup = typedCount >= 4;
  if (c.battleType === "grupal" && !canGroup) c.battleType = "individual";

  const root = el(`<div class="screen">
    <div class="top-bar"><h2>Configurar partida</h2><div class="top-bar-actions"><button class="icon-btn" id="back">← Menú</button><button class="icon-btn icon-btn-round" id="help">❓</button>${muteButtonHTML()}</div></div>
    <div class="card">
      <div class="field">
        <label>Jugadores</label>
        <div id="players-list"></div>
        <button class="btn btn-secondary" id="add-player" style="margin-top:6px;">+ Añadir jugador</button>
      </div>

      <div class="field">
        <label>Tipo de batalla</label>
        <div class="chip-group">
          <button class="chip ${c.battleType === "individual" ? "active" : ""}" data-battle="individual">👤 Individual</button>
          <button class="chip ${c.battleType === "grupal" ? "active alt" : ""}" data-battle="grupal" ${canGroup ? "" : 'disabled style="opacity:.4;cursor:not-allowed;"'}>👥 Grupal</button>
        </div>
        <p class="small-note" id="group-note" style="margin-top:8px;${canGroup ? "display:none;" : ""}">Necesitas al menos 4 jugadores escritos para jugar en grupo (llevas ${typedCount}).</p>
      </div>

      <div class="field">
        <label>Modo de juego</label>
        <div class="chip-group" id="modes"></div>
      </div>

      <div class="field">
        <label>Géneros musicales</label>
        <div class="chip-group" id="genres">
          ${GENRES.map((g) => `<button class="chip ${c.genres.includes(g) ? "active" : ""}" data-genre="${g}">${genreName(g)}</button>`).join("")}
        </div>
      </div>

      <div class="config-2col">
        <div class="field">
          <label>Puntaje objetivo (lista desplegable)</label>
          <select id="target">
            ${TARGET_SCORE_PRESETS.map((v) => `<option value="${v}" ${c.targetScoreMode === "preset" && v === c.targetScore ? "selected" : ""}>${v} pts</option>`).join("")}
            <option value="custom" ${c.targetScoreMode === "custom" ? "selected" : ""}>Personalizado</option>
          </select>
          <div id="target-custom-row" class="${c.targetScoreMode === "custom" ? "" : "hidden"}" style="margin-top:10px;">
            <div class="value-box-row">
              <div class="value-box">
                <button type="button" class="value-arrow" data-dir="up">▲</button>
                <input type="text" inputmode="numeric" id="target-value-input" class="value-display" value="${c.targetScore}">
                <button type="button" class="value-arrow" data-dir="down">▼</button>
              </div>
              <span class="small-note" style="margin:0;">pts (Enter para confirmar)</span>
            </div>
          </div>
        </div>
        <div class="field">
          <label>Tiempo por ronda (lista desplegable)</label>
          <select id="roundtime">
            ${ROUND_TIME_PRESETS.map((o) => `<option value="${o.value}" ${c.roundTimeMode === "preset" && o.value === c.roundTime ? "selected" : ""}>${o.label}</option>`).join("")}
            <option value="custom" ${c.roundTimeMode === "custom" ? "selected" : ""}>Personalizado</option>
          </select>
          <div id="time-custom-row" class="${c.roundTimeMode === "custom" ? "" : "hidden"}" style="margin-top:10px;">
            <div class="value-box-row">
              <div class="value-box">
                <button type="button" class="value-arrow" data-dir="up">▲</button>
                <input type="text" inputmode="numeric" id="min-value-input" class="value-display" value="0">
                <button type="button" class="value-arrow" data-dir="down">▼</button>
              </div>
              <span style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:16px;">min</span>
              <div class="value-box">
                <button type="button" class="value-arrow" data-dir="up">▲</button>
                <input type="text" inputmode="numeric" id="sec-value-input" class="value-display" value="0">
                <button type="button" class="value-arrow" data-dir="down">▼</button>
              </div>
              <span style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:16px;">seg</span>
            </div>
            <p class="small-note" style="margin-top:6px;">Enter para confirmar el valor escrito.</p>
            <p class="small-note" id="time-max-warning" style="color:var(--red);margin-top:6px;display:none;">
              ⚠ El tiempo máximo por ronda es de 2 minutos.
            </p>
          </div>
        </div>
      </div>

      <div class="field">
        <div class="switch-row">
          <button type="button" class="switch ${c.multipliers.length > 0 ? "on" : ""}" id="mult-toggle" role="switch" aria-checked="${c.multipliers.length > 0}">
            <span class="switch-thumb"></span>
          </button>
          <span class="switch-label">Multiplicadores</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block" id="confirm-config">Confirmar configuración</button>
    </div>
  </div>`);

  // ---------- Jugadores (alta/baja, mayúsculas, disponibilidad de Grupal) ----------
  initPlayersSection(root, c, () => render());

  // ---------- Modos (dependen del tipo de batalla) ----------
  function renderModes() {
    const box = root.querySelector("#modes");
    box.innerHTML = "";
    modesFor(c.battleType).forEach((m) => {
      const active = c.mode === m.id;
      const btn = el(`<button class="chip ${active ? "active" : ""}" ${m.enabled ? "" : 'style="opacity:.4;cursor:not-allowed;"'}>
        ${m.label}${m.enabled ? "" : " (próx.)"}
      </button>`);
      if (m.enabled) btn.onclick = () => { c.mode = m.id; renderModes(); };
      else btn.disabled = true;
      box.appendChild(btn);
    });
  }
  renderModes();

  root.querySelector("#back").onclick = () => { state.screen = "menu"; render(); };
  root.querySelector("#help").onclick = () => openHelp();
  bindMuteButtons(root);

  // ---------- Puntaje objetivo: preset vs. personalizado ----------
  root.querySelector("#target").onchange = (e) => {
    const v = e.target.value;
    if (v === "custom") {
      c.targetScoreMode = "custom";
      c.targetScore = Math.round(c.targetScore / 100) * 100 || 2000; // por si no era múltiplo de 100
    } else {
      c.targetScoreMode = "preset";
      c.targetScore = parseInt(v);
    }
    render();
  };

  function updateTargetOptionLabel() {
    const opt = root.querySelector('#target option[value="custom"]');
    if (!opt) return;
    opt.textContent = c.targetScoreMode === "custom" ? `${c.targetScore} pts` : "Personalizado";
  }
  bindValueBox(root, "target-value-input", {
    get: () => c.targetScore,
    set: (v) => { c.targetScore = v; },
    step: 100,
    clamp: (v) => Math.min(9900, Math.max(100, Math.round(v / 100) * 100)),
    onCommit: updateTargetOptionLabel,
  });
  updateTargetOptionLabel();

  // ---------- Tiempo por ronda: preset vs. personalizado (minutos + segundos) ----------
  root.querySelector("#roundtime").onchange = (e) => {
    const v = e.target.value;
    if (v === "custom") {
      c.roundTimeMode = "custom";
      if (c.roundTime === 0 || c.roundTime > 120) c.roundTime = 90; // valor inicial razonable
    } else {
      c.roundTimeMode = "preset";
      c.roundTime = parseInt(v);
    }
    render();
  };

  let minutes = Math.min(2, Math.floor(c.roundTime / 60));
  let seconds = minutes >= 2 ? 0 : c.roundTime % 60;
  const timeMaxWarning = root.querySelector("#time-max-warning");

  function showMaxWarning() {
    if (!timeMaxWarning) return;
    timeMaxWarning.style.display = "block";
    clearTimeout(showMaxWarning._t);
    showMaxWarning._t = setTimeout(() => { timeMaxWarning.style.display = "none"; }, 2500);
  }
  function updateTimeOptionLabel() {
    const opt = root.querySelector('#roundtime option[value="custom"]');
    if (!opt) return;
    opt.textContent = c.roundTimeMode === "custom" ? formatCustomTime(minutes * 60 + seconds) : "Personalizado";
  }

  const secBox = bindValueBox(root, "sec-value-input", {
    get: () => seconds,
    set: (v) => {
      if (minutes >= 2) { showMaxWarning(); return; } // bloqueado a 2 min: no cambia
      seconds = v;
      c.roundTime = minutes * 60 + seconds;
    },
    step: 5,
    clamp: (v) => Math.min(55, Math.max(0, Math.round(v / 5) * 5)),
    onCommit: updateTimeOptionLabel,
  });
  bindValueBox(root, "min-value-input", {
    get: () => minutes,
    set: (v) => {
      minutes = v;
      if (minutes >= 2) { seconds = 0; showMaxWarning(); }
      c.roundTime = minutes * 60 + seconds;
    },
    step: 1,
    clamp: (v) => Math.min(2, Math.max(0, v)),
    onCommit: () => { secBox && secBox.refresh(); updateTimeOptionLabel(); },
  });
  updateTimeOptionLabel();

  // ---------- Tipo de batalla / géneros / multiplicadores ----------
  root.querySelectorAll("[data-battle]").forEach((b) => (b.onclick = () => {
    c.battleType = b.dataset.battle;
    const avail = modesFor(c.battleType);
    if (!avail.find((m) => m.id === c.mode && m.enabled)) c.mode = "clasico";
    render();
  }));

  root.querySelectorAll("[data-genre]").forEach((b) => (b.onclick = () => {
    const g = b.dataset.genre;
    if (c.genres.includes(g)) c.genres = c.genres.filter((x) => x !== g);
    else c.genres.push(g);
    render();
  }));

  root.querySelector("#mult-toggle").onclick = () => {
    c.multipliers = c.multipliers.length > 0 ? [] : [2, 3, 4, 5];
    render();
  };

  // ---------- Confirmar y arrancar la partida ----------
  root.querySelector("#confirm-config").onclick = () => {
    c.players = c.players.map((p) => p.trim()).filter((p) => p.length > 0);
    if (c.players.length < 2) { showWarning("Escribe al menos 2 nombres de jugador para poder iniciar la partida."); return; }
    if (c.battleType === "grupal" && c.players.length < 4) {
      showWarning("Se necesitan al menos 4 jugadores escritos para jugar en grupo.");
      c.battleType = "individual";
      render();
      return;
    }
    if (c.genres.length === 0) { showWarning("Selecciona al menos un género."); return; }

    state.scores = {};
    if (c.battleType === "individual") {
      c.players.forEach((p) => (state.scores[p] = 0));
      startNextRound();
    } else {
      state.teams = { a: [], b: [] };
      c.players.forEach((p, i) => (i % 2 === 0 ? state.teams.a : state.teams.b).push(p));
      state.scores = { "Equipo 1": 0, "Equipo 2": 0 };
      state.screen = "team-org";
    }
    render();
  };

  return root;
}

import { state } from "../../state.js";
import { GENRES, genreName } from "../../data/songs.js";
import { el } from "../../utils.js";
import { render } from "../../router.js";
import { startNextRound, resetMatchTracking } from "../../gameLogic.js";
import { openHelp, showWarning } from "../modals.js";
import { muteButtonHTML, bindMuteButtons } from "../../sound.js";
import {
  TARGET_SCORE_PRESETS, ROUND_TIME_PRESETS, formatCustomTime,
  isPresetTarget, isPresetTime,
} from "./presets.js";
import { modesFor, usesRoundTime, allowsNoTime, usesMultipliers, DEFAULT_ROUND_TIME } from "./modes.js";
import { countTypedPlayers, initPlayersSection, cleanName } from "./players.js";
import { openValuePicker } from "./valuePicker.js";
import { distributeRandom, maxGroups } from "../../groups.js";

/**
 * Opción de la lista con el valor personalizado ya elegido (ej. "3500 pts").
 * Ocupa el lugar de los valores predeterminados en la lista; para cambiarlo
 * se vuelve a elegir "Personalizado…", que abre la ventana de valor.
 */
function customValueOption(show, label) {
  return show ? `<option value="custom-value" selected>${label}</option>` : "";
}

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
        <p class="field-error" id="players-error" hidden></p>
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
          <label>Puntaje objetivo</label>
          <select id="target">
            ${TARGET_SCORE_PRESETS.map((v) => `<option value="${v}" ${c.targetScoreMode === "preset" && v === c.targetScore ? "selected" : ""}>${v} pts</option>`).join("")}
            ${customValueOption(c.targetScoreMode === "custom", `${c.targetScore} pts`)}
            <option value="custom">Personalizado…</option>
          </select>
        </div>
        <div class="field">
          <label>Tiempo por ronda</label>
          ${usesRoundTime(c.mode) ? `
          <select id="roundtime">
            ${ROUND_TIME_PRESETS.filter((o) => o.value !== 0 || allowsNoTime(c.mode)).map((o) => `<option value="${o.value}" ${c.roundTimeMode === "preset" && o.value === c.roundTime ? "selected" : ""}>${o.label}</option>`).join("")}
            ${customValueOption(c.roundTimeMode === "custom", formatCustomTime(c.roundTime))}
            <option value="custom">Personalizado…</option>
          </select>` : `
          <p class="field-hint">En Clásico no hay reloj: la ronda termina cuando alguien acierta, cuando los dos fallan o con "Finalizar ronda".</p>`}
        </div>
      </div>

      ${usesMultipliers(c.mode) ? `
      <div class="field">
        <label>Multiplicadores</label>
        <div class="segmented" id="mult-segment" role="radiogroup" aria-label="Multiplicadores">
          <button type="button" role="radio" data-mult="on" class="${c.multipliers.length > 0 ? "active" : ""}" aria-checked="${c.multipliers.length > 0}">✨ Con multiplicadores</button>
          <button type="button" role="radio" data-mult="off" class="${c.multipliers.length > 0 ? "" : "active"}" aria-checked="${c.multipliers.length === 0}">Sin multiplicadores</button>
        </div>
        <p class="field-hint">${c.multipliers.length > 0 ? "Pueden salir ×2, ×3, ×4 o ×5 en cualquier ronda." : "Todas las rondas valen 100 puntos."}</p>
      </div>` : ""}

      <button class="btn btn-primary btn-block" id="confirm-config">Confirmar configuración</button>
    </div>
  </div>`);

  // ---------- Jugadores (alta/baja, mayúsculas, disponibilidad de Grupal) ----------
  const playersSection = initPlayersSection(root, c, () => render());

  // ---------- Modos (dependen del tipo de batalla) ----------
  function renderModes() {
    const box = root.querySelector("#modes");
    box.innerHTML = "";
    modesFor(c.battleType).forEach((m) => {
      const active = c.mode === m.id;
      const btn = el(`<button class="chip ${active ? "active" : ""}" ${m.enabled ? "" : 'style="opacity:.4;cursor:not-allowed;"'}>
        ${m.label}${m.enabled ? "" : " (próx.)"}
      </button>`);
      if (m.enabled) btn.onclick = () => selectMode(m.id);
      else btn.disabled = true;
      box.appendChild(btn);
    });
  }
  renderModes();

  // Cambiar de modo cambia qué opciones se muestran (tiempo, multiplicadores).
  // Si el modo nuevo no permite "Sin tiempo" y estaba elegido, se pone 30 seg.
  function selectMode(id) {
    c.mode = id;
    fixRoundTimeForMode();
    render();
  }
  function fixRoundTimeForMode() {
    if (usesRoundTime(c.mode) && !allowsNoTime(c.mode) && c.roundTime === 0) {
      c.roundTime = DEFAULT_ROUND_TIME;
      c.roundTimeMode = "preset";
    }
  }

  root.querySelector("#back").onclick = () => { state.screen = "menu"; render(); };
  root.querySelector("#help").onclick = () => openHelp();
  bindMuteButtons(root);

  // ---------- Puntaje objetivo y tiempo: predeterminado vs. personalizado ----------
  // "Personalizado…" abre un selector de rueda (valuePicker.js): se desliza
  // con el dedo o con las flechas ↑ ↓, y se confirma con Enter o "Listo".
  // El valor ocupa el lugar de los predeterminados en la lista (si coincide
  // con uno de ellos, se usa ese). "Cancelar" deja todo como estaba.
  root.querySelector("#target").onchange = (e) => {
    const v = e.target.value;
    if (v === "custom-value") return;
    if (v === "custom") {
      openValuePicker({
        title: "Puntaje objetivo",
        value: c.targetScore,
        min: 100, max: 9900, step: 100,
        formatItem: (s) => String(s),
        unit: "pts",
        describe: (s) => `${s} puntos`,
        onAccept: (s) => {
          c.targetScore = s;
          c.targetScoreMode = isPresetTarget(s) ? "preset" : "custom";
          render();
        },
        onCancel: render, // la lista vuelve a mostrar el valor anterior
      });
      return;
    }
    c.targetScoreMode = "preset";
    c.targetScore = parseInt(v);
    render();
  };

  const roundTimeSelect = root.querySelector("#roundtime");
  if (roundTimeSelect) roundTimeSelect.onchange = (e) => {
    const v = e.target.value;
    if (v === "custom-value") return;
    if (v === "custom") {
      openValuePicker({
        title: "Tiempo por ronda",
        value: c.roundTime > 0 ? c.roundTime : 90, // "Sin tiempo" no tiene valor: se parte de 1:30
        min: 5, max: 120, step: 5, // máximo 2 minutos; 0:00 sería "Sin tiempo"
        formatItem: (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`,
        describe: formatCustomTime,
        onAccept: (t) => {
          c.roundTime = t;
          c.roundTimeMode = isPresetTime(t) ? "preset" : "custom";
          render();
        },
        onCancel: render,
      });
      return;
    }
    c.roundTimeMode = "preset";
    c.roundTime = parseInt(v);
    render();
  };

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

  // Selector "Con / Sin multiplicadores" (diseño B elegido por el usuario).
  root.querySelectorAll("[data-mult]").forEach((b) => (b.onclick = () => {
    c.multipliers = b.dataset.mult === "on" ? [2, 3, 4, 5] : [];
    render();
  }));

  // ---------- Confirmar y arrancar la partida ----------
  root.querySelector("#confirm-config").onclick = () => {
    fixRoundTimeForMode(); // por si se llegó a Alternativo 1 con "Sin tiempo" elegido
    // Con nombres repetidos no se puede continuar: los campos ya están en rojo
    // y el mensaje aparece antes de "Añadir jugador".
    if (playersSection.refreshDuplicates()) {
      root.querySelector("#players-error").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    c.players = c.players.map(cleanName).filter((p) => p.length > 0);
    if (c.players.length < 2) { showWarning("Escribe al menos 2 nombres de jugador para poder iniciar la partida."); return; }
    if (c.battleType === "grupal" && c.players.length < 4) {
      showWarning("Se necesitan al menos 4 jugadores escritos para jugar en grupo.");
      c.battleType = "individual";
      render();
      return;
    }
    if (c.genres.length === 0) { showWarning("Selecciona al menos un género."); return; }

    state.scores = {};
    resetMatchTracking();
    if (c.battleType === "individual") {
      c.players.forEach((p) => (state.scores[p] = 0));
      startNextRound();
    } else {
      // Reparto al azar, con los que sobran en los últimos grupos. Los puntos
      // de cada grupo se crean al confirmar los grupos (ya con sus nombres).
      c.groupCount = Math.min(c.groupCount, maxGroups(c.players.length));
      state.groups = distributeRandom(c.players, c.groupCount);
      state.screen = "team-org";
    }
    render();
  };

  return root;
}

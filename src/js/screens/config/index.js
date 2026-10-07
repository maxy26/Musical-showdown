import { state } from "../../state.js";
import { GENRES, genreName } from "../../data/songs.js";
import { el } from "../../utils.js";
import { render } from "../../router.js";
import { startNextRound, resetMatchTracking } from "../../gameLogic.js";
import { openHelp, showWarning } from "../modals.js";
import { muteButtonHTML } from "../../sound.js";
import {
  TARGET_SCORE_PRESETS, ROUND_TIME_PRESETS, formatCustomTime,
  isPresetTarget, isPresetTime,
} from "./presets.js";
import { modesFor, modeName, usesRoundTime, allowsNoTime, DEFAULT_ROUND_TIME } from "./modes.js";
import { alt2RowsHTML, bindAlt2Options } from "./alt2Options.js";
import { countTypedPlayers, initPlayersSection, cleanName, padPlayers, fitPlayers } from "./players.js";
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

/** Tipo de batalla para el que se armaron los espacios de jugadores la última vez. */
let tipoDeLosEspacios = null;

export function screenConfig() {
  const c = state.config;

  // Si el modo actual ya no está disponible para el tipo de batalla elegido, se reinicia a Clásico.
  const available = modesFor(c.battleType);
  if (!available.find((m) => m.id === c.mode && m.enabled)) c.mode = "clasico";

  // El tipo de batalla y el modo se eligen en la pantalla de inicio (opción A
  // del usuario, 01-10-2026); aquí solo se muestran. En Grupal, si hay menos de
  // 4 jugadores, se avisa al confirmar y no se cambia nada.
  // Individual empieza con 2 espacios y Grupal con 4. Si cambió el tipo de batalla,
  // se quitan los espacios vacíos de más; si no, solo se completa (así no
  // desaparece un espacio que el usuario acaba de agregar).
  c.players = tipoDeLosEspacios === c.battleType ? padPlayers(c.players, c.battleType) : fitPlayers(c.players, c.battleType);
  tipoDeLosEspacios = c.battleType;
  const typedCount = countTypedPlayers(c.players);
  const isGroup = c.battleType === "grupal";
  fixRoundTimeForMode(); // Alternativo 1 no tiene "Sin tiempo"

  const root = el(`<div class="screen">
    <div class="top-bar"><h2>Configurar partida</h2><div class="top-bar-actions"><button class="icon-btn" id="back">← Inicio</button><button class="icon-btn icon-btn-round" id="help">❓</button>${muteButtonHTML()}</div></div>
    <div class="card">
      <p class="config-summary">${isGroup ? "👥 Grupal" : "👤 Individual"} · ${modeName(c.mode)}</p>
      <div class="field">
        <label>Jugadores</label>
        <div id="players-list"></div>
        <p class="field-error" id="players-error" hidden></p>
        <p class="small-note config-group-note" id="group-note" ${isGroup && typedCount < 4 ? "" : "hidden"}>Para jugar en Grupal se necesitan al menos 4 jugadores (llevas ${typedCount}).</p>
        <button class="btn btn-secondary add-player-btn" id="add-player">+ Añadir jugador</button>
      </div>

      <div class="field">
        <label>Géneros musicales</label>
        <div class="chip-group" id="genres">
          ${GENRES.map((g) => `<button class="chip ${c.genres.includes(g) ? "active" : ""}" data-genre="${g}">${genreName(g)}</button>`).join("")}
        </div>
      </div>

      <!-- Opciones en filas compactas: nombre a la izquierda, control a la derecha (03-10-2026) -->
      <div class="opts">
        <div class="opt-row"><span>🏆 Puntaje objetivo</span>
          <select id="target">
            ${TARGET_SCORE_PRESETS.map((v) => `<option value="${v}" ${c.targetScoreMode === "preset" && v === c.targetScore ? "selected" : ""}>${v} pts</option>`).join("")}
            ${customValueOption(c.targetScoreMode === "custom", `${c.targetScore} pts`)}
            <option value="custom">Personalizado…</option>
          </select>
        </div>
        ${usesRoundTime(c.mode) ? `
        <div class="opt-row"><span>⏱️ Tiempo por ronda</span>
          <select id="roundtime">
            ${ROUND_TIME_PRESETS.filter((o) => o.value !== 0 || allowsNoTime(c.mode)).map((o) => `<option value="${o.value}" ${c.roundTimeMode === "preset" && o.value === c.roundTime ? "selected" : ""}>${o.label}</option>`).join("")}
            ${customValueOption(c.roundTimeMode === "custom", formatCustomTime(c.roundTime))}
            <option value="custom">Personalizado…</option>
          </select>
        </div>` : ""}
        ${c.mode === "alternativo2" ? alt2RowsHTML(c) : ""}
      </div>

      <button class="btn btn-primary btn-block" id="confirm-config">Confirmar configuración</button>
    </div>
  </div>`);

  // ---------- Jugadores (alta/baja, mayúsculas, aviso de Grupal) ----------
  const playersSection = initPlayersSection(root, c);

  // Si el modo no permite "Sin tiempo" y estaba elegido, se pone 30 seg.
  function fixRoundTimeForMode() {
    if (usesRoundTime(c.mode) && !allowsNoTime(c.mode) && c.roundTime === 0) {
      c.roundTime = DEFAULT_ROUND_TIME;
      c.roundTimeMode = "preset";
    }
  }

  root.querySelector("#back").onclick = () => { state.screen = "menu"; render(); };
  root.querySelector("#help").onclick = () => openHelp();
  filasCompletas(root);

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

  // ---------- Géneros y opciones de Alternativo 2 ----------
  root.querySelectorAll("[data-genre]").forEach((b) => (b.onclick = () => {
    const g = b.dataset.genre;
    if (c.genres.includes(g)) c.genres = c.genres.filter((x) => x !== g);
    else c.genres.push(g);
    render();
  }));

  // Alternativo 2: multiplicadores, intentos, puntos y relevos (alt2Options.js).
  // En Alternativo 1 los multiplicadores ya no se eligen: siempre están activos.
  bindAlt2Options(root, c, render);

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
    // Grupal con menos de 4: solo se avisa; se queda aquí para agregar jugadores
    // (para jugar Individual, se vuelve al inicio con "← Inicio").
    if (c.battleType === "grupal" && c.players.length < 4) {
      showWarning(`Para jugar en Grupal se necesitan al menos 4 jugadores (llevas ${c.players.length}). Agrega más jugadores o vuelve al inicio para elegir Individual.`);
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

/**
 * Solo en PC: tocar cualquier parte de una fila hace lo mismo que su control
 * (usuario, 06-10-2026). En las filas con lista (puntaje, tiempo) va encima una
 * copia invisible de la misma lista: así cada toque abre o cierra la lista igual
 * que al tocar el valor. Las filas con − / + no, porque tienen dos acciones.
 */
function filasCompletas(root) {
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  root.querySelectorAll(".opts .opt-row").forEach((row) => {
    const sel = row.querySelector("select"), btn = row.querySelector("#relay-settings"), yn = row.querySelector("[data-yesno]");
    if (!sel && !btn && !yn) return;
    row.classList.add("row-click");
    if (sel) {
      const copia = document.createElement("select");
      copia.className = "fila-lista";
      copia.setAttribute("aria-hidden", "true");
      copia.tabIndex = -1;
      copia.innerHTML = sel.innerHTML;
      copia.value = sel.value;
      copia.onchange = () => { sel.value = copia.value; sel.dispatchEvent(new window.Event("change")); };
      row.append(copia);
      return;
    }
    row.addEventListener("click", (e) => {
      if (e.target.closest("select, button, input")) return;
      if (btn) btn.click();
      else yn.querySelector(".active").click();
    });
  });
}

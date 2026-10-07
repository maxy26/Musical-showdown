import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { ICONS } from "../icons.js";
import { openHelp, showToast, showConfirm } from "./modals.js";
import { openSheet } from "./sheet.js";
import { buildModesManual, modeAllowed } from "./modesManual.js";
import { modeName } from "./config/modes.js";
import { loadSettings, saveSetting, ajustarCuenta, cuentaValida, CUENTA_MAX } from "../settings.js";
import { refreshMusic, volumen } from "../sound.js";
import { APP_VERSION, BUILD_INFO } from "../version.js";
import { esAppInstalada, salirDeLaApp } from "../plataforma.js";

/**
 * Pantalla de inicio (rediseño elegido por el usuario el 01-10-2026; detalles
 * en PENDIENTES.md, "diseño general"). Aquí se eligen el tipo de batalla
 * (interruptor Individual | Grupal) y el modo ("Modos de juego"), que ya no
 * están en "Configurar partida". "Jugar" lleva a esa pantalla.
 */
const BATTLES = {
  individual: { title: "Individual", text: "Duelos 1 vs 1. Cada uno suma para sí.", icon: ICONS.user },
  grupal: { title: "Grupal", text: "Equipos que se enfrentan por turnos.", icon: ICONS.users },
};

/** Panel de la campana: actualizaciones, promoción del juego y avisos. Aún no hay fuente de avisos. */
function notificationsBody() {
  return el(`<div class="home-empty">
    <div class="home-empty-icon">🔔</div>
    <p>No hay notificaciones por ahora.</p>
    <p class="home-empty-note">Aquí aparecerán las novedades del juego, las actualizaciones y otros avisos.</p>
  </div>`);
}

/**
 * Ajustes (la tuerca): cada opción se enciende o apaga con "Sí / No" y se
 * guarda en el dispositivo (settings.js). El botón 🔊 de las pantallas sigue
 * silenciando todo de una vez.
 */
const SETTINGS = [
  { key: "animations", title: "Animaciones", text: "Luces que se mueven, rebotes y transiciones." },
  { key: "music", title: "Música de fondo", text: "La música que suena mientras se juega." },
  { key: "effects", title: "Efectos de sonido", text: "El sonido al tocar los botones." },
  { key: "clock", title: "Sonido del reloj", text: "El tic-tac de la ronda y el aviso de los últimos 5 segundos." },
];

/** Contenido de Ajustes (también se abre desde la ronda, ver round.js). */
export function settingsBody() {
  const body = el(`<div class="home-settings">
    <p class="home-settings-group">Pantalla</p>
    ${SETTINGS.map((o) => `
      ${o.key === "music" ? `<p class="home-settings-group">Sonido</p>` : ""}
      <div class="home-setting">
        <div><h3>${o.title}</h3><p>${o.text}</p></div>
        <div class="segmented" role="radiogroup" aria-label="${o.title}">
          <button type="button" role="radio" data-setting="${o.key}" data-value="on">Sí</button>
          <button type="button" role="radio" data-setting="${o.key}" data-value="off">No</button>
        </div>
        ${o.key === "music" || o.key === "effects" ? `<label class="home-volume"><span aria-hidden="true">🔈</span>
          <input type="range" min="0" max="100" step="5" data-volume="${o.key}" aria-label="Volumen: ${o.title}">
          <output></output></label>` : ""}
      </div>`).join("")}
    <p class="home-settings-group">Partida</p>
    <div class="home-setting">
      <div><h3>Cuenta antes de cada ronda</h3><p>Números grandes con sonido antes de que aparezca la palabra: No, o de 3 a 7 segundos.</p></div>
      <div class="stepper" data-stepper="countdown">
        <button type="button" data-step="-1" aria-label="Menos segundos">−</button><output></output>
        <button type="button" data-step="1" aria-label="Más segundos">+</button>
      </div>
    </div>
    ${esAppInstalada() ? `<button type="button" class="btn btn-danger btn-block home-exit" id="btn-exit">🚪 Salir del juego</button>` : ""}
    <p class="home-version">Musical Showdown · Versión ${APP_VERSION} · ${BUILD_INFO}</p>
  </div>`);
  const paint = () => {
    const current = loadSettings();
    body.querySelectorAll("[data-setting]").forEach((b) => {
      const active = (b.dataset.value === "on") === current[b.dataset.setting];
      b.classList.toggle("active", active);
      b.setAttribute("aria-checked", String(active));
    });
    const cd = cuentaValida(current.countdown);
    body.querySelector('[data-stepper="countdown"] output').textContent = cd === 0 ? "No" : cd + " s";
    body.querySelector('[data-stepper="countdown"] [data-step="-1"]').disabled = cd === 0;
    body.querySelector('[data-stepper="countdown"] [data-step="1"]').disabled = cd >= CUENTA_MAX;
    body.querySelectorAll("[data-volume]").forEach((r) => {
      const k = r.dataset.volume, v = volumen(k);
      r.value = v;
      r.nextElementSibling.textContent = v + " %";
      r.closest(".home-volume").classList.toggle("is-off", !current[k] || v === 0);
    });
  };
  // Salir del juego (solo en la app de Android y en el .exe): pregunta antes.
  const salir = body.querySelector("#btn-exit");
  if (salir) salir.onclick = () => showConfirm({
    title: "¿Salir del juego?",
    message: ["menu", "config"].includes(state.screen) ? "" : "Se perderá la partida en curso.",
    yesText: "Sí, salir",
    noText: "No",
    onYes: salirDeLaApp,
  });
  body.querySelectorAll('[data-stepper="countdown"] [data-step]').forEach((b) => (b.onclick = () => {
    saveSetting({ countdown: ajustarCuenta(loadSettings().countdown, Number(b.dataset.step)) });
    paint();
  }));
  // Volumen: en 0 es lo mismo que "No"; al subirlo desde 0 vuelve a "Sí"
  body.querySelectorAll("[data-volume]").forEach((r) => (r.oninput = () => {
    const k = r.dataset.volume, v = Number(r.value);
    saveSetting({ [k + "Vol"]: v, [k]: v > 0 });
    refreshMusic();
    paint();
  }));
  body.querySelectorAll("[data-setting]").forEach((b) => (b.onclick = () => {
    // Cada toque cambia el valor, aunque se toque la opción ya elegida (usuario, 06-10-2026).
    // Si se enciende la música o los efectos con el volumen en 0, vuelve a 50.
    const k = b.dataset.setting, on = !loadSettings()[k];
    saveSetting(on && (k === "music" || k === "effects") && volumen(k) === 0 ? { [k]: true, [k + "Vol"]: 50 } : { [k]: on });
    refreshMusic();
    paint();
  }));
  paint();
  return body;
}

export function screenMenu() {
  const c = state.config;
  // Por si se llega con un modo que no existe en este tipo de batalla.
  if (!modeAllowed(c.mode, c.battleType)) c.mode = "clasico";

  const root = el(`<div class="screen home">
    <header class="home-header">
      <button type="button" class="home-round-btn pressable" id="btn-settings" aria-label="Ajustes">${ICONS.settings()}</button>
      <div class="home-header-right">
        <button type="button" class="home-round-btn pressable" id="btn-notifications" aria-label="Notificaciones">${ICONS.bell()}</button>
        <button type="button" class="home-round-btn pressable" id="btn-help" aria-label="Cómo se juega">${ICONS.help()}</button>
      </div>
    </header>

    <section class="home-stage">
      <span class="home-notes" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i><i>♬</i></span>
      <h1 class="home-title"><span>Musical</span><span>Showdown</span></h1>
      <span class="home-floor" aria-hidden="true"></span>
    </section>

    <p class="home-subtitle">¿Cómo quieres jugar?</p>
    <div class="home-battle">
      <div class="home-toggle" role="tablist" aria-label="Tipo de batalla">
        <span class="home-toggle-thumb"></span>
        ${Object.entries(BATTLES).map(([id, b]) => `
          <button type="button" class="home-toggle-opt" role="tab" data-battle="${id}">${b.icon(20)} ${b.title}</button>`).join("")}
      </div>
      <div class="home-card" id="battle-card"></div>
    </div>

    <div class="home-mode">
      <button type="button" class="home-wide-btn pressable" id="btn-modes"><span class="home-wide-icon">${ICONS.book()}</span>Modos de juego</button>
      <p class="home-mode-label" id="mode-label"></p>
    </div>
  </div>`);

  // ---------- Tipo de batalla: interruptor + tarjeta con "Jugar" ----------
  const toggle = root.querySelector(".home-toggle");
  const card = root.querySelector("#battle-card");
  function paintBattle() {
    const b = BATTLES[c.battleType];
    toggle.dataset.sel = c.battleType;
    toggle.querySelectorAll("[data-battle]").forEach((t) =>
      t.setAttribute("aria-selected", String(t.dataset.battle === c.battleType)));
    card.className = `home-card home-card-${c.battleType}`;
    card.innerHTML = `
      <span class="home-card-icon">${b.icon(34)}</span>
      <span class="home-card-title">${b.title}</span>
      <span class="home-card-text">${b.text}</span>
      <button type="button" class="home-play pressable" id="btn-play">${ICONS.play(22)} Jugar</button>`;
  }
  // Se empieza a jugar tocando la tarjeta completa o el botón "Jugar" (usuario, 04-10-2026).
  const play = () => {
    state.screen = "config";
    render();
  };
  card.onclick = play;
  card.setAttribute("role", "button");
  card.tabIndex = 0;
  card.addEventListener("keydown", (e) => {
    if (e.target === card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); play(); }
  });
  toggle.querySelectorAll("[data-battle]").forEach((t) => (t.onclick = () => {
    c.battleType = t.dataset.battle;
    // Alternativo 2 solo existe en Grupal: al pasar a Individual vuelve a Clásico.
    if (!modeAllowed(c.mode, c.battleType)) {
      showToast(`${modeName(c.mode)} solo está en Grupal: se cambió a ${modeName("clasico")}`);
      c.mode = "clasico";
      paintMode();
    }
    paintBattle();
  }));

  // ---------- Modo de juego: manual con "Elegir" y el modo elegido debajo ----------
  const modeLabel = root.querySelector("#mode-label");
  function paintMode() {
    modeLabel.innerHTML = `Modo: <b>${modeName(c.mode)}</b>`;
  }
  root.querySelector("#btn-modes").onclick = () => {
    const close = openSheet({
      title: "Modos de juego",
      body: buildModesManual({
        battleType: c.battleType,
        current: c.mode,
        onChoose: (id) => {
          c.mode = id;
          paintMode();
          close();
          // Alternativo 2 solo existe en Grupal: si estaba Individual, pasa a Grupal.
          if (!modeAllowed(id, c.battleType)) {
            c.battleType = "grupal";
            paintBattle();
            showToast(`Modo elegido: ${modeName(id)} · se cambió a Grupal`);
          } else {
            showToast(`Modo elegido: ${modeName(id)}`);
          }
        },
      }),
    });
  };

  // ---------- Encabezado ----------
  root.querySelector("#btn-settings").onclick = () => openSheet({ title: "Ajustes", body: settingsBody(), side: "left" });
  root.querySelector("#btn-notifications").onclick = () => openSheet({ title: "Notificaciones", body: notificationsBody() });
  root.querySelector("#btn-help").onclick = () => openHelp();

  paintBattle();
  paintMode();
  return root;
}

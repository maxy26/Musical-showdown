import { espacioAnuncio } from "../anuncios.js";
import { state, resetState } from "../state.js";
import { el, escapeHtml } from "../utils.js";
import { render } from "../router.js";
import { startNextRound, resetMatchTracking } from "../gameLogic.js";
import { formatPoints } from "../scoring.js";
import { buildPodium, pickMvp } from "../podium.js";
import { groupName } from "../groups.js";
import { imagenDelPodio, compartirPodio, hayMenuCompartir, TEMAS_IMAGEN } from "../compartir.js";
import { loadSettings, saveSetting } from "../settings.js";
import { openSheet } from "./sheet.js";
import { showToast } from "./modals.js";
import { esDemo } from "../edicion.js";
import { abrirVersionCompleta } from "./modesManual.js";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };
// Orden en pantalla: 2.º a la izquierda, 1.º al centro (más alto), 3.º a la derecha.
const STEP_ORDER = [2, 1, 3];

/**
 * Pantalla final: ganador, podio de los 3 mejores puestos (los empatados
 * comparten el puesto; en Grupal, con el MVP de cada grupo) y "Ver más" con
 * el resto. Reglas: CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3.
 */
export function screenResults() {
  const c = state.config;
  const grupal = c.battleType === "grupal";
  const { steps, rest } = buildPodium(state.scores);
  const pts = (n) => `<span class="${n < 0 ? "score-negative" : ""}">${formatPoints(n)} pts</span>`;

  // Grupal: jugadores de cada grupo, para calcular su MVP.
  const playersOf = (name) => {
    const i = state.groups.findIndex((g, gi) => groupName(g, gi, c.groupTerm) === name);
    return i >= 0 ? state.groups[i].players : [];
  };
  const mvpLine = (name) => {
    if (!grupal) return "";
    const mvp = pickMvp(playersOf(name), state.contrib, state.answerTimes);
    return mvp.length ? `<div class="podium-mvp">⭐ MVP: ${mvp.map(escapeHtml).join(" y ")}</div>` : "";
  };

  const stepHtml = (place) => {
    const step = steps.find((s) => s.place === place);
    if (!step) return "";
    return `<div class="podium-step podium-${place}">
      <div class="podium-medal">${MEDALS[place]}</div>
      ${step.entries.map((e) => `<div class="podium-entry">
        <div class="podium-name">${escapeHtml(e.name)}</div>
        <div class="podium-points">${pts(e.points)}</div>
        ${mvpLine(e.name)}
      </div>`).join("")}
      <div class="podium-block">${place}</div>
    </div>`;
  };

  const root = el(`<div class="screen podio">
    <div class="card result-banner">
      <div class="panel-title">GANADOR</div>
      <div class="big">${escapeHtml(state.winner)}</div>
      <div class="pts">${formatPoints(state.scores[state.winner])} pts</div>
      <div class="podium">${STEP_ORDER.map(stepHtml).join("")}</div>
      ${rest.length ? `
      <button class="btn btn-ghost" id="ver-mas" style="margin-top:6px;">Ver más</button>
      <div id="others" class="hidden" style="margin-top:14px;text-align:left;">
        ${rest.map((r) => `<div class="others-row">
          <span>${r.place}. ${escapeHtml(r.name)}</span>${pts(r.points)}</div>`).join("")}
      </div>` : ""}
      <div class="btn-row" style="margin-top:22px;justify-content:center;">
        <button class="btn btn-primary" id="again">Jugar de nuevo</button>
        <button class="btn btn-secondary" id="menu">Volver al inicio</button>
      </div>
      <button class="btn btn-ghost btn-block compartir-btn" id="compartir">📤 Compartir el podio</button>
      ${esDemo() ? `<button class="btn btn-ghost btn-block" id="ver-completa">✨ ¿Les gustó? Mira qué trae la versión completa</button>` : ""}
    </div>
  </div>`);

  const verMas = root.querySelector("#ver-mas");
  if (verMas) verMas.onclick = () => root.querySelector("#others").classList.toggle("hidden");
  root.querySelector("#again").onclick = () => {
    Object.keys(state.scores).forEach((k) => (state.scores[k] = 0));
    resetMatchTracking();
    if (grupal) {
      state.screen = "team-org";
    } else {
      startNextRound();
    }
    render();
  };
  // Compartir el juego: imagen del podio con vista previa (ver compartir.js)
  root.querySelector("#compartir").onclick = async () => {
    const mvpDe = (name) => (grupal ? pickMvp(playersOf(name), state.contrib, state.answerTimes) : []);
    // Colores del fondo (usuario, 29-10-2026): flechitas en la PC, deslizar en el celular y "Mis colores"; se recuerdan
    const temas = [...Object.keys(TEMAS_IMAGEN), "propio"];
    const ajustes = loadSettings();
    let tema = temas.includes(ajustes.temaImagen) ? ajustes.temaImagen : "noche";
    const propios = [...ajustes.coloresImagen];
    const colores = () => (tema === "propio" ? { luces: [propios[0], propios[1], propios[0]], texto: propios } : tema);
    let imagen = await imagenDelPodio({ scores: state.scores, winner: state.winner, mvpDe, tema: colores() });
    const menu = hayMenuCompartir();
    const body = el(`<div class="compartir">
      <div class="compartir-visor">
        <button type="button" class="compartir-flecha izq" aria-label="Color anterior">‹</button>
        <img class="compartir-img" src="${imagen.url}" alt="Imagen del podio" draggable="false">
        <button type="button" class="compartir-flecha der" aria-label="Color siguiente">›</button>
        <p class="compartir-nombre-tema"><b></b><span class="solo-celular"> · desliza para cambiar</span></p>
      </div>
      <div class="compartir-personal">
        <button type="button" class="compartir-personalizar" aria-expanded="false">✏️ Personalizar colores</button>
        <div class="compartir-propio" hidden>
          <label>Color 1 <input type="color" data-color="0" value="${propios[0]}"></label>
          <label>Color 2 <input type="color" data-color="1" value="${propios[1]}"></label>
        </div>
      </div>
      <button type="button" class="btn btn-primary btn-block" id="compartir-ya">${menu ? "📤 Compartir (WhatsApp, Instagram…)" : "💾 Guardar imagen y copiar el texto"}</button>
    </div>`);
    const img = body.querySelector(".compartir-img");
    const nombre = () => { body.querySelector(".compartir-nombre-tema b").textContent = tema === "propio" ? "Mis colores" : TEMAS_IMAGEN[tema].nombre; };
    let dibujo = 0; // si se cambia rápido de color, solo vale el último dibujo
    const elegir = async (t) => {
      tema = t;
      nombre();
      saveSetting({ temaImagen: tema, coloresImagen: propios });
      const n = ++dibujo;
      const nueva = await imagenDelPodio({ scores: state.scores, winner: state.winner, mvpDe, tema: colores() });
      if (n !== dibujo) return;
      window.URL.revokeObjectURL(imagen.url);
      imagen = nueva;
      img.src = imagen.url;
    };
    const mover = (paso) => elegir(temas[(temas.indexOf(tema) + paso + temas.length) % temas.length]);
    body.querySelector(".izq").onclick = () => mover(-1);
    body.querySelector(".der").onclick = () => mover(1);
    // Deslizar la imagen con el dedo (o arrastrarla con el mouse)
    let x0 = null;
    img.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
    img.addEventListener("pointerup", (e) => {
      if (x0 !== null && Math.abs(e.clientX - x0) > 40) mover(e.clientX < x0 ? 1 : -1);
      x0 = null;
    });
    const panel = body.querySelector(".compartir-propio");
    const personalizar = body.querySelector(".compartir-personalizar");
    personalizar.onclick = () => {
      panel.hidden = !panel.hidden;
      personalizar.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) elegir("propio");
    };
    panel.querySelectorAll("input").forEach((i) => (i.oninput = () => { propios[Number(i.dataset.color)] = i.value; elegir("propio"); }));
    nombre();
    body.querySelector("#compartir-ya").onclick = async () => {
      try {
        const r = await compartirPodio(imagen);
        if (r === "guardado") showToast("Imagen guardada en Descargas y texto copiado");
      } catch {
        showToast("No se pudo compartir la imagen");
      }
    };
    openSheet({ title: "Compartir el podio", body });
  };
  root.querySelector("#menu").onclick = () => {
    resetState();
    render();
  };

  const completa = root.querySelector("#ver-completa");
  if (completa) completa.onclick = () => abrirVersionCompleta(); // demo: invitación suave, sin ventana que interrumpa
  root.insertAdjacentHTML("beforeend", espacioAnuncio("podio")); // espacio para un anuncio (anuncios.js)
  return root;
}

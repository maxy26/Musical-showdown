import { state } from "../state.js";
import { SONG_DB } from "../data/songs.js";
import { el, normalizeForSearch, escapeHtml } from "../utils.js";
import { render } from "../router.js";
import { resolveAnswer, currentSinger } from "../gameLogic.js";
import { botonAyuda, conectarAyudas } from "./ayudaBotones.js";
import { abrirEnlace } from "../plataforma.js";

/** Letras mínimas para buscar (usuario, 04-10-2026: con 1 o 2 letras no se muestra nada). */
export const MIN_SEARCH_LETTERS = 3;

/**
 * Nombre de la canción sin la versión: quita lo que va entre paréntesis o
 * corchetes y lo que va después de " - " ("Color Esperanza (en vivo)" →
 * "color esperanza"). Sirve para juntar las versiones del mismo artista.
 */
export function baseSongTitle(title) {
  return normalizeForSearch(title.replace(/[([][^)\]]*[)\]]/g, " ").replace(/\s+-\s+.*$/, ""));
}

/**
 * Deja una sola canción por nombre y artista: si hay varias versiones del mismo
 * artista ("Color Esperanza" y "Color Esperanza (en vivo)"), queda la original
 * (la que no tiene versión en el nombre). Si el artista es distinto, quedan las dos.
 */
export function onePerVersion(songs) {
  const chosen = new Map();
  songs.forEach((s) => {
    const key = `${baseSongTitle(s.title)}|${normalizeForSearch(s.artist)}`;
    const prev = chosen.get(key);
    const isOriginal = normalizeForSearch(s.title) === baseSongTitle(s.title);
    if (!prev || (isOriginal && normalizeForSearch(prev.title) !== baseSongTitle(prev.title))) chosen.set(key, s);
  });
  return songs.filter((s) => [...chosen.values()].includes(s));
}

/**
 * ¿La canción lleva la palabra de la ronda? La letra se usa solo por dentro, para
 * saber esto; ya no se muestra (usuario, 07-10-2026: mostrarla podría requerir
 * pagar derechos). Vale si la palabra está marcada en `words` o aparece entera
 * en la letra guardada (sin importar mayúsculas ni tildes).
 */
export function songHasWord(song, word) {
  if (!word) return true;
  if (song.words?.[word] === true) return true;
  const w = normalizeForSearch(word);
  return ` ${normalizeForSearch(song.lyric || "")} `.includes(` ${w} `);
}

/**
 * Busca por nombre o por fragmento de letra en los géneros elegidos. No
 * distingue mayúsculas, tildes ni signos de puntuación ("corazon" encuentra
 * "corazón"; "hay en tus ojos con solo mirar" ignora comas y saltos de línea).
 * Hacen falta al menos 3 letras, y de cada canción se muestra una sola versión
 * por artista (la original). Con `word`, solo aparecen las canciones que llevan
 * esa palabra (usuario, 07-10-2026: si la palabra es "despacito", buscar "la
 * bicicleta" no la encuentra).
 */
export function searchSongs(q, word) {
  const c = state.config;
  q = normalizeForSearch(q);
  if (q.replace(/ /g, "").length < MIN_SEARCH_LETTERS) return [];
  return onePerVersion(SONG_DB.filter(
    (s) => c.genres.includes(s.genre) &&
      (normalizeForSearch(s.title).includes(q) || normalizeForSearch(s.lyric).includes(q)) &&
      songHasWord(s, word)
  ));
}

/** Dirección de la búsqueda en YouTube (solo un enlace: el juego no reproduce ni descarga música). */
export function urlYoutube(texto) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(texto.trim())}`;
}

/**
 * Pantalla "¡Ana canta!" (usuario, 12-10-2026; versión 1.22): al tocar su nombre,
 * el jugador gana el turno y se muestra a pantalla completa, con el color de su
 * lado, quién canta y la palabra. El moderador marca ❌ / ✅ ahí mismo; la
 * búsqueda de la canción ya no se abre sola: está en el botón "🔎 Buscar
 * canción", por si hay dudas. "← Volver" deshace el toque (por si fue sin
 * querer) y la ronda sigue.
 */
export function screenVerify() {
  const r = state.round;
  const c = state.config;
  const who = currentSinger(r.selected);
  const equipo = c.battleType === "grupal" ? (r.selected === "A" ? r.participantA : r.participantB) : "";
  const grupo = r.selected === "A" ? r.groupA : r.groupB;
  const color = grupo === null || grupo === undefined ? `canta-lado-${r.selected === "A" ? "a" : "b"}` : `group-color-${grupo % 5}`;

  const root = el(`<div class="canta-capa ${color}">
    ${botonAyuda("decision", true)}
    <div class="canta-centro">
      <div class="canta-mic">🎤</div>
      <h2 class="canta-nombre">¡${escapeHtml(who)} canta!</h2>
      ${equipo && equipo !== who ? `<p class="canta-equipo">${escapeHtml(equipo)}</p>` : ""}
      <p class="canta-palabra">${escapeHtml(r.word.toUpperCase())}</p>
    </div>
    <div class="canta-botones">
      <button class="btn btn-danger btn-block" id="no">❌ Incorrecta</button>
      <button class="btn btn-primary btn-block" id="yes">✅ Correcta</button>
    </div>
    <div class="canta-extra">
      <button class="btn btn-ghost" id="back">← Volver</button>
      <button class="btn btn-secondary" id="buscar">🔎 Buscar canción</button>
    </div>
  </div>`);

  root.querySelector("#yes").onclick = () => resolveAnswer(true);
  root.querySelector("#no").onclick = () => resolveAnswer(false);
  root.querySelector("#buscar").onclick = () => abrirBusqueda();
  root.querySelector("#back").onclick = () => {
    // Se tocó sin querer: la ronda sigue como estaba (este lado no gastó su intento)
    Object.assign(state.round, state.round.antesDelToque || {});
    state.round.paused = false;
    state.round.selected = null;
    state.screen = "round";
    render();
  };
  conectarAyudas(root); // botoncito (?)
  return root;
}

/**
 * Sugerencia para completar lo escrito (usuario, 12-10-2026): la primera
 * canción encontrada. `resto` es lo que falta si el nombre empieza con lo
 * escrito ("des" → "pacito", para mostrarlo en gris dentro del campo); si
 * coincide por otra parte, `resto` es null y la sugerencia va debajo.
 */
export function sugerencia(query, resultados) {
  const cancion = resultados[0];
  if (!cancion || !query.trim()) return null;
  const inicio = cancion.title.slice(0, query.length);
  const resto = normalizeForSearch(inicio) === normalizeForSearch(query) && cancion.title.length > query.length
    ? cancion.title.slice(query.length) : null;
  if (normalizeForSearch(cancion.title) === normalizeForSearch(query)) return null; // ya está completo
  return { cancion, resto };
}

/** Qué se busca en YouTube: con el nombre exacto de una canción, nombre + artista. */
export function textoParaYoutube(texto, resultados) {
  const exacta = resultados.find((s) => normalizeForSearch(s.title) === normalizeForSearch(texto));
  return exacta ? `${exacta.title} ${exacta.artist}` : texto;
}

/**
 * Ventana de búsqueda (se abre solo con "🔎 Buscar canción"): sirve para
 * comprobar que la canción lleva la palabra (usuario, 12-10-2026).
 * - Tocar una canción escribe su nombre completo; Tab (PC) completa con la
 *   sugerencia, que se ve en gris mientras se escribe.
 * - ▶ abre esa canción en YouTube; Enter o "▶ Buscar en YouTube" buscan lo
 *   escrito (con el nombre exacto de una canción, nombre + artista).
 */
function abrirBusqueda() {
  const r = state.round;
  const v = state.verify;
  const root = el(`<div class="modal-backdrop">
    <div class="modal con-esquina">${botonAyuda("buscar", true)}
      <h2>🔎 Buscar canción</h2>
      <p class="panel-title">Palabra: <strong style="color:var(--gold);">${escapeHtml(r.word.toUpperCase())}</strong></p>
      <div class="field busqueda-campo">
        <input type="text" id="q" placeholder="Nombre de la canción" value="${escapeHtml(v.query)}" autocomplete="off" enterkeyhint="search">
        <div class="busqueda-fantasma" aria-hidden="true"><span class="escrito"></span><span class="resto"></span></div>
      </div>
      <p class="busqueda-sugerencia" id="sugerencia" hidden></p>
      <div class="search-results" id="results"></div>
      <div class="btn-row" style="margin-top:18px;">
        <button class="btn btn-ghost" id="close">Cerrar</button>
        <button class="btn btn-secondary" id="youtube" style="margin-left:auto;">▶ Buscar en YouTube</button>
      </div>
    </div>
  </div>`);
  const input = root.querySelector("#q");
  const fantasma = root.querySelector(".busqueda-fantasma");
  const linea = root.querySelector("#sugerencia");
  const irAYoutube = () => {
    const texto = input.value.trim();
    if (texto) abrirEnlace(urlYoutube(textoParaYoutube(texto, v.results)));
  };

  /** Escribe en el campo y vuelve a buscar. */
  function escribir(texto) {
    input.value = texto;
    v.query = texto;
    v.results = searchSongs(v.query, r.word);
    pintar();
    input.focus();
  }

  function pintar() {
    // Sugerencia: en gris dentro del campo (si empieza igual) o en una línea debajo
    const s = sugerencia(input.value, v.results);
    fantasma.querySelector(".escrito").textContent = input.value;
    fantasma.querySelector(".resto").textContent = s?.resto || "";
    linea.hidden = !s || Boolean(s.resto);
    if (s && !s.resto) linea.innerHTML = `Sugerencia: <b>${escapeHtml(s.cancion.title)}</b> <span class="tecla">Tab ↹</span>`;

    const box = root.querySelector("#results");
    box.innerHTML = "";
    const letters = normalizeForSearch(v.query).replace(/ /g, "").length;
    if (letters > 0 && letters < MIN_SEARCH_LETTERS) {
      box.appendChild(el(`<div class="empty-note">✍️ Escribe al menos ${MIN_SEARCH_LETTERS} letras para buscar.</div>`));
      return;
    }
    if (v.results.length === 0 && letters > 0) {
      box.appendChild(el(`<div class="empty-note">❌ No hay canciones con la palabra «${escapeHtml(r.word.toUpperCase())}» que coincidan con lo que escribiste.</div>`));
      return;
    }
    v.results.forEach((cancion) => {
      const item = el(`<div class="result-item result-item-youtube">
        <div><div class="r-title">🎵 ${escapeHtml(cancion.title)}</div>
        <div class="r-artist">${escapeHtml(cancion.artist)}</div></div>
        <button type="button" class="btn btn-secondary btn-youtube" aria-label="Escuchar en YouTube">▶</button>
      </div>`);
      // Tocar la canción escribe su nombre completo; ▶ la abre en YouTube
      item.onclick = () => escribir(cancion.title);
      item.querySelector(".btn-youtube").onclick = (e) => {
        e.stopPropagation();
        abrirEnlace(urlYoutube(`${cancion.title} ${cancion.artist}`));
      };
      box.appendChild(item);
    });
  }

  // Búsqueda rápida: los resultados se actualizan mientras se escribe.
  input.addEventListener("input", () => {
    v.query = input.value;
    v.results = searchSongs(v.query, r.word);
    pintar();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); irAYoutube(); }
    if (e.key === "Tab" && !e.shiftKey) {
      const s = sugerencia(input.value, v.results);
      if (s) { e.preventDefault(); escribir(s.cancion.title); }
    }
  });
  input.addEventListener("scroll", () => { fantasma.scrollLeft = input.scrollLeft; });
  root.querySelector("#youtube").onclick = irAYoutube;
  root.querySelector("#close").onclick = () => root.remove();

  conectarAyudas(root); // botoncito (?)
  document.getElementById("app").appendChild(root);
  // La sugerencia en gris usa la misma letra, márgenes y borde que el campo
  const estilo = window.getComputedStyle(input);
  for (const p of ["font", "letterSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "textAlign"]) fantasma.style[p] = estilo[p];
  fantasma.style.height = `${input.offsetHeight}px`;
  pintar();
  input.focus();
}

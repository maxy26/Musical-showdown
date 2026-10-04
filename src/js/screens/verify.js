import { state } from "../state.js";
import { SONG_DB } from "../data/songs.js";
import { el, normalizeForSearch, highlightWord } from "../utils.js";
import { render } from "../router.js";
import { resolveAnswer, currentSinger } from "../gameLogic.js";

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
 * Busca por nombre o por fragmento de letra en los géneros elegidos. No
 * distingue mayúsculas, tildes ni signos de puntuación ("corazon" encuentra
 * "corazón"; "hay en tus ojos con solo mirar" ignora comas y saltos de línea).
 * Hacen falta al menos 3 letras, y de cada canción se muestra una sola versión
 * por artista (la original).
 */
export function searchSongs(q) {
  const c = state.config;
  q = normalizeForSearch(q);
  if (q.replace(/ /g, "").length < MIN_SEARCH_LETTERS) return [];
  return onePerVersion(SONG_DB.filter(
    (s) => c.genres.includes(s.genre) &&
      (normalizeForSearch(s.title).includes(q) || normalizeForSearch(s.lyric).includes(q))
  ));
}

export function screenVerify() {
  const r = state.round;
  const v = state.verify;
  const who = currentSinger(r.selected);

  const root = el(`<div class="modal-backdrop">
    <div class="modal">
      <h2>🔎 Buscar canción</h2>
      <p class="panel-title">Palabra: <strong style="color:var(--gold);">${r.word.toUpperCase()}</strong> · Responde: ${who}</p>
      <div class="field">
        <input type="text" id="q" placeholder="Escribe el nombre o un fragmento (mín. 3 letras)" value="${v.query}" autocomplete="off">
      </div>
      <div class="search-results" id="results"></div>
      <div id="lyric-area"></div>
      <div class="btn-row" style="margin-top:18px;">
        <button class="btn btn-ghost" id="close">Cerrar</button>
        <button class="btn btn-primary" id="confirm" style="margin-left:auto;" ${v.selectedSong ? "" : "disabled"}>Confirmar</button>
      </div>
    </div>
  </div>`);

  function renderResults() {
    const box = root.querySelector("#results");
    box.innerHTML = "";
    const letters = normalizeForSearch(v.query).replace(/ /g, "").length;
    if (letters > 0 && letters < MIN_SEARCH_LETTERS) {
      box.appendChild(el(`<div class="empty-note">✍️ Escribe al menos ${MIN_SEARCH_LETTERS} letras para buscar.</div>`));
      return;
    }
    if (v.results.length === 0 && letters > 0) {
      box.appendChild(el(`<div class="empty-note">❌ Canción no encontrada / disponible en la base de datos.</div>`));
      return;
    }
    v.results.forEach((s) => {
      // Cualquier canción se puede elegir siempre, aunque ya se haya cantado.
      const item = el(`<div class="result-item ${v.selectedSong === s ? "selected" : ""}">
        <div class="r-title">🎵 ${s.title}</div>
        <div class="r-artist">${s.artist}</div>
      </div>`);
      item.onclick = () => {
        v.selectedSong = s;
        renderResults();
        renderLyric();
        root.querySelector("#confirm").disabled = false;
      };
      box.appendChild(item);
    });
  }

  function renderLyric() {
    const box = root.querySelector("#lyric-area");
    box.innerHTML = "";
    if (!v.selectedSong) return;
    box.appendChild(el(`<div class="lyric-box">${highlightWord(v.selectedSong.lyric, r.word)}</div>`));
  }

  // Búsqueda rápida: los resultados se actualizan mientras se escribe.
  root.querySelector("#q").addEventListener("input", (e) => {
    v.query = e.target.value;
    v.results = searchSongs(v.query);
    if (!v.results.includes(v.selectedSong)) {
      v.selectedSong = null;
      root.querySelector("#confirm").disabled = true;
    }
    renderResults();
    renderLyric();
  });

  root.querySelector("#close").onclick = () => {
    state.round.paused = false;
    state.screen = "round";
    render();
  };
  root.querySelector("#confirm").onclick = () => {
    if (!v.selectedSong) return;
    openJudgeDecision();
  };

  renderResults();
  renderLyric();
  return root;
}

function openJudgeDecision() {
  const r = state.round;
  const v = state.verify;
  const who = currentSinger(r.selected);
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal">
    <h2>¿La respuesta es correcta?</h2>
    <p class="panel-title">🎵 ${v.selectedSong.title} — 👤 ${who}</p>
    <div class="lyric-box">${highlightWord(v.selectedSong.lyric, r.word)}</div>
    <div class="btn-row" style="margin-top:18px;">
      <button class="btn btn-danger btn-block" id="no">❌ Incorrecta</button>
      <button class="btn btn-primary btn-block" id="yes">✅ Correcta</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  overlay.querySelector("#yes").onclick = () => { overlay.remove(); resolveAnswer(true); };
  overlay.querySelector("#no").onclick = () => { overlay.remove(); resolveAnswer(false); };
}

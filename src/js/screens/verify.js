import { state } from "../state.js";
import { SONG_DB } from "../data/songs.js";
import { el, normalizeForSearch, highlightWord } from "../utils.js";
import { render } from "../router.js";
import { resolveAnswer, currentSinger } from "../gameLogic.js";

/**
 * Busca por nombre o por fragmento de letra en los géneros elegidos. No
 * distingue mayúsculas, tildes ni signos de puntuación ("corazon" encuentra
 * "corazón"; "hay en tus ojos con solo mirar" ignora comas y saltos de línea).
 */
export function searchSongs(q) {
  const c = state.config;
  q = normalizeForSearch(q);
  if (!q) return [];
  return SONG_DB.filter(
    (s) => c.genres.includes(s.genre) &&
      (normalizeForSearch(s.title).includes(q) || normalizeForSearch(s.lyric).includes(q))
  );
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
        <div style="display:flex;gap:8px;">
          <input type="text" id="q" placeholder="Nombre de la canción o fragmento cantado" value="${v.query}">
          <button class="btn btn-secondary" id="search">Buscar</button>
        </div>
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
    if (v.results.length === 0 && v.query) {
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

  root.querySelector("#search").onclick = () => {
    v.query = root.querySelector("#q").value;
    v.results = searchSongs(v.query);
    v.selectedSong = null;
    renderResults();
    renderLyric();
    root.querySelector("#confirm").disabled = true;
  };
  root.querySelector("#q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") root.querySelector("#search").click();
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

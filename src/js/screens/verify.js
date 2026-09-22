import { state } from "../state.js";
import { SONG_DB } from "../data/songs.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { isSongUsed, resolveAnswer } from "../gameLogic.js";

function searchSongs(q) {
  const c = state.config;
  q = q.trim().toLowerCase();
  if (!q) return [];
  return SONG_DB.filter(
    (s) => c.genres.includes(s.genre) && (s.title.toLowerCase().includes(q) || s.lyric.toLowerCase().includes(q))
  );
}

export function screenVerify() {
  const r = state.round;
  const v = state.verify;
  const who = r.selected === "A" ? r.showA || r.participantA : r.showB || r.participantB;

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
      const used = isSongUsed(s);
      const item = el(`<div class="result-item ${v.selectedSong === s ? "selected" : ""}" style="${used ? "opacity:.45;" : ""}">
        <div class="r-title">🎵 ${s.title} ${used ? "(ya utilizada)" : ""}</div>
        <div class="r-artist">${s.artist}</div>
      </div>`);
      if (!used) {
        item.onclick = () => {
          v.selectedSong = s;
          renderResults();
          renderLyric();
          root.querySelector("#confirm").disabled = false;
        };
      }
      box.appendChild(item);
    });
  }

  function renderLyric() {
    const box = root.querySelector("#lyric-area");
    box.innerHTML = "";
    if (!v.selectedSong) return;
    const re = new RegExp("(" + r.word + ")", "ig");
    const highlighted = v.selectedSong.lyric.replace(re, "<mark>$1</mark>");
    box.appendChild(el(`<div class="lyric-box">${highlighted}</div>`));
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
  const who = r.selected === "A" ? r.showA || r.participantA : r.showB || r.participantB;
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal">
    <h2>¿La respuesta es correcta?</h2>
    <p class="panel-title">🎵 ${v.selectedSong.title} — 👤 ${who}</p>
    <div class="lyric-box">${v.selectedSong.lyric.replace(new RegExp("(" + r.word + ")", "ig"), "<mark>$1</mark>")}</div>
    <div class="btn-row" style="margin-top:18px;">
      <button class="btn btn-danger btn-block" id="no">❌ Incorrecta</button>
      <button class="btn btn-primary btn-block" id="yes">✅ Correcta</button>
    </div>
  </div>`;
  document.getElementById("app").appendChild(overlay);
  overlay.querySelector("#yes").onclick = () => { overlay.remove(); resolveAnswer(true); };
  overlay.querySelector("#no").onclick = () => { overlay.remove(); resolveAnswer(false); };
}

/**
 * Géneros musicales de "Configurar partida" (usuario, 10-10-2026): dos botones.
 * - "Todos" marca todos los géneros disponibles; es lo predeterminado.
 * - "Más" abre una hoja con un mosaico de géneros (puntito de color, nombre y
 *   dos artistas de ejemplo). En Clásico y Alternativo 1 se elige un solo género;
 *   en Alternativo 2, uno o varios.
 */
import { availableGenres, genreName, genreArtists } from "../../data/songs.js";
import { escapeHtml } from "../../utils.js";
import { openSheet } from "../sheet.js";

/** ¿Este modo deja elegir varios géneros con "Más"? */
export function allowsManyGenres(mode) {
  return mode === "alternativo2";
}

/** ¿Están marcados todos los géneros disponibles? */
export function hasAllGenres(genres) {
  return availableGenres().every((g) => genres.includes(g));
}

/**
 * Deja la elección de géneros válida para el modo: sin géneros, con alguno
 * que ya no existe o con varios (pero no todos) fuera de Alternativo 2,
 * vuelve a "Todos".
 */
export function fixGenresForMode(genres, mode) {
  const valid = genres.filter((g) => availableGenres().includes(g));
  if (valid.length === 0 || valid.length !== genres.length) return availableGenres();
  if (!allowsManyGenres(mode) && valid.length > 1 && !hasAllGenres(valid)) return availableGenres();
  return valid;
}

/** Botones "Todos" y "Más" (el de "Más" muestra lo elegido). */
export function genresFieldHTML(c) {
  const all = hasAllGenres(c.genres);
  return `<div class="chip-group" id="genres">
    <button type="button" class="chip ${all ? "active" : ""}" id="genres-all" aria-pressed="${all}">Todos</button>
    <button type="button" class="chip ${all ? "" : "active"}" id="genres-more" aria-pressed="${!all}">${all ? "Más" : `Más: ${c.genres.map(genreName).join(", ")}`}</button>
  </div>`;
}

/** Conecta los botones. `onChange` vuelve a dibujar la pantalla. */
export function bindGenres(root, c, onChange) {
  root.querySelector("#genres-all").onclick = () => {
    c.genres = availableGenres();
    onChange();
  };
  root.querySelector("#genres-more").onclick = () => openGenresSheet(c, onChange);
}

function openGenresSheet(c, onChange) {
  const many = allowsManyGenres(c.mode);
  // En Alternativo 2 se parte de lo elegido; si estaba "Todos", de cero.
  let picked = hasAllGenres(c.genres) ? [] : [...c.genres];

  const body = document.createElement("div");
  // Mosaico «Escenario nocturno» (usuario, 29-10-2026): cuadro de vidrio con puntito de color, nombre y dos artistas
  body.className = "genre-sheet";
  body.innerHTML = `<div class="genre-grid">${availableGenres().map((g) => `
    <article class="genre-item is-selectable" data-genre="${g}">
      <span class="home-tag genre-check" aria-label="Elegido" hidden>✓</span>
      <i class="genre-dot"></i>
      <h3 class="genre-name">${genreName(g)}</h3>
      <p class="genre-artists">${genreArtists(g, 2).map(escapeHtml).join(" · ")}</p>
    </article>`).join("")}</div>` + (many ? `
    <div class="genre-actions"><button type="button" class="genre-done pressable" id="genres-done">Listo</button></div>` : "");

  const done = body.querySelector("#genres-done");
  const paint = () => {
    body.querySelectorAll("[data-genre]").forEach((item) => {
      const on = picked.includes(item.dataset.genre);
      item.classList.toggle("is-chosen", on);
      item.querySelector(".home-tag").hidden = !on;
    });
    if (done) {
      done.disabled = picked.length === 0;
      done.textContent = picked.length > 0 ? `Listo (${picked.length})` : "Listo";
    }
  };

  const close = openSheet({ title: many ? "Elige uno o varios géneros" : "Elige un género", body });
  const accept = () => {
    // Marcar todos con "Más" es lo mismo que "Todos"
    c.genres = availableGenres().filter((g) => picked.includes(g));
    close();
    onChange();
  };
  // Con teclado, Enter es un clic (teclado.js)
  body.querySelectorAll("[data-genre]").forEach((item) => (item.onclick = () => {
    const g = item.dataset.genre;
    if (!many) { picked = [g]; accept(); return; }
    picked = picked.includes(g) ? picked.filter((x) => x !== g) : [...picked, g];
    paint();
  }));
  if (done) done.onclick = accept;
  paint();
}

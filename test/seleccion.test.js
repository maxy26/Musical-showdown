import test from "node:test";
import assert from "node:assert/strict";

import { state, resetState } from "../src/js/state.js";
import { SONG_DB, palabrasDe } from "../src/js/data/songs.js";
import { pickWeightedWord, PARTE_CLAVE } from "../src/js/gameLogic.js";

// Pruebas de la elección de palabra y de enfrentamiento (gameLogic.js).
// Usan la base de ejemplo real (SONG_DB) y reinician el estado global en
// cada prueba, porque gameLogic lee y escribe `state` directamente.

/** Palabras que se pueden pedir con los géneros elegidos. */
function palabrasPosibles() {
  const palabras = new Set();
  SONG_DB.filter((s) => state.config.genres.includes(s.genre)).forEach((s) => palabrasDe(s).forEach((w) => palabras.add(w)));
  return palabras;
}

/** Repite `fn` muchas veces y devuelve el conjunto de resultados. */
function muestrear(fn, veces = 300) {
  const vistos = new Set();
  for (let i = 0; i < veces; i++) vistos.add(fn());
  return vistos;
}

// ---------- pickWeightedWord (catálogo sin letra, usuario 12-10-2026) ----------

test("pickWeightedWord solo elige palabras de canciones de los géneros elegidos", () => {
  resetState();
  state.config.genres = ["pop"];
  const posibles = palabrasPosibles();
  for (const palabra of muestrear(() => pickWeightedWord())) {
    assert.ok(posibles.has(palabra), `"${palabra}" no pertenece a ninguna canción de pop`);
  }
});

test("mitad y mitad: con azar bajo sale una palabra clave, con azar alto una compartida", () => {
  resetState();
  state.config.genres = ["reggaeton"];
  const claves = new Set(SONG_DB.filter((s) => s.genre === "reggaeton").map((s) => s.clave));
  const compartidas = new Set(SONG_DB.filter((s) => s.genre === "reggaeton").flatMap((s) => s.palabras));
  for (let i = 0; i < 200; i++) {
    assert.ok(claves.has(pickWeightedWord(() => PARTE_CLAVE - 0.01)), "palabra clave");
    assert.ok(compartidas.has(pickWeightedWord(() => PARTE_CLAVE + 0.01)), "palabra compartida");
  }
});

test("las canciones no se bloquean: siempre se pueden pedir todas las palabras de los géneros elegidos (01-10-2026)", () => {
  resetState();
  state.config.genres = ["reggaeton"];
  assert.deepEqual([...muestrear(() => pickWeightedWord(), 6000)].sort(), [...palabrasPosibles()].sort());
  assert.equal("usedSongs" in state, false, "ya no existe la lista de canciones usadas");
});

test("pickWeightedWord devuelve null con un género sin canciones", () => {
  resetState();
  state.config.genres = ["genero-inexistente"];
  assert.equal(pickWeightedWord(), null);
});

test("una palabra compartida que está en más canciones sale más seguido", () => {
  resetState();
  state.config.genres = ["reggaeton"];
  // "cabeza" está en Danza Kuduro y Mi Gente; "cuello", solo en Despacito.
  let cabeza = 0, cuello = 0;
  for (let i = 0; i < 6000; i++) {
    const p = pickWeightedWord();
    if (p === "cabeza") cabeza++;
    if (p === "cuello") cuello++;
  }
  assert.ok(cabeza > cuello, `se esperaba "cabeza" (${cabeza}) más veces que "cuello" (${cuello})`);
});
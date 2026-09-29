import test from "node:test";
import assert from "node:assert/strict";

import { state, resetState } from "../src/js/state.js";
import { SONG_DB } from "../src/js/data/songs.js";
import { pickWeightedWord, songKey } from "../src/js/gameLogic.js";

// Pruebas de la elección de palabra y de enfrentamiento (gameLogic.js).
// Usan la base de ejemplo real (SONG_DB) y reinician el estado global en
// cada prueba, porque gameLogic lee y escribe `state` directamente.

/** Palabras que se pueden pedir con los géneros y canciones usadas actuales. */
function palabrasPosibles() {
  const palabras = new Set();
  SONG_DB
    .filter((s) => state.config.genres.includes(s.genre) && !state.usedSongs.includes(songKey(s)))
    .forEach((s) => Object.keys(s.words).filter((w) => s.words[w]).forEach((w) => palabras.add(w)));
  return palabras;
}

/** Repite `fn` muchas veces y devuelve el conjunto de resultados. */
function muestrear(fn, veces = 300) {
  const vistos = new Set();
  for (let i = 0; i < veces; i++) vistos.add(fn());
  return vistos;
}

// ---------- pickWeightedWord ----------

test("pickWeightedWord solo elige palabras de canciones de los géneros elegidos", () => {
  resetState();
  state.config.genres = ["pop"];
  const posibles = palabrasPosibles();
  for (const palabra of muestrear(pickWeightedWord)) {
    assert.ok(posibles.has(palabra), `"${palabra}" no pertenece a ninguna canción de pop`);
  }
});

test("pickWeightedWord nunca elige una palabra marcada como false", () => {
  resetState();
  state.config.genres = ["pop"];
  // "cerrar" está en Color Esperanza con valor false.
  assert.ok(!muestrear(pickWeightedWord).has("cerrar"));
});

test("pickWeightedWord no elige palabras que solo están en canciones ya usadas", () => {
  resetState();
  state.config.genres = ["reggaeton"];
  const despacito = SONG_DB.find((s) => s.title === "Despacito");
  state.usedSongs.push(songKey(despacito));
  // "despacito" y "piel" solo aparecen en Despacito; "cuerpo" también está en
  // Bailando, pero esa canción es de pop, así que tampoco debe salir.
  const vistas = muestrear(pickWeightedWord);
  for (const palabra of ["despacito", "piel", "cuerpo"]) {
    assert.ok(!vistas.has(palabra), `"${palabra}" salió aunque su canción ya se usó`);
  }
  assert.ok(vistas.size > 0);
});

test("pickWeightedWord devuelve null cuando no quedan canciones disponibles", () => {
  resetState();
  state.config.genres = ["rock"];
  SONG_DB.filter((s) => s.genre === "rock").forEach((s) => state.usedSongs.push(songKey(s)));
  assert.equal(pickWeightedWord(), null);
});

test("pickWeightedWord devuelve null con un género sin canciones", () => {
  resetState();
  state.config.genres = ["genero-inexistente"];
  assert.equal(pickWeightedWord(), null);
});

test("pickWeightedWord da más peso a una palabra que está en más canciones", () => {
  resetState();
  state.config.genres = ["pop"];
  // "saber" está en 2 canciones (Color Esperanza y su versión en vivo) y
  // "sol" solo en 1 (La Bicicleta); las tres son famosas y la palabra está
  // en el coro, así que "saber" pesa el doble (12 contra 6).
  // (No se puede probar aparte el peso del coro: en la base de ejemplo todas
  // las palabras que se pueden pedir están en el coro.)
  let saber = 0, sol = 0;
  for (let i = 0; i < 3000; i++) {
    const p = pickWeightedWord();
    if (p === "saber") saber++;
    if (p === "sol") sol++;
  }
  assert.ok(saber > sol, `se esperaba "saber" (${saber}) más veces que "sol" (${sol})`);
});


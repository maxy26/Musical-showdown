// Botones "Todos" y "Más" de los géneros (screens/config/genres.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { GENRES, availableGenres, genreArtists } from "../src/js/data/songs.js";
import { fixGenresForMode, hasAllGenres, allowsManyGenres } from "../src/js/screens/config/genres.js";
import { state, resetState } from "../src/js/state.js";

test("'Todos' es lo predeterminado al empezar", () => {
  resetState();
  assert.deepEqual(state.config.genres, availableGenres());
  assert.ok(hasAllGenres(state.config.genres));
});

test("Todos los géneros tienen canciones y artistas de ejemplo sin repetir", () => {
  assert.deepEqual(availableGenres(), GENRES);
  for (const g of GENRES) {
    const artistas = genreArtists(g);
    assert.ok(artistas.length > 0, `${g} sin artistas`);
    assert.equal(new Set(artistas).size, artistas.length);
  }
  assert.deepEqual(genreArtists("pop"), ["Diego Torres", "Enrique Iglesias", "Carlos Vives & Shakira"]);
});

test("Solo Alternativo 2 deja elegir varios géneros", () => {
  assert.equal(allowsManyGenres("alternativo2"), true);
  assert.equal(allowsManyGenres("clasico"), false);
  assert.equal(allowsManyGenres("alternativo1"), false);
});

test("Clásico y Alternativo 1: varios géneros (no todos) vuelven a 'Todos'", () => {
  for (const modo of ["clasico", "alternativo1"]) {
    assert.deepEqual(fixGenresForMode(["pop", "rock"], modo), availableGenres());
    assert.deepEqual(fixGenresForMode(["rock"], modo), ["rock"]);
    assert.deepEqual(fixGenresForMode(availableGenres(), modo), availableGenres());
  }
  assert.deepEqual(fixGenresForMode(["pop", "rock"], "alternativo2"), ["pop", "rock"]);
});

test("Sin géneros o con uno que no existe vuelve a 'Todos'", () => {
  assert.deepEqual(fixGenresForMode([], "alternativo2"), availableGenres());
  assert.deepEqual(fixGenresForMode(["tango"], "clasico"), availableGenres());
});

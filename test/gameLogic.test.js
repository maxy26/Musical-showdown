import test from "node:test";
import assert from "node:assert/strict";

import { weightedPick } from "../src/js/utils.js";
import { countTypedPlayers } from "../src/js/screens/config/players.js";
import { formatCustomTime } from "../src/js/screens/config/presets.js";
import { songKey } from "../src/js/gameLogic.js";

test("countTypedPlayers ignora espacios en blanco y campos vacíos", () => {
  assert.equal(countTypedPlayers(["", "  ", "Ana", "Beto", ""]), 2);
  assert.equal(countTypedPlayers([]), 0);
  assert.equal(countTypedPlayers(["Ana", "Beto", "Caro", "Deni"]), 4);
});

test("formatCustomTime da el texto esperado en cada caso", () => {
  assert.equal(formatCustomTime(0), "Sin tiempo");
  assert.equal(formatCustomTime(45), "45 seg");
  assert.equal(formatCustomTime(60), "1 min");
  assert.equal(formatCustomTime(90), "1 min 30 seg");
  assert.equal(formatCustomTime(120), "2 min (máximo)");
});

test("weightedPick siempre devuelve un elemento válido de la lista", () => {
  const items = ["a", "b", "c"];
  for (let i = 0; i < 50; i++) {
    assert.ok(items.includes(weightedPick(items, [1, 1, 1])));
  }
});

test("weightedPick nunca elige un elemento con peso 0", () => {
  const items = ["nunca", "siempre"];
  for (let i = 0; i < 100; i++) {
    assert.equal(weightedPick(items, [0, 1]), "siempre");
  }
});

test("songKey identifica una canción por título + letra (el artista no importa)", () => {
  const cancionA = { title: "Amor", artist: "Artista A", lyric: "letra de prueba" };
  const cancionB = { title: "Amor", artist: "Artista B", lyric: "letra de prueba" };
  const cancionDistinta = { title: "Amor", artist: "Artista A", lyric: "otra letra" };
  assert.equal(songKey(cancionA), songKey(cancionB));
  assert.notEqual(songKey(cancionA), songKey(cancionDistinta));
});

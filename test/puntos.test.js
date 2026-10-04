import test from "node:test";
import assert from "node:assert/strict";

import { roundValue, roundScoreChanges, formatPoints, formatDelta } from "../src/js/scoring.js";

// Puntos por ronda (reglas del usuario, 30-09-2026; CONTEXTO, sección 3).

test("valor de la ronda: 100, o 100 × multiplicador", () => {
  assert.equal(roundValue(null), 100);
  assert.equal(roundValue(2), 200);
  assert.equal(roundValue(5), 500);
});

test("Alternativo 1: el que acierta suma y el que pierde resta lo mismo (ejemplo ×2: +200 y −200)", () => {
  assert.deepEqual(roundScoreChanges("alternativo1", "A", 2), { A: 200, B: -200 });
  assert.deepEqual(roundScoreChanges("alternativo1", "B", null), { A: -100, B: 100 });
});

test("Alternativo 1: si nadie acierta, los dos restan la mitad (ejemplo ×3: −150 cada uno)", () => {
  assert.deepEqual(roundScoreChanges("alternativo1", null, 3), { A: -150, B: -150 });
  assert.deepEqual(roundScoreChanges("alternativo1", null, null), { A: -50, B: -50 });
});

test("ejemplo del usuario: objetivo 500, María 250 y Carlos 400; Carlos gana → 500 (gana) y María 150", () => {
  const scores = { "María": 250, Carlos: 400 };
  const ch = roundScoreChanges("alternativo1", "B", null); // A = María, B = Carlos
  scores["María"] += ch.A;
  scores.Carlos += ch.B;
  assert.deepEqual(scores, { "María": 150, Carlos: 500 });
  assert.ok(scores.Carlos >= 500);
});

test("Clásico: el que acierta suma y nadie resta", () => {
  assert.deepEqual(roundScoreChanges("clasico", "A", null), { A: 100, B: 0 });
  assert.deepEqual(roundScoreChanges("clasico", null, null), { A: 0, B: 0 });
});

test("Alternativo 2: el perdedor resta y 'nadie acierta' según lo elegido (ejemplos del usuario)", () => {
  // valores de entrada: el perdedor no resta y si nadie acierta nadie resta
  assert.deepEqual(roundScoreChanges("alternativo2", "B", 3), { A: 0, B: 300 });
  assert.deepEqual(roundScoreChanges({ loserLoses: false, noneLoseHalf: false }, null, 3), { A: 0, B: 0 });
  // "Sí, resta lo mismo que gana el otro": ronda ×3 → +300 y −300; ×4 → +400 y −400
  assert.deepEqual(roundScoreChanges({ loserLoses: true, noneLoseHalf: false }, "A", 3), { A: 300, B: -300 });
  assert.deepEqual(roundScoreChanges({ loserLoses: true, noneLoseHalf: false }, "B", 4), { A: -400, B: 400 });
  // "Si nadie acierta, ambos restan": ×3 → los dos −150; ×4 → los dos −200
  assert.deepEqual(roundScoreChanges({ loserLoses: false, noneLoseHalf: true }, null, 3), { A: -150, B: -150 });
  assert.deepEqual(roundScoreChanges({ loserLoses: false, noneLoseHalf: true }, null, 4), { A: -200, B: -200 });
});

test("los puntos negativos se muestran con signo menos y los cambios siempre con signo", () => {
  assert.equal(formatPoints(-200), "−200");
  assert.equal(formatPoints(350), "350");
  assert.equal(formatDelta(200), "+200");
  assert.equal(formatDelta(-150), "−150");
  assert.equal(formatDelta(0), "±0");
});

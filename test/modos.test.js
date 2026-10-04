import test from "node:test";
import assert from "node:assert/strict";

import {
  usesRoundTime, allowsNoTime, usesMultipliers, effectiveRoundTime, effectiveMultipliers,
  hasMultiplierChoice, scoringRules, alt2Options,
} from "../src/js/screens/config/modes.js";

// Qué usa cada modo (definido por el usuario el 30-09-2026; CONTEXTO, sección 3).

test("Clásico: sin reloj y sin multiplicadores, aunque la configuración guarde otros valores", () => {
  assert.equal(usesRoundTime("clasico"), false);
  assert.equal(usesMultipliers("clasico"), false);
  const config = { mode: "clasico", roundTime: 45, multipliers: [2, 3, 4, 5] };
  assert.equal(effectiveRoundTime(config), 0);
  assert.deepEqual(effectiveMultipliers(config), []);
});

test("Alternativo 1: tiempo obligatorio (sin 'Sin tiempo') y multiplicadores siempre activos", () => {
  assert.equal(usesRoundTime("alternativo1"), true);
  assert.equal(allowsNoTime("alternativo1"), false);
  assert.equal(usesMultipliers("alternativo1"), true);
  assert.equal(hasMultiplierChoice("alternativo1"), false);
  // aunque la configuración guarde "sin multiplicadores", en Alternativo 1 salen igual (03-10-2026)
  const config = { mode: "alternativo1", roundTime: 45, multipliers: [] };
  assert.equal(effectiveRoundTime(config), 45);
  assert.deepEqual(effectiveMultipliers(config), [2, 3, 4, 5]);
});

test("Alternativo 2: con 'Sin tiempo' y multiplicadores que se activan o desactivan", () => {
  assert.equal(usesRoundTime("alternativo2"), true);
  assert.equal(allowsNoTime("alternativo2"), true);
  assert.equal(hasMultiplierChoice("alternativo2"), true);
  assert.deepEqual(effectiveMultipliers({ mode: "alternativo2", multipliers: [] }), []);
  assert.deepEqual(effectiveMultipliers({ mode: "alternativo2", multipliers: [2, 3, 4, 5] }), [2, 3, 4, 5]);
});

test("Alternativo 2: valores de entrada (5 intentos, no resta, nadie resta, 3 relevos y 1 por ronda)", () => {
  assert.deepEqual(alt2Options({ mode: "alternativo2" }), {
    attempts: 5, loserLoses: false, noneLoseHalf: false, relaysTotal: 3, relaysPerRound: 1,
  });
});

test("reglas de puntos de cada modo", () => {
  assert.deepEqual(scoringRules({ mode: "clasico" }), { loserLoses: false, noneLoseHalf: false });
  assert.deepEqual(scoringRules({ mode: "alternativo1" }), { loserLoses: true, noneLoseHalf: true });
  assert.deepEqual(scoringRules({ mode: "alternativo2", alt2: { loserLoses: true } }), { loserLoses: true, noneLoseHalf: false });
});

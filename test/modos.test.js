import test from "node:test";
import assert from "node:assert/strict";

import {
  usesRoundTime, allowsNoTime, usesMultipliers, effectiveRoundTime, effectiveMultipliers,
} from "../src/js/screens/config/modes.js";

// Qué usa cada modo (definido por el usuario el 30-09-2026; CONTEXTO, sección 3).

test("Clásico: sin reloj y sin multiplicadores, aunque la configuración guarde otros valores", () => {
  assert.equal(usesRoundTime("clasico"), false);
  assert.equal(usesMultipliers("clasico"), false);
  const config = { mode: "clasico", roundTime: 45, multipliers: [2, 3, 4, 5] };
  assert.equal(effectiveRoundTime(config), 0);
  assert.deepEqual(effectiveMultipliers(config), []);
});

test("Alternativo 1: tiempo obligatorio (sin 'Sin tiempo') y multiplicadores", () => {
  assert.equal(usesRoundTime("alternativo1"), true);
  assert.equal(allowsNoTime("alternativo1"), false);
  assert.equal(usesMultipliers("alternativo1"), true);
  const config = { mode: "alternativo1", roundTime: 45, multipliers: [2, 3, 4, 5] };
  assert.equal(effectiveRoundTime(config), 45);
  assert.deepEqual(effectiveMultipliers(config), [2, 3, 4, 5]);
});

test("Alternativo 2 (aún sin reglas propias): queda como antes, con 'Sin tiempo' y multiplicadores", () => {
  assert.equal(usesRoundTime("alternativo2"), true);
  assert.equal(allowsNoTime("alternativo2"), true);
  assert.equal(usesMultipliers("alternativo2"), true);
});

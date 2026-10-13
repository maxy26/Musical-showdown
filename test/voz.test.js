import test from "node:test";
import assert from "node:assert/strict";

import { state, resetState } from "../src/js/state.js";
import { descuentoLento, empezarEscucha, resultadoVoz } from "../src/js/voz.js";
import { volumenDe, acumularVoz, UMBRAL_VOZ, VOZ_MINIMA_MS } from "../src/js/microfono.js";

// Al tocar un nombre, el micrófono escucha 3 segundos (usuario, 12-10-2026):
// si nadie canta, vuelve a la ronda con lo que corrió despacio descontado.

function enCanta({ tiempo = 20, roundTime = 30 } = {}) {
  resetState();
  Object.assign(state.config, { mode: "alternativo1", roundTime });
  state.round = { ...state.round, phase: "counting", timeLeft: tiempo, paused: true, selected: "A" };
  state.screen = "verify";
}

test("el reloj corre a mitad de velocidad mientras se escucha (como mucho 3 segundos)", () => {
  assert.equal(descuentoLento(0), 0);
  assert.equal(descuentoLento(1.5), 0);
  assert.equal(descuentoLento(2), 1);
  assert.equal(descuentoLento(3), 1);
  assert.equal(descuentoLento(10), 1, "nunca más de 3 segundos escuchando");
});

test("si nadie canta, vuelve a la ronda", () => {
  enCanta();
  let volvio = false;
  empezarEscucha({ conControl: true, alSilencio: () => { volvio = true; } });
  assert.equal(state.round.escuchando, true);
  resultadoVoz("silencio", state.round.toque);
  assert.equal(volvio, true);
  assert.equal(state.round.escuchando, false);
});

test("si alguien canta (o no hay micrófono), sigue en ¡X canta!", () => {
  for (const resultado of ["voz", "sin-microfono"]) {
    enCanta();
    let volvio = false;
    empezarEscucha({ conControl: true, alSilencio: () => { volvio = true; } });
    resultadoVoz(resultado, state.round.toque);
    assert.equal(volvio, false, resultado);
    assert.equal(state.round.escuchando, false);
  }
});

test("un resultado viejo (otro toque, o ya se eligió ✅ / ❌) no hace nada", () => {
  enCanta();
  let volvio = false;
  empezarEscucha({ conControl: true, alSilencio: () => { volvio = true; } });
  const viejo = state.round.toque;
  empezarEscucha({ conControl: true, alSilencio: () => {} }); // otro toque
  resultadoVoz("silencio", viejo);
  assert.equal(volvio, false);
  state.screen = "round-result"; // el moderador ya decidió
  resultadoVoz("silencio", state.round.toque);
  assert.equal(state.round.escuchando, true, "no se tocó");
});

test("el volumen y la voz: un ruido corto no cuenta, una voz sostenida sí", () => {
  assert.equal(volumenDe([]), 0);
  assert.ok(Math.abs(volumenDe([0.5, -0.5]) - 0.5) < 1e-9);
  let acumulado = acumularVoz(0, UMBRAL_VOZ * 2, 50);
  acumulado = acumularVoz(acumulado, 0, 50);
  assert.ok(acumulado < VOZ_MINIMA_MS, "un golpe suelto no es voz");
  for (let i = 0; i < 10; i++) acumulado = acumularVoz(acumulado, UMBRAL_VOZ * 2, 50);
  assert.ok(acumulado >= VOZ_MINIMA_MS, "medio segundo de voz sí");
});

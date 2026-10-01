import test from "node:test";
import assert from "node:assert/strict";

import { ranking, buildPodium, pickMvp } from "../src/js/podium.js";

// Podio y MVP (reglas del usuario, 30-09-2026; CONTEXTO, sección 3).

test("clasificación de mayor a menor; los empatados comparten el puesto", () => {
  const r = ranking({ Ana: 300, Beto: 500, Caro: 300, Dani: 100 });
  assert.deepEqual(r.map((x) => `${x.place}.${x.name}`), ["1.Beto", "2.Ana", "2.Caro", "3.Dani"]);
});

test("podio: los 3 primeros puestos, y el resto para 'Ver más'", () => {
  const { steps, rest } = buildPodium({ Ana: 500, Beto: 400, Caro: 300, Dani: 200, Eva: -100 });
  assert.deepEqual(steps.map((s) => s.entries.map((e) => e.name).join("+")), ["Ana", "Beto", "Caro"]);
  assert.deepEqual(rest.map((r) => r.name), ["Dani", "Eva"]);
});

test("podio con empate: dos comparten el 2.º puesto", () => {
  const { steps, rest } = buildPodium({ Ana: 500, Beto: 300, Caro: 300, Dani: 100, Eva: 50 });
  assert.deepEqual(steps.map((s) => `${s.place}:${s.entries.map((e) => e.name).join("+")}`), ["1:Ana", "2:Beto+Caro", "3:Dani"]);
  assert.deepEqual(rest.map((r) => r.name), ["Eva"]);
});

test("con solo 2 participantes el podio tiene 2 puestos", () => {
  const { steps, rest } = buildPodium({ Ana: 500, Beto: -200 });
  assert.equal(steps.length, 2);
  assert.equal(rest.length, 0);
});

test("MVP: el que más puntos le aportó al grupo (ejemplo: Ana +500 con ×5 gana a Beto +300)", () => {
  assert.deepEqual(pickMvp(["Ana", "Beto"], { Ana: 500, Beto: 300 }, {}), ["Ana"]);
  // lo perdido también cuenta
  assert.deepEqual(pickMvp(["Ana", "Beto"], { Ana: 500, Beto: 900 - 500 }, {}), ["Ana"]);
});

test("MVP empatado en puntos: gana el que respondió más rápido en promedio", () => {
  const contrib = { Ana: 300, Beto: 300 };
  const tiempos = { Ana: [20, 25, 30], Beto: [1, 3, 5] }; // Beto respondía en 1-5 segundos
  assert.deepEqual(pickMvp(["Ana", "Beto"], contrib, tiempos), ["Beto"]);
});

test("MVP empatado en puntos y en velocidad: se muestran los dos", () => {
  assert.deepEqual(pickMvp(["Ana", "Beto"], { Ana: 200, Beto: 200 }, { Ana: [4], Beto: [4] }), ["Ana", "Beto"]);
});

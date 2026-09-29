import test from "node:test";
import assert from "node:assert/strict";

import {
  roundRobinRounds, roundRobinSequence, groupOrderSequence,
  newGroupMemory, pickGroupDuelPlayers,
} from "../src/js/pairing.js";

// Orden de Alternativo 1, comparado con los ejemplos que confirmó el usuario
// (CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3). Las posiciones van desde 0: el
// jugador 1 es el 0.

const uno = (pares) => pares.map(([a, b]) => `${a + 1}v${b + 1}`).join(", ");

test("Individual con 10: tanda 1 = 1v10, 2v9, 3v8, 4v7, 5v6; tanda 2 = 1v9, 10v8, 2v7, 3v6, 4v5", () => {
  const tandas = roundRobinRounds(10);
  assert.equal(uno(tandas[0]), "1v10, 2v9, 3v8, 4v7, 5v6");
  assert.equal(uno(tandas[1]), "1v9, 10v8, 2v7, 3v6, 4v5");
  assert.equal(tandas.length, 9);
});

test("Individual: todos se enfrentan con todos exactamente una vez por ciclo", () => {
  for (const n of [2, 3, 4, 7, 9, 10, 11]) {
    const seq = roundRobinSequence(n);
    const parejas = new Set(seq.map(([a, b]) => [a, b].sort((x, y) => x - y).join("-")));
    assert.equal(seq.length, (n * (n - 1)) / 2, `con ${n} jugadores`);
    assert.equal(parejas.size, seq.length, `sin parejas repetidas con ${n}`);
    assert.ok(seq.every(([a, b]) => a !== b && a >= 0 && b >= 0 && a < n && b < n));
  }
});

test("Individual impar: con 9, en la tanda 1 descansa el 5 y cada tanda descansa uno distinto", () => {
  const tandas = roundRobinRounds(9);
  assert.equal(uno(tandas[0]), "1v9, 2v8, 3v7, 4v6");
  const descansan = tandas.map((t) => {
    const juegan = new Set(t.flat());
    return [...Array(9).keys()].find((i) => !juegan.has(i));
  });
  assert.equal(descansan[0] + 1, 5);
  assert.equal(new Set(descansan).size, 9);
});

test("Grupal: orden de los grupos con 2, 3 y 4 grupos", () => {
  assert.equal(uno(groupOrderSequence(2)), "1v2");
  assert.equal(uno(groupOrderSequence(3)), "1v3, 1v2, 2v3");
  assert.equal(uno(groupOrderSequence(4)), "1v4, 2v3, 1v3, 4v2, 1v2, 3v4");
});

test("Grupal: jugadores con el ejemplo confirmado (G1 = A,B,C; G2 = D,E,F; G3 = G,H,I,J)", () => {
  const grupos = [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I", "J"]];
  const orden = groupOrderSequence(3);
  const jugados = {}, memoria = newGroupMemory();
  const duelos = [];
  for (let n = 0; n < 10; n++) {
    const [ga, gb] = orden[n % orden.length];
    duelos.push(pickGroupDuelPlayers(grupos, ga, gb, jugados, memoria).join("–"));
  }
  assert.equal(duelos.join(", "), "A–G, B–D, E–H, C–I, A–F, D–J, B–G, C–E, F–H, A–I");
});

test("Grupal: con el tiempo cada jugador se enfrenta a todos los de los otros grupos", () => {
  const grupos = [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I", "J"]];
  const orden = groupOrderSequence(3);
  const jugados = {}, memoria = newGroupMemory();
  const vistas = new Set();
  let completo = null;
  for (let n = 0; n < 60 && !completo; n++) {
    const [ga, gb] = orden[n % orden.length];
    vistas.add(pickGroupDuelPlayers(grupos, ga, gb, jugados, memoria).sort().join("-"));
    if (vistas.size === 33) completo = n + 1;
  }
  assert.equal(completo, 45); // las 33 parejas posibles, en el duelo 45
  // Y el ciclo vuelve a empezar: la memoria de parejas se reinicia.
  assert.equal(memoria.faced.length, 0);
});

test("Grupal: dentro de cada grupo todos juegan casi la misma cantidad de veces", () => {
  const grupos = [["A", "B"], ["C", "D", "E"], ["F", "G"], ["H", "I", "J"]];
  const orden = groupOrderSequence(4);
  const jugados = {}, memoria = newGroupMemory();
  for (let n = 0; n < 48; n++) {
    const [ga, gb] = orden[n % orden.length];
    pickGroupDuelPlayers(grupos, ga, gb, jugados, memoria);
  }
  for (const g of grupos) {
    const veces = g.map((p) => jugados[p]);
    assert.ok(Math.max(...veces) - Math.min(...veces) <= 1, `${g.join(",")}: ${veces}`);
  }
});

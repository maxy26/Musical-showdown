import test from "node:test";
import assert from "node:assert/strict";

import {
  newClassicMemory, isBalanced, nextClassicMode, pickClassicPair, recordClassicDuel,
} from "../src/js/pairing.js";
import { hasSingleAttempt } from "../src/js/gameLogic.js";

// Reglas de Clásico definidas por el usuario (CONTEXTO, sección 3). Sirven
// igual para jugadores (Individual) y para grupos (Grupal).

const modos = (memoria, equilibrios) => equilibrios.map((b) => nextClassicMode(memoria, b));

// ---------- Equilibrio de puntos ----------

test("equilibrio: todos con al menos el 60 % del promedio (promedio 0 = equilibrio)", () => {
  assert.equal(isBalanced([0, 0, 0]), true);
  assert.equal(isBalanced([1000, 1000, 1000]), true);
  // promedio 1000: el que tiene 600 aprueba, el que tiene 599… no.
  assert.equal(isBalanced([1400, 1000, 600]), true);
  assert.equal(isBalanced([1401, 1000, 599]), false);
  assert.equal(isBalanced([500, 0]), false);
});

// ---------- Fases ----------

test("fases: 3 al azar, y con desequilibrio 3 con ventaja → 3 al azar → 3 con ventaja", () => {
  const m = newClassicMemory();
  const seq = modos(m, Array(12).fill(false));
  assert.deepEqual(seq, [
    "azar", "azar", "azar",
    "ventaja", "ventaja", "ventaja",
    "azar", "azar", "azar",
    "ventaja", "ventaja", "ventaja",
  ]);
});

test("fases: con equilibrio, siempre al azar", () => {
  assert.ok(modos(newClassicMemory(), Array(10).fill(true)).every((x) => x === "azar"));
});

test("fases: al llegar el equilibrio se corta en ese momento; al volver el desequilibrio, ventaja de inmediato", () => {
  const m = newClassicMemory();
  // 3 al azar, 1 con ventaja, equilibrio (se corta), 2 al azar, desequilibrio → ventaja ×3
  const seq = modos(m, [false, false, false, false, true, true, false, false, false, false]);
  assert.deepEqual(seq, ["azar", "azar", "azar", "ventaja", "azar", "azar", "ventaja", "ventaja", "ventaja", "azar"]);
});

// ---------- Elección del duelo ----------

const jugadores = ["Ana", "Beto", "Caro", "Dani", "Eva", "Fito"];

test("siempre dos distintos, y primero los que llevan menos duelos (equilibrio de partidos)", () => {
  for (let i = 0; i < 100; i++) {
    const [a, b] = pickClassicPair({
      participants: jugadores, scores: {}, matches: { Ana: 3, Beto: 3, Caro: 2, Dani: 3, Eva: 2, Fito: 3 },
      memory: newClassicMemory(), mode: "azar",
    });
    assert.notEqual(a, b);
    assert.deepEqual([a, b].sort(), ["Caro", "Eva"]); // los dos con menos duelos
  }
});

test("en muchas rondas, nadie juega más de 1 duelo de diferencia con los demás", () => {
  const matches = {}, scores = {}, memory = newClassicMemory();
  for (let i = 0; i < 90; i++) {
    const mode = nextClassicMode(memory, isBalanced(jugadores.map((p) => scores[p] || 0)));
    const [a, b] = pickClassicPair({ participants: jugadores, scores, matches, memory, mode });
    recordClassicDuel(memory, a, b, jugadores);
    matches[a] = (matches[a] || 0) + 1;
    matches[b] = (matches[b] || 0) + 1;
    const ganador = Math.random() < 0.5 ? a : b; // puntos al azar para crear desequilibrios
    scores[ganador] = (scores[ganador] || 0) + 100 * (1 + Math.floor(Math.random() * 3));
    const veces = jugadores.map((p) => matches[p] || 0);
    assert.ok(Math.max(...veces) - Math.min(...veces) <= 1, `duelo ${i + 1}: ${veces}`);
  }
});

test("con ventaja: uno sale de los que van por debajo del promedio y su rival, de los de arriba", () => {
  const scores = { Ana: 0, Beto: 900, Caro: 1000, Dani: 1100, Eva: 800, Fito: 1200 }; // promedio 833
  const abajo = ["Ana", "Eva"];
  for (let i = 0; i < 100; i++) {
    const [a, b] = pickClassicPair({ participants: jugadores, scores, matches: {}, memory: newClassicMemory(), mode: "ventaja" });
    assert.ok(abajo.includes(a), `el primero (${a}) debería ir por debajo del promedio`);
    assert.ok(!abajo.includes(b), `el rival (${b}) debería ir en el promedio o por encima`);
  }
});

test("con ventaja: el que va más lejos del promedio sale más veces (pero no siempre)", () => {
  const scores = { Ana: 0, Beto: 900, Caro: 1000, Dani: 1100, Eva: 800, Fito: 1200 }; // Ana muy abajo, Eva apenas
  let ana = 0, eva = 0;
  for (let i = 0; i < 2000; i++) {
    const [a] = pickClassicPair({ participants: jugadores, scores, matches: {}, memory: newClassicMemory(), mode: "ventaja" });
    if (a === "Ana") ana++;
    if (a === "Eva") eva++;
  }
  assert.ok(ana > eva * 3, `Ana ${ana} veces, Eva ${eva}`);
  assert.ok(eva > 0, "Eva también sale a veces: no está garantizado");
});

test("no repite el mismo duelo dos veces seguidas si hay otra opción", () => {
  for (let i = 0; i < 100; i++) {
    const memory = newClassicMemory();
    recordClassicDuel(memory, "Ana", "Beto", ["Ana", "Beto", "Caro", "Dani"]);
    const [a, b] = pickClassicPair({
      participants: ["Ana", "Beto", "Caro", "Dani"], scores: {},
      matches: { Ana: 1, Beto: 1, Caro: 1, Dani: 1 }, memory, mode: "azar",
    });
    assert.notDeepEqual([a, b].sort(), ["Ana", "Beto"]);
  }
});

test("sí repite cuando no hay otra opción (solo 2, o el equilibrio de partidos lo exige)", () => {
  const [a, b] = pickClassicPair({ participants: ["Ana", "Beto"], scores: {}, matches: {}, memory: newClassicMemory(), mode: "azar" });
  assert.deepEqual([a, b].sort(), ["Ana", "Beto"]);
  // Con 3: Ana y Beto llevan menos duelos que Caro; el equilibrio de partidos manda.
  const tres = ["Ana", "Beto", "Caro"];
  const memory = newClassicMemory();
  recordClassicDuel(memory, "Ana", "Caro", tres);
  recordClassicDuel(memory, "Beto", "Caro", tres);
  recordClassicDuel(memory, "Ana", "Beto", tres);
  const par = pickClassicPair({ participants: tres, scores: {}, matches: { Ana: 2, Beto: 2, Caro: 3 }, memory, mode: "azar" });
  assert.deepEqual(par.sort(), ["Ana", "Beto"]);
});

test("'enfrentarse con todos' se cuenta por vuelta: al completarse, la cuenta empieza de nuevo", () => {
  const tres = ["Ana", "Beto", "Caro"];
  const memory = newClassicMemory();
  recordClassicDuel(memory, "Ana", "Beto", tres);
  recordClassicDuel(memory, "Beto", "Caro", tres);
  assert.ok(Object.keys(memory.faced).length > 0);
  recordClassicDuel(memory, "Ana", "Caro", tres); // todos se enfrentaron con todos
  assert.deepEqual(memory.faced, {}, "nueva vuelta: la cuenta empieza de nuevo");
});

test("con 4 participantes, después de muchas vueltas nunca se repite un duelo seguido", () => {
  const cuatro = ["Equipo 1", "Equipo 2", "Equipo 3", "Equipo 4"];
  for (let partida = 0; partida < 20; partida++) {
    const matches = {}, scores = {}, memory = newClassicMemory();
    let anterior = null;
    for (let i = 0; i < 60; i++) {
      const mode = nextClassicMode(memory, isBalanced(cuatro.map((p) => scores[p] || 0)));
      const par = pickClassicPair({ participants: cuatro, scores, matches, memory, mode });
      recordClassicDuel(memory, par[0], par[1], cuatro);
      const clave = [...par].sort().join("|");
      assert.notEqual(clave, anterior, `duelo ${i + 1} repetido: ${clave}`);
      anterior = clave;
      par.forEach((p) => { matches[p] = (matches[p] || 0) + 1; });
      scores[par[Math.round(Math.random())]] = (scores[par[0]] || 0) + 100 * (1 + Math.floor(Math.random() * 3));
    }
  }
});

// ---------- Intentos por ronda (definido por el usuario el 30-09-2026) ----------

test("un solo intento por ronda solo en Clásico; Alternativo 1 sin límite", () => {
  assert.equal(hasSingleAttempt("clasico"), true);
  assert.equal(hasSingleAttempt("alternativo1"), false);
  assert.equal(hasSingleAttempt("alternativo2"), false); // aún sin reglas propias
});

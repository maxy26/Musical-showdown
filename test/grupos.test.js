import test from "node:test";
import assert from "node:assert/strict";

import {
  maxGroups, groupCountOptions, groupSizes, distributeRandom,
  defaultGroupName, groupName, pickGroupPairTemporary, pickRepresentative,
} from "../src/js/groups.js";

// Pruebas de los grupos del modo Grupal (reglas: CONTEXTO, sección 3).

const sinMezclar = (arr) => arr; // para pruebas deterministas del reparto
const diez = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

test("la cantidad de grupos va de 2 a la mitad de los jugadores", () => {
  assert.deepEqual(groupCountOptions(10), [2, 3, 4, 5]);
  assert.deepEqual(groupCountOptions(7), [2, 3]);
  assert.deepEqual(groupCountOptions(11), [2, 3, 4, 5]);
  assert.deepEqual(groupCountOptions(4), [2]);
  assert.equal(maxGroups(4), 2);
});

test("los grupos quedan parejos y los que sobran van a los últimos", () => {
  assert.deepEqual(groupSizes(10, 3), [3, 3, 4]); // ejemplo del usuario
  assert.deepEqual(groupSizes(11, 3), [3, 4, 4]);
  assert.deepEqual(groupSizes(10, 2), [5, 5]);
  assert.deepEqual(groupSizes(7, 3), [2, 2, 3]);
});

test("distributeRandom reparte a todos los jugadores, sin repetir ni perder ninguno", () => {
  const grupos = distributeRandom(diez, 3, sinMezclar);
  assert.deepEqual(grupos.map((g) => g.players), [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I", "J"]]);
  assert.ok(grupos.every((g) => g.customName === ""));
  // Con mezcla real: siempre los mismos jugadores, cada grupo con 2 o más.
  for (let i = 0; i < 50; i++) {
    const g = distributeRandom(diez, 4);
    assert.deepEqual(g.flatMap((x) => x.players).sort(), [...diez].sort());
    assert.ok(g.every((x) => x.players.length >= 2));
  }
});

test("nombres: predeterminado según Equipos/Grupos, o el editado", () => {
  assert.equal(defaultGroupName("equipo", 0), "Equipo 1");
  assert.equal(defaultGroupName("grupo", 3), "Grupo 4");
  assert.equal(groupName({ players: [], customName: "" }, 1, "equipo"), "Equipo 2");
  assert.equal(groupName({ players: [], customName: "Los Fantasmas" }, 0, "equipo"), "Los Fantasmas");
});

test("regla temporal: siempre dos grupos distintos, y primero los que menos han jugado", () => {
  for (let i = 0; i < 100; i++) {
    const [a, b] = pickGroupPairTemporary([0, 0, 0]);
    assert.notEqual(a, b);
  }
  // El grupo 2 lleva menos partidos: siempre juega.
  for (let i = 0; i < 50; i++) {
    assert.ok(pickGroupPairTemporary([3, 3, 1, 3]).includes(2));
  }
});

test("regla temporal: en muchas rondas todos los grupos juegan casi lo mismo", () => {
  const played = [0, 0, 0, 0, 0];
  for (let i = 0; i < 100; i++) pickGroupPairTemporary(played).forEach((g) => played[g]++);
  assert.ok(Math.max(...played) - Math.min(...played) <= 1, `partidos por grupo: ${played}`);
});

test("el representante sale entre los que menos han cantado", () => {
  const sang = { Ana: 2, Beto: 0, Caro: 2 };
  for (let i = 0; i < 30; i++) assert.equal(pickRepresentative(["Ana", "Beto", "Caro"], sang), "Beto");
  // Con todos iguales, cualquiera; con el tiempo cantan todos.
  const vistos = new Set();
  for (let i = 0; i < 100; i++) vistos.add(pickRepresentative(["Ana", "Beto", "Caro"], {}));
  assert.equal(vistos.size, 3);
});

import test from "node:test";
import assert from "node:assert/strict";

import { hasRelay, adjustRelays, canRequestRelay, relayPenaltyChanges, RELAYS_PER_TEAM } from "../src/js/relay.js";
import { newGroupMemory, pickGroupDuelPlayers, applyRelayToMemory } from "../src/js/pairing.js";

// Relevo (reglas del usuario, 29 y 30-09-2026; CONTEXTO, sección 3).

test("el relevo existe solo en Alternativo 1 – Grupal, con 3 por equipo", () => {
  assert.equal(hasRelay("alternativo1", "grupal"), true);
  assert.equal(hasRelay("alternativo1", "individual"), false);
  assert.equal(hasRelay("clasico", "grupal"), false);
  assert.equal(RELAYS_PER_TEAM, 3);
});

test("agregar o quitar relevos: entre 0 y 3 (3 es el máximo estricto por partida)", () => {
  assert.equal(adjustRelays(2, 1), 3);
  assert.equal(adjustRelays(3, 1), 3);
  assert.equal(adjustRelays(1, -1), 0);
  assert.equal(adjustRelays(0, -1), 0);
});

test("se pide antes de responder y como mucho 1 por equipo y por ronda", () => {
  const ronda = { relayUsed: { A: false, B: false }, attempted: { A: false, B: false } };
  assert.equal(canRequestRelay(ronda, "A"), true);
  assert.equal(canRequestRelay({ ...ronda, relayUsed: { A: true, B: false } }, "A"), false);
  assert.equal(canRequestRelay({ ...ronda, attempted: { A: true, B: false } }, "A"), false);
  // si un equipo ya respondió y falló, el otro todavía puede pedir relevo
  assert.equal(canRequestRelay({ ...ronda, attempted: { A: true, B: false } }, "B"), true);
});

test("penalización sin relevos: el que lo usó resta la mitad y el otro suma el valor completo (×2: −100 y +200)", () => {
  assert.deepEqual(relayPenaltyChanges("A", 2), { A: -100, B: 200 });
  assert.deepEqual(relayPenaltyChanges("B", null), { A: 100, B: -50 });
});

test("con relevo, para los emparejamientos cuenta el que entró (Ana releva a María → María vs Carlos)", () => {
  const grupos = [["Ana", "María", "Pedro"], ["Carlos", "Dani", "Eva"]];
  const jugados = {}, memoria = newGroupMemory();
  const [a, b] = pickGroupDuelPlayers(grupos, 0, 1, jugados, memoria);
  assert.deepEqual([a, b], ["Ana", "Carlos"]);
  applyRelayToMemory(grupos, 0, "Ana", "María", "Carlos", jugados, memoria);
  assert.equal(jugados.Ana, 0, "Ana no cuenta como que cantó");
  assert.equal(jugados["María"], 1, "María sí");
  assert.ok(memoria.faced.includes("Carlos|María") && !memoria.faced.includes("Ana|Carlos"));
});

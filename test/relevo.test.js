import test from "node:test";
import assert from "node:assert/strict";

import {
  relayRules, adjustRelays, relayStatus, relayPenaltyChanges, relaysLeftThisRound, maxRelaysPerRound, RELAYS_PER_TEAM,
} from "../src/js/relay.js";
import { newGroupMemory, pickGroupDuelPlayers, applyRelayToMemory } from "../src/js/pairing.js";

// Relevo (reglas del usuario, 29 y 30-09-2026; CONTEXTO, sección 3).

test("hay relevo en Grupal: Alternativo 1 con 3 fijos y 1 por ronda; Alternativo 2 con lo elegido", () => {
  assert.deepEqual(relayRules({ mode: "alternativo1", battleType: "grupal" }), { total: 3, perRound: 1, lifeline: false });
  assert.equal(relayRules({ mode: "alternativo1", battleType: "individual" }), null);
  assert.equal(relayRules({ mode: "clasico", battleType: "grupal" }), null);
  assert.deepEqual(relayRules({ mode: "alternativo2", battleType: "grupal" }), { total: 3, perRound: 1, lifeline: true });
  assert.deepEqual(relayRules({ mode: "alternativo2", battleType: "grupal", alt2: { relaysTotal: 6, relaysPerRound: 2 } }),
    { total: 6, perRound: 2, lifeline: true });
  assert.equal(relayRules({ mode: "alternativo2", battleType: "grupal", alt2: { relaysTotal: 0 } }), null, "0 = sin relevos");
  assert.equal(RELAYS_PER_TEAM, 3);
});

test("agregar o quitar relevos: entre 0 y el total de la partida", () => {
  assert.equal(adjustRelays(2, 1), 3);
  assert.equal(adjustRelays(3, 1), 3);
  assert.equal(adjustRelays(0, -1), 0);
  assert.equal(adjustRelays(6, 1, 7), 7);
  assert.equal(adjustRelays(7, 1, 7), 7);
});

test("el máximo por ronda no pasa de los intentos (cada relevo gasta un intento)", () => {
  assert.equal(maxRelaysPerRound(5), 5);
  assert.equal(maxRelaysPerRound(1), 1);
});

const ALT1 = { total: 3, perRound: 1, lifeline: false };
const ALT2 = { total: 3, perRound: 1, lifeline: true };
const ronda = (extra = {}) => ({ attempted: { A: false, B: false }, relaysThisRound: { A: 0, B: 0 }, sub: { A: null, B: null }, ...extra });

test("Alternativo 1: el relevo se pide antes de responder; el 2.º de la ronda o sin relevos es 'de más'", () => {
  assert.deepEqual(relayStatus({ round: ronda(), side: "A", left: 3, rules: ALT1, attemptsLeft: Infinity }), { status: "ok", usesTotal: true });
  assert.equal(relayStatus({ round: ronda({ attempted: { A: true, B: false } }), side: "A", left: 3, rules: ALT1, attemptsLeft: Infinity }).status, "blocked");
  // si un equipo ya respondió y falló, el otro todavía puede pedir relevo
  assert.equal(relayStatus({ round: ronda({ attempted: { A: true, B: false } }), side: "B", left: 3, rules: ALT1, attemptsLeft: Infinity }).status, "ok");
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 2, rules: ALT1, attemptsLeft: Infinity }), { status: "extra", reason: "round" });
  assert.deepEqual(relayStatus({ round: ronda(), side: "A", left: 0, rules: ALT1, attemptsLeft: Infinity }), { status: "extra", reason: "total" });
});

test("Alternativo 2 (comodín): se puede pedir después de fallar y mientras el compañero no responde, pero no sin intentos", () => {
  assert.equal(relayStatus({ round: ronda({ attempted: { A: true, B: false } }), side: "A", left: 3, rules: ALT2, attemptsLeft: 4 }).status, "ok");
  // Carlos todavía no responde: se puede llamar a otro en su lugar (con 1 por ronda, es de más)
  assert.deepEqual(relayStatus({ round: ronda({ sub: { A: "Carlos", B: null }, relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 2, rules: ALT2, attemptsLeft: 4 }), { status: "extra", reason: "round" });
  assert.equal(relayStatus({ round: ronda(), side: "A", left: 3, rules: ALT2, attemptsLeft: 0 }).status, "blocked");
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 2, rules: ALT2, attemptsLeft: 4 }), { status: "extra", reason: "round" });
});

test("relevo de más: el equipo resta la mitad y el rival suma esa misma mitad (×3: −150 y +150)", () => {
  assert.deepEqual(relayPenaltyChanges("A", 3), { A: -150, B: 150 });
  assert.deepEqual(relayPenaltyChanges("B", null), { A: 50, B: -50 });
});

test("conteo (usuario, 04-10-2026): el total se gasta con el primer relevo de la ronda; los siguientes hasta el máximo, no", () => {
  const R = { total: 5, perRound: 3, lifeline: true };
  // 1.º de la ronda: gasta del total
  assert.deepEqual(relayStatus({ round: ronda(), side: "A", left: 5, rules: R, attemptsLeft: 9 }), { status: "ok", usesTotal: true });
  // 2.º y 3.º de la misma ronda: no gastan del total
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 4, rules: R, attemptsLeft: 8 }), { status: "ok", usesTotal: false });
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 2, B: 0 } }), side: "A", left: 4, rules: R, attemptsLeft: 7 }), { status: "ok", usesTotal: false });
  // 4.º: se pasa del máximo por ronda → de más
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 3, B: 0 } }), side: "A", left: 4, rules: R, attemptsLeft: 6 }), { status: "extra", reason: "round" });
  // con 0 en el total y la ronda sin abrir → de más
  assert.deepEqual(relayStatus({ round: ronda(), side: "A", left: 0, rules: R, attemptsLeft: 5 }), { status: "extra", reason: "total" });
  // si gastó el último del total en esta ronda, todavía puede usar los que le faltan en la ronda
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 0, rules: R, attemptsLeft: 5 }), { status: "ok", usesTotal: false });
});

test("relevos que quedan en la ronda (ejemplo del usuario: 5 y 3, usa 2 → le queda 1 en la ronda)", () => {
  assert.equal(relaysLeftThisRound(0, 5, 3), 3);
  assert.equal(relaysLeftThisRound(2, 4, 3), 1);
  assert.equal(relaysLeftThisRound(0, 0, 3), 0);
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

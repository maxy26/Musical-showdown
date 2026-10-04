import test from "node:test";
import assert from "node:assert/strict";

import {
  relayRules, adjustRelays, relayStatus, relayPenaltyChanges, relayUsesTotal, maxRelaysPerRound, RELAYS_PER_TEAM,
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

test("el máximo por ronda no pasa del total ni de los intentos", () => {
  assert.equal(maxRelaysPerRound(3, 5), 3);
  assert.equal(maxRelaysPerRound(7, 4), 4);
  assert.equal(maxRelaysPerRound(0, 5), 1);
});

const ALT1 = { total: 3, perRound: 1, lifeline: false };
const ALT2 = { total: 3, perRound: 1, lifeline: true };
const ronda = (extra = {}) => ({ attempted: { A: false, B: false }, relaysThisRound: { A: 0, B: 0 }, sub: { A: null, B: null }, ...extra });

test("Alternativo 1: el relevo se pide antes de responder; el 2.º de la ronda o sin relevos es 'de más'", () => {
  assert.equal(relayStatus({ round: ronda(), side: "A", left: 3, rules: ALT1, attemptsLeft: Infinity }).status, "ok");
  assert.equal(relayStatus({ round: ronda({ attempted: { A: true, B: false } }), side: "A", left: 3, rules: ALT1, attemptsLeft: Infinity }).status, "blocked");
  // si un equipo ya respondió y falló, el otro todavía puede pedir relevo
  assert.equal(relayStatus({ round: ronda({ attempted: { A: true, B: false } }), side: "B", left: 3, rules: ALT1, attemptsLeft: Infinity }).status, "ok");
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 2, rules: ALT1, attemptsLeft: Infinity }), { status: "extra", reason: "round" });
  assert.deepEqual(relayStatus({ round: ronda(), side: "A", left: 0, rules: ALT1, attemptsLeft: Infinity }), { status: "extra", reason: "total" });
});

test("Alternativo 2 (comodín): se puede pedir después de fallar, no mientras el compañero no responde ni sin intentos", () => {
  assert.equal(relayStatus({ round: ronda({ attempted: { A: true, B: false } }), side: "A", left: 3, rules: ALT2, attemptsLeft: 4 }).status, "ok");
  assert.equal(relayStatus({ round: ronda({ sub: { A: "Carlos", B: null } }), side: "A", left: 3, rules: ALT2, attemptsLeft: 4 }).status, "blocked");
  assert.equal(relayStatus({ round: ronda(), side: "A", left: 3, rules: ALT2, attemptsLeft: 0 }).status, "blocked");
  assert.deepEqual(relayStatus({ round: ronda({ relaysThisRound: { A: 1, B: 0 } }), side: "A", left: 2, rules: ALT2, attemptsLeft: 4 }), { status: "extra", reason: "round" });
});

test("relevo de más: el equipo resta la mitad y el rival suma esa misma mitad (×3: −150 y +150)", () => {
  assert.deepEqual(relayPenaltyChanges("A", 3), { A: -150, B: 150 });
  assert.deepEqual(relayPenaltyChanges("B", null), { A: 50, B: -50 });
});

test("solo el relevo normal gasta del total; el de más ya se pagó con puntos", () => {
  assert.equal(relayUsesTotal("ok"), true);
  assert.equal(relayUsesTotal("extra"), false);
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

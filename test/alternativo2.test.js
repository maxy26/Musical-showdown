import test from "node:test";
import assert from "node:assert/strict";

import { state, resetState } from "../src/js/state.js";
import { useRelay, relayCheck, attemptsLeft, currentSinger } from "../src/js/gameLogic.js";

// Alternativo 2 – relevo comodín (reglas del usuario, 03-10-2026; CONTEXTO, sección 3).
// Se arma una ronda a mano porque startNextRound() necesita la pantalla.

function setupRound({ alt2 = {}, relays = 3, multiplier = 3 } = {}) {
  resetState();
  Object.assign(state.config, { mode: "alternativo2", battleType: "grupal", alt2: { ...state.config.alt2, ...alt2 } });
  state.groups = [{ players: ["Ana", "Carlos", "Dani"], customName: "" }, { players: ["Eva", "Fede"], customName: "" }];
  state.scores = { "Equipo 1": 1000, "Equipo 2": 1000 };
  state.relays = { "Equipo 1": relays, "Equipo 2": relays };
  state.round = {
    participantA: "Equipo 1", participantB: "Equipo 2", showA: "Ana", showB: "Eva", groupA: 0, groupB: 1,
    multiplier, attemptsUsed: { A: 0, B: 0 }, attempted: { A: false, B: false },
    relaysThisRound: { A: 0, B: 0 }, sub: { A: null, B: null },
  };
}

test("relevo normal: el compañero responde por Ana, gasta un relevo y no hay penalización", () => {
  setupRound();
  assert.equal(relayCheck("A").status, "ok");
  const penalty = useRelay("A", "Carlos");
  assert.equal(penalty, null);
  assert.equal(currentSinger("A"), "Carlos");
  assert.equal(state.relays["Equipo 1"], 2);
  assert.deepEqual(state.scores, { "Equipo 1": 1000, "Equipo 2": 1000 });
  // mientras Carlos no responde, no se puede pedir otro
  assert.equal(relayCheck("A").status, "blocked");
});

test("si el compañero falla, el turno vuelve a Ana y el 2.º relevo de la ronda es 'de más': −mitad y +mitad, sin gastar del total", () => {
  setupRound({ multiplier: 3 }); // ronda ×3: vale 300, la mitad es 150
  useRelay("A", "Carlos");
  // Carlos falla (lo que hace resolveAnswer): gasta un intento y vuelve Ana
  state.round.attemptsUsed.A = 1;
  state.round.sub.A = null;
  assert.equal(currentSinger("A"), "Ana");
  assert.equal(attemptsLeft("A"), 4);
  assert.deepEqual(relayCheck("A"), { status: "extra", reason: "round" });
  const penalty = useRelay("A", "Carlos"); // puede volver a llamar al mismo
  assert.deepEqual(penalty.map((p) => p.delta), [-150, 150]);
  assert.deepEqual(state.scores, { "Equipo 1": 850, "Equipo 2": 1150 });
  assert.equal(state.relays["Equipo 1"], 2, "el de más no gasta del total");
  assert.equal(currentSinger("A"), "Carlos", "la ronda sigue y Carlos responde");
});

test("sin relevos en el total también se puede usar, con la misma penalización", () => {
  setupRound({ relays: 0, multiplier: null }); // ronda sin multiplicador: vale 100
  assert.deepEqual(relayCheck("A"), { status: "extra", reason: "total" });
  useRelay("A", "Dani");
  assert.deepEqual(state.scores, { "Equipo 1": 950, "Equipo 2": 1050 });
  assert.equal(state.relays["Equipo 1"], 0);
});

test("sin intentos no se puede pedir relevo (cada relevo gasta un intento)", () => {
  setupRound({ alt2: { attempts: 2 } });
  state.round.attemptsUsed.A = 2;
  assert.equal(attemptsLeft("A"), 0);
  assert.equal(relayCheck("A").status, "blocked");
});

test("con 0 relevos elegidos no hay relevo en la partida", () => {
  setupRound({ alt2: { relaysTotal: 0 } });
  assert.equal(relayCheck("A").status, "blocked");
});

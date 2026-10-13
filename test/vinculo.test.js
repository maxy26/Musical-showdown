import test from "node:test";
import assert from "node:assert/strict";

import { state, resetState } from "../src/js/state.js";
import { textoQR, leerQR, armarEstado, nuevoCodigo, codigoLegible, limpiarCodigo, copiaDePartida } from "../src/js/vinculo.js";

// Partida en dos dispositivos (12-10-2026): el QR de la PC, el código de
// vinculación, lo que la PC le manda al celular y la partida que pasa a la PC.

test("el QR de la PC es un enlace (lo abre la cámara del celular) y se lee igual en el juego", () => {
  const datos = { ips: ["192.168.1.5", "10.0.0.3"], puerto: 47821, codigo: "042713" };
  const qr = textoQR(datos);
  assert.ok(qr.startsWith("https://maxy26.github.io/Musical-showdown/vincular/?"), "la dirección del AndroidManifest");
  assert.deepEqual(leerQR(qr), datos);
});

test("un QR que no es de Musical Showdown (o está incompleto) no sirve", () => {
  assert.equal(leerQR("https://www.youtube.com"), null);
  assert.equal(leerQR("https://maxy26.github.io/Musical-showdown/vincular/?ips=&p=47821&c=123456"), null);
  assert.equal(leerQR("https://maxy26.github.io/Musical-showdown/vincular/?ips=192.168.1.5&p=47821&c=1234"), null);
  assert.equal(leerQR(""), null);
});

test("el código: 6 números, se muestra en dos partes y se acepta con espacios", () => {
  const c = nuevoCodigo();
  assert.match(c, /^\d{6}$/);
  assert.notEqual(nuevoCodigo(c), c, "cada código nuevo es distinto del anterior");
  assert.equal(codigoLegible("482913"), "482 913");
  assert.equal(limpiarCodigo(" 482 913 "), "482913");
  assert.equal(limpiarCodigo("4829"), null);
});

test("la partida que pasa del celular a la PC va completa, sin el reloj del celular", () => {
  rondaIndividual();
  state.round.timerId = 77;
  const copia = copiaDePartida();
  assert.equal(copia.round.timerId, null);
  assert.equal(copia.round.word, "amor");
  assert.deepEqual(copia.scores, { Ana: 200, Beto: 100 });
  assert.equal(state.round.timerId, 77, "no toca la partida del celular");
});
function rondaIndividual() {
  resetState();
  Object.assign(state.config, { mode: "alternativo1", battleType: "individual", roundTime: 30, genres: ["pop"] });
  state.scores = { Ana: 200, Beto: 100 };
  state.round = {
    participantA: "Ana", participantB: "Beto", groupA: null, groupB: null, word: "amor", multiplier: 1,
    phase: "counting", timeLeft: 12, paused: false, attemptsUsed: { A: 0, B: 0 }, attempted: { A: false, B: false },
    sub: { A: null, B: null },
  };
  state.screen = "round";
}

test("en la ronda, el celular recibe los dos jugadores, sus puntos, el tiempo y la palabra", () => {
  rondaIndividual();
  const e = armarEstado();
  assert.equal(e.tipo, "estado");
  assert.equal(e.pantalla, "round");
  assert.equal(e.tiempo, 12);
  assert.equal(e.palabra, "amor");
  assert.deepEqual(e.generos, ["pop"]);
  assert.equal(e.A.nombre, "Ana");
  assert.equal(e.A.puntos, 200);
  assert.equal(e.A.puede, true);
  assert.equal(e.B.puede, true);
  assert.equal(e.A.relevos, null, "Individual: sin relevos");
});

test("con una ventana abierta en la PC (pausa u otra), los botones del celular no se pueden tocar", () => {
  rondaIndividual();
  const e = armarEstado("pausa");
  assert.equal(e.ventana, "pausa");
  assert.equal(e.A.puede, false);
  assert.equal(e.B.puede, false);
});

test("mientras alguien canta, el celular sabe quién es", () => {
  rondaIndividual();
  state.screen = "verify";
  state.round.selected = "B";
  assert.deepEqual(armarEstado().canta, { lado: "B", nombre: "Beto" });
});

test("fuera de la partida solo va la pantalla; en el podio, el ganador", () => {
  resetState();
  state.screen = "config";
  assert.deepEqual(armarEstado(), { tipo: "estado", pantalla: "config", ventana: null, modo: "clasico", batalla: "individual" });
  state.screen = "results";
  state.winner = "Ana";
  assert.equal(armarEstado().ganador, "Ana");
});

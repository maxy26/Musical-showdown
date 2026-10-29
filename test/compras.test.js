import test from "node:test";
import assert from "node:assert/strict";

import { tieneCompra, ordenarPlanes, textoPeriodo, textoPrueba, _reiniciarPremium } from "../src/js/compras.js";
import { modoBloqueado, escuchaCanto, conAnuncios, premiumActivo } from "../src/js/edicion.js";

// Premium (usuario, 13-10-2026): una sola app gratis; la suscripción desbloquea
// Alternativo 2, escuchar el canto y quita los anuncios.

test("sin Premium: Alternativo 2 y la escucha bloqueados, con anuncios en el celular", () => {
  _reiniciarPremium(false);
  assert.equal(tieneCompra("alternativo2"), false);
  assert.equal(modoBloqueado("alternativo2", "completa"), true);
  assert.equal(escuchaCanto("completa"), false);
  assert.equal(conAnuncios("completa", true), true);
});

test("con Premium: todo desbloqueado y sin anuncios", () => {
  _reiniciarPremium(true);
  assert.equal(tieneCompra("alternativo2"), true);
  assert.equal(tieneCompra("voz"), true);
  assert.equal(modoBloqueado("alternativo2", "completa"), false);
  assert.equal(escuchaCanto("completa"), true);
  assert.equal(conAnuncios("completa", true), false);
  assert.equal(tieneCompra("relevos"), true, "Premium deja devolver relevos");
  assert.equal(tieneCompra("otra-cosa"), false, "solo lo que incluye Premium");
  _reiniciarPremium(false);
});

test("los planes: uno por período, con la prueba gratis si hay, primero el mensual", () => {
  const planes = ordenarPlanes([
    { plan: "anual", periodo: "P1Y", precio: "14,99 US$", prueba: "", token: "a" },
    { plan: "mensual", periodo: "P1M", precio: "1,99 US$", prueba: "", token: "m" },
    { plan: "mensual", oferta: "prueba", periodo: "P1M", precio: "1,99 US$", prueba: "P7D", token: "mp" },
  ]);
  assert.deepEqual(planes.map((p) => p.token), ["mp", "a"]);
});

test("textos de los planes", () => {
  assert.equal(textoPeriodo("P1M"), "al mes");
  assert.equal(textoPeriodo("P1Y"), "al año");
  assert.equal(textoPrueba("P7D"), "7 días gratis");
  assert.equal(textoPrueba("P1M"), "1 mes gratis");
  assert.equal(textoPrueba(""), "");
});

test("cómo se ve con Premium: al pagar en la completa, y siempre en la copia personal", () => {
  _reiniciarPremium(false);
  assert.equal(premiumActivo("completa"), false);
  assert.equal(premiumActivo("personal"), true);
  assert.equal(premiumActivo("demo"), false);
  assert.equal(premiumActivo(""), false, "en desarrollo, sin insignia");
  _reiniciarPremium(true);
  assert.equal(premiumActivo("completa"), true);
  _reiniciarPremium(false);
});

import test from "node:test";
import assert from "node:assert/strict";

import { esDemo, modoBloqueado, modoOculto, escuchaCanto, conAnuncios } from "../src/js/edicion.js";
import { espacioAnuncio } from "../src/js/anuncios.js";
import { tiendaActual } from "../src/js/tienda.js";

// Ediciones y lo que se cobra (usuario, 13-10-2026):
//   demo     → solo Clásico; Alternativo 1 con candado; Alternativo 2 no aparece; no escucha el canto.
//   completa → gratis; Alternativo 2 y escuchar el canto son de pago; anuncios solo en el celular.
//   ""       → desarrollo y pruebas: todo abierto.

test("demo: solo se juega Clásico, Alternativo 1 se ve con candado y Alternativo 2 no aparece", () => {
  assert.equal(esDemo("demo"), true);
  assert.equal(modoBloqueado("clasico", "demo"), false);
  assert.equal(modoBloqueado("alternativo1", "demo"), true);
  assert.equal(modoOculto("alternativo1", "demo"), false);
  assert.equal(modoOculto("alternativo2", "demo"), true);
  assert.equal(escuchaCanto("demo"), false, "en la demo solo se busca la canción");
  assert.equal(conAnuncios("demo", true), false);
});

test("completa gratis: Alternativo 2 y escuchar el canto son de pago; anuncios solo en el celular", () => {
  assert.equal(modoBloqueado("clasico", "completa"), false);
  assert.equal(modoBloqueado("alternativo1", "completa"), false);
  assert.equal(modoBloqueado("alternativo2", "completa"), true, "todavía no hay compras");
  assert.equal(modoOculto("alternativo2", "completa"), false);
  assert.equal(escuchaCanto("completa"), false);
  assert.equal(conAnuncios("completa", true), true);
  assert.equal(conAnuncios("completa", false), false, "en la PC no hay anuncios");
});

test("desarrollo (src/ sin compilar): todo abierto y sin lugar para anuncios", () => {
  assert.equal(esDemo(""), false);
  for (const modo of ["clasico", "alternativo1", "alternativo2"]) {
    assert.equal(modoBloqueado(modo, ""), false);
    assert.equal(modoOculto(modo, ""), false);
  }
  assert.equal(escuchaCanto(""), true);
  assert.equal(espacioAnuncio("inicio"), "");
});

test("la demo de la tienda, sin su Store ID todavía, sigue enlazando a GitHub", () => {
  assert.equal(tiendaActual("microsoft-demo"), null);
  assert.ok(tiendaActual("microsoft"));
});

test("personal (copia del dueño): todo desbloqueado y sin anuncios", () => {
  for (const modo of ["clasico", "alternativo1", "alternativo2"]) {
    assert.equal(modoBloqueado(modo, "personal"), false);
    assert.equal(modoOculto(modo, "personal"), false);
  }
  assert.equal(escuchaCanto("personal"), true);
  assert.equal(conAnuncios("personal", true), false);
});

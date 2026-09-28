import test from "node:test";
import assert from "node:assert/strict";

import { normalizeText, normalizeForSearch, escapeHtml, highlightWord } from "../src/js/utils.js";
import { state, resetState } from "../src/js/state.js";
import { searchSongs } from "../src/js/screens/verify.js";

// Pruebas del buscador de canciones y del resaltado de la palabra en la letra.

// ---------- normalizeText / normalizeForSearch ----------

test("normalizeText quita mayúsculas, tildes y diéresis", () => {
  assert.equal(normalizeText("CORAZÓN"), "corazon");
  assert.equal(normalizeText("Reír"), "reir");
  assert.equal(normalizeText("pingüino"), "pinguino");
});

test("normalizeText conserva la ñ (año y ano son palabras distintas)", () => {
  assert.equal(normalizeText("AÑO"), "año");
  assert.notEqual(normalizeText("año"), normalizeText("ano"));
  // También con la ñ escrita como n + tilde combinada.
  assert.equal(normalizeText("año"), "año");
});

test("normalizeForSearch ignora signos de puntuación y espacios de más", () => {
  assert.equal(normalizeForSearch("  ¡Hola,   mundo!\n¿Qué tal?  "), "hola mundo que tal");
});

// ---------- escapeHtml ----------

test("escapeHtml escapa los caracteres especiales de HTML", () => {
  assert.equal(escapeHtml(`<b>"a" & 'b'</b>`), "&lt;b&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/b&gt;");
});

// ---------- highlightWord ----------

test("highlightWord resalta solo palabras completas", () => {
  assert.equal(
    highlightWord("amor y amores, mi amor", "amor"),
    "<mark>amor</mark> y amores, mi <mark>amor</mark>"
  );
});

test("highlightWord no distingue mayúsculas ni tildes y conserva el texto original", () => {
  assert.equal(highlightWord("Mi Corazón late", "corazon"), "Mi <mark>Corazón</mark> late");
  assert.equal(highlightWord("mi corazon late", "CORAZÓN"), "mi <mark>corazon</mark> late");
});

test("highlightWord no confunde ñ con n", () => {
  assert.equal(highlightWord("un año y un ano", "año"), "un <mark>año</mark> y un ano");
});

test("highlightWord conserva los saltos de línea y escapa el HTML", () => {
  assert.equal(highlightWord("sol\n<sol>", "sol"), "<mark>sol</mark>\n&lt;<mark>sol</mark>&gt;");
});

test("highlightWord devuelve el texto sin marcas si la palabra no aparece", () => {
  assert.equal(highlightWord("nada por aquí", "cielo"), "nada por aquí");
});

test("highlightWord no falla con palabras que tienen caracteres especiales", () => {
  assert.equal(highlightWord("uno (dos) tres", "(dos)"), "uno (dos) tres");
});

// ---------- searchSongs ----------

test("searchSongs encuentra por fragmento sin tildes ni signos de puntuación", () => {
  resetState();
  state.config.genres = ["pop"];
  // La letra dice "Que estás cansado de andar y de andar".
  const titulos = searchSongs("que estas cansado, de andar").map((s) => s.title);
  assert.ok(titulos.includes("Color Esperanza"));
});

test("searchSongs encuentra un fragmento que en la letra ocupa dos líneas", () => {
  resetState();
  state.config.genres = ["pop"];
  // En la letra, "mirar" termina una línea y "Que estás" empieza la siguiente.
  const titulos = searchSongs("con solo mirar que estas cansado").map((s) => s.title);
  assert.ok(titulos.includes("Color Esperanza"));
});

test("searchSongs encuentra por nombre sin importar mayúsculas", () => {
  resetState();
  state.config.genres = ["pop"];
  assert.ok(searchSongs("COLOR ESPERANZA").length >= 1);
});

test("searchSongs solo busca en los géneros elegidos", () => {
  resetState();
  state.config.genres = ["balada"];
  assert.deepEqual(searchSongs("color esperanza"), []);
});

test("searchSongs devuelve una lista vacía si la búsqueda está vacía o solo tiene signos", () => {
  resetState();
  assert.deepEqual(searchSongs(""), []);
  assert.deepEqual(searchSongs("  ¿?, "), []);
});

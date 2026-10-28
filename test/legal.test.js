// Política de privacidad y términos (28-10-2026): qué página abre Ajustes según el
// idioma y que la versión española (docs/privacidad) y la inglesa (docs/privacy)
// sigan teniendo la misma estructura.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { paginaLegal } from "../src/js/plataforma.js";

const leer = (ruta) => readFileSync(new URL(`../docs/${ruta}/index.html`, import.meta.url), "utf8");

test("Ajustes abre la página en el idioma del dispositivo", () => {
  assert.equal(paginaLegal("", "es-CO"), "https://maxy26.github.io/Musical-showdown/privacidad/");
  assert.equal(paginaLegal("parte-2", "es"), "https://maxy26.github.io/Musical-showdown/privacidad/#parte-2");
  assert.equal(paginaLegal("", "en-US"), "https://maxy26.github.io/Musical-showdown/privacy/");
  assert.equal(paginaLegal("parte-2", "pt-BR"), "https://maxy26.github.io/Musical-showdown/privacy/#parte-2");
  assert.equal(paginaLegal("", ""), "https://maxy26.github.io/Musical-showdown/privacidad/");
});

test("la página en español y la inglesa tienen las mismas secciones, enlaces y fecha", () => {
  const es = leer("privacidad"), en = leer("privacy");
  const ids = (h) => [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids(en), ids(es), "mismos id (secciones y anclas)");
  const externos = (h) => [...h.matchAll(/href="(https?:[^"]+|mailto:[^"]+)"/g)].map((m) => m[1].replace(/[?&]hl=\w+/, "").replace("/es/", "/en/")).sort();
  assert.deepEqual(externos(en), externos(es), "mismos enlaces externos");
  const tablas = (h) => (h.match(/<tr>/g) || []).length;
  assert.equal(tablas(en), tablas(es));
  // La fecha de "Última actualización" / "Last updated" es la misma (27 de octubre de 2026).
  assert.match(es, /27 de octubre de 2026/);
  assert.match(en, /October 27, 2026/);
});

test("cada página enlaza a la otra", () => {
  assert.match(leer("privacidad"), /href="\.\.\/privacy\/"/);
  assert.match(leer("privacy"), /href="\.\.\/privacidad\/"/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { nombreDelArchivo, ENLACE_DESCARGA, TEXTO_COMPARTIR } from "../src/js/compartir.js";

test("el nombre de la imagen lleva fecha y hora (no pisa una anterior)", () => {
  assert.equal(nombreDelArchivo(new Date(2026, 9, 8, 7, 5)), "musical-showdown-podio-2026-10-08-0705.png");
});

test("el texto para compartir lleva el enlace de descargas de GitHub", () => {
  assert.equal(ENLACE_DESCARGA, "https://github.com/maxy26/Musical-showdown/releases");
  assert.ok(TEXTO_COMPARTIR.includes(ENLACE_DESCARGA));
});

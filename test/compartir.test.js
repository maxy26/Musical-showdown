import test from "node:test";
import assert from "node:assert/strict";
import { nombreDelArchivo, ENLACE_DESCARGA, TEXTO_COMPARTIR, lineaDeDescarga } from "../src/js/compartir.js";

test("el nombre de la imagen lleva fecha y hora (no pisa una anterior)", () => {
  assert.equal(nombreDelArchivo(new Date(2026, 9, 8, 7, 5)), "musical-showdown-podio-2026-10-08-0705.png");
});

test("el texto para compartir lleva el enlace de descargas de GitHub", () => {
  assert.equal(ENLACE_DESCARGA, "https://github.com/maxy26/Musical-showdown/releases");
  assert.ok(TEXTO_COMPARTIR.includes(ENLACE_DESCARGA));
});

test("sin enlace (demo de la Store sin Store ID) no manda a descargar por fuera (21-10-2026)", () => {
  assert.equal(lineaDeDescarga(""), "Búscalo gratis en la Microsoft Store");
  assert.ok(!lineaDeDescarga("").includes("github"));
  assert.equal(lineaDeDescarga("https://x.test"), "Descárgalo gratis: https://x.test");
});

test("instalado desde la Microsoft Store: la actualización y el enlace llevan a la tienda (12-10-2026)", async () => {
  const { tiendaActual } = await import("../src/js/tienda.js");
  const { avisoDeVersion } = await import("../src/js/avisos.js");
  assert.equal(tiendaActual(""), null, "desde GitHub, sin tienda");
  const ms = tiendaActual("microsoft");
  assert.equal(ms.enlace, "https://apps.microsoft.com/detail/9PP0CFQWMWKT");
  assert.equal(avisoDeVersion({ tag: "v1.24", tienda: ms }).boton.url, ms.enlace);
  assert.match(avisoDeVersion({ tag: "v1.24" }).boton.url, /github\.com/, "sin tienda sigue yendo a GitHub");
});

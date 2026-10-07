import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { compararVersiones, fechaRelativa, avisosDeVersiones, avisosDelArchivo, unirAvisos } from "../src/js/avisos.js";

test("compararVersiones entiende 1.10 > 1.9 y la v del comienzo", () => {
  assert.ok(compararVersiones("1.10", "1.9") > 0);
  assert.ok(compararVersiones("v1.8", "1.7") > 0);
  assert.equal(compararVersiones("v1.7", "1.7"), 0);
  assert.ok(compararVersiones("1.6.2", "1.7") < 0);
});

test("fechaRelativa: hoy, ayer, días, semanas y meses", () => {
  const hoy = new Date(2026, 9, 7);
  assert.equal(fechaRelativa("2026-10-07", hoy), "Hoy");
  assert.equal(fechaRelativa("2026-10-06", hoy), "Ayer");
  assert.equal(fechaRelativa("2026-10-04", hoy), "Hace 3 días");
  assert.equal(fechaRelativa("2026-09-30", hoy), "Hace 1 semana");
  assert.equal(fechaRelativa("2026-09-16", hoy), "Hace 3 semanas");
  assert.equal(fechaRelativa("2026-07-01", hoy), "Hace 3 meses");
});

test("solo avisa la versión publicada más nueva que la instalada", () => {
  const releases = [
    { tag_name: "v1.9", published_at: "2026-10-20T10:00:00Z", html_url: "https://x/1.9", body: "Mejoras\nmás" },
    { tag_name: "v1.8", published_at: "2026-10-10T10:00:00Z", html_url: "https://x/1.8", body: "" },
    { tag_name: "v1.6", published_at: "2026-10-01T10:00:00Z", html_url: "https://x/1.6" },
  ];
  const avisos = avisosDeVersiones(releases, "1.7");
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].titulo, "Versión 1.9 disponible");
  assert.equal(avisos[0].texto, "Mejoras");
  assert.equal(avisos[0].boton.url, "https://x/1.9");
  assert.deepEqual(avisosDeVersiones(releases, "1.9"), []);
  assert.deepEqual(avisosDeVersiones({ message: "Not Found" }, "1.7"), []);
});

test("avisos del archivo: descarta los incompletos y ordena por fecha", () => {
  const lista = avisosDelArchivo([
    { id: "a", tipo: "novedad", fecha: "2026-10-01", titulo: "Viejo" },
    { id: "b", tipo: "promo", fecha: "2026-10-05", titulo: "Nuevo", boton: { texto: "Ir", url: "https://y" } },
    { id: "c", tipo: "otro", fecha: "2026-10-05", titulo: "Tipo desconocido" },
    { tipo: "novedad", fecha: "2026-10-05", titulo: "Sin id" },
  ]);
  assert.deepEqual(unirAvisos(lista).map((a) => a.id), ["b", "a"]);
  assert.equal(lista.find((a) => a.id === "a").boton, null);
});

test("el archivo avisos/avisos.json del repositorio es válido", () => {
  const archivo = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "avisos", "avisos.json"), "utf8"));
  assert.equal(avisosDelArchivo(archivo).length, archivo.length, "hay avisos incompletos en avisos.json");
});

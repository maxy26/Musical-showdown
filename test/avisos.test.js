import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { compararVersiones, fechaRelativa, avisosDeVersiones, avisosDelArchivo, unirAvisos, avisosNuevos, importantesNuevos, MINUTOS_REVISION,
  avisoDeVersion, avisoRecibido, unirConRecibidos, HORAS_RECIBIDOS } from "../src/js/avisos.js";

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
  // Notas con títulos de Markdown: se usa la primera línea de texto
  const conTitulos = avisosDeVersiones([{ tag_name: "v2.0", published_at: "2026-11-01T00:00:00Z", html_url: "u",
    body: "## What's Changed\n* **Sonidos** nuevos" }], "1.8");
  assert.equal(conTitulos[0].texto, "Sonidos nuevos");
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

test("importantes: las actualizaciones siempre; los del archivo solo con importante: true", () => {
  assert.equal(avisosDeVersiones([{ tag_name: "v2.0", published_at: "2026-11-01T00:00:00Z", html_url: "u" }], "1.0")[0].importante, true);
  const lista = avisosDelArchivo([
    { id: "a", tipo: "novedad", fecha: "2026-10-01", titulo: "Normal" },
    { id: "b", tipo: "promo", fecha: "2026-10-05", titulo: "Importante", importante: true },
    { id: "c", tipo: "promo", fecha: "2026-10-05", titulo: "Texto en vez de sí", importante: "true" },
  ]);
  assert.deepEqual(lista.map((a) => a.importante), [false, true, false]);
});

test("importantesNuevos: cada aviso importante se envía una sola vez", () => {
  const a = { id: "a", tipo: "novedad", fecha: "2026-10-01", titulo: "A", importante: true };
  const b = { id: "b", tipo: "promo", fecha: "2026-10-05", titulo: "B" };
  assert.deepEqual(importantesNuevos([], [a, b]).map((x) => x.id), ["a"]);
  assert.deepEqual(importantesNuevos([a], [a, b]), []); // ya se envió
  assert.deepEqual(importantesNuevos([a, b], [a, { ...b, importante: true }]).map((x) => x.id), ["b"]); // pasó a importante
  assert.deepEqual(importantesNuevos([a], [{ ...a, titulo: "A corregido" }]), []); // corregir el texto no lo reenvía
});

test("aviso de versión: el de la notificación tiene el mismo id que el de la campana", () => {
  const deGitHub = avisosDeVersiones([{ tag_name: "v1.19", published_at: "2026-10-12T00:00:00Z", html_url: "https://x/1.19" }], "1.18")[0];
  const deNotificacion = avisoDeVersion({ tag: "v1.19", fecha: "2026-10-12T05:00:00Z" });
  assert.equal(deNotificacion.id, deGitHub.id);
  assert.equal(deNotificacion.titulo, "Versión 1.19 disponible");
  assert.equal(deNotificacion.boton.url, "https://github.com/maxy26/Musical-showdown/releases/tag/v1.19");
});

test("avisoRecibido: lee el aviso que trae la notificación y descarta lo que no sirve", () => {
  const datos = JSON.stringify({ id: "x", tipo: "promo", fecha: "2026-10-11", titulo: "Hola", boton: { texto: "Ir", url: "https://y" } });
  const a = avisoRecibido(datos);
  assert.equal(a.id, "x");
  assert.equal(a.boton.url, "https://y");
  assert.equal(a.importante, true);
  assert.equal(avisoRecibido("no es json"), null);
  assert.equal(avisoRecibido(JSON.stringify({ id: "x", tipo: "otro", fecha: "2026-10-11", titulo: "T" })), null);
  assert.equal(avisoRecibido(JSON.stringify({ tipo: "promo", fecha: "2026-10-11", titulo: "Sin id" })), null);
});

test("unirConRecibidos: suma los recibidos que todavía valen, sin repetir", () => {
  const ahora = Date.parse("2026-10-11T12:00:00Z");
  const hora = 3600 * 1000;
  const github = [{ id: "a", tipo: "novedad", fecha: "2026-10-10", titulo: "A" }];
  const recibidos = [
    { aviso: { id: "b", tipo: "promo", fecha: "2026-10-11", titulo: "B" }, recibido: ahora - hora },
    { aviso: { id: "a", tipo: "novedad", fecha: "2026-10-10", titulo: "A" }, recibido: ahora - hora }, // ya está
    { aviso: { id: "c", tipo: "promo", fecha: "2026-10-09", titulo: "Viejo" }, recibido: ahora - (HORAS_RECIBIDOS + 1) * hora },
    { aviso: avisoDeVersion({ tag: "v1.18", fecha: "2026-10-11" }), recibido: ahora - hora }, // ya instalada
    { aviso: avisoDeVersion({ tag: "v1.19", fecha: "2026-10-11" }), recibido: ahora - hora },
  ];
  const ids = unirConRecibidos(github, recibidos, "1.18", ahora).map((x) => x.id);
  assert.deepEqual(ids.sort(), ["a", "b", "version-v1.19"]);
  assert.equal(unirConRecibidos(github, [], "1.18", ahora), github);
});

test("avisosNuevos: solo los sin leer que no estaban antes", () => {
  assert.deepEqual(avisosNuevos(["a"], ["a", "b"]), ["b"]);
  assert.deepEqual(avisosNuevos(["a", "b"], ["b"]), []);
  assert.deepEqual(avisosNuevos([], []), []);
});

test("la revisión no supera el límite gratis de GitHub (60 consultas por hora)", () => {
  assert.ok(60 / MINUTOS_REVISION <= 30, "cada revisión consulta las versiones una vez");
});

// Búsqueda de canciones: sugerencia para completar y lo que se busca en YouTube (screens/verify.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { sugerencia, textoParaYoutube, urlYoutube } from "../src/js/screens/verify.js";

const DESPACITO = { title: "Despacito", artist: "Luis Fonsi" };
const AMOR = { title: "Amor Eterno", artist: "Rocío Dúrcal" };

test("sugerencia: si el nombre empieza con lo escrito, lo que falta va en gris", () => {
  assert.deepEqual(sugerencia("des", [DESPACITO]), { cancion: DESPACITO, resto: "pacito" });
  assert.deepEqual(sugerencia("DESPA", [DESPACITO]), { cancion: DESPACITO, resto: "cito" }, "sin importar mayúsculas");
  assert.deepEqual(sugerencia("amor et", [AMOR]), { cancion: AMOR, resto: "erno" });
});

test("sugerencia: si coincide por otra parte, se sugiere debajo (sin resto)", () => {
  assert.deepEqual(sugerencia("eterno", [AMOR]), { cancion: AMOR, resto: null });
});

test("sugerencia: nada si no hay resultados, si no hay texto o si ya está completo", () => {
  assert.equal(sugerencia("des", []), null);
  assert.equal(sugerencia("  ", [DESPACITO]), null);
  assert.equal(sugerencia("despacito", [DESPACITO]), null);
});

test("YouTube: con el nombre exacto de una canción se busca nombre + artista", () => {
  assert.equal(textoParaYoutube("Despacito", [DESPACITO]), "Despacito Luis Fonsi");
  assert.equal(textoParaYoutube("despacito", [DESPACITO]), "Despacito Luis Fonsi");
  assert.equal(textoParaYoutube("des", [DESPACITO]), "des", "incompleto: tal cual");
  assert.equal(urlYoutube("Amor Eterno Rocío Dúrcal"), "https://www.youtube.com/results?search_query=Amor%20Eterno%20Roc%C3%ADo%20D%C3%BArcal");
});

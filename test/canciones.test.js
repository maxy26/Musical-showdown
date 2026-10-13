import test from "node:test";
import assert from "node:assert/strict";

import { SONG_DB, GENRES, genreName, palabrasDe } from "../src/js/data/songs.js";
import { normalizeText } from "../src/js/utils.js";
import { modeName, modesFor } from "../src/js/screens/config/modes.js";

// Revisa que los datos de canciones sean coherentes entre sí. La base actual
// es de ejemplo, pero estas reglas deben cumplirse también con la real.

test("cada canción tiene título, artista, palabra clave, un género válido y nada de letra", () => {
  for (const s of SONG_DB) {
    assert.ok(s.title && s.artist && s.clave, `faltan datos en "${s.title}"`);
    assert.ok(GENRES.includes(s.genre), `"${s.title}" tiene un género desconocido: ${s.genre}`);
    assert.equal("lyric" in s, false, `"${s.title}" no debe guardar la letra (usuario, 12-10-2026)`);
  }
});

test("las palabras están en minúsculas, sin espacios ni repetidas en la misma canción", () => {
  for (const s of SONG_DB) {
    const palabras = palabrasDe(s);
    for (const w of palabras) {
      assert.equal(w, w.toLowerCase(), `"${w}" en "${s.title}" debe ir en minúsculas`);
      assert.ok(!/\s/.test(w), `"${w}" en "${s.title}" debe ser una sola palabra`);
    }
    assert.equal(new Set(palabras).size, palabras.length, `"${s.title}" repite una palabra`);
  }
});

test("las palabras sin tilde que en español la llevan están corregidas", () => {
  // Lista de errores ya encontrados; si vuelven a aparecer, la prueba falla.
  const sinTilde = ["corazon", "razon", "reir", "cancion", "reggaeton", "paso", "perdon", "bote", "titi", "hawai", "musica", "bebe"];
  for (const s of SONG_DB) {
    for (const w of palabrasDe(s)) {
      assert.ok(!sinTilde.includes(w), `"${w}" en "${s.title}" debe llevar tilde`);
    }
  }
});

test("no hay canciones repetidas (mismo nombre y artista)", () => {
  const vistas = new Set();
  for (const s of SONG_DB) {
    const clave = `${normalizeText(s.title)}|${normalizeText(s.artist)}`;
    assert.ok(!vistas.has(clave), `"${s.title}" de ${s.artist} está dos veces`);
    vistas.add(clave);
  }
});
test("normalizeText hace coincidir las palabras con tilde con su versión sin tilde", () => {
  // Así la búsqueda y el resaltado encuentran "corazón" aunque se escriba "corazon".
  assert.equal(normalizeText("corazón"), normalizeText("corazon"));
});

test("modeName muestra el nombre del modo con tilde y espacios", () => {
  assert.equal(modeName("clasico"), "Clásico");
  assert.equal(modeName("alternativo1"), "Alternativo 1");
  assert.equal(modeName("alternativo2"), "Alternativo 2");
});

test("cada género tiene nombre visible con mayúscula inicial (y tilde en Reggaetón)", () => {
  for (const g of GENRES) {
    const nombre = genreName(g);
    assert.notEqual(nombre, g, `el género "${g}" no tiene nombre visible`);
    assert.equal(nombre[0], nombre[0].toUpperCase());
  }
  assert.equal(genreName("reggaeton"), "Reggaetón");
});

test("las etiquetas de los modos usan el mismo nombre que la ronda", () => {
  for (const m of modesFor("grupal")) {
    assert.equal(m.label, `🎮 ${modeName(m.id)}`);
  }
});

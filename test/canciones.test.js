import test from "node:test";
import assert from "node:assert/strict";

import { SONG_DB, GENRES, genreName } from "../src/js/data/songs.js";
import { normalizeText, highlightWord } from "../src/js/utils.js";
import { modeName, modesFor } from "../src/js/screens/config/modes.js";

// Revisa que los datos de canciones sean coherentes entre sí. La base actual
// es de ejemplo, pero estas reglas deben cumplirse también con la real.

test("cada canción tiene título, artista, letra y un género válido", () => {
  for (const s of SONG_DB) {
    assert.ok(s.title && s.artist && s.lyric, `faltan datos en "${s.title}"`);
    assert.ok(GENRES.includes(s.genre), `"${s.title}" tiene un género desconocido: ${s.genre}`);
  }
});

test("cada palabra del coro está escrita igual en words y vale true", () => {
  // gameLogic compara chorusWords con las claves de words de forma exacta: si
  // una lleva tilde y la otra no, la palabra pierde su peso extra sin avisar.
  for (const s of SONG_DB) {
    for (const w of s.chorusWords) {
      assert.equal(s.words[w], true, `"${w}" del coro de "${s.title}" no está en words con valor true`);
    }
  }
});

test("las palabras están en minúsculas", () => {
  for (const s of SONG_DB) {
    for (const w of Object.keys(s.words)) {
      assert.equal(w, w.toLowerCase(), `"${w}" en "${s.title}" debe ir en minúsculas`);
    }
  }
});

test("las palabras sin tilde que en español la llevan están corregidas", () => {
  // Lista de errores ya encontrados; si vuelven a aparecer, la prueba falla.
  const sinTilde = ["corazon", "razon", "reir", "cancion"];
  for (const s of SONG_DB) {
    for (const w of Object.keys(s.words)) {
      assert.ok(!sinTilde.includes(w), `"${w}" en "${s.title}" debe llevar tilde`);
    }
  }
});

test(
  "cada palabra que se puede pedir aparece en la letra guardada de su canción",
  { todo: "pendiente: las letras de ejemplo son fragmentos cortos (ver PENDIENTES.md)" },
  () => {
    for (const s of SONG_DB) {
      for (const w of Object.keys(s.words).filter((k) => s.words[k])) {
        assert.ok(highlightWord(s.lyric, w).includes("<mark>"),
          `"${w}" no aparece en la letra de "${s.title}"`);
      }
    }
  }
);

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

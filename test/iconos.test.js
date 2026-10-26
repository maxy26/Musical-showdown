// Íconos de Material Design en lugar de los emojis (src/js/iconosEmoji.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { EMOJI_A_ICONO, iconoDe } from "../src/js/iconosEmoji.js";
import { ICONOS_MATERIAL } from "../src/js/iconosMaterial.js";

const EMOJI = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;

function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "lib" ? [] : archivos(p);
    return /\.(js|html)$/.test(e.name) ? [p] : [];
  });
}

test("Cada emoji tiene un ícono que existe", () => {
  for (const [emoji, [nombre]] of Object.entries(EMOJI_A_ICONO)) {
    assert.ok(ICONOS_MATERIAL[nombre], `${emoji} → ${nombre} no está en iconosMaterial.js`);
  }
});

test("Ningún emoji de las pantallas se queda sin ícono", () => {
  const sinIcono = new Set();
  for (const archivo of archivos("src")) {
    if (archivo.endsWith("compartir.js")) continue; // el texto para compartir (WhatsApp) va con emojis
    for (const linea of fs.readFileSync(archivo, "utf8").split("\n")) {
      if (/^\s*(\/\/|\*|\/\*)/.test(linea)) continue; // comentarios
      for (const [emoji] of linea.matchAll(EMOJI)) if (!iconoDe(emoji)) sinIcono.add(`${emoji} (${archivo})`);
    }
  }
  assert.deepEqual([...sinIcono], []);
});

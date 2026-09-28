import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Verifica que la lista ASSETS de src/sw.js coincida con los archivos reales
// de src/. Si falta un archivo de la lista, cache.addAll() falla, el service
// worker no se instala y la web deja de funcionar sin conexión sin mostrar
// ningún error (ya pasó cuando config.js se dividió en screens/config/).

const SRC = path.join(import.meta.dirname, "..", "src");

/** Lee las rutas de ASSETS en sw.js, sin el "./" inicial. */
function leerAssets() {
  const sw = fs.readFileSync(path.join(SRC, "sw.js"), "utf8");
  const bloque = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
  assert.ok(bloque, "no se encontró la lista ASSETS en sw.js");
  return [...bloque[1].matchAll(/"\.\/([^"]*)"/g)]
    .map((m) => m[1])
    .filter((ruta) => ruta !== ""); // "./" es la raíz del sitio, no un archivo
}

/** Todos los archivos de src/ (rutas con "/"), excepto el propio sw.js. */
function archivosDeSrc() {
  return fs.readdirSync(SRC, { recursive: true })
    .map((ruta) => ruta.split(path.sep).join("/"))
    .filter((ruta) => fs.statSync(path.join(SRC, ruta)).isFile())
    .filter((ruta) => ruta !== "sw.js");
}

test("cada archivo de ASSETS en sw.js existe en src/", () => {
  const faltantes = leerAssets().filter((ruta) => !fs.existsSync(path.join(SRC, ruta)));
  assert.deepEqual(faltantes, [], `sw.js lista archivos que no existen: ${faltantes.join(", ")}`);
});

test("todo archivo de src/ está en ASSETS de sw.js (para que funcione sin conexión)", () => {
  const assets = new Set(leerAssets());
  const sinListar = archivosDeSrc().filter((ruta) => !assets.has(ruta));
  assert.deepEqual(sinListar, [],
    `Agregar a ASSETS en sw.js (y subir CACHE_NAME): ${sinListar.join(", ")}`);
});

test("ASSETS en sw.js no tiene rutas repetidas", () => {
  const assets = leerAssets();
  const repetidas = assets.filter((ruta, i) => assets.indexOf(ruta) !== i);
  assert.deepEqual(repetidas, []);
});

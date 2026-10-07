import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cuentaValida, ajustarCuenta, CUENTA_MIN, CUENTA_MAX } from "../src/js/settings.js";
import { EFECTOS, MUSICA, TICK, BUCLES } from "../src/js/audio/catalogo.js";

const SRC = path.join(import.meta.dirname, "..", "src");

test("cuenta antes de la ronda: solo No (0) o de 3 a 7 segundos", () => {
  assert.equal(CUENTA_MIN, 3);
  assert.equal(CUENTA_MAX, 7);
  assert.equal(cuentaValida(0), 0);
  assert.equal(cuentaValida(undefined), 0);
  assert.equal(cuentaValida(1), 3); // menos de 3 no se permite
  assert.equal(cuentaValida(5), 5);
  assert.equal(cuentaValida(10), 7); // un valor viejo fuera de rango baja a 7
});

test("cuenta: − desde 3 pasa a No y + desde No pasa a 3; tope en 7", () => {
  assert.equal(ajustarCuenta(3, -1), 0);
  assert.equal(ajustarCuenta(0, -1), 0);
  assert.equal(ajustarCuenta(0, 1), 3);
  assert.equal(ajustarCuenta(4, -1), 3);
  assert.equal(ajustarCuenta(6, 1), 7);
  assert.equal(ajustarCuenta(7, 1), 7);
});

test("todos los archivos de sonido y música existen en src/", () => {
  const archivos = new Set([
    ...Object.values(EFECTOS).flat().map((n) => n.f),
    ...Object.values(MUSICA),
    ...TICK,
  ]);
  const faltan = [...archivos].filter((f) => !fs.existsSync(path.join(SRC, f)));
  assert.deepEqual(faltan, []);
});

test("cada efecto tiene al menos una nota con archivo", () => {
  for (const [id, notas] of Object.entries(EFECTOS)) {
    assert.ok(Array.isArray(notas) && notas.length > 0, id);
    for (const n of notas) assert.ok(typeof n.f === "string" && n.f.length > 0, id);
  }
});

test("el bucle sin corte de la música de la ronda está dentro de la canción", () => {
  const [ini, fin] = BUCLES[MUSICA.ronda];
  assert.ok(ini >= 0.3 && fin > ini + 10); // el cruce de 0,3 s necesita espacio antes del comienzo
});

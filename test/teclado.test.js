import { test } from "node:test";
import assert from "node:assert/strict";
import { vecinoEn } from "../src/js/teclado.js";

// Cuadrícula de prueba: dos filas de tres botones y uno ancho abajo
//   [0] [1] [2]
//   [3] [4] [5]
//   [   6     ]
const caja = (x, y, w = 80, h = 40) => ({ x, y, w, h });
const CAJAS = [
  caja(0, 0), caja(100, 0), caja(200, 0),
  caja(0, 60), caja(100, 60), caja(200, 60),
  caja(0, 120, 280),
];
const desde = (i, dir) => vecinoEn(dir, CAJAS[i], CAJAS);

test("las flechas van al control de ese lado", () => {
  assert.equal(desde(4, "arriba"), 1);
  assert.equal(desde(4, "abajo"), 6);
  assert.equal(desde(4, "izquierda"), 3);
  assert.equal(desde(4, "derecha"), 5);
});

test("hacia arriba o abajo se prefiere el control alineado", () => {
  assert.equal(desde(2, "abajo"), 5);
  assert.equal(desde(6, "arriba"), 4); // el del medio, el más centrado
});

test("en el borde no hay a dónde ir (-1)", () => {
  assert.equal(desde(0, "arriba"), -1);
  assert.equal(desde(0, "izquierda"), -1);
  assert.equal(desde(5, "derecha"), -1);
  assert.equal(desde(6, "abajo"), -1);
});

test("← → solo van a lo que está en la misma línea", () => {
  const cajas = [caja(0, 0), caja(200, 100)]; // el segundo está a la derecha pero más abajo
  assert.equal(vecinoEn("derecha", cajas[0], cajas), -1);
  assert.equal(vecinoEn("abajo", cajas[0], cajas), 1);
});

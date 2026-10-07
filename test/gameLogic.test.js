import test from "node:test";
import assert from "node:assert/strict";

import { weightedPick } from "../src/js/utils.js";
import { countTypedPlayers, duplicateNameIndexes, cleanName, minPlayerRows, padPlayers, fitPlayers } from "../src/js/screens/config/players.js";
import { formatCustomTime, isPresetTarget, isPresetTime } from "../src/js/screens/config/presets.js";
import { clampStep, wheelValues, snapIndex } from "../src/js/screens/config/valuePicker.js";

test("countTypedPlayers ignora espacios en blanco y campos vacíos", () => {
  assert.equal(countTypedPlayers(["", "  ", "Ana", "Beto", ""]), 2);
  assert.equal(countTypedPlayers([]), 0);
  assert.equal(countTypedPlayers(["Ana", "Beto", "Caro", "Deni"]), 4);
});

test("duplicateNameIndexes marca todos los nombres repetidos y no cuenta los vacíos", () => {
  assert.deepEqual([...duplicateNameIndexes(["Ana", "Beto", "Ana"])].sort(), [0, 2]);
  assert.deepEqual([...duplicateNameIndexes(["Ana ", " Ana", "Ana  Ruiz", "Ana Ruiz"])].sort(), [0, 1, 2, 3]);
  assert.equal(duplicateNameIndexes(["", "", "Ana", "Beto"]).size, 0);
  assert.equal(duplicateNameIndexes(["Ángel", "Angel"]).size, 0); // con y sin tilde son distintos
});

test("cleanName quita espacios sobrantes", () => {
  assert.equal(cleanName("  Mike   Ruiz "), "Mike Ruiz");
});

test("formatCustomTime da el texto esperado en cada caso", () => {
  assert.equal(formatCustomTime(0), "Sin tiempo");
  assert.equal(formatCustomTime(45), "45 seg");
  assert.equal(formatCustomTime(60), "1 min");
  assert.equal(formatCustomTime(90), "1 min 30 seg");
  assert.equal(formatCustomTime(120), "2 min (máximo)");
});

test("isPresetTarget e isPresetTime reconocen los valores predeterminados", () => {
  assert.equal(isPresetTarget(2000), true);
  assert.equal(isPresetTarget(2100), false);
  assert.equal(isPresetTime(30), true);
  assert.equal(isPresetTime(60), true);
  assert.equal(isPresetTime(95), false);
});

test("clampStep respeta los límites y el paso del puntaje y del tiempo", () => {
  // Puntaje: de 100 a 9900, de 100 en 100.
  assert.equal(clampStep(3450, 100, 9900, 100), 3500);
  assert.equal(clampStep(0, 100, 9900, 100), 100);
  assert.equal(clampStep(12000, 100, 9900, 100), 9900);
  // Tiempo: de 5 seg a 2 min, de 5 en 5 (0:00 sería "Sin tiempo").
  assert.equal(clampStep(0, 5, 120, 5), 5);
  assert.equal(clampStep(150, 5, 120, 5), 120);
  assert.equal(clampStep(87, 5, 120, 5), 85);
});

test("wheelValues arma las filas de la rueda con las reglas de puntaje y tiempo", () => {
  const puntaje = wheelValues(100, 9900, 100);
  assert.equal(puntaje.length, 99);
  assert.equal(puntaje[0], 100);
  assert.equal(puntaje.at(-1), 9900);
  const tiempo = wheelValues(5, 120, 5);
  assert.equal(tiempo.length, 24);
  assert.deepEqual([tiempo[0], tiempo.at(-1)], [5, 120]);
});

test("snapIndex detiene la rueda en una fila entera, con impulso y sin salirse", () => {
  assert.equal(snapIndex(10.3, 0, 99), 10); // sin impulso: la fila más cercana
  assert.equal(snapIndex(10.3, 0.005, 99), 10); // arrastre lento: tampoco sigue girando
  assert.ok(snapIndex(10, 0.05, 99) > 10); // lanzada hacia arriba: sigue girando
  assert.ok(snapIndex(10, -0.05, 99) < 10); // lanzada hacia abajo
  assert.equal(snapIndex(97, 0.06, 99), 98); // no pasa de la última fila
  assert.equal(snapIndex(1, -0.06, 99), 0); // ni de la primera
});

test("weightedPick siempre devuelve un elemento válido de la lista", () => {
  const items = ["a", "b", "c"];
  for (let i = 0; i < 50; i++) {
    assert.ok(items.includes(weightedPick(items, [1, 1, 1])));
  }
});

test("weightedPick nunca elige un elemento con peso 0", () => {
  const items = ["nunca", "siempre"];
  for (let i = 0; i < 100; i++) {
    assert.equal(weightedPick(items, [0, 1]), "siempre");
  }
});

test("Grupal empieza con 4 espacios de jugador e Individual con 2 (usuario, 04-10-2026)", () => {
  assert.equal(minPlayerRows("individual"), 2);
  assert.equal(minPlayerRows("grupal"), 4);
  assert.deepEqual(padPlayers(["", ""], "grupal"), ["", "", "", ""]);
  assert.deepEqual(padPlayers(["Ana", "Luis"], "grupal"), ["Ana", "Luis", "", ""]);
  assert.deepEqual(padPlayers(["Ana", "Luis", "Eva", "Mario", "Sofía"], "grupal"), ["Ana", "Luis", "Eva", "Mario", "Sofía"]);
  assert.deepEqual(padPlayers(["", ""], "individual"), ["", ""]);
  // Al volver de Grupal a Individual se quitan los espacios vacíos de más
  assert.deepEqual(fitPlayers(["", "", "", ""], "individual"), ["", ""]);
  assert.deepEqual(fitPlayers(["Ana", "", "", ""], "individual"), ["Ana", ""]);
  assert.deepEqual(fitPlayers(["Ana", "", "Luis", ""], "individual"), ["Ana", "Luis"]);
  assert.deepEqual(fitPlayers(["Ana", "Luis", "Eva"], "individual"), ["Ana", "Luis", "Eva"]);
  assert.deepEqual(fitPlayers(["Ana", ""], "grupal"), ["Ana", "", "", ""]);
});

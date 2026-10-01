// Pruebas de la pantalla de inicio rediseñada (01-10-2026): las preferencias
// guardadas (Animaciones Sí/No) y qué modos se pueden elegir en cada tipo de
// batalla. Solo partes sin pantalla (sin DOM).
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadSettings } from "../src/js/settings.js";
import { modeAllowed } from "../src/js/screens/modesManual.js";

/** Almacenamiento falso con la misma forma que localStorage. */
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

test("las animaciones están encendidas por defecto", () => {
  assert.equal(loadSettings(fakeStorage()).animations, true);
});

test("se respeta la preferencia guardada de apagar las animaciones", () => {
  const storage = fakeStorage({ "musical-showdown:ajustes": JSON.stringify({ animations: false }) });
  assert.equal(loadSettings(storage).animations, false);
});

test("si lo guardado está dañado o no hay almacenamiento, se usan las predeterminadas", () => {
  assert.equal(loadSettings(fakeStorage({ "musical-showdown:ajustes": "{no es json" })).animations, true);
  assert.equal(loadSettings(undefined).animations, true);
  const broken = { getItem: () => { throw new Error("bloqueado"); } };
  assert.equal(loadSettings(broken).animations, true);
});

test("los tres tipos de sonido están encendidos por defecto y se apagan por separado", () => {
  const d = loadSettings(fakeStorage());
  assert.deepEqual([d.music, d.effects, d.clock], [true, true, true]);
  const storage = fakeStorage({ "musical-showdown:ajustes": JSON.stringify({ music: false }) });
  const s = loadSettings(storage);
  assert.deepEqual([s.music, s.effects, s.clock, s.animations], [false, true, true, true]);
});

test("Alternativo 2 solo se puede elegir en Grupal", () => {
  assert.equal(modeAllowed("alternativo2", "individual"), false);
  assert.equal(modeAllowed("alternativo2", "grupal"), true);
});

test("Clásico y Alternativo 1 se pueden elegir en los dos tipos de batalla", () => {
  for (const battle of ["individual", "grupal"]) {
    assert.equal(modeAllowed("clasico", battle), true);
    assert.equal(modeAllowed("alternativo1", battle), true);
  }
});

#!/usr/bin/env node
/**
 * Copia personal del dueño del juego (usuario, 13-10-2026): la misma versión
 * con todo desbloqueado (Alternativo 2, escuchar el canto, sin anuncios ni
 * Premium). **No se publica ni se comparte.**
 *   npm run build:personal
 *     -> dist/personal/Musical Showdown (personal).exe
 *     -> dist/personal/MusicalShowdown-personal.apk (firmado con la clave del proyecto:
 *        se instala encima de la versión normal del celular)
 * Después hay que volver a compilar la versión normal (build:desktop / build:apk)
 * antes de publicar: las dos usan las mismas carpetas www/.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist", "personal");
const ANDROID = path.join(ROOT, "platforms", "android", "android");
const run = (cmd, cwd = ROOT) => { console.log(`\n$ ${cmd}`); execSync(cmd, { cwd, stdio: "inherit" }); };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log("== PC (personal) ==");
run("node build/build-desktop.js --personal");
fs.copyFileSync(path.join(ROOT, "dist", "windows-personal", "Musical Showdown.exe"), path.join(OUT, "Musical Showdown (personal).exe"));
fs.rmSync(path.join(ROOT, "dist", "windows-personal"), { recursive: true, force: true });

console.log("== Android (personal) ==");
run("node build/build-android.js --personal");
const gradlew = path.join(ANDROID, process.platform === "win32" ? "gradlew.bat" : "gradlew");
run(`"${gradlew}" assembleRelease`, ANDROID);
fs.copyFileSync(path.join(ANDROID, "app", "build", "outputs", "apk", "release", "app-release.apk"), path.join(OUT, "MusicalShowdown-personal.apk"));

console.log("\n✔ Listo: dist/personal/ (Musical Showdown (personal).exe y MusicalShowdown-personal.apk)");

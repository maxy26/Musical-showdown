#!/usr/bin/env node
/**
 * Compila la versión de escritorio a partir de src/.
 * Uso (desde la raíz del repo):
 *   npm run build:desktop   -> Windows: dist/windows/Musical Showdown.exe
 *   npm run build:linux     -> Linux:   dist/linux/Musical-Showdown.AppImage
 *
 * Ambas salidas son un solo archivo que se abre sin instalar. La versión de
 * Linux conviene compilarla en Linux (por ejemplo, en GitHub Actions).
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { stampBuild } = require("./stamp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DESKTOP = path.join(ROOT, "platforms", "desktop");
const WWW = path.join(DESKTOP, "www");
const RAW_OUT = path.join(ROOT, "dist", ".desktop-raw");

// Cada destino: bandera de electron-builder, archivo que genera (definido
// en "artifactName" de platforms/desktop/package.json) y carpeta final.
const TARGETS = {
  windows: { flag: "--win", file: "Musical Showdown.exe" },
  linux: { flag: "--linux", file: "Musical-Showdown.AppImage" },
};
const targetName = process.argv.includes("--linux") ? "linux" : "windows";
const target = TARGETS[targetName];
const FINAL_OUT = path.join(ROOT, "dist", targetName);

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

console.log("== 1/4: copiando src/ -> platforms/desktop/www ==");
fs.rmSync(WWW, { recursive: true, force: true });
fs.cpSync(SRC, WWW, { recursive: true });
// Versión visible y caché del service worker únicos por compilación (build/stamp.js).
stampBuild(WWW, targetName === "linux" ? "PC Linux" : "PC Windows");

console.log("== 2/4: empaquetando los módulos JS en un solo bundle ==");
// Se usa npx (y no "node_modules/.bin/...") porque en Windows execSync
// corre en cmd.exe, que no entiende la "/" de esa ruta.
run(`npx esbuild www/js/main.js --bundle --outfile=www/bundle.js --format=iife`, DESKTOP);
const indexPath = path.join(WWW, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html.replace('<script type="module" src="js/main.js"></script>', '<script src="bundle.js"></script>');
fs.writeFileSync(indexPath, html);

console.log(`== 3/4: compilando con electron-builder (${targetName}) ==`);
fs.rmSync(RAW_OUT, { recursive: true, force: true });
run(`npx electron-builder ${target.flag} --x64`, DESKTOP);

console.log(`== 4/4: copiando el resultado a dist/${targetName} ==`);
fs.rmSync(FINAL_OUT, { recursive: true, force: true });
fs.mkdirSync(FINAL_OUT, { recursive: true });
fs.copyFileSync(path.join(RAW_OUT, target.file), path.join(FINAL_OUT, target.file));
fs.rmSync(RAW_OUT, { recursive: true, force: true });

console.log(`\n✔ Listo: dist/${targetName}/${target.file}`);

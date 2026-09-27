#!/usr/bin/env node
/**
 * Compila la versión de escritorio (Windows) a partir de src/.
 * Uso: npm run build:desktop   (desde la raíz del repo)
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DESKTOP = path.join(ROOT, "platforms", "desktop");
const WWW = path.join(DESKTOP, "www");
// Destino "portable": electron-builder genera un solo .exe que se abre con
// doble clic, sin instalar y sin archivos sueltos al lado.
const RAW_EXE = path.join(ROOT, "dist", ".desktop-raw", "Musical Showdown.exe");
const FINAL_OUT = path.join(ROOT, "dist", "windows");

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

console.log("== 1/4: copiando src/ -> platforms/desktop/www ==");
fs.rmSync(WWW, { recursive: true, force: true });
fs.cpSync(SRC, WWW, { recursive: true });

console.log("== 2/4: empaquetando los módulos JS en un solo bundle ==");
// Se usa npx (y no "node_modules/.bin/...") porque en Windows execSync
// corre en cmd.exe, que no entiende la "/" de esa ruta.
run(`npx esbuild www/js/main.js --bundle --outfile=www/bundle.js --format=iife`, DESKTOP);
const indexPath = path.join(WWW, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html.replace('<script type="module" src="js/main.js"></script>', '<script src="bundle.js"></script>');
fs.writeFileSync(indexPath, html);

console.log("== 3/4: compilando con electron-builder ==");
fs.rmSync(path.join(ROOT, "dist", ".desktop-raw"), { recursive: true, force: true });
run(`npx electron-builder --win --x64`, DESKTOP);

console.log("== 4/4: copiando el resultado a dist/windows ==");
fs.rmSync(FINAL_OUT, { recursive: true, force: true });
fs.mkdirSync(FINAL_OUT, { recursive: true });
fs.copyFileSync(RAW_EXE, path.join(FINAL_OUT, "Musical Showdown.exe"));
fs.rmSync(path.join(ROOT, "dist", ".desktop-raw"), { recursive: true, force: true });

console.log(`\n✔ Listo: dist/windows/Musical Showdown.exe`);

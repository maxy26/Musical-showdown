#!/usr/bin/env node
/**
 * Compila la versión de escritorio a partir de src/.
 * Uso (desde la raíz del repo):
 *   npm run build:desktop   -> Windows: dist/windows/Musical Showdown.exe
 *   npm run build:linux     -> Linux:   dist/linux/Musical-Showdown.AppImage
 *   npm run build:store-windows -> Microsoft Store: dist/store/Musical Showdown.appx
 *     (paquete MSIX/APPX que firma la Store; identidad en
 *     platforms/desktop/tienda-microsoft.json, ver TIENDAS.md)
 *
 * Ambas salidas son un solo archivo que se abre sin instalar. La versión de
 * Linux conviene compilarla en Linux (por ejemplo, en GitHub Actions).
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { stampBuild, androidVersion } = require("./stamp");

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
  store: { flag: "--win appx", file: "Musical Showdown.appx" },
};
const targetName = process.argv.includes("--linux") ? "linux" : process.argv.includes("--store") ? "store" : "windows";
const target = TARGETS[targetName];
// --demo: la demo gratis (solo Clásico jugable, Alternativo 1 con candado, sin escuchar el canto; src/js/edicion.js)
const demo = process.argv.includes("--demo");
// --personal: copia del dueño con todo desbloqueado (no se publica)
const personal = process.argv.includes("--personal");
const FINAL_OUT = path.join(ROOT, "dist", demo ? `${targetName}-demo` : personal ? `${targetName}-personal` : targetName);

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

console.log("== 1/4: copiando src/ -> platforms/desktop/www ==");
fs.rmSync(WWW, { recursive: true, force: true });
fs.cpSync(SRC, WWW, { recursive: true });
// Versión visible y caché del service worker únicos por compilación (build/stamp.js).
stampBuild(WWW, { linux: "PC Linux", store: "Microsoft Store", windows: "PC Windows" }[targetName] + (demo ? " (demo)" : personal ? " (personal)" : ""),
  { tienda: targetName === "store" ? (demo ? "microsoft-demo" : "microsoft") : "", edicion: demo ? "demo" : personal ? "personal" : "completa" }); // tienda.js y edicion.js

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
// Microsoft Store: la identidad del paquete la da Partner Center (no es secreta).
// Sin el archivo se usan datos de prueba: el paquete sirve para revisar, no para subir.
let identidad = "";
// La demo no escucha ni se vincula: sin micrófono ni red local (usuario, 21-10-2026).
// Por consola (-c) no se puede cambiar una lista, así que va en un archivo aparte.
let DEMO_APPX = "";
if (demo && targetName === "store") {
  const config = JSON.parse(fs.readFileSync(path.join(DESKTOP, "package.json"), "utf8")).build;
  config.appx = { ...config.appx, displayName: "Musical Showdown Demo", capabilities: ["runFullTrust", "internetClient"] };
  const archivoConfig = path.join(require("os").tmpdir(), "musical-showdown-demo-builder.json");
  fs.writeFileSync(archivoConfig, JSON.stringify(config));
  DEMO_APPX = ` --config "${archivoConfig}"`;
}
if (targetName === "store") {
  // La demo es otro producto de la Store, con su propia identidad
  const archivo = path.join(DESKTOP, demo ? "tienda-microsoft-demo.json" : "tienda-microsoft.json");
  const datos = fs.existsSync(archivo)
    ? JSON.parse(fs.readFileSync(archivo, "utf8"))
    : { identityName: "MusicalShowdown.Prueba", publisher: "CN=MusicalShowdownPrueba", publisherDisplayName: "Musical Showdown" };
  if (!fs.existsSync(archivo)) console.warn("⚠ Sin platforms/desktop/tienda-microsoft.json: paquete de PRUEBA (no se puede subir a la Store).");
  // La Store pide una versión mayor en cada envío: la misma del juego (1.23 → 1.23.0)
  identidad = ` -c.appx.identityName="${datos.identityName}" -c.appx.publisher="${datos.publisher}" -c.appx.publisherDisplayName="${datos.publisherDisplayName}" -c.extraMetadata.version=${androidVersion().name}.0${demo ? DEMO_APPX : ""}`;
}
// La copia personal se descomprime en otra carpeta: así puede abrirse junto a la normal
const carpeta = personal ? ' -c.portable.unpackDirName=MusicalShowdownPersonal' : "";
run(`npx electron-builder ${target.flag} --x64${identidad}${carpeta}`, DESKTOP);

console.log(`== 4/4: copiando el resultado a dist/${targetName} ==`);
fs.rmSync(FINAL_OUT, { recursive: true, force: true });
fs.mkdirSync(FINAL_OUT, { recursive: true });
fs.copyFileSync(path.join(RAW_OUT, target.file), path.join(FINAL_OUT, target.file));
fs.rmSync(RAW_OUT, { recursive: true, force: true });

console.log(`\n✔ Listo: dist/${path.basename(FINAL_OUT)}/${target.file}`);

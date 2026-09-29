#!/usr/bin/env node
/**
 * Sincroniza src/ dentro del proyecto Android y lo deja listo para abrir
 * en Android Studio y generar el .apk.
 * Uso (desde la raíz del repo):
 *   npm run build:android   -> deja el proyecto listo para Android Studio
 *   npm run build:apk       -> además genera dist/android/Musical-Showdown.apk
 *
 * IMPORTANTE: "npx cap sync" regenera capacitor.settings.gradle apuntando
 * a node_modules/@capacitor/android/capacitor, una carpeta que NO viaja en
 * las entregas del proyecto. Este script copia esa carpeta dentro de
 * android/capacitor-android y corrige la ruta automáticamente cada vez,
 * para que ese error (ya nos costó varias vueltas) no vuelva a aparecer.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ANDROID_PROJ = path.join(ROOT, "platforms", "android");
const WWW = path.join(ANDROID_PROJ, "www");
const ANDROID_NATIVE = path.join(ANDROID_PROJ, "android");

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

console.log("== 1/4: copiando src/ -> platforms/android/www ==");
fs.rmSync(WWW, { recursive: true, force: true });
fs.cpSync(SRC, WWW, { recursive: true });

console.log("== 2/4: empaquetando los módulos JS en un solo bundle ==");
// Se usa npx (y no "node_modules/.bin/...") porque en Windows execSync
// corre en cmd.exe, que no entiende la "/" de esa ruta.
run(`npx esbuild www/js/main.js --bundle --outfile=www/bundle.js --format=iife`, ANDROID_PROJ);
const indexPath = path.join(WWW, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html.replace('<script type="module" src="js/main.js"></script>', '<script src="bundle.js"></script>');
fs.writeFileSync(indexPath, html);

console.log("== 3/4: sincronizando con el proyecto Android nativo (npx cap sync) ==");
run(`npx cap sync android`, ANDROID_PROJ);

console.log("== 4/4: corrigiendo la referencia a capacitor-android (ver comentario arriba) ==");
const capacitorAndroidSrc = path.join(ANDROID_PROJ, "node_modules", "@capacitor", "android", "capacitor");
const capacitorAndroidDest = path.join(ANDROID_NATIVE, "capacitor-android");
fs.rmSync(capacitorAndroidDest, { recursive: true, force: true });
fs.cpSync(capacitorAndroidSrc, capacitorAndroidDest, { recursive: true });

const settingsPath = path.join(ANDROID_NATIVE, "capacitor.settings.gradle");
let settings = fs.readFileSync(settingsPath, "utf8");
settings = settings.replace(
  /project\(':capacitor-android'\)\.projectDir = new File\('.*?'\)/,
  "project(':capacitor-android').projectDir = new File('./capacitor-android')"
);
fs.writeFileSync(settingsPath, settings);

if (!process.argv.includes("--apk")) {
  console.log(`\n✔ Listo. Abre platforms/android/android en Android Studio y genera el APK`);
  console.log(`  (Build → Generate App Bundles or APKs → Generate APKs),`);
  console.log(`  o usa "npm run build:apk" para generarlo sin abrir Android Studio.`);
  process.exit(0);
}

// --apk: genera el APK con Gradle y lo deja en dist/android. Requiere Java 17+
// y el SDK de Android (el que instala Android Studio; su ruta va en
// android/local.properties). Es un APK con firma de depuración: sirve para
// instalarlo directamente en un teléfono, no para la Play Store.
console.log("== 5/5: generando el APK con Gradle ==");
// Ruta completa: algunas consolas de Windows no buscan programas en la carpeta actual.
const gradlew = path.join(ANDROID_NATIVE, process.platform === "win32" ? "gradlew.bat" : "gradlew");
run(`"${gradlew}" assembleDebug --no-daemon`, ANDROID_NATIVE);
const apkOut = path.join(ROOT, "dist", "android");
fs.rmSync(apkOut, { recursive: true, force: true });
fs.mkdirSync(apkOut, { recursive: true });
fs.copyFileSync(
  path.join(ANDROID_NATIVE, "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
  path.join(apkOut, "Musical-Showdown.apk")
);
console.log(`\n✔ Listo: dist/android/Musical-Showdown.apk`);

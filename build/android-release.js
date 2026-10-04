#!/usr/bin/env node
/**
 * npm run android:release — APK de Android limpio, con versión nueva y firma fija.
 *
 *   1. Borra todo lo generado antes: www/, los archivos copiados a la app,
 *      las carpetas build/ de Gradle y los APK anteriores de dist/.
 *      Nunca borra la clave de firma (platforms/android/keystore/) ni src/.
 *   2. Sube versionCode en 1 (y versionName = 1.<versionCode − 1>) en
 *      platforms/android/android/app/build.gradle.
 *   3. Copia src/, marca la versión y la caché (build/stamp.js), empaqueta,
 *      hace "cap sync" y corrige capacitor-android (build-android.js).
 *   4. Crea la clave de firma la primera vez (keytool) y compila limpio con
 *      Gradle (clean assembleRelease), firmando siempre con esa clave.
 *   5. Deja el APK en dist/MusicalShowdown-v<versión>.apk y comprueba su
 *      versionCode y su firma.
 *
 * Requiere Java 17 y el SDK de Android (ver CLAUDE.md).
 */
const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { androidVersion, APP_GRADLE } = require("./stamp");

const ROOT = path.join(__dirname, "..");
const ANDROID_PROJ = path.join(ROOT, "platforms", "android");
const ANDROID_NATIVE = path.join(ANDROID_PROJ, "android");
const KEYSTORE_DIR = path.join(ANDROID_PROJ, "keystore");
const KEYSTORE_PROPS = path.join(KEYSTORE_DIR, "keystore.properties");
const DIST = path.join(ROOT, "dist");

function run(cmd, cwd, env, secret) {
  console.log(`\n$ ${secret ? cmd.split(secret).join("******") : cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
}
function output(cmd) {
  return execSync(cmd, { encoding: "utf8" });
}
/** Busca un programa de Java (keytool) o del SDK de Android (aapt, apksigner). */
function javaTool(name) {
  const exe = process.platform === "win32" ? `${name}.exe` : name;
  const homes = [process.env.JAVA_HOME, "C:/Program Files/Java/jdk-17"].filter(Boolean);
  for (const h of homes) {
    const p = path.join(h, "bin", exe);
    if (fs.existsSync(p)) return p;
  }
  return name; // que lo busque en el PATH
}
function sdkTool(name) {
  const local = fs.readFileSync(path.join(ANDROID_NATIVE, "local.properties"), "utf8");
  const sdk = (local.match(/sdk\.dir=(.*)/) || [])[1].trim().replace(/\\\\/g, "\\").replace(/\\:/g, ":");
  const versions = fs.readdirSync(path.join(sdk, "build-tools")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const dir = path.join(sdk, "build-tools", versions[versions.length - 1]);
  const exe = process.platform === "win32" ? (name === "apksigner" ? "apksigner.bat" : `${name}.exe`) : name;
  return path.join(dir, exe);
}

// ---------- 1. Borrar todo lo generado antes ----------
console.log("== 1/5: borrando compilaciones, archivos copiados y APK anteriores ==");
const toDelete = [
  path.join(ANDROID_PROJ, "www"),
  path.join(ANDROID_NATIVE, "app", "src", "main", "assets", "public"),
  path.join(ANDROID_NATIVE, "app", "build"),
  path.join(ANDROID_NATIVE, "build"),
  path.join(ANDROID_NATIVE, "capacitor-android", "build"),
  path.join(ANDROID_NATIVE, "capacitor-cordova-android-plugins", "build"),
  path.join(ANDROID_NATIVE, ".gradle"),
  path.join(DIST, "android"),
];
for (const p of toDelete) {
  if (p.startsWith(KEYSTORE_DIR) || p.startsWith(path.join(ROOT, "src"))) throw new Error(`No se borra ${p}`);
  fs.rmSync(p, { recursive: true, force: true });
  console.log(`   borrado: ${path.relative(ROOT, p)}`);
}
if (fs.existsSync(DIST)) {
  for (const f of fs.readdirSync(DIST).filter((f) => /^MusicalShowdown-v.*\.apk$/.test(f))) {
    fs.rmSync(path.join(DIST, f));
    console.log(`   borrado: dist/${f}`);
  }
}

// ---------- 2. Subir versionCode ----------
console.log("== 2/5: subiendo versionCode ==");
const before = androidVersion();
const newCode = before.code + 1;
const newName = `1.${newCode - 1}`;
let gradle = fs.readFileSync(APP_GRADLE, "utf8");
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${newCode}`).replace(/versionName\s+"[^"]*"/, `versionName "${newName}"`);
fs.writeFileSync(APP_GRADLE, gradle);
console.log(`   versionCode ${before.code} → ${newCode} · versionName "${before.name}" → "${newName}"`);

// ---------- 3. Copiar, marcar, empaquetar, cap sync y corregir capacitor-android ----------
console.log("== 3/5: copiando src/, cap sync y corrigiendo capacitor-android ==");
run(`node "${path.join(__dirname, "build-android.js")}"`, ROOT, { MS_BUILD_LABEL: "Android" });

// ---------- 4. Clave de firma (solo se crea la primera vez) y compilación limpia ----------
console.log("== 4/5: compilando limpio y firmando con la clave del proyecto ==");
if (!fs.existsSync(KEYSTORE_PROPS)) {
  fs.mkdirSync(KEYSTORE_DIR, { recursive: true });
  const password = crypto.randomBytes(18).toString("base64url");
  const storeFile = "musical-showdown.jks";
  run(`"${javaTool("keytool")}" -genkeypair -v -keystore "${path.join(KEYSTORE_DIR, storeFile)}" -alias musicalshowdown ` +
    `-keyalg RSA -keysize 2048 -validity 36500 -storepass ${password} -keypass ${password} ` +
    `-dname "CN=Musical Showdown, O=Musical Showdown, C=CO"`, ROOT, {}, password);
  fs.writeFileSync(KEYSTORE_PROPS,
    `# Clave de firma de Musical Showdown (secreta). Hacer copia de seguridad de esta carpeta:\n` +
    `# si se pierde, las próximas versiones no se podrán instalar encima de las anteriores.\n` +
    `storeFile=${storeFile}\nstorePassword=${password}\nkeyAlias=musicalshowdown\nkeyPassword=${password}\n`);
  console.log("   clave nueva creada en platforms/android/keystore/ (hacer copia de seguridad)");
} else {
  console.log("   usando la clave existente de platforms/android/keystore/");
}
const gradlew = path.join(ANDROID_NATIVE, process.platform === "win32" ? "gradlew.bat" : "gradlew");
run(`"${gradlew}" clean assembleRelease --no-daemon`, ANDROID_NATIVE);

// ---------- 5. Copiar a dist/ y comprobar ----------
console.log("== 5/5: copiando a dist/ y comprobando versión y firma ==");
const built = path.join(ANDROID_NATIVE, "app", "build", "outputs", "apk", "release", "app-release.apk");
if (!fs.existsSync(built)) throw new Error("No se generó app-release.apk (¿falta la firma?)");
fs.mkdirSync(DIST, { recursive: true });
const finalApk = path.join(DIST, `MusicalShowdown-v${newName}.apk`);
fs.copyFileSync(built, finalApk);

const badging = output(`"${sdkTool("aapt")}" dump badging "${finalApk}"`).split("\n")[0];
const apkCode = Number((badging.match(/versionCode='(\d+)'/) || [])[1]);
const certs = output(`"${sdkTool("apksigner")}" verify --print-certs "${finalApk}"`);
const sha = (certs.match(/SHA-256 digest: (\w+)/) || [])[1];
if (!(apkCode > before.code)) throw new Error(`El versionCode del APK (${apkCode}) no es mayor que el anterior (${before.code})`);

console.log(`\n✔ Listo: dist/MusicalShowdown-v${newName}.apk`);
console.log(`   ${badging.trim()}`);
console.log(`   versionCode ${before.code} → ${apkCode} (mayor: sí)`);
console.log(`   firma SHA-256: ${sha}`);

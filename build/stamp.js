/**
 * Marca cada compilación (lo usan build-android.js y build-desktop.js después
 * de copiar src/ a www/):
 *   - www/js/version.js: la versión del juego y la fecha y hora de la
 *     compilación, que se muestran en Ajustes.
 *   - www/sw.js: un nombre de caché único por compilación, para que el service
 *     worker no sirva archivos de una versión anterior (su "activate" borra
 *     las cachés con otro nombre).
 *
 * La versión sale de versionName en platforms/android/android/app/build.gradle
 * (una sola fuente para Android y PC).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APP_GRADLE = path.join(ROOT, "platforms", "android", "android", "app", "build.gradle");

/** versionName y versionCode actuales de Android. */
function androidVersion() {
  const gradle = fs.readFileSync(APP_GRADLE, "utf8");
  return {
    name: (gradle.match(/versionName\s+"([^"]+)"/) || [])[1] || "0",
    code: Number((gradle.match(/versionCode\s+(\d+)/) || [])[1] || 0),
  };
}

const dos = (n) => String(n).padStart(2, "0");

/** Escribe la versión y el nombre de caché únicos en la copia www/. */
function stampBuild(wwwDir, platformLabel) {
  const { name, code } = androidVersion();
  const d = new Date();
  const fecha = `${dos(d.getDate())}-${dos(d.getMonth() + 1)}-${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
  const sello = `${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}${dos(d.getHours())}${dos(d.getMinutes())}${dos(d.getSeconds())}`;

  fs.writeFileSync(path.join(wwwDir, "js", "version.js"),
    `// Generado al compilar (build/stamp.js). No editar: se reescribe en cada build.\n` +
    `export const APP_VERSION = ${JSON.stringify(name)};\n` +
    `export const BUILD_INFO = ${JSON.stringify(`${platformLabel} · ${fecha} · compilación ${code}`)};\n`);

  const swPath = path.join(wwwDir, "sw.js");
  const sw = fs.readFileSync(swPath, "utf8");
  const nuevo = sw.replace(/const CACHE_NAME = "[^"]*";/, `const CACHE_NAME = "musical-showdown-${name}-${sello}";`);
  if (nuevo === sw) throw new Error("build/stamp.js: no se encontró CACHE_NAME en sw.js");
  fs.writeFileSync(swPath, nuevo);

  console.log(`   versión ${name} (código ${code}) · ${platformLabel} · ${fecha} · caché musical-showdown-${name}-${sello}`);
  return { name, code, fecha };
}

module.exports = { androidVersion, stampBuild, APP_GRADLE };

# Pendientes — Musical Showdown

> Lista viva de inconsistencias, bugs, mejoras, implementaciones y
> avances por hacer. Al empezar una conversación, revisar esta lista
> junto con `AUDITORIA-CAMBIOS.md`. Al resolver algo, marcarlo `[x]`,
> anotar la fecha y registrar el cambio en la auditoría. Los resueltos
> se mueven a la sección final.
>
> Prioridad: 🔴 alta · 🟡 media · 🟢 baja

## 🐛 Bugs e inconsistencias

- [ ] 🟢 **El nombre técnico de Android sigue siendo `com.palabracantada.app`**
  (nombre anterior del juego). Renombrarlo es delicado porque afecta
  las rutas de Java. Solo hacerlo si el usuario lo pide
  (contexto, sección 7).

## 🔧 Entorno / herramientas

- [ ] 🟢 **Electron no se puede ejecutar en modo desarrollo**
  (`npx electron .` en `platforms/desktop`). npm 11 bloqueó su script de
  instalación, que descarga el binario. No afecta la compilación. Si hace
  falta, aprobarlo con `npm install-scripts approve electron --prefix
  platforms/desktop` y reinstalar.
- [ ] 🟢 **Aviso de Node al correr el lint:** `eslint.config.js` usa
  `export` pero el `package.json` raíz no declara `"type": "module"`.
  Arreglo sencillo: renombrarlo a `eslint.config.mjs`. No conviene poner
  `"type": "module"` en la raíz, porque los scripts de `build/` usan `require`.
- [ ] 🟢 **`npm audit` reporta vulnerabilidades** en las dependencias de
  desarrollo de `platforms/desktop`. Hay que revisarlas antes de
  aplicar `npm audit fix --force`, porque este puede cambiar versiones
  mayores de Electron o electron-builder.

## 📦 Distribución a otros equipos (objetivo: Windows, Linux y Android)

- [ ] 🔴 **Subir el commit de GitHub Actions (bloqueado).** GitHub rechazó el
  envío porque el token guardado en Windows no tiene el permiso `workflow`,
  que es obligatorio para subir archivos de `.github/workflows/`. Acción del
  usuario: crear un token nuevo con los permisos `repo` y `workflow`, o volver
  a iniciar sesión con el navegador. Después, `git push origin main`.
- [ ] 🔴 **Revisar la primera ejecución de GitHub Actions** (configurado el
  27-09-2026 en `.github/workflows/compilar.yml`). Los trabajos de Linux y
  Android no se han probado nunca, porque no se pueden correr en esta PC.
  Si alguno falla, revisar el registro en la pestaña "Actions" de GitHub.
- [ ] 🟡 **Probar la versión de Linux en un equipo con Linux real.** El
  `.AppImage` sale de GitHub Actions. Para abrirlo: darle permiso de
  ejecución (`chmod +x Musical-Showdown.AppImage`) y hacer doble clic. En
  algunas distribuciones hace falta instalar `libfuse2`.
- [ ] 🟡 **Probar el `.exe` portátil en otra PC con Windows.** En esta PC ya
  se comprobó que abre. El `.exe` se descomprime en una carpeta temporal cada
  vez que se abre, así que puede tardar unos segundos en arrancar.
- [ ] 🟢 **Publicar una versión descargable:** crear y subir una etiqueta
  (por ejemplo, `git tag v1.0.0` y luego `git push origin v1.0.0`). GitHub
  Actions creará una "Release" con los 3 archivos.
- [ ] 🟢 **Windows SmartScreen en otros equipos.** El `.exe` no está firmado,
  así que en otra PC Windows mostrará "Windows protegió su PC" y habrá que
  hacer clic en "Más información → Ejecutar de todas formas". Para quitar el
  aviso hace falta un certificado de firma de código, que cuesta dinero.

## ✨ Mejoras

- [ ] 🟡 **Reemplazar los 2 `confirm()` nativos** por un modal propio,
  del mismo estilo que `showWarning()` en `modals.js`:
  - `src/js/screens/round.js:73`: "¿Desean finalizar esta ronda?"
  - `src/js/screens/teamOrg.js:81`: "¿Confirmar equipos?"
  (El usuario aún no lo pidió explícitamente; contexto, sección 5.)
- [ ] 🟢 **Evitar que la lista `ASSETS` de `sw.js` vuelva a quedar
  desactualizada.** Idea: una prueba en `test/` que verifique que cada
  archivo listado existe y que todo `.js` de `src/js/` esté en la lista.
- [ ] 🟢 **Ampliar las pruebas**: hoy solo cubren 4 funciones puras.
  Candidatas: `pickWeightedWord` y `pickIndividualPair` (requieren
  preparar `state` y `SONG_DB`).

## 🎮 Diseño / implementación pendiente (decisión del usuario)

> No inventar reglas: preguntar antes (instrucción 21).

- [ ] **Reglas de Alternativo 1** (`state.config.mode`, `screens/config/modes.js`).
- [ ] **Reglas de Alternativo 2.**
- [ ] **Rotación grupal exacta por modo.** Hoy `rotateTeamShown` en
  `gameLogic.js` solo manda al participante mostrado al final de su fila.
- [ ] **Cantidad de equipos.** Hoy es fijo en 2, sin manejo especial
  cuando el número de jugadores es impar.
- [ ] **Fuente real de letras** en lugar del mock `data/songs.js`.
  Primero hay que resolver el tema legal (instrucción 22).

---

## ✅ Resueltos

- [x] 2026-09-27: 🔴 Compilación de Windows: con el Modo de desarrollador
  activado, `build:desktop` funciona.
- [x] 2026-09-27: 🟡 Windows en un solo archivo: `dist/windows/` tiene solo
  `Musical Showdown.exe` (75 MB), que abre bien con doble clic.
- [x] 2026-09-27: 🟡 Versión de Linux configurada (`npm run build:linux`,
  AppImage). Se compila en GitHub Actions; falta probarla en un equipo real.
- [x] 2026-09-27: 🟢 GitHub Actions configurado: compila las 3 plataformas.

- [x] 2026-09-27: 🔴 Los scripts de `build/` no funcionaban en Windows
  (`node_modules/.bin/...` en `cmd.exe`). Se cambiaron a `npx`.
- [x] 2026-09-27: 🔴 La compilación de Android fallaba por falta de
  TypeScript. Se agregó `typescript@^5`; la compilación ya funciona.
- [x] 2026-09-27: 🔴 Lint corrido: 0 errores y 0 advertencias.
- [x] 2026-09-27: 🔴 Dependencias de raíz, escritorio y Android instaladas.
- [x] 2026-09-27: 🟡 Commit de la sesión 1 (`a5fa0c3`, hecho por el usuario).
- [x] 2026-09-27: 🟡 Permisos de `gradlew` y de los `.java`: resuelto con
  `core.fileMode=false`.

- [x] 2026-09-26: 🔴 `sw.js` apuntaba a `js/screens/config.js`, que ya no
  existe, y eso rompía la instalación del service worker (modo offline
  de la web). Detalle en la auditoría, sesión 1.

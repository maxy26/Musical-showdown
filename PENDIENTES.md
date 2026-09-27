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

- [ ] 🔴 **La compilación de Windows falla por falta de permisos.**
  electron-builder no puede crear enlaces simbólicos ("Cannot create
  symbolic link: El cliente no dispone de un privilegio requerido").
  Solución (acción del usuario): activar el **Modo de desarrollador** en
  Configuración de Windows → Sistema → Para programadores, o correr
  `npm run build:desktop` en una consola abierta como administrador.
  Nota: el `.exe` actual (21-09-2026) no tiene el arreglo de `sw.js`, pero
  en Electron eso no cambia nada, porque la app se abre con `file://`, donde
  el service worker no se registra.
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

- [ ] 🟡 **No hay versión para Linux.** `build/build-desktop.js` solo compila
  `--win`. Habría que agregar un destino de Linux en electron-builder
  (por ejemplo, un AppImage, que corre sin instalar). Compilarlo desde
  Windows no es confiable; lo normal es hacerlo en Linux o en GitHub Actions.
- [ ] 🟡 **La versión de Windows es una carpeta, no un solo archivo.**
  Con el destino `dir`, `dist/windows/` tiene el `.exe` junto a varias DLL y
  recursos, y hay que compartir la carpeta completa. Opciones: destino
  `portable` (un solo `.exe`) o `nsis` (instalador).
- [ ] 🟢 **Windows SmartScreen en otros equipos.** El `.exe` no está firmado,
  así que en otra PC Windows mostrará "Windows protegió su PC" y habrá que
  hacer clic en "Más información → Ejecutar de todas formas". Para quitar el
  aviso hace falta un certificado de firma de código, que cuesta dinero.
- [ ] 🟢 **Compilar en la nube (opcional).** Con GitHub Actions, el repositorio
  podría compilar Windows, Linux y Android automáticamente, sin depender del
  Modo de desarrollador ni de tener Linux a mano.

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

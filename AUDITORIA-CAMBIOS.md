# Auditoría de cambios — Musical Showdown

> Registro cronológico de cada cambio o ajuste hecho al proyecto con
> Claude Code. Sirve para saber **en qué nos quedamos** al empezar una
> nueva conversación. La entrada más reciente va **arriba**.
>
> Formato de cada entrada: fecha · qué se hizo · archivos tocados ·
> cómo se verificó · qué quedó abierto (con referencia a `PENDIENTES.md`).
>
> El historial anterior a Claude Code (hecho con Claude en el chat) está
> resumido en `CONTEXTO-MUSICAL-SHOWDOWN.md`; el commit base es
> `59438fd` (reestructuración a monorepo).

---

## 2026-09-28 — Sesión 3: prueba automática para la lista de `sw.js`

**Qué se hizo**
- Nuevo archivo `test/sw.test.js` con 3 pruebas sobre la lista `ASSETS`
  de `src/sw.js`:
  1. Cada ruta listada existe en `src/`.
  2. Todo archivo de `src/` (excepto `sw.js`) está en la lista, para que el
     juego funcione completo sin conexión.
  3. No hay rutas repetidas.
- Como `npm test` corre todos los `test/*.test.js`, la prueba también se
  ejecuta en GitHub Actions en cada envío.
- `CLAUDE.md`: se explica qué hace la prueba nueva.
- Nota de la sesión anterior: la revisión en segundo plano de la compilación 3
  de GitHub no encontró la ejecución por un error en su búsqueda y se detuvo
  sin avisar. La compilación sí terminó bien.

**Archivos tocados:** `test/sw.test.js` (nuevo), `CLAUDE.md`,
`AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`. No se tocó `src/`, así que no se
recompiló.

**Verificación**
- `npm test`: 8/8 (5 anteriores + 3 nuevas).
- Se reintrodujo por un momento el bug original en `sw.js` (`config.js` en
  lugar de `config/index.js`): las pruebas fallaron con el mensaje "sw.js lista
  archivos que no existen: js/screens/config.js". Después se restauró
  `sw.js` con `git checkout`.

**Quedó abierto:** nada.

---

## 2026-09-27 — Sesión 2 (parte 5): ventanas de confirmación propias

**Qué se hizo**
1. Nueva función `showConfirm({ title, message, yesText, noText, onYes })`
   en `src/js/screens/modals.js`, con el mismo diseño que "¿Salir de la
   partida?": título, nota opcional y botones "No" (secundario) y "Sí"
   (principal). El foco queda en "No" para que un Enter accidental no
   confirme. Solo reutiliza clases existentes (`modal-backdrop`, `modal`,
   `warning-modal`, `small-note`, `btn-row`, `btn-*`).
2. Se reemplazaron los 2 `confirm()` nativos:
   - `round.js`: "¿Desean finalizar esta ronda?" (No, seguir / Sí, finalizar).
   - `teamOrg.js`: "¿Confirmar equipos?" + "Ya no se podrán mover jugadores
     durante la partida." (No, seguir editando / Sí, confirmar).
3. Se actualizaron `CONTEXTO-MUSICAL-SHOWDOWN.md` (secciones 5 y 8),
   `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` (regla 10) y `CLAUDE.md`.

**Archivos tocados:** `src/js/screens/modals.js`, `src/js/screens/round.js`,
`src/js/screens/teamOrg.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`,
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, `CLAUDE.md`, `AUDITORIA-CAMBIOS.md`,
`PENDIENTES.md`.

**Verificación**
- Ya no queda ningún `confirm()` ni `alert()` nativo en `src/js` (solo aparecen
  en comentarios).
- `npm run lint`: sin errores. `npm test`: 5/5.
- `build:android` y `build:desktop`: ambos bien.
- **Prueba en el navegador real** (Edge sin interfaz, con una página de prueba
  temporal fuera del repositorio que carga el juego y simula los clics): pasaron
  16 de 16 comprobaciones. Se abre la ventana; "No" cierra sin hacer nada; "Sí"
  confirma; en organizar equipos "Sí" inicia la ronda; en una ronda sin tiempo
  "Sí" la finaliza; no se llama ningún `confirm()` nativo.
- Captura de pantalla revisada: la ventana usa el estilo del juego.

**Quedó abierto:** nada.

---

## 2026-09-27 — Sesión 2 (parte 4): token de GitHub y primera compilación en la nube

**Qué se hizo**
1. El primer envío con `.github/workflows/compilar.yml` fue rechazado porque
   el token guardado no tenía el permiso `workflow`. Se subió aparte el commit
   del `.exe` portátil (`76821d1`), que no incluía ese archivo.
2. El usuario creó un token clásico con permisos `repo` y `workflow`. Con su
   autorización se borró la credencial vieja (`cmdkey /delete:git:https://github.com`)
   y se hizo el envío; Windows guardó el token nuevo.
3. Nueva regla de trabajo: yo hago los `git push`, pero pregunto antes de cada uno.

**Verificación: primera ejecución de GitHub Actions**
([run 36349478749](https://github.com/maxy26/Musical-showdown/actions/runs/36349478749)),
commit `66b12d3`:
- Pruebas y lint: bien.
- Windows: bien; `musical-showdown-windows` (75 MB).
- Linux: bien; `musical-showdown-linux` (108 MB).
- Android: bien; `musical-showdown-android` (5 MB).
- Publicar versión: omitido, como corresponde (solo corre con etiquetas `v*`).

**Quedó abierto:** probar la versión de Linux en un equipo real y el APK en un
teléfono (ver pendientes).

---

## 2026-09-27 — Sesión 2 (parte 3): compilación de Windows, Linux y GitHub Actions

**Qué se hizo**
1. El usuario activó el Modo de desarrollador. `npm run build:desktop` ya
   funciona: `dist/windows/` quedó con un solo `Musical Showdown.exe` (75 MB).
   Se abrió y mostró la ventana "Musical Showdown"; luego se cerró.
2. **Versión de Linux:** `build/build-desktop.js` ahora acepta `--linux`
   (script `npm run build:linux`) y genera
   `dist/linux/Musical-Showdown.AppImage`. En `platforms/desktop/package.json`
   se agregó la sección `linux` (destino AppImage, ícono
   `www/icons/icon-512.png`, categoría "Game").
3. **GitHub Actions** (`.github/workflows/compilar.yml`). Corre en cada envío
   a `main`, en cada pull request y a mano. Trabajos:
   - `pruebas`: lint y pruebas.
   - `windows`: genera el `.exe`.
   - `linux`: genera el `.AppImage`.
   - `android`: corre `build:android` y `gradlew assembleDebug` con Java 21 y
     genera `Musical-Showdown.apk` con firma de depuración.
   - `release`: solo al subir etiquetas `v*`; publica una Release con los 3
     archivos.

**Archivos tocados:** `build/build-desktop.js`, `package.json`,
`platforms/desktop/package.json`, `.github/workflows/compilar.yml` (nuevo),
`CLAUDE.md`, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- Compilación de Windows local con el script nuevo: bien.
- `npm test`: 5/5. `npm run lint`: sin errores.
- Los trabajos de Linux y Android no se pudieron probar localmente. Se
  verifican en la primera ejecución de GitHub Actions (ver pendientes).

**Quedó abierto:** revisar el resultado de la primera ejecución en GitHub.

---

## 2026-09-27 — Sesión 2 (parte 2): Windows en un solo `.exe`

**Qué se hizo**
1. Se subieron a GitHub los commits de la sesión 2 y uno con pendientes nuevos
   de distribución: Linux, formato de Windows, SmartScreen y GitHub Actions.
2. Se aclaró con el usuario que el Modo de desarrollador solo hace falta para
   **compilar**, no para **jugar**: el `.exe` corre en cualquier PC sin
   configuración especial.
3. **Windows en un solo archivo:** en `platforms/desktop/package.json` el
   destino pasó de `dir` (una carpeta con el `.exe` y sus DLL) a `portable`
   (un solo `.exe`), con `artifactName: "Musical Showdown.exe"`.
   `build/build-desktop.js` ahora copia solo ese `.exe` a `dist/windows/`.

**Archivos tocados:** `platforms/desktop/package.json`,
`build/build-desktop.js`, `CLAUDE.md`, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- **No se pudo compilar:** falla en el mismo punto, porque el Modo de
  desarrollador sigue desactivado. electron-builder alcanzó a empaquetar la
  aplicación, así que la configuración se leyó bien, pero no llegó a generar
  el `.exe` portátil.
- `dist/windows/` quedó intacta (el script solo la borra si la compilación
  sale bien).

**Quedó abierto:** probar la compilación con el Modo de desarrollador activo
(ver pendientes). Estos cambios no se han subido a GitHub.

---

## 2026-09-27 — Sesión 2: revisión de código, dependencias y compilaciones

**Estado encontrado al empezar**
- El usuario ya había hecho el commit `a5fa0c3` con el trabajo de la sesión 1
  y lo había subido a `origin/main`. La rama local ahora es `main`.
- `core.fileMode=false` ya estaba en `.git/config`, así que git dejó de marcar
  `gradlew` y los `.java` de Android.
- Las dependencias de la raíz ya estaban instaladas. La instalación de la
  sesión 1 se había cortado antes de llegar a las plataformas.

**Qué se hizo**
1. `npm run lint`: 0 errores y 0 advertencias en `src/`. Node muestra un aviso
   aparte sobre el tipo de módulo de `eslint.config.js` (ver pendientes).
2. Se instalaron las dependencias de `platforms/desktop` y `platforms/android`.
   npm 11 bloquea por defecto los scripts de instalación de `esbuild` y
   `electron`. esbuild funciona igual; ver pendientes para Electron.
3. **Arreglo en `build/build-desktop.js` y `build/build-android.js`:** llamaban
   a `node_modules/.bin/<herramienta>` con `execSync`, que en Windows corre en
   `cmd.exe`, y fallaban con "'node_modules' no se reconoce como un comando…".
   Se cambiaron a `npx esbuild`, `npx cap sync android` y
   `npx electron-builder`, que funcionan en Windows y en Linux.
4. **Compilación de Android:** `cap sync` falló porque `capacitor.config.ts`
   necesita TypeScript, que no estaba en las dependencias. Se agregó
   `typescript@^5` como dependencia de desarrollo en `platforms/android`.
   TypeScript 7 no sirve porque Capacitor 6 usa una API que la versión 7 ya no
   tiene (error "Cannot read properties of undefined (reading 'CommonJS')").
   Con eso la compilación de Android terminó bien.
5. **La compilación de Windows NO terminó.** electron-builder falla al
   descomprimir `winCodeSign` con "Cannot create symbolic link: El cliente no
   dispone de un privilegio requerido". Hace falta activar el Modo de
   desarrollador de Windows o compilar como administrador. No se forzó nada.
   `dist/windows/Musical Showdown.exe` sigue siendo el del 21-09-2026.
6. Se agregó `platforms/desktop/package-lock.json`, que no existía, para fijar
   las versiones de Electron y electron-builder.

**Archivos tocados:** `build/build-desktop.js`, `build/build-android.js`,
`platforms/android/package.json`, `platforms/android/package-lock.json`,
`platforms/desktop/package-lock.json` (nuevo), `CLAUDE.md`,
`AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- `npm run lint`: sin errores.
- `npm test`: las 5 pruebas pasan.
- Android: `capacitor-android/build.gradle` existe; `assets/public/bundle.js` es
  del 27-09-2026 y su `sw.js` trae `musical-showdown-v3`;
  `capacitor.settings.gradle` apunta a `./capacitor-android`; la copia
  regenerada de `capacitor-android` no tiene diferencias con la versionada.
- El APK no se generó. Eso se hace a mano en Android Studio.

**Quedó abierto:** la compilación de Windows (requiere acción del usuario). No
se subió a GitHub.

---

## 2026-09-26 — Sesión 1: arranque con Claude Code

**Qué se hizo**
1. Se creó `CLAUDE.md` (en español) con comandos, arquitectura y
   referencias a los documentos de contexto e instrucciones.
2. **Bug corregido en `src/sw.js`**: la lista `ASSETS` del service worker
   todavía apuntaba a `./js/screens/config.js`, que ya no existe (se
   dividió en la carpeta `screens/config/`). Como `cache.addAll()` falla
   completo si falta un solo archivo, el service worker no se instalaba
   y **la versión web no funcionaba sin conexión**.
   - Se reemplazó por los 5 módulos reales de `screens/config/`
     (`index.js`, `players.js`, `modes.js`, `presets.js`, `valueBox.js`).
   - Se subió `CACHE_NAME` de `musical-showdown-v2` a `musical-showdown-v3`
     para que los navegadores descarten la caché vieja.
3. Se crearon `AUDITORIA-CAMBIOS.md` (este archivo) y `PENDIENTES.md`.
4. El usuario agregó `CONTEXTO-MUSICAL-SHOWDOWN.md` e
   `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` (historial y reglas de trabajo de
   las sesiones con Claude en el chat).

**Archivos tocados:** `src/sw.js`, `CLAUDE.md`, `AUDITORIA-CAMBIOS.md`,
`PENDIENTES.md`.

**Verificación**
- Script que confirma que todos los archivos de `ASSETS` existen en
  `src/`: OK, no falta ninguno.
- `npm test`: 5/5 pruebas pasan.
- `npm run lint`: **no se pudo correr** porque `eslint` no está
  instalado en la raíz (falta `npm install`). Ver `PENDIENTES.md`.
- **No** se corrieron `build:desktop` ni `build:android` (según la
  instrucción 3 habría que hacerlo antes de entregar). Ver `PENDIENTES.md`.

**Quedó abierto:** el commit (lo hizo después el usuario: `a5fa0c3`).

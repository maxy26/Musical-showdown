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

## 2026-09-27 — Sesión 2 (continuación): Windows en un solo `.exe`

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Idioma:** responder siempre al usuario en español. El código, los comentarios, los textos de la interfaz y los commits están en español; mantener ese idioma.

## Documentos de seguimiento (leer al iniciar cada conversación)

- `AUDITORIA-CAMBIOS.md`: registro cronológico de cada cambio hecho, con la entrada más reciente arriba. Indica en qué nos quedamos. **Agregar una entrada cada vez que se modifique el proyecto**, con fecha, qué se hizo, archivos tocados, cómo se verificó y qué quedó abierto.
- `PENDIENTES.md`: lista de bugs, inconsistencias, mejoras e implementaciones por hacer, con prioridad. **Agregar cualquier problema que se detecte aunque no se resuelva en el momento.** Al resolver uno, marcarlo `[x]` con la fecha y moverlo a "Resueltos".
- `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`: reglas de trabajo y decisiones ya tomadas que no deben revertirse. Es obligatorio respetarlas.
- `CONTEXTO-MUSICAL-SHOWDOWN.md`: reglas de diseño del juego e historial de lo que se construyó antes de Claude Code.

Reglas clave de las instrucciones:
- Después de tocar `src/`, correr ambos builds.
- No usar `alert()`/`confirm()` nativos nuevos; usar los modales de `modals.js`.
- No poner efectos secundarios en el nivel superior de un módulo (ver la inicialización perezosa de `sound.js`).
- Reutilizar las clases de `css/styles.css` en vez de estilos inline.
- Mantener el service worker en network-first.
- Los sonidos son sintetizados.
- No inventar reglas para Alternativo 1 y 2 ni para la rotación grupal; preguntar antes.

## Proyecto

Musical Showdown es un juego de fiesta/familiar: el sistema muestra una palabra y los jugadores deben cantar cualquier canción que la contenga. Se distribuye como PWA web, `.exe` de Windows (Electron) y app Android (Capacitor).

## Comandos

```bash
npm test                                   # node --test test/*.test.js
node --test --test-name-pattern="weightedPick" test/gameLogic.test.js   # correr una sola prueba
npm run lint                               # eslint src

# Web: archivos estáticos, sin paso de build (los módulos ES requieren servidor HTTP, no file://)
cd src && python3 -m http.server 8000

npm install --prefix platforms/desktop     # solo la primera vez
npm run build:desktop                      # -> dist/windows/Musical Showdown.exe (un solo archivo, destino "portable")

npm install --prefix platforms/android     # solo la primera vez
npm run build:android                      # luego abrir platforms/android/android en Android Studio y generar el APK
```

Particularidades al compilar en Windows:
- Los scripts de `build/` llaman a las herramientas con `npx` y no con `node_modules/.bin/...`, porque `execSync` corre en `cmd.exe` y ahí esa ruta falla.
- `build:desktop` requiere el Modo de desarrollador de Windows (o una consola de administrador), porque electron-builder crea enlaces simbólicos. Esto solo aplica al compilar; el `.exe` generado corre en cualquier PC sin configuración especial.
- `build:android` requiere TypeScript **5** en `platforms/android` para leer `capacitor.config.ts`. TypeScript 7 no es compatible con Capacitor 6.
- npm 11 muestra advertencias de "install-scripts" para esbuild y electron. Se pueden ignorar para compilar.

En desarrollo no hay bundler. El `package.json` raíz no tiene `"type": "module"`, así que las pruebas ESM y los archivos de `src/` dependen de la detección automática de sintaxis ESM de Node.

## Arquitectura

**`src/` es la única fuente de verdad.** `platforms/desktop` (Electron) y `platforms/android` (Capacitor) son envoltorios delgados. No editar código del juego en `platforms/*/www/` ni en `platforms/android/android/app/src/main/assets/public/`: el build los sobrescribe (están en `.gitignore`). Los dos scripts de `build/` siguen los mismos pasos:
1. Copiar `src/` a `platforms/<x>/www`.
2. Empaquetar `www/js/main.js` en `www/bundle.js` con esbuild (IIFE).
3. Reemplazar por texto exacto `<script type="module" src="js/main.js"></script>` en `index.html` con `<script src="bundle.js"></script>`. Si se cambia esa etiqueta en `src/index.html`, el reemplazo deja de funcionar sin avisar.
4. Ejecutar la herramienta de la plataforma (electron-builder o `cap sync`).

`build-android.js` además corrige un problema de Capacitor: `cap sync` apunta `capacitor.settings.gradle` a `node_modules/@capacitor/android/capacitor`, que no se versiona. El script copia esa carpeta a `platforms/android/android/capacitor-android` y reescribe la ruta. Esa copia se regenera en cada build de Android, así que no se edita a mano.

**Juego en tiempo de ejecución (JS puro, sin framework):**
- `state.js` contiene un único objeto global mutable `state` más `resetState()`. Todas las pantallas y `gameLogic.js` lo leen y escriben directamente.
- `router.js` asocia las claves de `state.screen` con funciones que construyen cada pantalla. `render()` vacía `#app` y agrega el resultado de la pantalla actual.
- Para navegar: asignar `state.screen = "<clave>"` y luego llamar a `render()`. Para agregar una pantalla, registrarla en `SCREENS` dentro de `router.js`.
- Cada archivo de `screens/` exporta una función `screenXxx()` que devuelve un nodo DOM. El nodo se crea con `el(cadenaHtml)` de `utils.js`, y los eventos se conectan con `root.querySelector(...).onclick`. La pantalla de configuración está dividida en submódulos dentro de `screens/config/`, coordinados por `index.js`.
- `gameLogic.js` contiene las reglas:
  - La palabra se elige ponderada por las canciones disponibles y aún no usadas, con más peso si está en el coro o si la canción es famosa.
  - En modo individual, el enfrentamiento favorece a los jugadores con menos puntaje.
  - El temporizador avanza con `setInterval`. `updateClockOnly()` actualiza `.clock` directamente en lugar de volver a renderizar.
  - El puntaje es 100 × multiplicador.
  - Las canciones usadas se registran por `songKey` (`titulo|letra`).
- `data/songs.js` (`SONG_DB`) es una base local de ejemplo. Cada canción tiene `words` (mapa de palabra a booleano) y `chorusWords`. Se reemplazará por una fuente real de letras cuando se elija una que se pueda usar legalmente.
- Los comentarios citan secciones de un documento de diseño externo ("diseño, sección N") que no está en el repositorio.

**Service worker (`src/sw.js`):** usa "network-first", con una lista fija de precaché (`ASSETS`) y un `CACHE_NAME` versionado. Al agregar, mover o renombrar archivos en `src/`, actualizar `ASSETS` y subir la versión de `CACHE_NAME`. Si un solo archivo de la lista no existe, `cache.addAll` falla y el SW no se instala: la web deja de funcionar sin conexión, y no aparece ningún error visible. ESLint revisa `sw.js` aparte, como script clásico.

**Pruebas:** importan directamente desde `src/` y solo cubren funciones puras. Los módulos que importan no deben tocar el DOM al cargarse.

Las decisiones de diseño pendientes están en `PENDIENTES.md`.

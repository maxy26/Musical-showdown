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
- No usar `alert()`/`confirm()` nativos; usar `showWarning()` (avisos) y `showConfirm({ title, message, yesText, noText, onYes })` (preguntas sí/no) de `modals.js`.
- No poner efectos secundarios en el nivel superior de un módulo (ver la inicialización perezosa de `sound.js`).
- Reutilizar las clases de `css/styles.css` en vez de estilos inline.
- Mantener el service worker en network-first.
- Los sonidos son grabaciones CC0 (créditos en `src/audio/CREDITOS.txt`); los efectos suenan todos al mismo volumen.
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

npm run build:linux                        # -> dist/linux/Musical-Showdown.AppImage (compilar en Linux o en GitHub Actions)

npm install --prefix platforms/android     # solo la primera vez
npm run build:android                      # deja el proyecto listo para Android Studio
npm run build:apk                          # APK de prueba (firma de depuración): dist/android/Musical-Showdown.apk y Musical-Showdown-v<versión>.apk
npm run android:release                    # APK para instalar en el celular: limpia todo, sube versionCode en 1, firma con la clave del proyecto -> dist/MusicalShowdown-v<versión>.apk
```

**Compilación en la nube:** `.github/workflows/compilar.yml` corre lint y pruebas, y compila Windows (`.exe`), Linux (`.AppImage`) y Android (`.apk`) en cada envío a `main`. El APK sale **firmado con la clave del proyecto** si el repositorio tiene los secretos `ANDROID_KEYSTORE_BASE64` (el `.jks` en base64) y `ANDROID_KEYSTORE_PROPERTIES` (el contenido de `keystore.properties`); si no, con firma de depuración (solo para probar). Los archivos quedan en la sección "Artifacts" de cada ejecución. Al subir una etiqueta `v*` (por ejemplo, `v1.1.0`), además publica una Release con los 3 archivos. Si se cambian los scripts de `build/` o las rutas de salida, actualizar también este archivo de flujo.

Particularidades al compilar en Windows:
- Los scripts de `build/` llaman a las herramientas con `npx` y no con `node_modules/.bin/...`, porque `execSync` corre en `cmd.exe` y ahí esa ruta falla.
- `build:desktop` requiere el Modo de desarrollador de Windows (o una consola de administrador), porque electron-builder crea enlaces simbólicos. Esto solo aplica al compilar; el `.exe` generado corre en cualquier PC sin configuración especial.
- `build:android` requiere TypeScript **5** en `platforms/android` para leer `capacitor.config.ts`. TypeScript 7 no es compatible con Capacitor 6.
- npm 11 muestra advertencias de "install-scripts" para esbuild y electron. Se pueden ignorar para compilar.
- `build:apk` llama a `gradlew.bat` con su ruta completa, porque algunas consolas de Windows no buscan programas en la carpeta actual. En esta PC el SDK está en `%LOCALAPPDATA%\Android\Sdk` (`android/local.properties`) y Java 17 en `C:\Program Files\Java\jdk-17`.
- Para que el usuario vea los cambios: después de cambios de lógica o visuales, compilar (`build:desktop` y `build:apk`) y abrirle el `.exe`. Para recompilar hay que cerrar el juego si está abierto, porque Windows no deja reemplazar un `.exe` en uso.

En desarrollo no hay bundler. El `package.json` raíz no tiene `"type": "module"`, así que las pruebas ESM y los archivos de `src/` dependen de la detección automática de sintaxis ESM de Node.

## Arquitectura

**`src/` es la única fuente de verdad.** `platforms/desktop` (Electron) y `platforms/android` (Capacitor) son envoltorios delgados. No editar código del juego en `platforms/*/www/` ni en `platforms/android/android/app/src/main/assets/public/`: el build los sobrescribe (están en `.gitignore`). Los dos scripts de `build/` siguen los mismos pasos:
1. Copiar `src/` a `platforms/<x>/www`.
2. Empaquetar `www/js/main.js` en `www/bundle.js` con esbuild (IIFE).
3. Reemplazar por texto exacto `<script type="module" src="js/main.js"></script>` en `index.html` con `<script src="bundle.js"></script>`. Si se cambia esa etiqueta en `src/index.html`, el reemplazo deja de funcionar sin avisar.
4. Ejecutar la herramienta de la plataforma (electron-builder o `cap sync`).

**Publicar un APK (`build/android-release.js`, `npm run android:release`):** borra todo lo generado (www/, `assets/public`, carpetas `build/` de Gradle, `.gradle`, APK de `dist/`; nunca `platforms/android/keystore/` ni `src/`), sube `versionCode` en 1 y `versionName` a `1.<versionCode − 1>`, corre `build-android.js` y compila con `gradlew clean assembleRelease`. Firma siempre con la clave del proyecto en `platforms/android/keystore/` (si no la encuentra se detiene sin tocar nada; solo crea una nueva con `npm run android:release -- --nueva-clave`; está en `.gitignore`: **hacer copia de seguridad**, sin ella las versiones nuevas no se pueden instalar encima). Comprueba con `aapt` que el versionCode subió y muestra la huella de la firma. El manifiesto tiene `allowBackup="false"` y `capacitor.config.ts` usa `server.hostname: "musicalshowdown.app"`: así Android no restaura el service worker ni la caché de versiones anteriores al reinstalar (eso hacía que la app mostrara la versión vieja). Los APK de GitHub Actions llevan la misma firma si están los secretos de la clave (ver "Compilación en la nube"); sin ellos, son de prueba.

`build-android.js` además corrige un problema de Capacitor: `cap sync` apunta `capacitor.settings.gradle` a `node_modules/@capacitor/android/capacitor`, que no se versiona. El script copia esa carpeta a `platforms/android/android/capacitor-android` y reescribe la ruta. Esa copia se regenera en cada build de Android, así que no se edita a mano.

**Juego en tiempo de ejecución (JS puro, sin framework):**
- `state.js` contiene un único objeto global mutable `state` más `resetState()`. Todas las pantallas y `gameLogic.js` lo leen y escriben directamente.
- `router.js` asocia las claves de `state.screen` con funciones que construyen cada pantalla. `render()` vacía `#app` y agrega el resultado de la pantalla actual.
- Para navegar: asignar `state.screen = "<clave>"` y luego llamar a `render()`. Para agregar una pantalla, registrarla en `SCREENS` dentro de `router.js`.
- Cada archivo de `screens/` exporta una función `screenXxx()` que devuelve un nodo DOM. El nodo se crea con `el(cadenaHtml)` de `utils.js`, y los eventos se conectan con `root.querySelector(...).onclick`. La pantalla de configuración está dividida en submódulos dentro de `screens/config/`, coordinados por `index.js`.
- `gameLogic.js` contiene las reglas:
  - La palabra se elige ponderada por las canciones de los géneros elegidos, con más peso si está en el coro o si la canción es famosa.
  - Emparejamientos (`pairing.js`, reglas en `CONTEXTO-MUSICAL-SHOWDOWN.md` sección 3): Clásico usa fases al azar / con ventaja según el equilibrio de puntos (60 % del promedio), siempre con equilibrio de partidos; Alternativo 1 sigue un orden fijo que se repite; Alternativo 2 (solo Grupal) empareja los grupos como Clásico y elige a los jugadores en orden como Alternativo 1. Sirven para jugadores y para grupos. Las reglas que cambian por modo (intentos, puntos, multiplicadores, opciones de Alternativo 2) están en `screens/config/modes.js`; el relevo, en `relay.js`. Los grupos del modo Grupal (cantidad, reparto, nombres, quién canta) están en `groups.js`. `resetMatchTracking()` reinicia todo al empezar cada partida.
  - El temporizador avanza con `setInterval`. `updateClockOnly()` actualiza `.clock` directamente en lugar de volver a renderizar.
  - El puntaje es 100 × multiplicador.
  - Las canciones no se bloquean: una ya cantada se puede volver a elegir (decisión del usuario, 01-10-2026).
- Pantalla de inicio (`screens/menu.js`, rediseño del 01-10-2026): ahí se eligen el tipo de batalla y el modo (ya no en "Configurar partida"). Las hojas emergentes usan `screens/sheet.js`. Las luces de fondo están en `index.html`, fuera de `#app`, para que sigan en todas las pantallas.
- Versión visible en Ajustes: `src/js/version.js` (`APP_VERSION`, `BUILD_INFO`). Al compilar, `build/stamp.js` reescribe ese archivo en la copia `www/` con el `versionName` de `platforms/android/android/app/build.gradle` (única fuente de la versión, también para PC) y la fecha y hora; y pone en `www/sw.js` un `CACHE_NAME` único por compilación.
- `settings.js` guarda en el dispositivo la preferencia "Animaciones: Sí / No" y la aplica con `html[data-anim]`. Las animaciones van siempre encendidas por decisión del usuario: no usar `prefers-reduced-motion` (en la PC del usuario Windows tiene las animaciones apagadas). También guarda el volumen de música y efectos (`musicVol`, `effectsVol`, 0 a 100; 0 = "No") y la cuenta antes de cada ronda (`countdown`: 0 o de 3 a 7, ver `cuentaValida`/`ajustarCuenta`).
- Sonido (rediseñado entre el 04 y el 07-10-2026; detalle en `CONTEXTO-MUSICAL-SHOWDOWN.md` sección 4): `sound.js` decide qué suena en cada momento y engancha los toques en `document`; `audio/catalogo.js` tiene los archivos y notas de cada efecto; `audio/motor.js` usa Web Audio (iguala el volumen de todos los efectos, bucle sin corte, entrada de la música, aceleración y pausa). El motor lee los audios con `fetch`, por eso el `.exe` sirve el juego con `app://juego/` (ver `platforms/desktop/main.js`), no con `file://`. En Node (pruebas) el motor no hace nada (`hayAudio()`). Fuera de la app (segundo plano) no suena nada: `alCambiarPrimerPlano()` de `plataforma.js` (página oculta y, en Android, `appStateChange` del complemento App) llama a `congelarAudio()`, que suspende el audio y no deja reactivarlo hasta volver.
- `plataforma.js`: `esAppInstalada()` (Android con Capacitor o el `.exe`; en la web, no), `salirDeLaApp()` y `nativo(complemento, método, opciones)`. Los complementos nativos de Android (`@capacitor/app`, `@capacitor/share`, `@capacitor/filesystem`, versión 6, instalados en `platforms/android`) se llaman con `Capacitor.nativePromise` a través de `nativo()`: el juego no incluye sus librerías y en Capacitor 6 `Capacitor.Plugins.X` no existe sin ellas. El botón "Salir del juego" de Ajustes solo aparece en la app instalada.
- Compartir el podio: `compartir.js` dibuja la imagen del podio (1080 × 1350) y la comparte (Android: Filesystem + Share; celular en la web: `navigator.share`; PC: la descarga y copia el texto). El `.exe` guarda las descargas directo en la carpeta Descargas (`will-download` en `platforms/desktop/main.js`). El enlace es la página de descargas de GitHub mientras no haya tienda oficial.
- Avisos de la campana: `avisos.js` lee de GitHub (repositorio público, gratis) las versiones publicadas (Releases, para "Actualización") y `avisos/avisos.json` de la rama `main` (novedades y promociones; cómo escribirlos en `avisos/LEEME.md`). Guarda los últimos avisos para verlos sin internet y marca los leídos al abrir el panel. Con la app abierta revisa sola cada 3 minutos (y al volver internet o la app al frente; mínimo 1 minuto entre revisiones por el límite de 60 consultas por hora de GitHub); si llega algo, `avisosLlegaron()` de `menu.js` actualiza el globito y sacude la campana. `plataforma.js` → `abrirEnlace()` abre los enlaces en el navegador del sistema (el `.exe` lo hace con `setWindowOpenHandler` en `platforms/desktop/main.js`).
- Tipografías (Unbounded, Inter, Fredoka, Nunito) incluidas en `src/fonts/` y cargadas desde `css/fuentes.css` (licencia OFL en `fonts/LICENCIAS.txt`): el juego no usa Google Fonts, así se ve igual sin internet.
- `router.js` no repite la animación de entrada al redibujar la misma pantalla (clase `sin-entrada`): eso causaba parpadeo al tocar Sí / No o + / −.
- `data/songs.js` (`SONG_DB`) es una base local de ejemplo. Cada canción tiene `words` (mapa de palabra a booleano) y `chorusWords`. Se reemplazará por una fuente real de letras cuando se elija una que se pueda usar legalmente.
- Los comentarios citan secciones de un documento de diseño externo ("diseño, sección N") que no está en el repositorio.

**Service worker (`src/sw.js`):** solo se registra en la **web** (`main.js`, `esAppInstalada()` de `plataforma.js`); dentro de Android (Capacitor) y del `.exe` (app://) se borra al abrir, porque Capacitor no atiende sus peticiones y mostraba la versión vieja guardada. Usa "network-first", con una lista fija de precaché (`ASSETS`) y un `CACHE_NAME` versionado. Al agregar, mover o renombrar archivos en `src/`, actualizar `ASSETS` y subir la versión de `CACHE_NAME`. Si un solo archivo de la lista no existe, `cache.addAll` falla y el SW no se instala: la web deja de funcionar sin conexión, y no aparece ningún error visible. ESLint revisa `sw.js` aparte, como script clásico.

**Pruebas:** `test/gameLogic.test.js` importa directamente desde `src/` y solo cubre funciones puras; los módulos que importa no deben tocar el DOM al cargarse. `test/seleccion.test.js` prueba `pickWeightedWord` con la base de ejemplo real; `test/clasico.test.js`, `test/alternativo1.test.js` y `test/grupos.test.js` prueban los emparejamientos y los grupos; `test/alternativo2.test.js` prueba el relevo comodín sobre una ronda armada a mano (no se puede llamar a `startNextRound()` en Node porque usa la pantalla); llama a `resetState()` en cada prueba porque `gameLogic` usa el `state` global, y algunas pruebas dependen del azar (tienen márgenes amplios). Si se cambia `data/songs.js`, puede que haya que ajustar las canciones que nombra. `test/sw.test.js` falla si la lista `ASSETS` de `sw.js` no coincide con los archivos reales de `src/`, así que al agregar, mover o borrar un archivo en `src/` hay que actualizar esa lista. `test/sonido.test.js` prueba los límites de la cuenta y que existan todos los audios del catálogo.

Las decisiones de diseño pendientes están en `PENDIENTES.md`.

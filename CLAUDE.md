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
- Después de cada cambio, por mínimo que sea, compilar y abrirle el juego al usuario para que lo pruebe; publicar una versión solo cuando lo confirme (instrucciones 23 a 26).
- Con cada cambio, actualizar **todos** los `.md` que correspondan (auditoría, pendientes, contexto, instrucciones, este archivo, `README.md`, `avisos/LEEME.md`), no solo la auditoría (instrucción 27).
- El juego nunca reproduce ni descarga música de terceros: solo abre enlaces a la búsqueda de YouTube, sin su logo (instrucción 29).
- No publicar por cada cambio mínimo: acumular los cambios confirmados (lista "Listo para la próxima versión" en `PENDIENTES.md`) y publicar cuando haya una actualización notable (instrucción 28).

## Tiendas

Todo lo de las tiendas (textos, permisos, privacidad, clasificación, pasos) está en `TIENDAS.md`; las imágenes, en `tiendas/imagenes/`. La política de privacidad es `docs/privacidad/index.html` (GitHub Pages; enlace en Ajustes, `POLITICA_PRIVACIDAD` de `menu.js`). Si se agrega un permiso o un servicio, actualizar los dos. La versión de tienda se marca al compilar (`TIENDA` en `version.js`, lo escribe `build/stamp.js`); `tienda.js` → `tiendaActual()` hace que el aviso de actualización y "Compartir el podio" lleven a la tienda (Microsoft Store: Store ID `9PP0CFQWMWKT`). La identidad del paquete está en `platforms/desktop/tienda-microsoft.json`. Galaxy Store no acepta personas (solo empresas): Android irá por Google Play. El paquete de la Microsoft Store (`appx` en `platforms/desktop/package.json`) declara micrófono y red local, y toma la versión del juego.

## Proyecto

Musical Showdown es un juego de fiesta/familiar: el sistema muestra una palabra y los jugadores deben cantar cualquier canción que la contenga. Se distribuye como PWA web, `.exe` de Windows (Electron) y app Android (Capacitor).

## Comandos

```bash
npm test                                   # node --test test/*.test.js
node --test --test-name-pattern="weightedPick" test/gameLogic.test.js   # correr una sola prueba
npm run lint                               # eslint src
npm run test:e2e                           # pruebas de pantallas con Playwright (test/e2e; en esta PC usa el Edge instalado)

# Web: archivos estáticos, sin paso de build (los módulos ES requieren servidor HTTP, no file://)
cd src && python3 -m http.server 8000

npm install --prefix platforms/desktop     # solo la primera vez
npm run build:desktop                      # -> dist/windows/Musical Showdown.exe (un solo archivo, destino "portable")

npm run build:linux                        # -> dist/linux/Musical-Showdown.AppImage (compilar en Linux o en GitHub Actions)
npm run build:store-windows                # -> dist/store/Musical Showdown.appx (Microsoft Store; identidad en platforms/desktop/tienda-microsoft.json, ver TIENDAS.md)

npm install --prefix platforms/android     # solo la primera vez
npm run build:android                      # deja el proyecto listo para Android Studio
npm run build:apk                          # APK de prueba (firma de depuración): dist/android/Musical-Showdown.apk y Musical-Showdown-v<versión>.apk
npm run android:release                    # APK para instalar en el celular: limpia todo, sube versionCode en 1, firma con la clave del proyecto -> dist/MusicalShowdown-v<versión>.apk
```

**Compilación en la nube:** `.github/workflows/compilar.yml` corre lint, pruebas y pruebas de pantallas, y compila Windows (`.exe`), Linux (`.AppImage`) y Android (`.apk`) en cada envío a `main`. El APK sale **firmado con la clave del proyecto** si el repositorio tiene los secretos `ANDROID_KEYSTORE_BASE64` (el `.jks` en base64) y `ANDROID_KEYSTORE_PROPERTIES` (el contenido de `keystore.properties`); si no, con firma de depuración (solo para probar). Los archivos quedan en la sección "Artifacts" de cada ejecución. Al subir una etiqueta `v*` (por ejemplo, `v1.1.0`), además publica una Release con los 3 archivos. Si se cambian los scripts de `build/` o las rutas de salida, actualizar también este archivo de flujo.

Particularidades al compilar en Windows:
- Los scripts de `build/` llaman a las herramientas con `npx` y no con `node_modules/.bin/...`, porque `execSync` corre en `cmd.exe` y ahí esa ruta falla.
- `build:desktop` requiere el Modo de desarrollador de Windows (o una consola de administrador), porque electron-builder crea enlaces simbólicos. Esto solo aplica al compilar; el `.exe` generado corre en cualquier PC sin configuración especial.
- `build:android` requiere TypeScript **5** en `platforms/android` para leer `capacitor.config.ts`. TypeScript 7 no es compatible con Capacitor 6.
- npm 11 muestra advertencias de "install-scripts" para esbuild y electron. Se pueden ignorar para compilar.
- `build:apk` llama a `gradlew.bat` con su ruta completa, porque algunas consolas de Windows no buscan programas en la carpeta actual. En esta PC el SDK está en `%LOCALAPPDATA%\Android\Sdk` (`android/local.properties`) y Java 17 en `C:\Program Files\Java\jdk-17`.
- El `.exe` portátil se descomprime siempre en `%TEMP%\MusicalShowdown` (`portable.unpackDirName` en `platforms/desktop/package.json`). Si no, usaba una carpeta al azar en cada apertura y el Firewall de Windows volvía a pedir (o bloqueaba) el permiso de red de "Vincular".
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
  - La palabra se elige entre las canciones de los géneros elegidos (`pickWeightedWord`, 12-10-2026): la mitad de las veces la palabra clave de una canción y la otra mitad una de sus palabras compartidas (`PARTE_CLAVE`), con más peso si está en más canciones o si la canción es famosa.
  - Emparejamientos (`pairing.js`, reglas en `CONTEXTO-MUSICAL-SHOWDOWN.md` sección 3): Clásico usa fases al azar / con ventaja según el equilibrio de puntos (60 % del promedio), siempre con equilibrio de partidos; Alternativo 1 sigue un orden fijo que se repite; Alternativo 2 (solo Grupal) empareja los grupos como Clásico y elige a los jugadores en orden como Alternativo 1. Sirven para jugadores y para grupos. Las reglas que cambian por modo (intentos, puntos, multiplicadores, opciones de Alternativo 2) están en `screens/config/modes.js`; el relevo, en `relay.js`. Los grupos del modo Grupal (cantidad, reparto, nombres, quién canta) están en `groups.js`. `resetMatchTracking()` reinicia todo al empezar cada partida.
  - El temporizador avanza con `setInterval`. `updateClockOnly()` actualiza `.clock` directamente en lugar de volver a renderizar.
  - El puntaje es 100 × multiplicador.
  - Géneros (`screens/config/genres.js`, 10-10-2026): botones "Todos" (predeterminado, `availableGenres()`) y "Más" (hoja con artistas de ejemplo, `genreArtists()`). Con "Más" se elige un solo género en Clásico y Alternativo 1, y varios en Alternativo 2 (`fixGenresForMode`).
  - Las canciones no se bloquean: una ya cantada se puede volver a elegir (decisión del usuario, 01-10-2026).
- Pantalla de inicio (`screens/menu.js`, rediseño del 01-10-2026): ahí se eligen el tipo de batalla y el modo (ya no en "Configurar partida"). Las hojas emergentes usan `screens/sheet.js`. Las luces de fondo están en `index.html`, fuera de `#app`, para que sigan en todas las pantallas.
- Versión visible en Ajustes y abajo a la derecha del inicio (`.home-version-tag`, aparece al terminar la entrada de la pantalla porque un elemento `fixed` se mueve con ella): `src/js/version.js` (`APP_VERSION`, `BUILD_INFO`). Al compilar, `build/stamp.js` reescribe ese archivo en la copia `www/` con el `versionName` de `platforms/android/android/app/build.gradle` (única fuente de la versión, también para PC) y la fecha y hora; y pone en `www/sw.js` un `CACHE_NAME` único por compilación.
- `settings.js` guarda en el dispositivo la preferencia "Animaciones: Sí / No" y la aplica con `html[data-anim]`. Las animaciones van siempre encendidas por decisión del usuario: no usar `prefers-reduced-motion` (en la PC del usuario Windows tiene las animaciones apagadas). También guarda el volumen de música y efectos (`musicVol`, `effectsVol`, 0 a 100; 0 = "No") y la cuenta antes de cada ronda (`countdown`: 0 o de 3 a 7, ver `cuentaValida`/`ajustarCuenta`).
- Sonido (rediseñado entre el 04 y el 07-10-2026; detalle en `CONTEXTO-MUSICAL-SHOWDOWN.md` sección 4): `sound.js` decide qué suena en cada momento y engancha los toques en `document`; `audio/catalogo.js` tiene los archivos y notas de cada efecto; `audio/motor.js` usa Web Audio (iguala el volumen de todos los efectos, bucle sin corte, entrada de la música, aceleración y pausa). El motor lee los audios con `fetch`, por eso el `.exe` sirve el juego con `app://juego/` (ver `platforms/desktop/main.js`), no con `file://`. En Node (pruebas) el motor no hace nada (`hayAudio()`). En la app instalada la música del inicio suena desde la pantalla de carga: se carga antes que los demás sonidos (`precargar(…, despuesDe)`) y `main.js` no quita la pantalla de carga hasta que suena (`esperarMusica(4000)`); en la web espera el primer toque (los navegadores no dejan sonar nada antes). Fuera de la app (segundo plano) no suena nada: `alCambiarPrimerPlano()` de `plataforma.js` (página oculta y, en Android, `appStateChange` del complemento App) llama a `congelarAudio()`, que suspende el audio y no deja reactivarlo hasta volver.
- `plataforma.js`: `esAppInstalada()` (Android con Capacitor o el `.exe`; en la web, no), `salirDeLaApp()` y `nativo(complemento, método, opciones)`. Los complementos nativos de Android (`@capacitor/app`, `@capacitor/share`, `@capacitor/filesystem`, versión 6, instalados en `platforms/android`) se llaman con `Capacitor.nativePromise` a través de `nativo()`: el juego no incluye sus librerías y en Capacitor 6 `Capacitor.Plugins.X` no existe sin ellas. El botón "Salir del juego" de Ajustes solo aparece en la app instalada.
- Compartir el podio: `compartir.js` dibuja la imagen del podio (1080 × 1350) y la comparte (Android: Filesystem + Share; celular en la web: `navigator.share`; PC: la descarga y copia el texto). El `.exe` guarda las descargas directo en la carpeta Descargas (`will-download` en `platforms/desktop/main.js`). El enlace es la página de descargas de GitHub mientras no haya tienda oficial.
- Avisos de la campana: `avisos.js` lee de GitHub (repositorio público, gratis) las versiones publicadas (Releases, para "Actualización") y `avisos/avisos.json` de la rama `main` (novedades y promociones; cómo escribirlos en `avisos/LEEME.md`). Guarda los últimos avisos para verlos sin internet y marca los leídos al abrir el panel. Con la app abierta revisa sola cada 3 minutos (y al volver internet o la app al frente; mínimo 1 minuto entre revisiones por el límite de 60 consultas por hora de GitHub); si llega algo, `avisosLlegaron()` de `menu.js` actualiza el globito y sacude la campana. `plataforma.js` → `abrirEnlace()` abre los enlaces en el navegador del sistema (el `.exe` lo hace con `setWindowOpenHandler` en `platforms/desktop/main.js`).
- Notificaciones fuera de la app (10-10-2026, solo Android, Firebase Cloud Messaging): `notificaciones.js` pide directo el permiso de Android al abrir la app la primera vez (sin ventana propia del juego, usuario 11-10-2026) y anota el celular en el tema `importantes` (`@capacitor/push-notifications` + `@capacitor-community/fcm`, con `nativo()`; se detectan por `Capacitor.PluginHeaders`). Importantes = actualizaciones + avisos con `"importante": true` (`avisos.js`); los envía GitHub Actions con `build/notificar.js` (al publicar una versión y al cambiar `avisos.json` en `main`). Necesita `platforms/android/android/app/google-services.json` (no está en git; en Actions, secreto `GOOGLE_SERVICES_JSON`) y el secreto `FIREBASE_SERVICE_ACCOUNT`. Cada notificación lleva el aviso completo (`data.aviso`): al recibirla con la app abierta o al tocarla, `agregarAvisoRecibido()` lo pone en la campana sin esperar a GitHub (se guarda 24 horas). Salen arriba también con la app abierta (`presentationOptions` en `capacitor.config.ts`), con el ícono `res/drawable/ic_notificacion.xml` (meta-data en `AndroidManifest.xml`). Sin `google-services.json`, `CON_FIREBASE` (de `version.js`, lo escribe `build/stamp.js`) queda en `false` y la app no las ofrece.
- Ayuda (11-10-2026): la ❓ del inicio abre "Cómo se juega" (`openHelp()` de `screens/modals.js`, resumen de todo el juego); en las demás pantallas, `openHelp()` abre la ayuda del modo (`screens/ayudaModos.js`, una por modo y tipo de batalla). Los botoncitos (?) de cada sección están en `screens/ayudaBotones.js` (`botonAyuda(clave, esquina)` + `conectarAyudas(root)`; en `AYUDAS`, cada uno tiene una `frase` corta y `tarjetas` [dibujito, texto], fijos o por modo). Confirmadas por el usuario el 12-10-2026 (versión 1.20). Durante la ronda, abrir una ayuda detiene el reloj (`pausarRondaMientras()` de `modals.js`; `openSheet` acepta `alCerrar`). Cada texto explica solo el modo que se juega, sin nombrar a los otros.
- Tipografías (Unbounded, Inter, Fredoka, Nunito) incluidas en `src/fonts/` y cargadas desde `css/fuentes.css` (licencia OFL en `fonts/LICENCIAS.txt`): el juego no usa Google Fonts, así se ve igual sin internet.
- Teclado (`teclado.js`, `iniciarTeclado()` en `main.js`): las flechas recorren la pantalla hacia donde apuntan (`vecinoEn`; dentro de una ventana abierta, solo esa ventana), Enter es un clic y Backspace es "volver" (`botonVolver`). Las listas desplegables (`select`) no reciben toques (CSS): con teclado, mouse o dedo se abre la lista propia del juego (`abrirLista`), que se cierra con Backspace / Esc o tocando afuera.
- Dos dispositivos, etapa 1 (12-10-2026, versión 1.23): la PC es la pantalla grande y el celular es el control.
  - `vinculo.js`:
    - La PC (`.exe`) abre un servidor WebSocket en la red local. Lo hacen `platforms/desktop/main.js` y `preload.js`, que expone solo `window.vinculoPC`.
      - `main.js` usa la librería `ws`, el puerto 47821 y acepta un celular a la vez.
      - El código es de 6 números y cambia cada minuto. Al conectarse, el celular recibe una "llave" para reconectar.
      - UDP 47822: la PC contesta a `MSV1 BUSCAR <código>` y, si se escribió el código del celular, a `MSV1 COMPARTE <código>`.
    - La PC le manda al celular `armarEstado()` cada vez que cambia `#app` (MutationObserver) y hace lo que el celular pide (`ACCIONES`). "Compartir partida": el celular manda `copiaDePartida()` y la PC la toma con `recibirPartida()`.
    - El celular busca la PC con el complemento nativo propio `VinculoPlugin.java` (UDP broadcast, registrado en `MainActivity.java`), llamado con `nativo("Vinculo", "buscar", …)`.
  - `screens/control.js` (pantalla `"control"`): lo que ve el celular.
  - `screens/vincular.js`: las ventanas para vincular.
    - Botones: "📱 Vincular" en la ronda de la PC y del celular (`round.js`) y uno a la izquierda de Ajustes en el inicio (`menu.js`).
    - El QR se dibuja con `lib/qrcode.js` y se lee con la cámara y `lib/jsqr.js`.
    - El QR es el enlace `https://maxy26.github.io/Musical-showdown/vincular/?…`: `AndroidManifest.xml` lo abre con la app e `iniciarEnlacesDeVinculo()` sigue la conexión.
    - Sin la app, se ve la página `docs/vincular/` (GitHub Pages). Para que Android abra el enlace directo hace falta `assetlinks.json` en `maxy26.github.io` (ver `PENDIENTES.md`).
  - Voz (12-10-2026): al tocar un nombre, `voz.js` (`empezarEscucha` / `resultadoVoz`) espera 3 s.
    - Sin voz, vuelve a la ronda con `deshacerToque` y descuenta del reloj lo que corrió a mitad de velocidad.
    - `microfono.js` (`escucharVoz`) solo mide el volumen, sin grabar.
    - Si hay celular vinculado, escucha el celular: ve `escuchando` / `toque` en el estado y contesta con la acción `"voz"`.
  - `MainActivity.java` deja el espacio de la barra de estado, la barra de navegación y el teclado (Android 15/16 dibuja la app debajo y el WebView no da `safe-area-inset`).
  - Las librerías de terceros van en `src/js/lib/` sin cambios, con `LICENCIAS.txt`; ESLint las ignora.
  - Android necesita `CAMERA`, `usesCleartextTraffic` y `allowMixedContent` (la conexión es `ws://`).
  - Sin internet: los dos dispositivos tienen que estar en la misma red Wi-Fi.
- `router.js` no repite la animación de entrada al redibujar la misma pantalla (clase `sin-entrada`): eso causaba parpadeo al tocar Sí / No o + / −.
- `data/songs.js` (`SONG_DB`) es el catálogo, **sin letras** (usuario, 12-10-2026).
  - Cada canción: `title`, `artist`, `genre`, `famous`, `clave` (la palabra propia de la canción) y `palabras` (otras de su parte famosa); `palabrasDe()` las junta.
  - "Buscar canción" busca solo por el nombre (`searchSongs`).
  - Se llena por tandas de 20 (meta: 100 por género, 10 géneros; hoy 200 canciones; ver `PENDIENTES.md`). `GENRES` tiene 10 ids; `genreArtists` muestra solo el artista principal (`artistaPrincipal`).
  - No guardar letras.
- Los comentarios citan secciones de un documento de diseño externo ("diseño, sección N") que no está en el repositorio.

**Service worker (`src/sw.js`):** solo se registra en la **web** (`main.js`, `esAppInstalada()` de `plataforma.js`); dentro de Android (Capacitor) y del `.exe` (app://) se borra al abrir, porque Capacitor no atiende sus peticiones y mostraba la versión vieja guardada. Usa "network-first", con una lista fija de precaché (`ASSETS`) y un `CACHE_NAME` versionado. Al agregar, mover o renombrar archivos en `src/`, actualizar `ASSETS` y subir la versión de `CACHE_NAME`. Si un solo archivo de la lista no existe, `cache.addAll` falla y el SW no se instala: la web deja de funcionar sin conexión, y no aparece ningún error visible. ESLint revisa `sw.js` aparte, como script clásico.

**Pruebas:** `test/gameLogic.test.js` importa directamente desde `src/` y solo cubre funciones puras; los módulos que importa no deben tocar el DOM al cargarse. `test/seleccion.test.js` prueba `pickWeightedWord` con la base de ejemplo real; `test/clasico.test.js`, `test/alternativo1.test.js` y `test/grupos.test.js` prueban los emparejamientos y los grupos; `test/alternativo2.test.js` prueba el relevo comodín sobre una ronda armada a mano (no se puede llamar a `startNextRound()` en Node porque usa la pantalla); llama a `resetState()` en cada prueba porque `gameLogic` usa el `state` global, y algunas pruebas dependen del azar (tienen márgenes amplios). Si se cambia `data/songs.js`, puede que haya que ajustar las canciones que nombra. `test/sw.test.js` falla si la lista `ASSETS` de `sw.js` no coincide con los archivos reales de `src/`, así que al agregar, mover o borrar un archivo en `src/` hay que actualizar esa lista. `test/teclado.test.js` prueba `vecinoEn` (a qué control va cada flecha). `test/generos.test.js` prueba "Todos" / "Más" por modo. `test/sonido.test.js` prueba los límites de la cuenta y que existan todos los audios del catálogo.

**Pruebas de pantallas (Playwright, 10-10-2026):** `test/e2e/*.spec.mjs` abren el juego en un navegador sin ventana y lo recorren como un jugador (partida Individual y Grupal, respuesta correcta e incorrecta, pausa, podio y compartir, lista de jugadores, ajustes, textos que ya no deben aparecer). Cada prueba corre dos veces: tamaño celular (Pixel 7) y PC. `playwright.config.mjs` levanta `test/e2e/servidor.mjs`, que sirve `src/` solo en `127.0.0.1` (así Windows no pide permiso de red). En esta PC usan el Edge instalado (`channel: "msedge"`); en GitHub Actions, el Chromium de Playwright. `ayuda.mjs` corta los pedidos a GitHub (avisos) y pone la cuenta en "No". Si una falla, la captura y el rastro quedan en `test-results/` (en `.gitignore`). Si se cambia un texto, un `id` o el flujo de una pantalla, revisar estas pruebas.

Las decisiones de diseño pendientes están en `PENDIENTES.md`.

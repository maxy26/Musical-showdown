# Auditoría de cambios — Musical Showdown

> Registro cronológico de cada cambio o ajuste hecho al proyecto. Sirve para saber **en qué nos quedamos** al empezar una
> nueva conversación. La entrada más reciente va **arriba**.
>
> Formato de cada entrada: fecha · qué se hizo · archivos tocados ·
> cómo se verificó · qué quedó abierto (con referencia a `PENDIENTES.md`).
>
> El historial anterior a este registro está
> resumido en `CONTEXTO-MUSICAL-SHOWDOWN.md`; el commit base es
> `59438fd` (reestructuración a monorepo).

---

## 2026-10-29 — Parte 2 confirmada: a las tres apps y a `main` (sin versión nueva)

**Qué se hizo («está bien, déjalo así. Actualiza y publica»):** el usuario confirmó la parte 2 (pantalla completa,
géneros, volumen y que todo concuerde). Como el código es el mismo `src/`, se compilaron la completa (`.exe` y APK) y
la demo; se subió todo a `main` con los documentos al día. No se sacó versión: queda en «Listo para la próxima
versión» de `PENDIENTES.md` (instrucción 28).

**Archivos:** `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md` y lo de la entrada de abajo.

**Verificación:** `build:desktop`, `build:demo-windows` y `build:apk` terminaron bien; GitHub Actions vuelve a correr
lint, pruebas y pruebas de pantallas al subir.

**Abierto:** sacar la próxima versión cuando el usuario lo pida.

---

## 2026-10-29 — «Escenario nocturno», parte 2: pantalla completa, géneros, volumen y que todo concuerde (solo en la personal)

**Qué se hizo (el usuario eligió en una vista previa con capturas y los sonidos reales: 1B, 2A, 4 todo y una mezcla
suave de volumen):** modificación general (instrucción 31), probada solo en la personal.
- **Pantalla completa (1B «Agrandar»):** el `.exe` abre en pantalla completa (F11 entra y sale) y agranda todo en
  proporción a la pantalla con `setZoomFactor` (base 1366 × 768, de 1 a 2; `platforms/desktop/main.js`). En la PC el
  contenido va centrado en el alto (`#app{margin-block:auto}`). Android oculta la barra de la hora y la de los botones
  (salen un momento deslizando desde el borde; `ocultarBarras()` en `MainActivity.java`, también al volver al juego).
- **Géneros (2A «Mosaico»):** la ventana «Más» es un mosaico de cuadros de vidrio con puntito de color, nombre y dos
  artistas; el elegido en violeta con ✓. PC: 5 por fila (entran los 10); celular: de a dos (`config/genres.js`, CSS
  `.genre-sheet`).
- **Volumen:** efectos de 0,13 a 0,09 y música de 0,07 a 0,028 (`NIVEL`, `NIVEL_MUSICA` de `audio/motor.js`); el
  barrido de la entrada baja en la misma proporción.
- **Que todo concuerde:** una sola paleta (los colores viejos apuntan a los de «Escenario nocturno» y las variables
  `--a-*` están una sola vez en `:root`); solo la letra Inter (se quitaron Fredoka, Nunito y Unbounded de `fonts/`,
  `fuentes.css`, `sw.js` y `LICENCIAS.txt`; la imagen del podio ya usaba Inter); 7 tamaños de letra (12, 14, 16, 20,
  24, 32 y 48 px; los más grandes, como la palabra de la ronda, quedan); lo elegido siempre en violeta-rosa (también
  Individual / Grupal, Todos / Más y Sí / No, que iban en blanco); el numerito de Jugadores dice «0 de mín. 2» en gris
  mientras falten (`textoCuenta` de `players.js`); la lista de jugadores ya no difumina la última casilla en el celular
  (`fijarAlto` no contaba el margen de la fila). Las ayudas no nombran colores distintos a los que se ven.

**Archivos:** `platforms/desktop/main.js`, `platforms/android/.../MainActivity.java`, `src/css/styles.css`,
`src/css/fuentes.css`, `src/fonts/` (quitadas 3 letras), `src/sw.js` (v33), `src/js/audio/motor.js`,
`src/js/compartir.js`, `src/js/screens/config/{genres,players,index}.js`, `test/gameLogic.test.js`,
`test/e2e/pantallas.spec.mjs`, documentos.

**Verificación:** lint, 177 pruebas, 54 de 54 pruebas de pantallas (Chromium de Playwright), capturas en 1366 × 768 y
412 × 915 (inicio, configurar, géneros, ronda, ajustes, modos, pausa). `build:personal` (`.exe` y APK) y se abrió el
`.exe` personal. No se probó en un celular real ni el zoom en un monitor grande.

**Abierto:** que el usuario lo pruebe; al confirmar, pasarlo a la demo y la completa. La web (PWA) no entra sola en
pantalla completa ni agranda (los navegadores no lo dejan sin un toque).

---

## 2026-10-29 — Versión 1.28 publicada

**Qué se hizo:** `npm run android:release` (versionCode 28 → 29, versionName 1.28, firma con la clave del
proyecto, SHA-256 `e0e0a02f…d5d730`, la misma de siempre). Cambios para los jugadores desde la 1.27: el
rediseño «Escenario nocturno» completo (todas las pantallas y ventanas, la pantalla de carga con bienvenida,
el fondo borroso con la fila marcada al editar una opción y las ventanas según el tamaño de la pantalla) y
«Devolver relevos» pasa a ser de Premium.

**Archivos:** `platforms/android/android/app/build.gradle` (versión), `ESTADO.md`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** `aapt` confirma versionCode 29 y versionName 1.28 (`dist/MusicalShowdown-v1.28.apk` y
`.aab`). Se recompiló el `.exe` (`dist/windows`) con la versión nueva. La Release la arma GitHub Actions al
subir la etiqueta `v1.28`.

**Reintentos:** la compilación de la etiqueta falló dos veces en las pruebas de pantallas (en `main` el mismo
commit pasó). Corriéndolas como en GitHub (Chromium, modo CI) la que fallaba a veces era «Podio: compartir
muestra la imagen»: dibujar la imagen de 1080 × 1350 puede pasar de los 5 s en máquinas lentas. Se le dio
hasta 15 s a ese paso (`test/e2e/partida.spec.mjs`; pasó 6 de 6 sin reintentos) y la etiqueta `v1.28` se movió a
ese commit (`a09ec97`) y se volvió a subir, con permiso del usuario.

**Resultado:** GitHub Actions «Compilar v1.28» terminó bien y la Release v1.28 quedó publicada con
`Musical-Showdown.apk`, `Musical-Showdown.AppImage` y `Musical.Showdown.exe`. Se abrió el `.exe` final
(`dist/windows`); no se instaló en un celular.

**Abierto:** que el usuario pruebe la 1.28 en el celular.

---

## 2026-10-29 — Se sube a `main` el rediseño «Escenario nocturno» (sin versión nueva)

**Qué se hizo («actualiza y publica», instrucción 34):** se subieron a `main` todos los cambios del rediseño
y de «Devolver relevos» en Premium, con los documentos al día. No se sacó versión (`v*`): la lista
«Listo para la próxima versión» de `PENDIENTES.md` junta lo que irá en la 1.28 (instrucción 28).
- Pruebas de pantallas: «Lista de jugadores» esperaba el diseño anterior (alto fijo y ✕ roja). Ahora en el
  celular comprueba el alto fijo y en la PC que no pase de 420 px; la ✕ ya no se compara por color
  (`test/e2e/pantallas.spec.mjs`).

**Archivos:** `test/e2e/pantallas.spec.mjs`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md` y todo lo listado en
las entradas de abajo.

**Verificación:** lint, 176 pruebas y las cuatro compilaciones. Pruebas de pantallas con Brave (Edge sigue sin
abrir): 52 de 54 pasan con 2 a la vez; «Buscar canción» en PC falla también en la versión publicada (anotado
en `PENDIENTES.md`). GitHub Actions las vuelve a correr al subir.

**Abierto:** sacar la versión 1.28 cuando el usuario lo pida.

---

## 2026-10-29 — Pantalla de carga con el estilo «Escenario nocturno» y bienvenida

**Qué se hizo (el usuario notó que faltaba; pidió combinar A y B con una animación de bienvenida y eligió C3
«Ondas y enfoque»):**
- `#loader` (`index.html`): el fondo y el título del inicio nuevo («Musical» en blanco y «Showdown» en
  degradado, ahora en dos `span`); el micrófono en un círculo de color que aparece y suelta ondas de sonido;
  el título pasa de borroso a nítido y cada tanto lo cruza un brillo; debajo, un ecualizador de siete barritas
  en lugar de la barra que se llena. En la PC, más grande.
- `main.js`: la pantalla de carga dura al menos 1,5 s (antes 0,9 s) para que la bienvenida se vea entera.
- La barra que se llena (`.loader-bar`) sigue igual en la ronda, Premium y vincular; se conservó
  `loader-bounce`, que usa el micrófono de la ronda.

**Archivos:** `src/index.html`, `src/js/main.js`, `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** vista previa en vivo en PC y celular (propuestas A y B, combinaciones C1 a C3 y la C3 con
el código del juego). Lint, pruebas y las cuatro compilaciones; se abrió la personal.

**Abierto:** que el usuario la vea al abrir el juego en PC y celular.

---

## 2026-10-29 — Listas desplegables con el estilo «Escenario nocturno»

**Qué se hizo (el usuario notó que faltaban; eligió la opción B en una vista previa en vivo):**
- La lista propia del juego (`teclado.js`, `.lista-teclado`: Puntaje objetivo, Tiempo por ronda y las dos de
  «Organizar equipos») pasa a vidrio oscuro con Inter. La opción señalada va en letras de degradado con líneas
  finas arriba y abajo (como la rueda); la elegida lleva una rayita rosa a la izquierda (`is-elegida`, nueva).
- Al abrirla, todo queda borroso menos la fila de la lista, marcada con «Editando · <nombre>» (`.lista-fondo`;
  se cierra con la lista). Para eso `resaltarFila` pasó de `valuePicker.js` a `utils.js` y toma la clase de la
  pantalla (`config`, `organizar`…) para que la copia conserve su estilo.

**Archivos:** `src/js/teclado.js`, `src/js/utils.js`, `src/js/screens/config/valuePicker.js`,
`src/js/screens/config/alt2Options.js`, `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** vista previa en vivo en PC y celular (Puntaje objetivo y «Se llaman» de Organizar equipos),
primero como propuesta y después con el código del juego. Lint, pruebas y las cuatro compilaciones; se abrió
la personal.

**Abierto:** que el usuario lo pruebe con mouse, teclado y dedo.

---

## 2026-10-29 — Ventana de Premium con el estilo «Escenario nocturno»

**Qué se hizo (el usuario eligió en vistas previas en vivo; pidió combinar las dos primeras propuestas y eligió la D):**
- La ventana de Premium (`premium.js`, hoja `.sheet:has(.premium)`) deja el dorado: vidrio oscuro, Inter y acento
  de violeta a rosa. Estrella en un círculo de color con brillo; beneficios en cuadritos con el ícono en un
  cuadrito de color (4 en fila en la PC, 2 × 2 en el celular); planes en filas, el de prueba gratis con borde
  de color y la etiqueta arriba a la derecha; «Restaurar compras» como enlace. En la PC va centrada (620 px);
  en el celular sube desde abajo. Con Premium, el mensaje y «Ver o cancelar la suscripción» van en columna.
- Solo CSS: se reemplazó el bloque «Premium (premium.js, 13-10-2026)» de `styles.css`. No cambia qué hace
  ningún botón.

**Archivos:** `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** vista previa en vivo con planes de ejemplo (Google Play simulado) y el estado «ya con
Premium», en PC y celular, primero como propuesta y después con el CSS del juego. Lint, pruebas y las
cuatro compilaciones; se abrió la personal.

**Abierto:** ver la ventana con los precios reales de Google Play cuando esté la consola.

---

## 2026-10-29 — Ventanas chicas según el tamaño de la pantalla

**Qué se hizo (pedido del usuario, elegido en una vista previa en vivo con 4 tamaños de PC y 3 de celular):**
- Las ventanas chicas (`.chica`: «Sí / No», aviso, pausa, relevos y «Relevos por equipo») escalan letras,
  botones, íconos y márgenes con la variable `--e` (bloque final de `styles.css`): PC con poca altura
  (≤ 820 px) 0,86, (≤ 700 px) 0,76; monitores de 1600 × 1000 o más 1,12 y de 2200 × 1300 o más 1,22;
  celular chico (≤ 700 px de alto o ≤ 360 de ancho) 0,88 y grande (≥ 412 × 880) 1,06. Los px de esos
  bloques pasaron a `calc(Npx*var(--e,1))`.
- `pegarAFila` (`alt2Options.js`): si la ventana no entra ni arriba ni abajo de la fila, va del lado con
  más lugar.

**Archivos:** `src/css/styles.css`, `src/js/screens/config/alt2Options.js`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas con Brave en 1280 × 720, 1366 × 768, 1920 × 1080, 2560 × 1440, 360 × 640,
390 × 844 y 430 × 932. En la primera, las condiciones `@media` también habían quedado con `calc` (el
celular se veía como PC); se corrigieron. Lint, pruebas y las cuatro compilaciones; se abrió la personal.

**Abierto:** la rueda, Ajustes, la campana, la ayuda y los modos no usan `--e`.

---

## 2026-10-29 — Editar opciones con la fila marcada (Alternativo 2 y rueda)

**Qué se hizo (el usuario eligió en una vista previa en vivo):**
- **Ventana «Relevos por equipo»** (`alt2Options.js`): estilo de ventana chica (`.chica`, ícono 🔁) con
  la opción B: cada opción en un bloque con el número grande en degradado y − + redondos.
- **Fila marcada al editar:** todo queda borroso menos la fila que se edita, que se ve nítida con borde
  violeta y la etiqueta «Editando · <nombre>». `resaltarFila(overlay, fila, nombre)` en `valuePicker.js`
  pone encima del fondo una copia de la fila (sin ids, `inert`) dentro de una capa `.config`.
- **Dónde sale la ventana:** como globo pegado arriba de la fila (debajo si arriba no entra), con
  flechita, en la PC y en el celular (`globo-fila`, `pegarAFila` en `alt2Options.js`). En el celular va a
  todo el ancho, sin ícono ni título y con Cancelar / Listo lado a lado. Al principio iba al lado de la
  fila en la PC; el usuario pidió ponerla arriba como en el celular.
- **Más chica** que las demás ventanas chicas (420 px en la PC; más compacta en el celular) y **tocar
  afuera la cierra** como la ✕, sin guardar (pedidos del usuario).
- Las reglas del celular para la fila de relevos usan `:has(.relay-open)` en lugar del id, porque la
  copia marcada no lleva ids.
- La **rueda** de Puntaje objetivo y Tiempo por ronda también marca su fila.

**Archivos:** `src/js/screens/config/alt2Options.js`, `src/js/screens/config/valuePicker.js`,
`src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** vista previa en vivo con el código del juego y capturas (PC y celular, relevos y
rueda); con Playwright y Brave, tocar afuera cierra la ventana en los dos tamaños. Lint, 176 pruebas y
las cuatro compilaciones; se abrió la personal.

**Abierto:** que el usuario lo pruebe; la copia de la fila no se reubica si se gira la pantalla con la
ventana abierta. Falta la ventana de Premium.

---

## 2026-10-29 — Ventanas de relevos y devolver relevos en Premium

**Qué se hizo (el usuario eligió en vistas previas en vivo):**
- **Ventanas de relevos** (`relayModals.js`): toman el estilo de las ventanas chicas (`.chica`:
  vidrio, ícono 🔁 arriba, botones uno debajo del otro, más grandes en la PC y desde abajo en el
  celular). Elegir compañero: **lista** (opción B), cada uno en su fila con la inicial en un
  círculo (`data-inicial`) y el elegido con borde violeta y ✓. Ajustar relevos: número grande en
  degradado y − + redondos de vidrio. El aviso de «relevo de más» ya usaba la ventana «Sí / No».
- **Devolver relevos es de Premium** (pedido del usuario): en la versión completa sin Premium, el
  botón ± de la ronda lleva 🔒 y abre la ventana de Premium (el reloj espera mientras está abierta).
  Se bloquea todo el botón (agregar y quitar). `ajustaRelevos()` en `edicion.js`, `"relevos"` en
  `INCLUYE_PREMIUM` (`compras.js`) y en `DE_PAGO`; Premium lo lista entre sus beneficios
  (`premium.js`, que ahora acepta `alCerrar`). La personal y el desarrollo lo tienen abierto; la
  demo no tiene relevos.

**Archivos:** `src/js/screens/relayModals.js`, `src/js/screens/round.js`, `src/js/screens/premium.js`,
`src/js/edicion.js`, `src/js/compras.js`, `src/css/styles.css`, `test/edicion.test.js`,
`test/compras.test.js`, `TIENDAS.md`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** vistas previas en vivo; en el juego real, con Playwright y Brave: lista de
compañeros, ajustar relevos y, simulando la versión completa sin Premium, el 🔒 abre Premium con
«Devolver relevos». Lint y 176 pruebas pasaron (una nueva). Se compilaron las cuatro versiones y se
abrió la personal.

**Abierto:** probar la compra real de Premium en Android. La política de privacidad nombra las
funciones de pago «por ejemplo», así que sigue siendo correcta. La ventana de Premium y las
opciones de Alternativo 2 conservan el estilo anterior.

---

## 2026-10-29 — Rediseño "Escenario nocturno": rueda para elegir números (encima del valor)

**Qué se hizo (el usuario eligió en vistas previas en vivo; primero una ventana con flechas,
luego la cambió):** la rueda de `valuePicker.js` («Personalizado…» del puntaje objetivo y del
tiempo por ronda):
- **Se abre encima de la lista donde está el valor** (`campo`, que pasa `config/index.js`):
  mismo ancho y letra que la lista, 3 filas, y el número elegido justo sobre el valor
  (`pegarAlCampo`, mide con `offset*` por la animación de apertura). Sin título ni ayuda; el
  resto apenas borroso. «Listo» o **tocar afuera confirman**; Esc cancela.
- **Diseño «Líneas»:** sin franja; dos líneas finas en degradado arriba y abajo del número
  elegido, que va más grande y en degradado.
- **Flechas ▲ ▼** arriba y abajo: un valor por toque (`animateTo(goal ± 1)`).
- Sin `campo`, sigue siendo una ventana (vidrio; en el celular sube desde abajo).

**Archivos:** `src/js/screens/config/valuePicker.js`, `src/js/screens/config/index.js`,
`src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** vistas previas en vivo; en el juego real, con Playwright y Brave (PC con el
puntaje y celular con el tiempo): la rueda se abre sobre la lista (unos 6 px de diferencia con
el valor), ▼ sube un valor y al tocar afuera la lista queda con el nuevo (2100 pts; 31 seg).
Lint y 175 pruebas pasaron. Se compilaron las cuatro versiones y se abrió la personal.

**Abierto:** quedan con el estilo anterior las ventanas de relevos y las opciones de Alternativo 2.

---

## 2026-10-29 — Rediseño "Escenario nocturno": ventanas «Sí / No», aviso y pausa

**Qué se hizo (el usuario eligió en una vista previa en vivo):** las ventanas chicas de
`modals.js` (`showConfirm`, `showWarning` y la pausa con su «¿Salir de la partida?») llevan la
clase `.chica`:
- Vidrio oscuro y letra Inter; ícono arriba en un círculo (❓ pregunta, 🚪 salir, ⏸ pausa; el aviso
  conserva su ⚠️ en un círculo dorado); botones uno debajo del otro con la respuesta principal
  arriba (opción B, en PC y celular); «Sí» en degradado, «Sí, salir» en rojo rosado (antes verde
  por `.modal #yes`), «No» de vidrio. La pausa conserva su orden (Continuar, Ayuda, Salir).
- PC: un poco más grande (540 px de ancho, título 31 px, texto 19 px). Celular: suben desde abajo.

**Archivos:** `src/js/screens/modals.js`, `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** vista previa en vivo y el juego real con Playwright y Brave (pausa y pregunta
en PC, salir y aviso en el celular). Lint y 175 pruebas pasaron. Se compilaron las cuatro
versiones y se abrió la personal.

**Abierto:** con esto termina la lista de pantallas del rediseño. Quedan con el estilo anterior
la rueda para elegir números (`valuePicker.js`), las ventanas de relevos (`relayModals.js`) y las
opciones de Alternativo 2 (`alt2Options.js`) (anotado en `PENDIENTES.md`).

---

## 2026-10-29 — Rediseño "Escenario nocturno": control del celular, PC vinculada y reloj de la ronda

**Qué se hizo (el usuario eligió en vistas previas en vivo):**
- **Celular como control** (`control.js`, `.control-screen`, agregada a los `:is(...)` del fondo):
  fondo con colores que se mueven, «Conectado» en una pastilla con punto verde (rojo y clase
  `sin-conexion` sin conexión), botones de vidrio; en la ronda, los dos botones de vidrio teñidos
  del color de cada lado con el nombre grande en Inter; mientras alguien canta, micrófono con
  ondas, Correcta verde e Incorrecta rojo rosado; avisos con el ícono en un círculo de vidrio y
  botón en degradado; la cuenta en degradado.
- **PC con el celular vinculado:** en la ronda, «📱 Los nombres se tocan en el celular»; en
  «¡Ana canta!», «📱 Correcta o Incorrecta se marca en el celular»; «📱 Vinculado» en verde. La
  ronda se redibuja al cerrar la ventana de vincular (`vincular.js`) y al conectarse o
  desconectarse el celular si no hay una ventana abierta (`vinculo.js`).
- **Reloj de la ronda:** anillo (opción 1, estilo B): los segundos dentro de un anillo grueso en
  degradado que se vacía, con un punto de luz en la punta; en los últimos 5 s, rojo y late.
  112 px en el celular y `clamp(140px, 19vh, 190px)` en la PC; el dibujo cabe entero (sin el
  recorte que se veía en la vista previa). `round.js` (`ANILLO_RELOJ`, `--f`) y `updateClockOnly()`
  de `gameLogic.js` (actualiza `--f` cada segundo). «Sin tiempo» sigue como pastilla.

**Archivos:** `src/css/styles.css`, `src/js/screens/control.js`, `src/js/screens/round.js`,
`src/js/screens/verify.js`, `src/js/screens/vincular.js`, `src/js/vinculo.js`, `src/js/gameLogic.js`,
`PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** vistas previas en vivo (control con estados de prueba; PC con un celular de
prueba) y el reloj en el juego real (celular 390 × 844, PC 1440 × 900 y 1366 × 768, también los
últimos 5 s). Lint y 175 pruebas pasaron. Se compilaron las cuatro versiones y se abrió la personal.

**Abierto:** probar vinculando un celular de verdad (control y avisos de la PC).

---

## 2026-10-29 — Rediseño "Escenario nocturno": vincular

**Qué se hizo (el usuario eligió en vistas previas en vivo):** las cuatro ventanas de
`vincular.js` («Vincular celular» de la PC, «Seguir partida del celular», «Escanear partida» y
«Vincular con la PC» del celular) al estilo del inicio:
- Vidrio oscuro y letra Inter; cada paso en su panel con el número en un círculo en degradado;
  QR en tarjeta blanca con brillo violeta; código de 6 números grande en degradado; «Esperando…»
  en violeta claro y «Conectado» en verde; botones en degradado, de vidrio o rojo rosado.
- PC, «Vincular celular»: opción B, explicación a la izquierda y el QR a la derecha.
- Tiempo que le queda al código: **relojito circular** al lado de los números que se vacía, sin
  mostrar los segundos (opción 3 sin conteo). Reemplaza la barra amarilla (`CODIGO_HTML` y
  `pintarCodigo`; se quitaron los estilos de `.vincular-codigo-barra`).
- El usuario aclaró cómo se vincula (celular → PC con el código del celular; PC → celular con el
  QR y su código debajo, el celular elige escanear o escribir): ya era así. Se le avisó que con el
  QR el celular queda de **control** de la partida de la PC (no la juega en su pantalla); si quiere
  otra cosa, sería una función aparte (anotado en `PENDIENTES.md`).

**Archivos:** `src/css/styles.css`, `src/js/screens/vincular.js`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas de la vista previa en vivo (PC 1440 × 900 y celular 390 × 844, QR y
código de ejemplo). En el juego real, con Playwright y Brave, el relojito se vacía a una vuelta
por minuto. Lint y pruebas; se compilaron las cuatro versiones y se abrió la personal.

**Abierto:** que el usuario lo pruebe vinculando de verdad el celular y la PC.

---

## 2026-10-29 — Rediseño "Escenario nocturno": compartir el podio (imagen, ventana y colores)

**Qué se hizo (el usuario eligió en vistas previas en vivo):**
- **Imagen del podio** (`compartir.js`, `imagenDelPodio`), opción A: fondo casi negro con tres
  resplandores, letra Inter, «Showdown» y el nombre del ganador en degradado, bloques del podio de
  vidrio teñidos de oro, plata y bronce (el 1.º con brillo) y la invitación en un panel de vidrio.
- **Colores del fondo a elegir:** `TEMAS_IMAGEN` (Noche, Océano, Atardecer, Bosque, Fuego) y «Mis
  colores» (dos colores propios). En la ventana: flechitas ‹ › a los lados de la imagen en la PC;
  en el celular se desliza la imagen; debajo, el nombre del color; «✏️ Personalizar colores» abre
  Color 1 y Color 2 (selector del sistema). Sin círculos de colores (el usuario los quitó). Se
  comparte la imagen con el color elegido.
- Se recuerda en el dispositivo el último color y «Mis colores» (`temaImagen` y `coloresImagen` en
  `settings.js`).
- **Ventana** (`results.js`, hoja con `.compartir`): vidrio oscuro, imagen con borde y brillo, el
  botón en degradado; todo entra sin desplazar en PC y celular.

**Archivos:** `src/js/compartir.js`, `src/js/screens/results.js`, `src/js/settings.js`,
`src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** con Playwright y Brave sobre el juego real (PC 1440 × 900 y celular 390 × 844):
flechita y deslizar cambian Noche → Océano, «Personalizar» pasa a «Mis colores», se guarda en los
ajustes y la ventana no desborda. Lint y 175 pruebas pasaron. Se compilaron las cuatro versiones
y se abrió la personal.

**Abierto:** el selector de color es el del sistema (se ve distinto en Windows y Android). No se
probó compartir de verdad en Android con la imagen nueva.

---

## 2026-10-29 — Rediseño "Escenario nocturno": verificar canción («¡X canta!» y «Buscar canción»)

**Qué se hizo:** se llevó al estilo del inicio la pantalla «¡Ana canta!» (`verify.js`,
`.canta-capa`) y su ventana «Buscar canción». Vista previa en vivo; el usuario eligió:
- Fondo casi negro con el resplandor del color de quien canta (los mismos de la ronda: rosa
  `#FF5FA2` y celeste `#38BDF8`; en Grupal, el del grupo); micrófono en un círculo con ondas
  que salen; nombre grande en Inter con brillo; palabra en blanco con halo violeta; reloj de vidrio.
- «Correcta» en verde, «Incorrecta» en rojo rosado; «Volver» y «Buscar canción» de vidrio.
- «Buscar canción»: vidrio oscuro, la palabra en blanco, resultados en filas de vidrio; «Buscar
  en YouTube» y los ▶ en **rojo** (pedido del usuario; sin el logo, instrucción 29).
- PC: opción A, todo centrado en una columna y más grande. Celular: centrado, como antes.
- Solo CSS. `.canta-lado-a` / `.canta-lado-b` cambian de color también en el control del celular.

**Archivos:** `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas de la vista previa en vivo (celular 390 × 844 y PC 1440 × 900,
pantalla y búsqueda con resultados). Lint y pruebas; se compilaron las cuatro versiones y se
abrió la personal.

**Abierto:** que el usuario lo pruebe.

---

## 2026-10-28 — «Modos de juego»: tamaño según la pantalla y «Ver más» de a uno

**Qué se hizo (pedido del usuario):** en la PC, la ventana y todo su contenido (letra, viñetas,
botones, espacios) siguen el alto de la pantalla con `clamp(…, vh, …)`: entra sin desplazar de
1280 × 720 a 1920 × 1080 y en las pantallas grandes se ve más grande (ancho hasta 1600 px). La
grilla usa `align-items:start`: «Ver más» agranda solo su modo y los otros conservan su tamaño.

**Archivos:** `src/css/styles.css`, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación:** medido con Playwright y Brave (alto del contenido = alto visible, sin
desborde) en 1920 × 1080 (796 px), 1440 × 900 (680), 1366 × 768 (581) y 1280 × 720 (548); el
usuario lo vio en el juego real sin compilar. Lint y pruebas; se compilaron las cuatro versiones
y se abrió la personal.

**Abierto:** con «Ver más» abierto, el modo se alarga y hay que desplazar para leerlo entero.

---

## 2026-10-28 — Rediseño "Escenario nocturno": «Modos de juego»

**Qué se hizo:** se llevó la ventana «Modos de juego» (`modesManual.js`, también la abre «Ver
modos de juego» de la ayuda) al estilo del inicio. Vista previa en vivo; el usuario eligió:
- Vidrio oscuro y letra Inter; cada modo en su tarjeta de vidrio con el nombre grande; el elegido
  con borde violeta, brillo y «✓ Elegido» en degradado; historieta como en la ayuda; «Elegir…» en
  degradado, «Ver más» de vidrio y los modos con candado más apagados.
- **PC (opción B):** ventana ancha (1240 px) con los tres modos uno al lado del otro.
- **Celular (opción 3, lista compacta):** la historieta solo se ve en el modo elegido o al tocar
  «Ver más» (clase `abierto` que pone el botón).
- `modesManual.js`: la lista lleva `.modos`; «Ver más» alterna `abierto` en la tarjeta.

**Archivos:** `src/css/styles.css`, `src/js/screens/modesManual.js`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas de la vista previa en vivo (celular 390 × 844 y PC 1440 × 900). Lint y
pruebas; se compilaron las cuatro versiones y se abrió la personal.

**Abierto:** que el usuario lo pruebe.

---

## 2026-10-28 — Rediseño "Escenario nocturno": ayudas y botoncitos (?) junto a su botón

**Qué se hizo (el usuario eligió en vistas previas en vivo):**
- «Cómo se juega» y la ayuda de cada modo (`.manual.ayuda`, clase agregada en `modals.js` y
  `ayudaModos.js`): vidrio oscuro, letra Inter, cada parte en su panel con el título chico en
  violeta claro, viñetas encendidas en violeta con el número en degradado, puntos que suman en
  verde y que restan en rosado. **Dos columnas** (opción B) en PC (ventana ancha de 1080 px) y en
  el celular: la primera parte, la historieta y las tarjetas de puntos (en el celular) a todo el
  ancho; las demás de a dos.
- Ventanita de los (?) (`ayudaBotones.js`): **globo junto a su botón** (opción 3) con una flechita
  que le apunta; debajo si cabe, si no arriba; si no cabe, centrada (grande en la PC). El fondo
  queda **borroso** y encima va una copia del (?) encendida en violeta (`pegarAlBoton`).
  `abrirAyuda(clave, { boton })`: lo pasan `conectarAyudas` y el ❓ de la ronda (`round.js`) y del
  control del celular (`control.js`).

**Archivos:** `src/css/styles.css`, `src/js/screens/ayudaBotones.js`, `src/js/screens/modals.js`,
`src/js/screens/ayudaModos.js`, `src/js/screens/round.js`, `src/js/screens/control.js`,
`PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** el usuario lo vio en el juego real (sin compilar): ayudas en PC y celular y los
(?) de Configurar partida (primero, del medio y último: el globo sale abajo o arriba). Lint y 175
pruebas pasaron. Se compilaron las cuatro versiones y se abrió la personal.

**Abierto:** el globo no se reubica si se gira el celular o cambia el tamaño de la ventana con
él abierto. No se probaron en la vista los (?) de Organizar equipos, la ronda ni verificar canción.

---

## 2026-10-28 — Campana: borrar notificaciones y (!) mientras quede alguna

**Qué se hizo (pedido del usuario, eligió entre opciones en una vista previa):**
- Botón «Borrar notificaciones» (opción B) al final de la lista, **fijo abajo** de la ventana
  (`position:sticky`): al desplazar, los avisos pasan por detrás. Pregunta con `showConfirm`
  («¿Borrar las notificaciones?», «Sí, borrar» / «No») y la ventana queda vacía.
- `avisos.js`: `borrarAvisos()` guarda los ids en `musical-showdown:avisos-borrados` y los marca
  leídos; `avisosActuales()` ya no devuelve los borrados. Los que lleguen después aparecen.
- La campana muestra un **(!) rojo** (opción 2) mientras quede al menos un aviso sin borrar, aunque
  esté leído (antes: número de no leídos). `pintarGlobito()` de `menu.js`.
- `test/e2e/pantallas.spec.mjs`: el globito espera "!" y se prueba borrar (ventana vacía y sin (!)).

**Archivos:** `src/js/avisos.js`, `src/js/screens/menu.js`, `src/css/styles.css`,
`test/e2e/pantallas.spec.mjs`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** el usuario lo vio en el juego real (sin compilar) con 7 avisos de ejemplo, en
celular y PC. Con Playwright y Brave: borrar → pregunta → ventana vacía → (!) oculto. Lint y 175
pruebas pasaron; las pruebas de pantallas no corren en esta PC (Edge). Se compilaron las cuatro
versiones y se abrió la personal.

**Abierto:** la ventana de confirmación general (`showConfirm`) conserva el estilo anterior; se
rediseña con las demás ventanas.

---

## 2026-10-28 — Rediseño "Escenario nocturno": avisos de la campana

**Qué se hizo:** se llevó a la ventana de la campana (Notificaciones) el estilo del inicio. Vista
previa en vivo con avisos de ejemplo y dos acomodos para la PC (A ventana centrada, B panel a
todo el alto desde la derecha); el usuario eligió la B y dejó el celular («con avisos» y «sin
avisos») como se propuso. Quedó así:
- Vidrio oscuro con letra Inter, igual que Ajustes (sus propias variables `--a-*` en
  `.sheet:has(:is(.avisos,.home-empty))`).
- Cada aviso en su panel de vidrio con el ícono en un cuadrito del color de su tipo (rosa
  novedad, dorado promoción, violeta actualización) y la etiqueta del tipo en ese color; los
  nuevos con borde violeta y «● Nuevo» en rosa; el botón del aviso en degradado.
- Sin avisos: la campana en un círculo de degradado y el texto tenue.
- PC: panel a todo el alto que entra desde la derecha (la campana está a la derecha). Celular:
  sube desde abajo, como antes.
- `menu.js`: cada aviso lleva la clase de su tipo (`aviso-version`, `aviso-novedad`, `aviso-promo`).

**Archivos:** `src/css/styles.css`, `src/js/screens/menu.js`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas de la vista previa en vivo (celular 390 × 844 con y sin avisos; PC
1440 × 900). Lint, pruebas y las cuatro compilaciones (personal, completa, demo y APK); se le
abrió al usuario la personal.

**Abierto:** que el usuario lo pruebe. El último ajuste del color de los íconos (heredan el color
del tipo) no se vio en captura.

---

## 2026-10-28 — Rediseño "Escenario nocturno": Ajustes

**Qué se hizo:** se llevó a la ventana de Ajustes el estilo del inicio. Vista previa en vivo con
dos acomodos para la PC (A ventana centrada, B panel a todo el alto); el usuario eligió la B y
dejó el celular como se propuso. Quedó así:
- Panel de vidrio oscuro con letra Inter; en celular y PC entra desde la izquierda a todo el alto.
- Cada opción en su panel de vidrio; rótulos de grupo chicos en violeta claro; «Sí / No» con la
  elegida en blanco; barras de volumen violetas; cuenta antes de la ronda de vidrio.
- «Premium» en degradado; «Política», «Términos» y «Desvincular» de vidrio; «Salir» en rosado.
- Solo CSS: se aplica a la hoja que contiene `.home-settings` (`.sheet:has(.home-settings)`) y
  lleva sus propias variables `--a-*`, porque también se abre desde la ronda y desde el control
  del celular.

**Archivos:** `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas de la vista previa en vivo (celular 390 × 844; PC 1440 × 900 y
1366 × 768). Lint, pruebas y las cuatro compilaciones (personal, completa, demo y APK); se le
abrió al usuario la personal.

**Abierto:** que el usuario lo pruebe. «Premium» y «Salir del juego» solo aparecen en la app
compilada y no se vieron en la vista previa. En 1366 × 768 el panel se desplaza para ver el final.

---

## 2026-10-28 — Rediseño "Escenario nocturno": organizar equipos

**Qué se hizo:** se llevó a «Organizar equipos» el estilo del inicio. Vista previa en vivo; el
usuario eligió para la PC la opción B (todos los grupos en una sola fila) y pidió el celular
igual, con los grupos lado a lado. Quedó así:
- Sin la tarjeta grande: la cantidad y el nombre de los grupos en un panel de vidrio; cada grupo
  en su propio panel teñido con su color (el mismo de la ronda, `--group-color`) y un punto de
  color junto al nombre. El jugador elegido para intercambiar se marca en violeta con brillo.
- «Confirmar» en degradado y «Volver a organizar» de vidrio, uno junto al otro.
- PC: todo más grande, grupos en una sola fila y los botones centrados debajo.
- Celular: grupos de a dos por fila y los botones pegados abajo (`position:sticky`).
- `teamOrg.js`: la pantalla lleva `.organizar` (agregada a los `:is(...)` del fondo).

**Archivos:** `src/css/styles.css`, `src/js/screens/teamOrg.js`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas de la vista previa en vivo (celular 390 × 844 con 2 y 4 equipos; PC
1440 × 900 y 1366 × 768). Lint y pruebas pasaron. Se compilaron la personal, la completa, la
demo y el APK sin errores; se le abrió al usuario la personal.

**Abierto:** que el usuario lo pruebe. Nombres muy largos se parten en dos líneas dentro de la
tarjeta del celular (no probado con nombres largos).

---

## 2026-10-28 — Rediseño "Escenario nocturno": podio

**Qué se hizo:** se llevó al podio el estilo del inicio. Vista previa en vivo con dos acomodos
para la PC (A tarjeta centrada, B pantalla completa); el usuario eligió la B y pidió el celular
también a pantalla completa, igual que la B. Quedó así, en celular y PC:
- Sin tarjeta, fondo con colores que se mueven, letra Inter y pantalla centrada en el alto.
- «GANADOR» chico y espaciado; el nombre del ganador grande (52 px en el celular, 84 px en la
  PC) en el degradado de «Showdown» y su puntaje en blanco.
- Bloques del podio de vidrio teñidos de oro, plata y bronce (el primero con brillo dorado),
  más altos; MVP en una pastilla de degradado; resto de los puestos en filas de vidrio.
- «Jugar de nuevo» en degradado; «Volver al inicio», «Compartir el podio» y «Ver más» de vidrio.
- `results.js`: la pantalla lleva `.podio` y se quitaron los estilos escritos a mano del nombre
  (tamaño) y del puntaje (dorado).

**Archivos:** `src/css/styles.css`, `src/js/screens/results.js`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas del juego real con Playwright y Brave (celular 390 × 844, PC
1440 × 900 y 1366 × 768, Individual con 5 jugadores y Grupal con 3 equipos y MVP). Lint y 175
pruebas pasaron. Se compilaron la personal, la completa, la demo y el APK sin errores; se le
abrió al usuario la personal.

**Abierto:** que el usuario lo pruebe. La imagen para compartir (`compartir.js`) conserva su
diseño anterior.

---

## 2026-10-28 — Rediseño "Escenario nocturno": resultado de la ronda

**Qué se hizo:** se llevó al resultado de la ronda (acierto, fallo con intentos de sobra y ronda
sin ganador) el estilo del inicio. Vista previa en vivo con dos acomodos para la PC (A tarjeta
centrada, B pantalla completa); el usuario eligió la B y aprobó el celular. Quedó así:
- Fondo con colores que se mueven, letra Inter y pantalla centrada en el alto.
- Ícono del título en un círculo de color: verde al acertar, rosado al fallar o si nadie
  acertó, violeta si la ronda terminó sin ganador (clases `es-correcto` / `es-incorrecto` /
  `es-neutro` en `roundResult.js`).
- «+100» grande en el degradado de «Showdown»; filas de cómo quedan de vidrio, verdes si suben
  y rosadas si bajan (los puntos siguen contando hasta el valor nuevo); botón en degradado.
- Celular: tarjeta de vidrio. PC: sin tarjeta, título de 64 px, puntos de 130 px y los dos
  lados en cuadros grandes uno al lado del otro; entra en 1366 × 768.

**Archivos:** `src/css/styles.css`, `src/js/screens/roundResult.js`, `PENDIENTES.md`,
`ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas del juego real con Playwright y Brave (celular 390 × 844, PC
1440 × 900 y 1366 × 768, acierto y fallo). Lint y 175 pruebas pasaron. Se compilaron la
personal, la completa, la demo y el APK sin errores; se le abrió al usuario la personal.

**Abierto:** que el usuario lo pruebe y seguir con el podio.

---

## 2026-10-28 — Rediseño "Escenario nocturno": ronda

**Qué se hizo:** se llevó a la ronda el estilo del inicio. Se mostró una vista previa en vivo
con dos acomodos para la PC (1 «Escenario», 2 «Marcador abajo») y el celular. El usuario
eligió el 1, con todo un poco más grande, y aprobó el celular. Quedó así:
- Fondo con colores que se mueven, letra Inter y botones de arriba de vidrio.
- Cada lado conserva su color: rosa y celeste en Individual y el de su grupo en Grupal
  (`--lado`, con `color-mix`). Casillas de vidrio teñidas, barra de puntos fina con brillo,
  «Relevo», «Ronda: N» y ± de vidrio.
- Reloj de vidrio (en los últimos 5 s, rojo rosado); «Sin tiempo» más chico y en una línea.
- Palabra blanca con halo violeta y multiplicador en una pastilla de degradado. Su tamaño se
  ajusta según cuántas letras tiene (`--letras` en `round.js` + unidades `cqi`), así las
  palabras largas (hasta 13 letras, como «desesperación») entran en una línea; antes se partían
  en el celular.
- PC: lados altos a los costados (hasta 520 px), puntaje de 66 px, palabra de hasta 124 px y
  reloj de hasta 80 px, a todo el alto de la pantalla. El celular conserva el «cara a cara».

**Archivos:** `src/css/styles.css`, `src/js/screens/round.js`, `PENDIENTES.md`, `ESTADO.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas del juego real con Playwright y Brave (celular 390 × 844, PC
1440 × 900 y 1366 × 768, Individual · Clásico y Grupal · Alternativo 2). Lint y 175 pruebas
pasaron. Se compilaron la personal, la completa, la demo y el APK sin errores; se le abrió
al usuario la personal.

**Abierto:** que el usuario pruebe la ronda. El celular de control (`control.js`) y «¡X canta!»
todavía tienen el estilo anterior.

---

## 2026-10-28 — Rediseño "Escenario nocturno": Configurar partida

**Qué se hizo:** se llevó a «Configurar partida» el estilo del inicio: los mismos colores
(`--a-*`), letra Inter, fondo con colores que se mueven, botones de arriba y tarjetas de vidrio,
lo elegido en blanco (géneros, Sí / No), filas de opciones sin franjas de color y «Confirmar»
en degradado como «Jugar». Se revisó en una vista previa en vivo (celular y PC) y el usuario
pidió ajustar los tamaños de la PC y elegir el acomodo del celular entre tres (A ordenado,
B secciones, C compacto). Quedó así:
- PC: dos columnas (jugadores a la izquierda, con la lista del alto de la columna; géneros y
  opciones a la derecha), «Confirmar» centrado abajo, letra más grande (títulos 18, filas 17)
  y menos aire vertical para que Alternativo 2 entre en 1440 × 900; en pantallas de hasta
  800 px de alto se compacta más (entra en 1366 × 768).
- Celular, opción B «Secciones»: sin la tarjeta grande, jugadores, géneros y opciones cada uno
  en su panel; «Confirmar» queda pegado abajo al desplazarse; «Añadir jugador» y «Borrar
  nombres» en una fila; «Relevos por equipo» pasa el botón a la línea de abajo en lugar de
  partir el nombre en tres líneas.

La pantalla lleva la clase `config`; el bloque del fondo y las variables del inicio ahora
usan `body:has(:is(.home,.config))`.

**Archivos:** `src/css/styles.css`, `src/js/screens/config/index.js`, `PENDIENTES.md`,
`ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas del juego real con Playwright y Brave (celular 390 × 844, PC
1440 × 900 y 1366 × 768, Individual · Clásico y Grupal · Alternativo 2), iguales a la vista
previa aprobada. Lint y 175 pruebas pasaron. Se compilaron la personal (`build:personal`),
la completa (`build:desktop`), la demo (`build:demo-windows`) y el APK (`build:apk`), sin errores;
se le abrió al usuario la personal.

**Abierto:** que el usuario pruebe la pantalla y seguir con la siguiente (ver «Rediseño
"Escenario nocturno"» en `PENDIENTES.md`). Las pruebas de pantallas (Playwright con Edge)
siguen sin correr en esta PC.

---

## 2026-10-28 — Rediseño "Escenario nocturno": pantalla de inicio

**Qué se hizo:** el usuario pidió un estilo más profesional y moderno. De 4 propuestas
eligió la A «Escenario nocturno» y se empezó por el inicio, revisado en una vista previa
con celular y PC juntos. Quedó así:
- Fondo casi negro con manchas violeta, rosa y celeste que se mueven y cambian de tono;
  en el inicio reemplaza a las luces.
- Letra Inter y «Showdown» en degradado de violeta a rosa, sin el recuadro del título.
- Botones de arriba, Individual / Grupal, tarjeta y «Modos de juego» de vidrio; la opción
  elegida va en blanco y «Jugar» en degradado.
- En la PC (desde 900 px): título grande arriba y una columna centrada de 600 px, con
  la tarjeta acostada y botones más grandes. En pantallas de hasta 800 px de alto, el
  título es más chico.

Se pidió aplicarlo directo a las tres apps (demo, personal y completa). Solo cambia CSS:
el bloque final de `styles.css`, que reemplaza el acomodo anterior de la PC (escenario a
la izquierda y opciones a la derecha). Las demás pantallas siguen igual.

**Archivos:** `src/css/styles.css`, `PENDIENTES.md`, `ESTADO.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** capturas del juego real con Playwright y Brave (celular 390 × 844,
PC 1440 × 900 y 1366 × 768, Individual y Grupal), iguales a la vista previa aprobada.
Lint y 175 pruebas pasaron. Se compilaron la completa (`build:desktop`), la demo
(`build:demo-windows`), la personal (`build:personal`) y el APK (`build:apk`). Las pruebas
de pantallas (Playwright con Edge) no se corrieron porque Edge no abre en esta PC (ver
`PENDIENTES.md`).

**Abierto:** que el usuario confirme el inicio y seguir con la siguiente pantalla (ver
«Rediseño "Escenario nocturno"» en `PENDIENTES.md`).

---

## 2026-10-28 — Política y privacidad en pausa

**Qué se hizo:** por decisión del usuario se deja la política de privacidad en
pausa. Se reescribió la sección «Privacidad y parte legal» de `PENDIENTES.md` con lo
hecho y lo que falta (nombre del estudio, revisión legal, traducción, AdMob, etc.).

**Archivos:** `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Abierto:** todo lo que dice «Falta» en esa sección. Sin cambios en `src/`.

---

## 2026-10-28 — Versión 1.27 publicada

**Qué se hizo:** `npm run android:release` (versionCode 27 → 28, versionName 1.27, firma
con la clave del proyecto, SHA-256 `e0e0a02f…d5d730`, igual a la de `assetlinks.json`).
Cambios para los jugadores desde la 1.26: botón «Términos de uso» en Ajustes y que
«Política de privacidad» / «Términos de uso» abran la página en el idioma del
dispositivo. El resto (política y términos unidos y en inglés, `GOOGLE-PLAY.md`,
`TIENDAS.md`) son páginas y documentos que ya estaban en `main`.

**Archivos:** `platforms/android/android/app/build.gradle` (versión), `ESTADO.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** `aapt` confirma versionCode 28 y versionName 1.27; lint y 175 pruebas
pasaron antes. GitHub Actions «Compilar v1.27» terminó bien y la Release v1.27 quedó
publicada con `Musical-Showdown.apk`, `Musical-Showdown.AppImage` y `Musical.Showdown.exe`.
Se abrió el `.exe` final (`dist/windows`); no se instaló en un celular.

**Abierto:** el nombre del estudio y las revisiones externas de la política.

---

## 2026-10-28 — Ajustes abre la política en el idioma del dispositivo + prueba de que las dos páginas coincidan

**Qué se hizo:** (1) `paginaLegal(parte, idioma)` en `plataforma.js`: «Política de
privacidad» y «Términos de uso» de Ajustes abren `docs/privacidad/` si el idioma del
dispositivo empieza por «es» y `docs/privacy/` en los demás (los términos, con
`#parte-2`). Reemplaza `POLITICA_PRIVACIDAD` / `TERMINOS_DE_USO` de `menu.js`.
(2) `test/legal.test.js`: prueba esa función y falla si la página española y la
inglesa dejan de tener los mismos id, enlaces externos, filas de tabla o fecha, o si
no se enlazan entre sí.

**Archivos:** `src/js/plataforma.js`, `src/js/screens/menu.js`, `test/legal.test.js`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** `npm run lint` y `npm test` (175) pasan; compiladas la personal, `build:desktop` y `build:apk` (1.26). Se abrió el `.exe` personal. No se corrieron las e2e ni se probó en un celular con idioma inglés.

**Abierto:** el usuario debe probarlo; sin subir a `main`. El inglés sin revisión humana (ver `PENDIENTES.md`). Hay que seguir copiando los cambios de una página a la otra, pero ahora la prueba avisa si se desincronizan estructura o enlaces (no si cambia un texto).

---

## 2026-10-28 — `docs/vincular/` con el estilo de la política

**Qué se hizo:** la página que se abre al escanear el QR sin la app ahora usa el
mismo estilo «claro profesional» de la política: portada oscura con el ícono del
juego (en lugar del emoji 🎤), tipografía Inter (`docs/fonts/`), fondo blanco,
botones azules y un pie con enlace a «Privacidad y términos». El script que
abre la app o lleva a la descarga no se tocó.

Además, el destino de descarga quedó en dos variables (`DESCARGA_ANDROID`,
`DESCARGA_OTROS`, hoy GitHub) usadas por los dos botones; al publicar en Google Play
basta cambiar esa línea.

**Archivos:** `docs/vincular/index.html`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** abierta en Brave (en el PC; el botón «Abrir en la app» solo actúa en Android). Sin cambios en `src/`.

**Abierto:** sin publicar. Probarla en el celular tras publicar; el enlace directo a la app sigue pendiente de `assetlinks.json` (ver `PENDIENTES.md`).

---

## 2026-10-28 — Política y términos en inglés (`docs/privacy/`)

**Qué se hizo:** traducción completa al inglés de la página unida (Parte I,
17 secciones; Parte II, 16), con el mismo diseño, índice y resúmenes. Enlace
«English» / «Español» en el encabezado y el pie de las dos páginas. La española
es la original: el texto inglés lo dice y prevalece la española si difieren.

**Archivos:** `docs/privacy/index.html` (nuevo), `docs/privacidad/index.html` (enlaces al inglés), `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** 33 secciones en cada página, sin enlaces internos rotos, sin menciones a IA; abierta en Brave. Los enlaces externos del inglés apuntan a las versiones en inglés de Google y GitHub (no se comprobaron uno a uno).

**Abierto:** sin publicar. Traducción sin revisión humana. Mantener las dos páginas iguales.

---

## 2026-10-28 — `GOOGLE-PLAY.md`: respuestas para la Play Console

**Qué se hizo:** hoja interna con las respuestas de los formularios de Google Play:
datos de la app, contenido (anuncios, público 13+), Seguridad de los datos (qué se
declara y qué no, con lo de AdMob marcado «[AdMob]»), cuestionario IARC, permisos
(comprobados en el manifiesto combinado de la versión de lanzamiento),
suscripción Premium y pasos previos al lanzamiento. Avisa del riesgo de la
política de Familias por la frase «amigos y familia».

**Archivos:** `GOOGLE-PLAY.md` (nuevo, fuera de `docs/`: no se publica), `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** permisos cruzados con el manifiesto; el resto, con la política y `TIENDAS.md`. **No** se vieron los formularios reales.

**Abierto:** repasar contra la consola real; decidir planes y precios de Premium.

---

## 2026-10-28 — Revisión de enlaces de la política

**Qué se hizo:** se probaron los 3 enlaces externos de la página (GitHub, política
de Google, publicidad de Google): responden 200. Al probar la página publicada
(`maxy26.github.io/Musical-showdown/privacidad/`) y sus archivos, todo da **404**:
GitHub Pages no está activado. Se anotó como 🔴 en `PENDIENTES.md`.

**Archivos:** `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Resuelto el mismo día:** el usuario activó Pages (Settings → Pages → `main` / `/docs`) y se
comprobó: `/privacidad/`, `/fonts/inter.woff2`, `/icono.png` y `/vincular/` responden 200 y la
página es la última versión. Antes, los documentos que decían «publicada» eran una suposición.

---

## 2026-10-27 — Botón «Términos de uso» en Ajustes

**Qué se hizo:** en Ajustes, debajo de «Política de privacidad», nuevo botón
«📖 Términos de uso» que abre la Parte II de la misma página
(`TERMINOS_DE_USO` en `menu.js`, la dirección de la política + `#parte-2`). Se
reutilizó el ícono de 📖 (no hizo falta un ícono nuevo).

**Archivos:** `src/js/screens/menu.js`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** `npm run lint` y `npm test` (172) pasan; compiladas la personal
(`.exe` y APK), `build:desktop` y `build:apk` (1.26). Se abrió el `.exe` personal.
No se corrieron las pruebas de pantallas (e2e).

**Abierto:** el usuario debe probarlo; sin subir a `main` ni publicar versión.
En el celular no se instaló (no se comprobó si hay uno conectado).

---

## 2026-10-27 — `TIENDAS.md` alineado con la política

**Qué se hizo:** se corrigió lo que contradecía la política: precio y descripción
larga («sin anuncios y sin compras» → gratis con Premium opcional y anuncios no
personalizados previstos), clasificación por edad (compras y anuncios en «Sí»),
permiso `AD_ID`, respuestas de datos (AdMob compartido para publicidad, compras
por la tienda, sin análisis de uso), enlace a los términos (Parte II) y país
provisional. La demo y PC siguen sin anuncios.

**Archivos:** `TIENDAS.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** lectura cruzada contra `docs/privacidad/index.html`. Sin cambios en `src/`.

**Abierto:** sin subir a `main`. Repetir la revisión al integrar AdMob.

---

## 2026-10-27 — Política: anuncios (AdMob, no personalizados) y sin análisis de uso

**Qué se hizo:** decisiones del usuario: anuncios con AdMob previsto, **no
personalizados**, solo en la versión gratis de Android (Premium los quita); sin
análisis de uso. Se reescribió la sección 8 de la política (8.1 a 8.4: quién, tipo,
datos, opciones), se agregó AdMob a «Servicios de terceros» y una frase de que no
hay análisis de uso ni servidor propio.

**Archivos:** `docs/privacidad/index.html`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** 33 secciones, sin enlaces internos rotos, sin menciones a IA. Sin cambios en `src/`.

**Abierto:** sin publicar. Al integrar AdMob: formularios de Play, consentimiento UE.

---

## 2026-10-27 — Privacidad y términos en una sola página

**Qué se hizo:** a pedido del usuario se unieron la política y los términos en
`docs/privacidad/index.html` (misma dirección que ya usan la app y las tiendas):
Parte I (política, 17 secciones) y Parte II (términos, 16 secciones), índice
lateral con las dos partes, dos resúmenes arriba y enlaces cruzados. Se borró
`docs/terminos/`. Pie: correo y accesos a cada parte.

**Archivos:** `docs/privacidad/index.html`, `docs/terminos/` (borrada), `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** 33 secciones, 0 enlaces internos rotos, sin menciones a IA; abierta en Brave. Sin cambios en `src/`.

**Abierto:** el usuario debe revisarla; sin publicar. Datos legales pendientes (ver `PENDIENTES.md`).

---

## 2026-10-27 — Términos de uso (`docs/terminos/`)

**Qué se hizo:** páginas de términos de uso en español con 16 secciones (licencia,
edad 13+, Premium y compras por tienda, anuncios, canciones sin música ni letras,
uso aceptable, propiedad intelectual, garantías, responsabilidad, terminación,
ley aplicable, cambios, contacto), con el mismo estilo de la política. La política
ahora enlaza a los términos en el pie. Datos acordados: edad mínima 13 años,
correo `showdownmusical@gmail.com`; el nombre del estudio y el país quedan
pendientes (el usuario primero va a crear el estudio). País provisional: **Colombia** (ley aplicable de los términos y sección 1 de la política); cambiarlo si se constituye el estudio en otro país.

**Archivos:** `docs/terminos/index.html`, `docs/privacidad/index.html`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** 16 secciones, sin menciones a IA; abierta en Brave. Sin cambios
en `src/`: no hay versión nueva del juego.

**Abierto:** el usuario debe revisarla; sin publicar. Falta titular/país, enlazar
desde Ajustes (cambio en `src/`) y desde las tiendas.

---

## 2026-10-27 — Política de privacidad: estilo «B · Claro profesional»

**Qué se hizo:** el usuario eligió la muestra B de tres. Se rediseñó
`docs/privacidad/index.html`: portada oscura con título y fechas, fondo blanco
(oscuro si el sistema está en modo oscuro), tipografía Inter, columna de lectura
angosta, índice lateral fijo (arriba en celular), secciones separadas por líneas
y números en azul. Se copió `inter.woff2` y `LICENCIAS.txt` a `docs/fonts/`
(GitHub Pages no alcanza `src/`). A pedido del usuario se dejó **idéntica a la
muestra**: siempre clara (sin modo oscuro), sin ícono en la portada, con el
subtítulo, el resumen arriba de todo y el párrafo de introducción dentro de la
sección 1. Se comparó con capturas de Brave (muestra y página real).

**Archivos:** `docs/privacidad/index.html`, `docs/fonts/`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** abierta en Brave; 17 secciones.

**Publicado:** el usuario lo confirmó; se actualizaron `ESTADO.md`, `TIENDAS.md`
(público objetivo), `README.md`, `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`
(instrucciones 33 y 34) y `PENDIENTES.md`, y se subió a `main`
(GitHub Pages publica la política). Sin cambios en `src/`: no hay versión nueva
del juego (sigue la 1.26).

**Abierto:** usar el mismo estilo en los términos de uso y en `docs/vincular/` si
se quiere; datos legales pendientes (ver `PENDIENTES.md`).

---

## 2026-10-27 — Política de privacidad completa en español

**Qué se hizo:** se reescribió `docs/privacidad/index.html` con 17 secciones y
subapartados, basada en la plantilla `privacy-policy-gdpr` de General Legal (CC0,
sin copiar texto en inglés: adaptada al juego) y con estructura parecida a la de
cosmicode.games (secciones numeradas, fecha de última actualización arriba y al
final). Se agregaron usos y bases legales, conservación, transferencias
internacionales, derechos (UE/Reino Unido y EE. UU.), opciones y enlaces. Público:
adolescentes y adultos (antes decía «toda la familia»). El inglés queda como
pendiente futuro.

**Archivos:** `docs/privacidad/index.html`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación:** generada con script; 17 secciones; sin menciones a IA. No se
publicó (GitHub Pages se actualiza al subir a `main`).

**Abierto:** datos legales por completar paso a paso, términos de uso, inglés,
formularios de Google Play (ver «Privacidad y parte legal» en `PENDIENTES.md`).

---

## 2026-10-26 — Release 1.26: falló por el repositorio privado

**Qué pasó:** al subir la etiqueta `v1.26`, Actions falló al subir los
artefactos: "Artifact storage quota has been hit". El repositorio se había puesto
**privado** (cuota de unos 500 MB; había 331 artefactos, 7,6 GB solo en los
primeros 100) y con eso también quedaban sin abrirse la campana de avisos
(`avisos.js`), los enlaces de descarga y las páginas de GitHub Pages (política
de privacidad y `docs/vincular/`).

**Qué se hizo:** el usuario volvió a poner el repositorio **público** y se relanzó
la ejecución de `v1.26`: todo en verde, Release publicada con `Musical-Showdown.apk`
(firmado con la clave del proyecto), `.exe` y `.AppImage`.

**Abierto:** el repositorio debe seguir público (el juego lee de él avisos,
versiones y la política de privacidad). Los 331 artefactos viejos siguen
guardados; conviene borrar los antiguos si vuelve a llenarse la cuota.

---

## 2026-10-26 — Diseño confirmado en las tres apps; versión 1.26 publicada

**Del usuario:** la equis de los multiplicadores, del mismo color que los demás
íconos; con eso queda confirmado: pasarlo a las tres apps, actualizar y
publicar todo.

**Qué se hizo:**
- `iconosEmoji.js`: ✖️ sin color propio; siempre íconos de contorno (relleno solo
  si falta el de contorno). Se quitó `disenoNuevo()` (`edicion.js`) y la marca de
  `main.js`: el diseño nuevo es el de las tres apps.
- `icons.js`: ahora solo íconos de Material (se quitaron los dibujados a mano).
- Pantallas sin el diseño viejo: `config/index.js`, `round.js`,
  `config/alt2Options.js`, `ayudaModos.js`, `ayudaBotones.js`.
  `styles.css`: el bloque del diseño ya no depende de `data-diseno`.
- Versión 1.26 (`versionCode` 27) con `android:release`; compilados la personal,
  la PC normal y la demo.

**Cómo se verificó:** `npm test` (172) y lint bien; pruebas de pantallas con
Brave (Edge sigue sin abrir): 54 de 54 bien, celular y PC, también la demo.

**Abierto:** nada del diseño. La demo sigue en pausa para la Store
(`PENDIENTES.md`, plan por partes).

---

## 2026-10-26 — Diseño nuevo en la app personal (modificación general, en prueba)

**Del usuario:** acepta las propuestas 1, 2, 3, 4, 7, 8, 9, 11 y 12; rechaza
la 5, la 6 y la 10; cambiar el ✨ de los multiplicadores por una equis de
multiplicar; activar el diseño solo en la personal (sin rama nueva).

**Qué se hizo:**
- `edicion.js`: `disenoNuevo()` (EDICION "personal"). `main.js`: marca
  `<html data-diseno="nuevo">` antes de dibujar.
- `iconosMaterial.js`: `ICONOS_CONTORNO` (72 íconos de contorno de
  `google/material-design-icons`) y la bandera rellena. `iconosEmoji.js`: usa el
  contorno con el diseño nuevo; emojis nuevos ✖️ (`cancel` dorado) y 🚩 (`flag`).
  `icons.js`: los íconos propios (ajustes, campana, ayuda, personas, modos, jugar,
  vincular) salen de Material con el diseño nuevo.
- Pantallas (solo con el diseño nuevo): `config/index.js` (volver a la izquierda,
  redondo; `person_add`; bandera), `round.js` (pausa a la izquierda, redonda),
  `config/alt2Options.js` y `ayudaModos.js` (✖️ en multiplicadores),
  `ayudaBotones.js` (? como ícono).
- `styles.css`: bloque final `html[data-diseno="nuevo"]` con las propuestas.
- La demo y la completa no cambian (sin `data-diseno`).

**Cómo se verificó:** `npm test` (172 bien) y `npm run lint`; capturas con la
edición cambiada a "personal" al vuelo (inicio, modos, configurar, ronda, pausa),
sin errores en la consola; `npm run build:personal`.

**Qué quedó abierto:** que el usuario pruebe la app personal y confirme
(`PENDIENTES.md`, "Diseño más profesional"). No se corrieron las pruebas de
pantallas (Edge no abre en esta PC, ver `PENDIENTES.md`); no cambian para la
demo ni la completa.

---

## 2026-10-26 — Procedimiento de "modificación general" y propuestas de diseño

**Del usuario:** hacer el diseño más profesional, con los íconos de Google, como
"modificación general": probar solo en su app (personal) y dejar intactas la
demo y la completa hasta confirmar; dejar el procedimiento escrito para
repetirlo; sin rama nueva si no hace falta.

**Qué se hizo:**
- `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`: instrucción 31 (modificación general),
  junto a la 30 de las tres apps. La guía técnica la cita en las reglas clave.
- 12 propuestas de diseño mostradas en una página de prueba local fuera del
  proyecto: sirve `src/` sin cambios y, en el celular de la derecha, le suma
  un CSS y un script con las propuestas, con una casilla por cada una. Los íconos
  de contorno se bajaron de `google/material-design-icons` (Material Symbols
  Rounded, `_24px.svg`).
- `PENDIENTES.md`: nueva sección con las propuestas en revisión.

**Archivos tocados:** `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, la guía técnica,
`PENDIENTES.md`, este archivo. Sin cambios en `src/`: no se compiló.

**Cómo se verificó:** capturas de antes y después (inicio, configurar, ronda,
pausa) con Brave sin ventana; sin errores del juego en la consola.

**Qué quedó abierto:** que el usuario acepte o rechace cada propuesta
(`PENDIENTES.md`, "Diseño más profesional").

---

## 2026-10-25 — Íconos de Material Design en lugar de los emojis; pausa de la demo

**Del usuario:** pausar la demo dejando el siguiente paso en pendientes; cambiar
**todos** los emojis (también las ayudas) por íconos de
`google/material-design-icons` en las tres apps; volver a sacar las capturas; y
guardar todo en GitHub (sin versión nueva).

**Qué se hizo:**
- `src/js/iconosMaterial.js` (nuevo): trazos de los 67 íconos de Material Symbols
  Rounded que usa el juego, descargados solo esos (no el repositorio entero).
  `src/icons/LICENCIA-MATERIAL.txt`: licencia Apache 2.0.
- `src/js/iconosEmoji.js` (nuevo): tabla emoji → ícono (con color para ✅ ❌ ⭐ 🏆
  ⚠️ y las medallas) e `iniciarIconos()`, que al dibujar cualquier pantalla
  cambia los emojis por `<svg class="mi">` (no dentro de `<option>`). El código
  sigue escribiendo emojis; el texto para compartir conserva los suyos.
  `dibujarIcono()` dibuja un ícono en un canvas.
- `main.js`: llama a `iniciarIconos()` antes del primer render. `index.html`: el
  micrófono de la pantalla de carga ya es SVG. `compartir.js`: la imagen del podio
  dibuja trofeo, medallas, estrella y micrófono como íconos. `styles.css`: clase
  `.mi` (mide lo mismo que la letra) y colores. `sw.js`: archivos nuevos y v32.
- Pruebas: `test/iconos.test.js` (cada emoji tiene ícono y ninguno de las
  pantallas queda sin ícono); prueba de pantallas "Íconos: la ayuda muestra
  íconos…"; `pantallas.spec.mjs` busca "Ver modos de juego" sin el emoji.
- Capturas de la demo de nuevo (`tiendas/imagenes/demo/`).
- Errores encontrados y corregidos al revisar: la búsqueda se saltaba el primer
  emoji de cada texto (`lastIndex`), y `auto_awesome` (✨) venía en otra escala.

**Verificación:** `npm test` (172), lint y pruebas de pantallas con Brave (54) bien.
Revisadas a ojo: ayuda "Cómo se juega", modos, ajustes, ronda, canta, puntos,
podio e imagen del podio para compartir.

**Abierto:** que el usuario revise los íconos en el juego; siguiente paso de la
demo en `PENDIENTES.md` (reservar el nombre en Partner Center).

---

## 2026-10-25 — Capturas de la ficha de la demo

**Del usuario:** preparar las capturas de la demo.

**Qué se hizo:** un script temporal (fuera del proyecto) abrió la demo en Brave sin
ventana (edición "demo" al vuelo, como `demo.spec.mjs`) y guardó en
`tiendas/imagenes/demo/` 14 imágenes: inicio, configurar, ronda, "¡Ana canta!",
puntos, podio y la hoja de géneros (solo Pop, Rock y Reggaetón), en celular y en
PC (1920 × 1080). Revisadas a ojo: inicio, géneros, ronda, canta y podio. `TIENDAS.md`
actualizado.

**Abierto:** el usuario elige cuáles subir (para Windows bastan las de PC).

---

## 2026-10-25 — Demo aprobada; íconos Material Design en pendientes

**Del usuario:** aprobó la demo (solo pop, rock y reggaetón) y pidió pasar a "la
ficha" (explicada: la página de la tienda). Pidió anotar en pendientes agregar los
íconos de `google/material-design-icons` a las tres apps. Sin cambios de código.

**Qué se hizo:** sección "Íconos Material Design en las tres apps" en
`PENDIENTES.md` (licencia Apache 2.0, copiar solo los SVG usados, `sw.js`).

---

## 2026-10-25 — La demo solo con pop, rock y reggaetón

**Del usuario:** la demo solo trae pop, rock y reggaetón (nuevas y viejas); la
app propia y la oficial traen todos los géneros.

**Qué se hizo:** `src/js/data/songs.js`: `GENRES_DEMO` y `availableGenres(edicion)`
(en la demo devuelve solo esos 3; el resto, los 10). Con eso la demo no ofrece los
otros géneros en "Configurar partida" y "Más", ni los elige "Todos", ni los busca
"Buscar canción". `test/generos.test.js`: prueba de las tres ediciones.
`TIENDAS.md` y `ESTADO.md` actualizados (demo: 60 canciones en 3 géneros).

**Verificación:** `npm test` (170) y lint bien. Compilado de nuevo y abierto.

**Abierto:** ¿los 7 géneros extra en la oficial son gratis o solo con Premium?

---

## 2026-10-25 — Letras que faltaban (letras.com.br) y compilación

**Del usuario:** buscar las letras que faltaban en `letras.com.br`; compilar y abrir
el juego; la demo tendrá **menos géneros** (pendiente, ver `PENDIENTES.md`).

**Qué se hizo** (`src/js/data/songs.js`): se encontraron 6 de 8 (la dirección
correcta sale de buscar con `allowed_domains: letras.com.br`): Waka Waka (vamos),
Kumbalá (pasión, música, pareja; "kumbala" es el nombre de un bar), Bzrp 53
(tipos, igualita), Bzrp 52 (noches, contigo); Llorarás y Aguanile quedaron sin
extras (el coro repite solo el título). Todas sin vulgaridades. **Sin letra:**
Columbia (no está en el sitio) y Nena Maldición (no la encontré).

**Compilado:** `build:desktop`, `build:apk`, `build:demo-windows` y
`build:personal`. Pruebas (169) y lint bien.

**Abierto:** letras de Columbia y Nena Maldición (las pasa el usuario o se
cambian); elegir los géneros de la demo.

---

## 2026-10-25 — Urbano: se quitan las 4 dudosas y entran 5 limpias más

**Del usuario:** quitar Sola, TQG, Despechá y Feliz Cumpleaños Ferxxo y buscar
reemplazos.

**Qué se hizo** (`src/js/data/songs.js`): entran "Baila Baila Baila" (Ozuna),
"Vaina Loca" (Ozuna y Manuel Turizo), "Mi Cama" (Karol G), "Una Lady Como Tú" y
"La Bachata" (Manuel Turizo; en esta última "bachata" solo está en el título).
Descartadas: Desconocidos, Soltera, Desesperados, Sin Pijama, Mía y Dákiti
(palabras vulgares o drogas). Urbano queda en **18**; el catálogo, en **198**.
Quitadas nuevas para la lista de Premium: Sola, TQG, Despechá y Feliz
Cumpleaños Ferxxo.

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

---

## 2026-10-25 — Urbano: se quitan Callaíta, Provenza y Saoko; entran 5 limpias

**Del usuario:** quitar las tres y buscar reemplazos limpios. **Cambio de plan:**
el catálogo limpio es para la app gratis/demo; en Premium se agregan las quitadas,
tras una nueva revisión (las mejores de las peores). Ver "Catálogo gratis vs.
Premium" en `PENDIENTES.md`.

**Qué se hizo** (`src/js/data/songs.js`): entran "Si Antes Te Hubiera Conocido",
"Ay, Dios Mío!" y "Mayores" (Karol G / Becky G), y "Tal Vez" y "Nublado" (Paulo
Londra). Descartadas por palabras vulgares o drogas: Amorfoda, Ni Bien Ni Mal,
Normal, Vete, Qué Más Pues, A Veces, Cairo. Urbano queda en **17**; el catálogo
en **197**. Dudosas aún dentro: Despechá, Feliz Cumpleaños Ferxxo, TQG, Sola.

**Verificación:** `npm test` (169) y lint bien (un fallo de coma propio, corregido
al momento). No se compiló todavía.

---

## 2026-10-25 — Urbano: palabras vulgares → se quitan 4; letras desde letras.com.br

**Del usuario:** aprobó regional, quitar "Contrabando y Traición" (hecho) y seguir
con trap y urbano; permitió buscar letras en letras.com.

**Fuente de letras:** `letras.com` y `letras.mus.br` dan 403; `www.letras.com.br`
(mismo sitio, dirección `/artista/cancion`) sí abre y se usó para las canciones
que faltaban.

**Qué se hizo** (`src/js/data/songs.js`):
- Extras para las que no se habían podido leer: Me Va a Extrañar, Bésame Mucho,
  Tu Cárcel, Obsesión, El Jardinero, Cielito Lindo, La Media Vuelta, En
  Barranquilla Me Quedo.
- **Error de título corregido:** "Hijos de la Luna" es "Hijo de la Luna" (clave
  `hijo`, extras luna, gitana, amanecer, madre).
- Urbano: extras para Sola, Mañana Será Bonito, Ojitos Lindos, Te Felicito y
  Adán y Eva. Se quitaron **Yonaguni** (cabrón, culo), **Mónaco** (mierda,
  cojones, putero), **La Jumpa** (puta, joder, chingar) y **Todo de Ti** (culo y
  drogas). Urbano queda en **15** canciones; el catálogo, en **195**.

**Pendiente de decisión:** Callaíta (marihuana, culito), Provenza (hierba),
Feliz Cumpleaños Ferxxo (pastillas; "cumpleaños" ni se canta), Despechá y Saoko
("fuck" en inglés), TQG ("culito") y Sola (insinuación y "fumando"); y las sin
comprobar: Waka Waka, Kumbalá, Llorarás, Aguanile, Bzrp 53, Bzrp 52, Columbia y
Nena Maldición.

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

---

## 2026-10-25 — Regional mexicano: palabras extras; cierre de merengue

**Del usuario:** aprobó merengue y pasó las letras de Pégame Tu Vicio, Volvió
Juanita y Compadre Pedro Juan (ya con extras en `songs.js`). Siguió con regional.

**Qué se hizo** (`src/js/data/songs.js`): extras del coro para 11 de las 20 de
regional. Sin extras: "El Rey" y "Contrabando y Traición". Sin comprobar: Cielito
Lindo, La Bikina, Ella, La Media Vuelta, Paloma Negra y Mi Credo. "El Sinaloense"
no canta "sinaloense" (canta "Sinaloa"; se agregó como extra).

**Aviso:** "Contrabando y Traición" cuenta una historia de contrabando de
marihuana; el usuario la había dejado el 24-10 con la palabra `traición`, pero la
regla del 21-10 excluye drogas/narco. Pendiente de decisión.

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

---

## 2026-10-25 — Merengue: palabras extras del coro; vuelve "Hermanita"

**Del usuario:** devolver solo "Hermanita" (bachata, `lloras`); "La Bebé" sigue
fuera. Seguir con merengue.

**Qué se hizo** (`src/js/data/songs.js`): extras del coro para 12 de las 20 de
merengue (ninguna tiene palabras vulgares en el coro). Sin extras: "El Baile del
Perrito" (el coro solo repite el título). Sin comprobar (letra no disponible):
La Dueña del Swing, El Jardinero, Pégame Tu Vicio, Volvió Juanita y Compadre
Pedro Juan. Solo-título: La Cosquillita, Rompecintura y El Africano.

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

---

## 2026-10-25 — Criterio aclarado: la insinuación no es motivo para quitar

**Del usuario:** las canciones con insinuación pero sin palabras vulgares dichas
directamente ("sexo", "puta", "chocha", "cochina"…) no se quitan.

**Qué se hizo** (`src/js/data/songs.js`): vuelven "Propuesta Indecente"
(`propuesta`, `aventura`) e "Imitadora" (`imitadora`, `dime`); bachata queda en
20 (con "Corazón Sin Cara"). "Eres Mía" y "El Perdedor" se quedan. Siguen
quitadas "Hermanita" (coro de violencia, otro motivo) y "La Bebé (Remix)" y
"Jefe de Jefes" (narco/drogas/alcohol): pendiente que el usuario confirme si
"La Bebé" vuelve. Memoria actualizada.

**Verificación:** ver la entrada de bachata (169 pruebas y lint).

---

## 2026-10-25 — Bachata: coro revisado, 3 quitadas y extras (pregunta 6)

**Del usuario:** aprobó cumbia, pasó las letras de 7 canciones de cumbia (ya con
extras: pollera, sampuesana, colegiala, cariñito, juana, cumbia, río) y pidió
seguir con bachata.

**Qué se hizo** (`src/js/data/songs.js`): se quitaron "Propuesta Indecente",
"Imitadora" (coros sexuales) y "Hermanita" (coro de violencia). Entra "Corazón Sin
Cara" (Prince Royce, `cara`). Bachata queda en 18 canciones. Extras del coro para
Frío Frío, Odio, Mi Corazoncito, Inmortal, Cuándo Volverás, Darte un Beso, Las
Cosas Pequeñas, Fukuoka, Bachata Rosa y Te Extraño.

**Dudosas que se dejaron:** "Eres Mía" (insinuación y tono posesivo) y "El
Perdedor" (una referencia sexual); decide el usuario. Sin comprobar: "Obsesión".
Reemplazos descartados: "Un Beso" y "Todavía Me Amas" (contenido sexual).

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

---

## 2026-10-25 — Cumbia: palabras extras del coro (pregunta 6)

**Del usuario:** aprobó balada y pidió seguir con cumbia; ofreció pasar las
letras de las canciones que no se puedan leer en internet.

**Qué se hizo** (`src/js/data/songs.js`): 13 de las 20 de cumbia recibieron
palabras del coro (`lyricfluent.com`). Sin extras y sin comprobar (la página no
las tiene): La Pollera Colorá, La Cumbia Sampuesana, La Colegiala, Cariñito,
Juana la Cubana, Baila Esta Cumbia y Cumbia Sobre el Río. Solo-título: "17 Años"
(se canta el 17, no "años"), "Bidi Bidi Bom Bom" y "La Cumbia Cienaguera".

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

**Abierto:** que el usuario apruebe la tanda y pase las letras de las 7 sin
comprobar; siguen bachata, merengue, regional mexicano y urbano.

---

## 2026-10-25 — Balada: palabras extras del coro (pregunta 6)

**Del usuario:** revisar balada y agregar palabras extras del coro.

**Qué se hizo** (`src/js/data/songs.js`): 15 de las 20 canciones de balada
recibieron 1 a 3 palabras del coro (sacadas de `lyricfluent.com`). Quedaron sin
extras: Querida, Me Va a Extrañar, Bésame Mucho y Tu Cárcel (letra no
comprobable) y Contigo Aprendí (el coro no repite palabras útiles). Se
descartaron "cuerpo" y "humedad" de Tengo Todo Excepto a Ti.

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

**Abierto:** que el usuario apruebe la tanda; siguen cumbia, bachata, merengue,
regional mexicano y urbano.

---

## 2026-10-25 — Catálogo: se quitan 2 canciones no familiares (pregunta 3)

**Qué se hizo** (`src/js/data/songs.js`): se quitó "La Bebé (Remix)" (coro con
alcohol e insinuaciones) y "Jefe de Jefes" se cambió por "La Bamba" (coro de
narco/violencia). "Odio" y "Hasta el Amanecer" se quedan. "Te Boté" (coro no
comprobable) se reemplazó a pedido del usuario por "Súbeme la Radio" (reggaetón).

**Verificación:** `npm test` (169) y lint bien. No se compiló todavía.

**Abierto:** el catálogo tiene 199 canciones y los textos dicen 200 (`TIENDAS.md`,
`ESTADO.md`, `CONTEXTO-MUSICAL-SHOWDOWN.md`); confirmar el coro de "Te Boté".

---

## 2026-10-25 — Revisión de las palabras del catálogo contra las letras

**Del usuario:** revisar todas las canciones (pregunta 2). Sin cambios de código.

**Qué se hizo:** por cada canción se consultó su página en `lyricfluent.com` y se
preguntó si cada palabra (clave y extras) aparece en la letra. Resultado y
detalle en `PENDIENTES.md`, pregunta 2: ~155 de 200 confirmadas, ~45 sin
comprobar (404), 1 palabra extra que no aparece (`viaje`) y 13 casos solo-título.

**Límites:** la respuesta viene de un resumidor, no de leer la letra; los "no"
no son seguros (Bidi Bidi y Despechá sí se cantan). Los "sí" se calibraron con
una palabra falsa (dio "no").

**Abierto:** decidir si se quita `viaje` y qué hacer con los casos solo-título.

---

## 2026-10-25 — Plan por partes: demo, propia y completa

**Del usuario:** dividir el proyecto en 3 apps (demo, propia, completa/final) y
enfocarse primero en sacar y terminar por completo la demo; después, la propia
y la final a la vez.

**Qué se hizo:** sección "Plan por partes del proyecto" en `PENDIENTES.md`, con
lo que falta para cerrar la demo. Sin cambios de código.

---

## 2026-10-25 — Catálogo: 1 de las 7 canciones de reemplazo vuelve a su original

**Regla nueva del usuario:** las canciones sin palabras seguras que las
representen e identifiquen se quitan directamente (no importa si la palabra es
obvia). Por eso "Safaera" se quitó (`muévelo` y `hoy` eran genéricas) y quedó
"Provenza"; solo "La Diabla" volvió. Los otros 5 reemplazos quedan definitivos.
Lo que sigue describe la primera pasada, antes de esa regla.

**Del usuario:** pregunta 1 de pendientes, opción 2: buscar la letra en internet y,
si una canción tiene palabras normales que la identifiquen, ponerla; si no, se
deja el reemplazo.

**Qué se hizo** (`src/js/data/songs.js`):
- "La Diabla" (Romeo Santos) vuelve en lugar de "Un Beso": clave `diabla`, más
  `revancha` y `barajas` (palabras del coro).
- "Safaera" (Bad Bunny) vuelve en lugar de "Provenza": clave `muévelo`, más
  `hoy` (las más repetidas y limpias).
- Siguen los reemplazos de Sobredosis, Abusadora, Los Infieles, Bichota y
  Mamichula: el coro no trae una palabra familiar que la identifique
  (Sobredosis y Los Infieles tratan temas adultos; Bichota tiene un coro sin
  palabras propias) o no se encontró la letra (Abusadora, Mamichula).

**Cómo se verificó:** `npm test` (169) y lint bien. Las palabras salen de un
resumen de páginas de letras, **no de leer la letra completa**: conviene que el
usuario las confirme. No se compiló ni se abrió el juego todavía.

**Abierto:** que el usuario revise esas palabras; Abusadora y Mamichula, buscar
la letra por otra vía.

---

## 2026-10-24 — Recordar a los jugadores y la configuración entre partidas

**Del usuario:** pidió continuar con "recordar a los jugadores" y eligió
**nombres + configuración**, guardados **al empezar la partida**, con botón
para borrar los nombres.

**Qué se hizo:**
- `src/js/settings.js`: `loadLastConfig(defaults)` y `saveLastConfig(config)`
  (clave `musical-showdown:ultima-partida`); solo se aceptan las claves y tipos
  de la configuración base; si el almacenamiento falla, no pasa nada.
- `src/js/state.js`: `freshState()` mezcla la configuración base con la
  guardada, así también se recuerda después de `resetState()`.
- `src/js/screens/config/index.js`: se guarda al tocar "Confirmar" (ya validado)
  y botón "🗑 Borrar nombres" (aparece si hay nombres escritos).
- `test/e2e/partida.spec.mjs`: prueba "Recordar jugadores".

**Verificación:** `npm test` (169) y lint bien; pruebas de pantallas con Brave
(Edge sigue sin abrir): 49 de 50 bien, la que falló ("Ronda con reloj") pasó al
repetirla sola (cae por tiempo al correr todas juntas).

**Confirmado por el usuario y publicado como la 1.25** (`versionCode` 26). Abierto:
los nombres de los grupos (Grupal) no se recuerdan, solo los jugadores.

---

## 2026-10-24 — Catálogo: la misma canción con una palabra familiar; preguntas en pendientes

**Del usuario:** aclaró que no quería cambiar la canción sino **una palabra más
familiar para la misma canción**; que las preguntas sin responder queden en
`PENDIENTES.md`; y una recomendación de mejora por cada publicación.

**Qué se hizo:**
- `src/js/data/songs.js`: se volvieron a poner las canciones originales en 6
  casos, con una palabra del título: "Desnúdate Mujer" (`mujer`), "Propuesta
  Indecente" (`propuesta`), "Pégame Tu Vicio" (`pégame`), "Contrabando y
  Traición" (`traición`), "Por Tu Maldito Amor" (`amor`) y "Nena Maldición"
  (`nena`). Se quitaron los reemplazos hechos antes para ellas.
- Quedan 7 con canción de reemplazo (Sobredosis, Abusadora, Safaera, La Diabla,
  Los Infieles, Bichota, Mamichula): el título solo tiene la palabra dudosa y
  no se pudo confirmar otra con la letra. Pregunta 1 de pendientes.
- `PENDIENTES.md`: sección "Preguntas para el usuario (sin responder)" (12) y
  tabla "Mejora recomendada por publicación".

**Cómo se verificó:** lint sin avisos; `npm test`: 169 bien. Compilados: demo,
`.exe`, APK y personal.

**Qué quedó abierto:** las preguntas de `PENDIENTES.md`.

---

## 2026-10-24 — Arreglos de la revisión de la demo (compartir, texto de Premium, pruebas)

**Del usuario:** que se arreglen los puntos 1, 2 y 3 de la revisión y se
terminen los pendientes (compilar todo y guardar en GitHub).

**Qué se hizo:**
1. **Compartir el podio** (`src/js/compartir.js`): en la demo sin Store ID ya
   no lleva el enlace de GitHub; el texto y la imagen dicen "Búscalo gratis en
   la Microsoft Store" (`lineaDeDescarga`). Cuando `tienda.js` tenga el enlace
   de la demo, se usa ese. Prueba nueva en `test/compartir.test.js`.
2. **Ventana "Versión completa"** (`screens/modesManual.js`): solo lista
   Alternativo 1, con reloj. Se quitaron Alternativo 2 y escuchar el canto
   porque son de Premium y en PC todavía no se compra.
3. **Pruebas de pantallas de la demo** (`test/e2e/demo.spec.mjs`, 4 pruebas
   por tamaño): sin "Vincular", ayuda solo la primera vez, la campana no pide
   `/releases` y la ventana de Ajustes (sin Premium ni enlaces). Se comprobó
   que la de Vincular falla si se quita el cambio de `vinculo.js`.
- `sw.js` v31.

**Cómo se verificó:** lint sin avisos; `npm test`: 169 bien; pruebas de
pantallas: 50 bien (con Brave: Edge se actualizó hoy y ya no abre, ver
`PENDIENTES.md`). Compilados: demo, `.exe`, APK y personal.

**Qué quedó abierto:** que el usuario pruebe la demo; las canciones dudosas
("maldito", "La Diabla", "Los Infieles", "Bichota", "Mamichula"); revisar
las 8 palabras nuevas contra las letras; Edge para las pruebas.

---

## 2026-10-21 — Catálogo para toda la familia; salsa revisada

**Del usuario:** aprobó la tanda de salsa y pidió que las palabras sean para
toda la familia.

**Qué se hizo (`src/js/data/songs.js`):** se revisó todo el catálogo y se
cambiaron 7 canciones: "Desnúdate Mujer" → "Todo Tiene Su Final" (Willie
Colón y Héctor Lavoe); "Propuesta Indecente" → "Corazón Sin Cara" (Prince
Royce); "Sobredosis" → "Frío, Frío" (Juan Luis Guerra); "Abusadora" → "El
Tiburón" (Proyecto Uno); "Pégame Tu Vicio" → "Muchacho Malo" (Olga Tañón);
"Contrabando y Traición" → "Las Mañanitas"; "Safaera" → "Provenza" (Karol G).
Se quitó "borracho" de "Lamento Boliviano". Regla nueva en `PENDIENTES.md`
(criterio del catálogo) y en la guía técnica.

**Cómo se verificó:** lint sin avisos; `npm test`: 168 bien. Compilados:
demo, `.exe`, APK y personal.

**Qué quedó abierto:** las canciones dudosas ("maldito", "La Diabla", "Los
Infieles", "Bichota", "Mamichula") las decide el usuario; siguen los otros 6
géneros sin revisar.

---

## 2026-10-21 — PRUEBA: mejoras de la demo (de la más fácil a la más compleja)

**Del usuario:** le gustaron las 8 mejoras recomendadas para la demo; pidió
hacerlas de la más fácil a la más compleja.

**Qué se hizo:**
1. **Permisos del paquete:** `build/build-desktop.js` arma para la demo de la
   Store un archivo de configuración aparte (en la carpeta temporal), porque
   `-c.appx.capabilities` por consola no reemplaza la lista. El paquete pide
   solo `internetClient` y `runFullTrust`. Antes declaraba micrófono y red
   local, aunque `TIENDAS.md` decía que no.
2. **Sin "📱 Vincular":** `puedeSerPantalla()` y `puedeSerControl()`
   (`vinculo.js`) dan `false` en la demo; se van los botones del inicio y de la
   ronda.
3. **Campana:** en la demo, `cargarAvisos()` (`avisos.js`) no pide las
   versiones de GitHub; las novedades de `avisos.json` siguen.
4. **Ventana "Versión completa"** (`abrirVersionCompleta()` en
   `screens/modesManual.js`): qué trae (Alternativo 1; con Premium,
   Alternativo 2 y escuchar el canto) y "Muy pronto en la Microsoft Store".
   Ya no lleva a descargar desde GitHub (se quitó `DESCARGA_COMPLETA`).
5. **"Cómo se juega"** se abre sola la primera vez en la demo (`menu.js`,
   clave `musical-showdown:vio-ayuda`).
6. **"⭐ Versión completa"** en Ajustes de la demo.
7. **Podio:** botón "✨ ¿Les gustó? Mira qué trae la versión completa".
8. Revisión de los 7 géneros sin revisar: se le mostró la tanda de salsa.
- Estilos nuevos `.version-completa-lista` y `.version-completa-pronto`;
  `sw.js` v30. Comentarios viejos de `roundResult.js` y `results.js` ("demo:
  espacio para un anuncio") corregidos: los anuncios no van en la demo.

**Cómo se verificó:** lint sin avisos; `npm test`: 168 bien; pruebas de
pantallas: 42 bien. Se leyó `AppxManifest.xml` del paquete de la demo:
solo `internetClient` y `runFullTrust`. Compilados: demo, `.exe`, APK y
personal. Se le abrió la demo.

**Qué quedó abierto:** que el usuario pruebe y confirme; la revisión de los
géneros (empieza por salsa).

---

## 2026-10-21 — Demo confirmada; documentos sin menciones de herramientas

**Del usuario:**
- La demo "está bien así".
- Que se quiten las menciones de herramientas de los archivos del proyecto.
- `recuperar.yml` fue un error suyo, de otro proyecto. Se comprobó que
  `compilar.yml` quedó igual que antes de sus cambios en la web (sin
  diferencias con `d528cf1`).
- Antes de subir la demo, pidió recomendaciones de mejoras para ella.

**Qué se hizo:**
- Se cambiaron las frases en `AUDITORIA-CAMBIOS.md`, `CONTEXTO`, `ESTADO`,
  `PENDIENTES`, `TIENDAS`, `INSTRUCCIONES` y `README`, y dos comentarios
  (`src/js/data/songs.js`, `build/android-release.js`).
- La guía técnica queda solo en la PC: se sacó de git y se excluyó en
  `.git/info/exclude`. El historial anterior no se toca.

**Cómo se verificó:** ningún archivo de git tiene ya esas menciones; lint y
`npm test` sin fallas.

---

## 2026-10-21 — Flujo de compilación corregido; demo abierta para probar

**Qué se hizo:**
- Al enviar a `main` había cambios hechos desde la web de GitHub en
  `.github/workflows/compilar.yml`. Su primera línea había quedado como
  `@@ -1,182 +0,0 @@`, un resto de algo pegado, y eso rompía la compilación
  (falló la ejecución de `c4ed1c3`). Se quitó esa línea (`94803c4`). También
  se creó y se borró un `recuperar.yml` ("key recovery"); queda por confirmar
  con el usuario que lo hizo él.
- El usuario eligió seguir con la **demo de la Microsoft Store**: se compiló
  (`npm run build:demo-windows`) y se le abrió.
- Se revisaron menciones a herramientas en los documentos y se anotaron en
  `PENDIENTES.md` (Entorno), para decidir con el usuario.

**Cómo se verificó:** la ejecución de GitHub Actions de `94803c4` salió bien:
pruebas y lint, Windows, Linux y Android. "Publicar versión" se saltó porque
no hay etiqueta.

**Qué quedó abierto:** que el usuario confirme la demo o pida cambios.

---

## 2026-10-21 — Se guarda en GitHub el trabajo de las partes 35 a 39 (sin versión nueva)

**Pedido del usuario:** "publica lo que falte". Se le avisó que una versión
nueva dejaría la completa sin Alternativo 2 ni la escucha del canto (el cobro
todavía no funciona) y eligió **solo guardar en GitHub**: commit y envío a
`main`, sin etiqueta ni Release. La demo y Premium siguen EN PRUEBA.
**Cómo se verificó:** lint sin avisos; `npm test`: 168 bien.

---

## 2026-10-21 — ESTADO.md: resumen del proyecto

**Pedido del usuario:** un resumen del estado del proyecto (qué está hecho, qué
falta y decisiones importantes) en `ESTADO.md`. **Qué se hizo:** `ESTADO.md`
nuevo, armado desde la auditoría y los pendientes; enlazado en `README.md` y
la guía técnica. No se tocó el juego.

---

## 2026-10-13 — Sesión 8 (parte 39): PRUEBA — cómo se ve con Premium; política publicada

**Del usuario:**
- Publicar la política de privacidad nueva.
- Actualizar la app del celular (ya conectado).
- Todavía **no** seguir con la consola de Google Play: el diseño del sistema
  de pago no está terminado.
- Agregar en todas las versiones **cómo se ve cuando se paga Premium**, y que
  su app personal se vea así.

**Qué se hizo:**
- **Política publicada:** commit solo de `docs/privacidad/index.html` y
  `docs/icono.png` (`d528cf1`), subido a `main`; comprobada en línea.
- `edicion.js` → `premiumActivo()`: en la versión completa al pagar; en la
  copia personal, siempre. Con Premium:
  - **Inicio:** insignia dorada "⭐ PREMIUM" sobre el título.
  - **Ajustes:** "⭐ Premium activo" (borde dorado), también en la personal.
  - **Modos de juego:** Alternativo 2 con la etiqueta "⭐ Premium".
  - **Ventana Premium:** "✅ Ya tienes Premium" con "Ver o cancelar la
    suscripción"; en la personal, "Premium activo (versión personal)".
- Prueba nueva en `compras.test.js`.

**Cómo se verificó:** lint sin avisos; `npm test`: 168 bien; pruebas de
pantallas: 42 bien. Se compilaron la personal y la normal (PC y Android). La
**personal se instaló en el celular del usuario**: la captura muestra la
insignia "⭐ PREMIUM" y "v1.24 · personal". Se abrieron los dos `.exe`.

---

## 2026-10-13 — Sesión 8 (parte 38): versión personal del dueño y regla de compilar PC y celular

**Del usuario:**
- Confirmó los precios en USD: 1,99 al mes y 14,99 al año, con 7 días
  gratis.
- Pidió actualizar sus versiones de celular y PC, y tener las mismas versiones
  **con todo desbloqueado para su uso personal**.
- Regla nueva: **cada actualización se hace para los dos dispositivos**
  (instrucción 30).

**Qué se hizo:**
- Edición **"personal"**: todo abierto, sin anuncios ni Premium. En el
  inicio dice "v… · personal".
- `--personal` en `build-desktop.js` (con su propia carpeta temporal,
  `MusicalShowdownPersonal`, para abrirse junto a la normal) y en
  `build-android.js`.
- **`npm run build:personal`** (`build/build-personal.js`) →
  `dist/personal/Musical Showdown (personal).exe` y
  `MusicalShowdown-personal.apk`, firmado con la clave del proyecto. No se
  publica; `dist/` no está en git.
- Prueba nueva en `edicion.test.js`.
- Instrucción 30 en `INSTRUCCIONES`, la guía técnica y memoria.

**Cómo se verificó:** lint sin avisos; `npm test`: 167 bien. Se compilaron
la personal (PC y Android) y la normal (`build:desktop` y APK firmado
`dist/MusicalShowdown-PRUEBA.apk`). Se abrieron los dos `.exe`. El celular no
estaba conectado.

---

## 2026-10-13 — Sesión 8 (parte 37): PRUEBA — Premium con Google Play (sistema de compras) y política de privacidad nueva

**Del usuario:**
- Pidió hacer el sistema de compras. Ya tiene cuenta de Google Play.
- Eligió **una sola app gratis con Premium adentro**: Clásico y Alternativo 1
  gratis, anuncios en el celular; Premium desbloquea Alternativo 2, escuchar
  el canto y quita los anuncios.
- Preguntas respondidas:
  - el precio se fija por país en la consola (Google convierte e incluye
    impuestos); recomendación: 1,99 USD al mes o 14,99 USD al año, con 7 días
    gratis y más barato en Latinoamérica;
  - la demo en Google Play no conviene como app aparte;
  - el juego se puede publicar en todo el mundo (cuidados: consentimiento de
    anuncios en Europa, público 13+, impuestos a cargo de la tienda);
  - las 12 personas: es común lograrlo y, si no se llega, la app sigue en
    prueba cerrada sin castigo;
  - pidió una política de privacidad más profesional.

**Qué se hizo:**
- **`ComprasPlugin.java`** (nuevo), complemento propio con Google Play
  Billing 7.1.1 (`build.gradle`; registrado en `MainActivity`):
  - `productos`: planes y precio en la moneda del jugador;
  - `comprar`: abre el pago de Google Play;
  - `consultar`: qué suscripciones están activas;
  - reconoce las compras para que Google no las devuelva.
- **`compras.js`** reescrito:
  - suscripción `premium` (`INCLUYE_PREMIUM`: alternativo2, voz y
    sinAnuncios);
  - guarda lo último que se supo para funcionar sin internet y revisa al
    abrir el juego y al volver a él (`main.js`);
  - `ordenarPlanes`, `textoPeriodo`, `textoPrueba`.
- **`screens/premium.js`** (nuevo), ventana "Musical Showdown Premium":
  - qué incluye, los planes con su precio y la prueba gratis;
  - "Restaurar compras" y "Ver o cancelar la suscripción";
  - en PC: "por ahora, desde la app de Android".
  - Se abre desde Ajustes ("⭐ Premium", solo en la versión completa) y desde
    el candado de Alternativo 2 ("⭐ Ver Premium").
- `edicion.js`: Premium quita los anuncios.
- `build/android-release.js` genera también el **`.aab`** para Google Play.
- **Política de privacidad rediseñada** (`docs/privacidad/index.html` y
  `docs/icono.png`):
  - encabezado con el ícono, vigencia, resumen, índice y 12 secciones (tabla
    de permisos, terceros, compras, anuncios, menores, derechos, seguridad);
  - modo claro y oscuro. **Sin publicar todavía**: se le abrió al usuario
    para que la apruebe.
- `sw.js` v29; prueba nueva `test/compras.test.js` (4).

**Cómo se verificó:**
- Lint sin avisos; `npm test`: 166 bien; pruebas de pantallas: 42 bien.
- Android compila con el complemento (APK y `.aab`).
- El cobro real no se pudo probar: hace falta subir la app a Google Play y
  crear la suscripción en la consola.

**Qué quedó abierto:**
- El usuario aprueba y publica la política.
- Crear la app y la suscripción en la consola de Google Play (guiado).
- Subir el `.aab` a una prueba interna o cerrada.
- Probar la compra con una cuenta de prueba de licencias.

---

## 2026-10-13 — Sesión 8 (parte 36): PRUEBA — reglas de la demo, lo que se cobra y lugares de anuncios

**Pedido del usuario (al ver la demo):**
- El aviso del candado debe dar el **enlace de descarga** de la versión
  completa.
- Los anuncios son para la **versión final**, **solo en el celular**. No hay
  que mostrar "Publicidad": el lugar queda vacío hasta que haya un anuncio.
- La etiqueta debe decir **"versión · demo"**.
- La demo, y también la versión completa gratis, **no escuchan el canto**:
  solo "Buscar canción".
- **Se cobra:** el modo **Alternativo 2** y la **IA** que escucha e
  identifica lo cantado.
- La demo muestra solo **Clásico** (se juega) y **Alternativo 1** (sin
  jugar); **Alternativo 2 no aparece**.
- Preguntó cómo funcionan las 12 personas de Google Play. Se le explicó:
  inscripción en la prueba cerrada, 14 días seguidos, invitar a 15–20 y qué
  pasa si alguien se sale o desinstala.

**Qué se hizo:**
- `edicion.js` reescrito:
  - `EDICION`: "demo", "completa" (todas las compilaciones normales:
    `build-desktop` y `build-android`) o vacío (desarrollo y pruebas: todo
    abierto).
  - `modoOculto`, `modoBloqueado` (demo: solo Clásico; completa: Alternativo
    2 de pago) y `escuchaCanto` (demo nunca; completa solo con la compra).
  - `conAnuncios`: completa y en el celular.
- `compras.js` (nuevo): `tieneCompra()`, que todavía no hay compras, así que
  nada está comprado.
- `anuncios.js`: el lugar `[data-anuncio]` queda vacío e invisible
  (`:empty{display:none}`); solo en la completa del celular.
- `modesManual.js`: oculta Alternativo 2 en la demo; candado "🔒 Versión
  completa" con "⬇️ Descargar la versión completa" (GitHub, última versión),
  y en la completa "🔒 Desbloquear" / "Modo de pago".
- "Cómo se juega" (`modals.js`) tampoco nombra Alternativo 2 en la demo.
- `round.js`: los 3 segundos de escucha solo si `escuchaCanto()`.
- Inicio: "Versión · demo". Si el modo elegido está oculto o bloqueado, vuelve
  a Clásico.
- `sw.js` v28; `test/edicion.test.js` reescrito (4 pruebas).

**Cómo se verificó:** lint sin avisos; `npm test`: 162 bien; pruebas de
pantallas: 42 bien (en desarrollo todo sigue abierto). Capturas de la demo
compilada: inicio sin recuadro, dos modos y el aviso con el botón de
descarga.

**Qué quedó abierto:**
- **Ojo:** la próxima versión completa (GitHub y tiendas) ya no tendrá
  Alternativo 2 ni la escucha del canto hasta que existan las compras.
  Avisarle al usuario antes de publicarla.
- Que el usuario confirme la demo; reservar "Musical Showdown Demo" en
  Partner Center.

---
## 2026-10-13 — Sesión 8 (parte 35): PRUEBA — demo gratis para la Microsoft Store y espacios para anuncios

**Pedido del usuario:**
- Subir a la Microsoft Store una **demo gratis**, aparte de la versión
  completa (la 1.24 se queda en GitHub y la completa irá después a la tienda
  como otro producto).
- La versión final será gratis, pero **cobrará por jugar otros modos** (no
  por la app).
- Agregar **anuncios** y tener su espacio en pantalla.
- Ver la demo antes de subirla.
- Objetivo del usuario: juntar las 12 personas activas que pide Google Play.
  Se le aclaró que tienen que ser de la **prueba cerrada de Google Play**,
  no de la Microsoft Store.

**Qué se hizo (propuesta para que el usuario la vea):**
- `src/js/edicion.js` y `EDICION` en `version.js` (los escribe
  `build/stamp.js`):
  - En la demo solo se juega **Clásico** (Individual o Grupal, todas las
    canciones).
  - Alternativo 1 y 2 se ven en "Modos de juego" con "🔒 Versión completa";
    al tocarlos se explica (`avisoVersionCompleta` en `modesManual.js`).
- `src/js/anuncios.js` → `espacioAnuncio(lugar)`: un recuadro "Publicidad"
  (60 px en celular, 90 en PC). Va en el inicio, Configurar partida, el
  resultado de la ronda y el podio, **nunca durante la ronda**. Por ahora es
  solo el espacio, sin red de anuncios.
- Etiqueta "v1.24 · Demo" en el inicio.
- Compilación:
  - `npm run build:demo-windows` → `dist/windows-demo/` (para mostrarla);
  - `npm run build:store-demo` → paquete de la Store llamado "Musical
    Showdown Demo", con identidad en `platforms/desktop/tienda-microsoft-demo.json`
    (falta reservar el producto).
- `tienda.js`: "microsoft-demo" sin enlace todavía (sigue yendo a GitHub).
- Prueba nueva `test/edicion.test.js`; `sw.js` v27.

**Cómo se verificó:** lint sin avisos; `npm test`: 161 bien; pruebas de
pantallas: 42 bien (la versión completa no cambia). Capturas de la demo
(inicio con "Publicidad", modos con candado, aviso de versión completa). Se le
abrió la demo.

**Qué quedó abierto:**
- Que el usuario confirme la demo.
- Reservar "Musical Showdown Demo" en Partner Center.
- La red de anuncios real y las compras dentro de la app (`PENDIENTES.md`).

---

## 2026-10-13 — Sesión 8 (parte 34): versión 1.24 (GitHub)

**Pedido del usuario:** "publica la nueva versión; la mantendremos ahí". En la
Microsoft Store se subirá primero una **demo gratis** (ver parte 35).

**Qué incluye la 1.24:**
- Catálogo sin letras: 200 canciones en 10 géneros, búsqueda solo por
  nombre y rondas mitad palabra clave y mitad compartida.
- Enlace a la política de privacidad en Ajustes.
- Preparación para tiendas: `TIENDAS.md`, imágenes, paquete de la Microsoft
  Store y enlaces a la tienda en la versión de tienda.

**Publicación:**
- Lista "Listo para la próxima versión" vaciada.
- `npm run android:release`, `build:desktop`, commit con el mensaje en un
  archivo (`-F`), comprobación del commit, etiqueta `v1.24` y envío a
  GitHub.

---

## 2026-10-12 — Sesión 8 (parte 33): Microsoft Store — identidad, enlaces a la tienda y política publicada

**Del usuario:**
- **Galaxy Store descartada por ahora:** Samsung exige ser "Corporate
  Commercial Seller", es decir, una empresa registrada. Para Android se usará
  Google Play.
- Creó la cuenta de la Microsoft Store (individual), reservó "Musical
  Showdown" y pasó la identidad y el Store ID (`9PP0CFQWMWKT`).
- Correo del juego: `showdownmusical@gmail.com`.
- Se le explicó: Gmail "Para mi uso personal", nombre "Musical Showdown",
  teléfono personal (privado), mismo correo en las tiendas, cómo crear la
  cuenta Microsoft y la de desarrollador.

**Qué se hizo:**
- `platforms/desktop/tienda-microsoft.json`: la identidad del paquete (no es
  secreta). El `.appx` sale con `MusicalShowdown.MusicalShowdown`, el editor
  `CN=A04D9DC2-…` y la versión del juego.
- **Enlaces a la tienda:** `src/js/tienda.js` (nuevo) y `TIENDA` en
  `version.js`, que escribe `build/stamp.js` ("microsoft" solo en
  `build:store-windows`).
  - En esa versión, el aviso de "Actualización" dice "🛍️ Abrir la Microsoft
    Store" y "Compartir el podio" invita a la Microsoft Store.
  - Las versiones de GitHub siguen igual.
  - `sw.js` v26; prueba en `compartir.test.js`.
- **Política de privacidad** con el correo y **publicada**: commit solo de
  `docs/privacidad/index.html` (`2b50cce`), subido a `main`. Comprobada en
  línea en https://maxy26.github.io/Musical-showdown/privacidad/.
- `TIENDAS.md` con el correo y el desarrollador.

**Cómo se verificó:** lint sin avisos; `npm test`: 158 bien; pruebas de
pantallas: 42 bien; la página respondió en línea; `build:store-windows` (sello
"Microsoft Store"), `build:desktop` y APK; se abrió el `.exe`.

**Qué quedó abierto:**
- Que el usuario pruebe y confirme.
- La versión de la tienda debería salir como **1.24** junto con la release
  de GitHub, porque la 1.23 de GitHub no tiene el catálogo nuevo.
- Subir el paquete y llenar la ficha en Partner Center (guiado).

---

## 2026-10-12 — Sesión 8 (parte 32): PRUEBA — preparación para tiendas (Galaxy Store y Microsoft Store)

**Pedido del usuario:** dejar el juego lo más listo posible para publicar,
empezando por Galaxy Store y Microsoft Store.

**Qué se hizo:**
- **Política de privacidad** `docs/privacidad/index.html` (GitHub Pages,
  activado por el usuario).
  - Explica micrófono (solo volumen, no graba), cámara (solo el QR), red local,
    Firebase, GitHub, YouTube y que todo queda en el dispositivo.
  - Tiene el correo como `CORREO_DEL_JUEGO`: **no se sube** hasta que el
    usuario cree el correo del juego.
  - Enlace "🔒 Política de privacidad" en Ajustes (`menu.js`,
    `POLITICA_PRIVACIDAD`).
- **`TIENDAS.md`** (nuevo): todo para copiar y pegar.
  - Datos generales, descripción corta y larga, novedades.
  - Permisos y por qué se piden; respuestas de privacidad y clasificación por
    edad.
  - Pasos de Galaxy Store y Microsoft Store.
- **Imágenes** en `tiendas/imagenes/`: 6 capturas de celular (1080 × 2400),
  6 de PC (1920 × 1080) y la imagen destacada de 1024 × 500.
- **Paquete de la Microsoft Store:** `npm run build:store-windows` →
  `dist/store/Musical Showdown.appx` (lo firma la Store).
  - Destino `--store` en `build/build-desktop.js` y `appx` en
    `platforms/desktop/package.json`.
  - Íconos en `platforms/desktop/build/appx/`.
  - Declara micrófono, red local e internet. La versión es la del juego
    (1.23.0.0).
  - La identidad (nombre del paquete y editor) se lee de
    `platforms/desktop/tienda-microsoft.json` cuando el usuario tenga la
    cuenta; sin ese archivo sale un paquete de prueba.
- Respuestas al usuario: para el correo del juego, elegir "Para mi uso
  personal" en Gmail (la otra opción ofrece Google Workspace, de pago).

**Cómo se verificó:** lint sin avisos; `npm test`: 157 bien; pruebas de
pantallas: 42 bien. Se revisó el manifiesto del paquete (identidad, idiomas,
permisos, versión). Capturas revisadas. `build:desktop` y APK de prueba; se
abrió el `.exe`.

**Qué quedó abierto (ver `PENDIENTES.md`):**
- correo del juego → completar la política y subirla;
- cuentas de Samsung y Microsoft;
- datos de identidad de la Microsoft Store;
- que el aviso de "Actualización" lleve a la tienda en las versiones de
  tienda;
- probar en Linux.

---

## 2026-10-12 — Sesión 8 (parte 31): catálogo de 200 canciones en 10 géneros

**Pedido del usuario:**
- Dejar la app lo más lista posible para publicar: primero Galaxy Store y
  Microsoft Store, después las demás tiendas.
- Retomar el catálogo: aprobó las tandas de pop y rock "por ahora" y pidió
  hacer lo mismo con los demás géneros hasta que pida retomar ese pendiente.

**Qué se hizo:**
- `data/songs.js`: tandas de pop (2) y rock en español (3), y tandas armadas
  sin revisión del usuario de salsa, balada, cumbia, bachata, merengue, regional mexicano y
  trap y urbano (20 cada una). En total, **200 canciones**.
  - Se quitaron los ejemplos viejos.
  - `GENRES` pasa a 10 (`regional` = "Regional mexicano", `urbano` = "Trap y
    urbano"); "Rock" pasa a llamarse "Rock en español".
- Hoja "Más": colores para los 5 géneros nuevos (`styles.css`) y artistas de
  ejemplo sin invitados (`artistaPrincipal()`).
- Prueba de pantallas de géneros: "Más: Rock en español".
- Se le explicó al usuario que GitHub Secrets no es una copia de seguridad
  (no se puede descargar). La clave sigue en
  `platforms/android/keystore/`. GitHub Pages quedó activado por el usuario.

**Cómo se verificó:** lint sin avisos; `npm test`: 157 bien (sin repetidas,
palabras en minúscula y con tilde); pruebas de pantallas: 42 bien; capturas
de la hoja "Más" en celular y PC.

**Qué quedó abierto:**
- Revisar con el usuario las 7 tandas sin revisar cuando retome el
  pendiente.
- Política de privacidad, ficha de tiendas, imágenes, paquete MSIX (en
  curso).

---

## 2026-10-12 — Sesión 8 (parte 30): catálogo sin letras (tanda 1: reggaetón) — confirmado por el usuario

**Pedido del usuario:**
- Que las canciones no se guarden en la app y "vengan de YouTube".
- Se le explicó que YouTube no da letras y que su servicio oficial tiene
  límites y exige su marca.
- Eligió un **catálogo propio sin letras**: solo nombre, artista, género y
  palabras sueltas.
- Buscar solo por nombre.
- Más adelante, una IA que reconozca la canción cantada buscando la letra en
  internet (anotado en el pendiente de la IA de voz, al final).
- Meta: las 100 mejores de cada género y más géneros (10 en total). Las listas se
  arman y el usuario las revisa de a 20.
- Criterio del usuario: palabras de la parte más famosa o pegadiza, con una
  palabra clave propia de cada canción, y la ronda mezclada mitad y mitad.

**Qué se hizo:**
- `data/songs.js`: formato nuevo `{ title, artist, genre, famous, clave,
  palabras }`, sin letra, y `palabrasDe()`.
  - Tanda 1 aprobada por el usuario: 20 canciones de reggaetón.
  - Las canciones de los otros géneros quedan como ejemplo (sin letra) hasta
    su tanda; se quitó la "versión en vivo".
- `gameLogic.js` → `pickWeightedWord`:
  - Mitad de las rondas sale una palabra clave y mitad una compartida
    (`PARTE_CLAVE = 0.5`).
  - Pesa más si la palabra está en más canciones y si la canción es famosa.
- `screens/verify.js`: `searchSongs` busca solo por el nombre; `songHasWord`
  mira la clave y las palabras.
- Pruebas: `canciones.test.js` (sin letra, palabras correctas, sin repetidas),
  `seleccion.test.js` (mitad y mitad, peso de las compartidas) y
  `texto.test.js` (búsqueda solo por nombre).

**Cómo se verificó:** lint sin avisos; `npm test`: 157 bien (ya no queda la
prueba pendiente de las letras); pruebas de pantallas: 42 bien.
`build:desktop` y APK de prueba `dist/MusicalShowdown-PRUEBA.apk`; se abrió el
`.exe`.

**Qué quedó abierto:**
- Las 49 tandas que faltan.
- Se propuso la tanda 2 (pop, 20). El usuario dijo "por ahora déjalo así"
  y pidió tener en cuenta la de reggaetón y la de pop para futuras
  actualizaciones. Quedó anotada completa en `PENDIENTES.md`, **sin cargar**.
- Nada publicado.

---

## 2026-10-12 — Sesión 8 (parte 29): versión 1.23

**Pedido del usuario:** "listo, publícalo".

**Qué incluye la 1.23:**
- Celular + PC vinculados (etapa 1): "📱 Vincular" en la ronda, código que
  cambia cada minuto, QR, escanear o escribir el código, pasar la partida del
  celular a la PC y el celular como control.
- 3 segundos escuchando con el micrófono al tocar un nombre.
- Puntos animados y "cómo quedan".
- Reloj grande y ❓ de la ronda.
- Cuenta regresiva en las dos pantallas.
- Arreglo de Android 15/16 (barra de la hora).
- `.exe` con carpeta fija (un solo permiso del Firewall).

**Publicación:**
- Marcas "en prueba" cambiadas a versión 1.23 (la guía técnica, `CONTEXTO`,
  `PENDIENTES.md`) y lista "Listo para la próxima versión" vaciada.
- `npm run android:release`, `build:desktop`, commit, etiqueta `v1.23` y envío
  a GitHub (la Release y la notificación las hace GitHub Actions).
- Se le abrió la versión final (PC). El celular ya no estaba conectado por
  cable: la 1.23 se instala desde `dist/MusicalShowdown-v1.23.apk` o desde la
  Release.

**Incidente al publicar (resuelto):**
- El primer `git commit` falló: PowerShell partió el mensaje, que traía
  comillas y emojis.
- El mismo comando siguió y subió la etiqueta `v1.23` apuntando al commit de
  la 1.22 (`6634ead`). GitHub Actions empezó a publicarla.
- Se borró la etiqueta en GitHub y aquí. El usuario canceló la ejecución
  (38329327010, "cancelled" antes de compilar).
- Después se hizo el commit bien (`3026d83`, mensaje desde un archivo con
  `git commit -F`) y se subió la etiqueta correcta. Ejecución 38329658020:
  todo bien, Release v1.23 con `.exe`, `.AppImage` y `.apk`.
- **Regla desde ahora:** el mensaje del commit va siempre en un archivo
  (`-F`), y la etiqueta se crea y se sube recién después de comprobar que el
  commit existe.

---

## 2026-10-12 — Sesión 8 (parte 28): PRUEBA — ajustes antes de la 1.23 (reloj, control, ayudas)

**Pedido del usuario** (lista de cambios antes de publicar la 1.23). Hecho:
- **Reloj más grande y visible** (`.clock.reloj-grande`, en rojo los últimos
  5 s). También en "¡X canta!" de la pantalla grande, del mismo tamaño.
- **Celular de control:**
  - Ya no muestra el tiempo, la palabra ni quién canta. Mientras alguien
    canta quedan "Finalizar ronda" (sin tiempo), ❌ / ✅, Buscar y Volver.
  - Arriba tiene pausa, ❓, 🔊 (pone o quita la música de la PC) y Ajustes;
    "Desvincular" está en Ajustes.
  - Muestra la cuenta antes de cada ronda, igual que la PC.
- **PC vinculada:**
  - Sin "El moderador decide desde el celular".
  - Los nombres no se tocan en la PC; el celular pide el turno con
    `pedirTurno()` de `round.js`.
- **Ayudas:**
  - La ❓ roja de la ronda ahora abre la ayuda de la ronda (lo del (?) del
    centro, que se quitó).
  - En el celular: ❓ arriba y el (?) de "Correcta o Incorrecta", con el modo
    de la partida de la PC.
  - Abrir una ayuda en el celular detiene el reloj de la PC (acciones
    `ayudaAbierta` / `ayudaCerrada`).
- **`.exe`:**
  - El juego portátil se descomprimía cada vez en una carpeta temporal
    distinta, y Windows pedía (o bloqueaba) el permiso de red en cada
    apertura.
  - Ahora usa siempre `%TEMP%\MusicalShowdown` (`unpackDirName` en
    `platforms/desktop/package.json`): el permiso se pide una sola vez.
- Durante las pruebas se había dejado en "No" la cuenta antes de la ronda del
  `.exe` del usuario. Se volvió a poner en 3 s (lo predeterminado).

**Archivos:**
- `round.js`, `verify.js`, `control.js`, `menu.js`
- `ayudaBotones.js` (`abrirAyuda` exportada, con `alCerrar`)
- `vinculo.js` (observa todo el documento; manda la cuenta, la música, el modo
  y la batalla)
- `sound.js` (`musicaActiva`, `alternarMusica`)
- `styles.css`, `platforms/desktop/package.json`
- Pruebas: `vinculo.test.js` y la prueba de pantallas del reloj con la ayuda.

**Cómo se verificó:** lint sin avisos; `npm test`: 153 bien; pruebas de
pantallas: 42 bien. La prueba con el celular quedó frenada porque Windows
bloqueó la carpeta nueva del juego. Hace falta el OK del usuario
(administrador) para permitirla.

**Aclarado por el usuario y hecho (mismo día):**
- **3 segundos escuchando** (`voz.js`, `microfono.js`): al tocar un nombre, el
  reloj se ve detenido, pero por dentro corre a mitad de velocidad durante 3
  segundos mientras el micrófono escucha.
  - Si oye voz, sigue "¡X canta!".
  - Si no oye nada, vuelve a la ronda (como "Volver") con ese tiempo
    descontado.
  - Micrófono: el del celular con PC + celular (y TV + celular, más
    adelante), el de la PC con PC + TV (más adelante) y, sin vincular, el del
    mismo dispositivo.
  - Sin micrófono o sin permiso, sigue "¡X canta!" como antes.
  - Solo mide el volumen: no graba nada.
  - Android: permisos `RECORD_AUDIO` y `MODIFY_AUDIO_SETTINGS`, pedidos
    directo por Android la primera vez.
- **Puntos más animados y "cómo quedan"** (`roundResult.js`, `tablaPuntos`):
  una fila por jugador o equipo.
  - El +/− aparece de golpe y el puntaje sube o baja hasta el nuevo.
  - También al responder mal (cómo quedan, ±0).
  - Vinculado y sin vincular.
- Prueba nueva `test/voz.test.js`. `sw.js` v25 con los dos archivos nuevos.
- **Verificado en el celular del usuario con el `.exe`:**
  - vinculó por el enlace y la cuenta regresiva salió en el celular;
  - Android pidió el micrófono directo;
  - en silencio, a los 3 s volvió sola a la ronda;
  - ✅ desde el celular mostró los puntos animados.
- Lint sin avisos; `npm test`: 158 bien; pruebas de pantallas: 42 bien. El
  usuario permitió el `.exe` en el Firewall (carpeta fija).
- **Abierto:** que el usuario pruebe cantando de verdad (el volumen mínimo,
  `UMBRAL_VOZ`, puede necesitar ajuste). Nada publicado.

---

## 2026-10-12 — Sesión 8 (parte 27): PRUEBA — vincular desde la ronda, código dinámico, QR que abre la app y compartir partida

**Pedido del usuario:**
- Que al escanear el QR con la cámara del celular (fuera de la app) se abra
  la app o se mande a instalarla.
- El botón de vincular, en la pantalla de la ronda (con el reloj detenido) y
  ya no en Ajustes.
- Un código de vinculación dinámico (para la TV) y poder vincular escribiendo
  el código.
- En el inicio del celular, un botón a la izquierda de Ajustes para escanear
  una partida de la PC.
- "Compartir partida" en el celular: da un código para escribirlo en la PC.

**Qué se hizo:**
- **Código de vinculación**: 6 números, cambia cada minuto (también vale el
  anterior) y reemplaza a "dirección + código de 4". Lo maneja
  `platforms/desktop/main.js`.
- **Encontrar la PC sin dirección**: complemento nativo propio
  `VinculoPlugin.java` (registrado en `MainActivity.java`).
  - El celular grita por UDP a toda la red (puerto 47822, `MSV1 BUSCAR
    <código>`) y la PC que tiene ese código le contesta con su puerto.
  - Al revés (`MSV1 COMPARTE <código>` → `MSV1 PC …`) se usa para pasar la
    partida del celular a la PC.
  - La PC le da al celular una "llave" para "Reconectar" aunque el código ya
    haya cambiado.
- **QR = enlace** `https://maxy26.github.io/Musical-showdown/vincular/?ips=…&p=…&c=…`.
  - `AndroidManifest.xml` tiene el `intent-filter` (autoVerify) que abre la
    app, y `vincular.js` → `iniciarEnlacesDeVinculo()` (getLaunchUrl /
    appUrlOpen) sigue con la conexión.
  - Si la app no está instalada: página `docs/vincular/index.html` (GitHub
    Pages) con "Abrir en la app" y "Descárgala" (releases).
  - `docs/assetlinks.json`: el archivo que confirma que el enlace es de la app
    (ver Qué quedó abierto).
- **Botones**:
  - Ronda de la PC: "📱 Vincular" (QR + código; detiene el reloj y se cierra
    sola al conectarse; dice "📱 Vinculado").
  - Ronda del celular: "📤 Compartir" (muestra el código del celular).
  - Inicio del celular, a la izquierda de Ajustes: escanear (cámara o
    código).
  - Inicio de la PC, mismo lugar: "Seguir partida del celular" (escribir el
    código).
  - Se quitaron de Ajustes.
- **Compartir partida**: el celular manda la partida completa
  (`copiaDePartida()`); la PC sigue desde el mismo punto, en pausa
  (`recibirPartida`), y el celular queda de control.
- **Android 15/16** (la app apunta a Android 16): el juego quedaba debajo de la
  barra de la hora y de los botones de abajo. `MainActivity.java` ahora deja
  ese espacio (y el del teclado), con el fondo del juego. Esto arregla todas
  las pantallas, no solo las nuevas.
- Enter / "→" del teclado en el campo del código conecta (`enterkeyhint="go"`,
  también en `teclado.js`). Nuevos íconos `scan` y `link`.

**Cómo se verificó:**
- Lint sin avisos; `npm test`: 153 bien; pruebas de pantallas: 42 bien.
- **Prueba real con el celular del usuario** (OPPO CPH2695, Android 16, misma
  Wi-Fi) y el `.exe`:
  1. Enlace del QR abierto en el celular → abrió la app y se conectó sola.
  2. Tocar Beto en el celular → "¡Beto canta!" en la PC; ✅ en el celular →
     "¡Correcto!".
  3. Desvincular → inicio → botón escanear → escribir el código → encontró la
     PC por la red y se conectó.
  4. Partida en el celular → "📤 Compartir" → código escrito en la PC → la
     partida pasó a la PC (en pausa) → "Continuar" desde el celular.
- Sin el archivo de verificación de GitHub, el enlace se abrió en Firefox. Para
  la prueba se marcó con adb como "de la app"
  (`pm set-app-links-user-selection`).

**Qué quedó abierto:**
- Para que la cámara abra la app en cualquier celular (y la página para
  instalarla) hay que publicar en GitHub dos cosas (ver `PENDIENTES.md`):
  - activar GitHub Pages (carpeta `docs/`);
  - crear el repositorio `maxy26.github.io` con
    `.well-known/assetlinks.json`.
- La red Wi-Fi de la PC del usuario ("DEKAMI 2") está marcada como **pública**
  en Windows. El permiso que se dio al juego vale para redes públicas: ya
  funciona.
- Nada publicado.
- **Decisión del usuario (mismo día):** lo de GitHub Pages y `assetlinks.json`
  queda **en espera hasta publicar en Play Store** (el enlace de descarga de
  GitHub es temporal). Anotado en `PENDIENTES.md`.
- **Pedido del usuario (mismo día):** el botón de la ronda del celular se
  llama **"📱 Vincular"**, igual que en la PC (antes "📤 Compartir"). La ventana
  se llama "Vincular con la PC" y la ayuda de la PC dice "📱 Vincular".
  Archivos: `round.js`, `vincular.js`. Lint sin avisos; `.exe` y APK de prueba
  compilados, instalados en el celular y abiertos.
- **El usuario confirmó la etapa 1 ("listo", 12-10-2026).** Pasó a "Listo para
  la próxima versión" en `PENDIENTES.md`, junto con el arreglo de Android 15/16.
  Sin publicar.

---

## 2026-10-12 — Sesión 8 (parte 26): PRUEBA — etapa 1 de dos dispositivos (celular + PC)

**Pedido del usuario:** empezar la etapa 1 (celular como control, PC como
pantalla grande; todavía sin micrófono).

**Qué se hizo:**
- **PC (`.exe`)**: `platforms/desktop/main.js` abre, al tocar Ajustes →
  "📱 Vincular celular", un servidor WebSocket (`ws` 8.22.0, MIT) en el puerto
  47821 (si está ocupado, otro) dentro de la red local. Pide un código de 4
  números y acepta un solo celular. Las direcciones de redes virtuales
  (VirtualBox, etc.) van al final. `preload.js` (nuevo) expone solo
  `window.vinculoPC` (abrir, cerrar, enviar, alRecibir, alCambiar).
- **Juego**: `src/js/vinculo.js` (nuevo).
  - La PC le manda al celular lo que hay en pantalla (`armarEstado`), cada vez
    que algo cambia en `#app`. Lo detecta un MutationObserver, también para el
    reloj.
  - Hace en la PC lo que toca el celular: tocar un jugador, pausa, continuar,
    ✅ / ❌, volver, finalizar y siguiente.
  - Del lado del celular: conexión (`conectarComoControl`), acciones
    (`enviarAccion`) y la última PC guardada para "Reconectar".
- **Pantalla del celular** `screens/control.js` (nueva, clave `"control"` en
  `router.js`):
  - Ronda: solo los dos botones a pantalla completa (el de arriba girado) y la
    pausa.
  - "¡X canta!": el tiempo o "Finalizar ronda", ❌ / ✅, "Buscar canción" (se
    busca en el celular, con la palabra y los géneros de la PC) y "← Volver".
  - También tiene pausa, resultado, podio, "Se perdió la conexión" +
    "Reconectar" y "Desvincular".
  - La música del celular se calla en esta pantalla (`sound.js`).
- **Ventanas para vincular** `screens/vincular.js` (nueva):
  - PC: QR (qrcode-generator 2.0.4, MIT), la dirección y el código, y "✅
    Celular conectado" / "Desvincular celular".
  - Celular: "📷 Escanear el código QR" (cámara + jsQR 1.4.0, Apache 2.0) o
    dirección + código. Los errores se explican: código incorrecto, PC ocupada,
    no se encuentra.
  - Librerías en `src/js/lib/` con `LICENCIAS.txt`. ESLint las ignora
    (`eslint.config.js` pasó a `eslint.config.mjs`).
- Con un celular vinculado, el "¡X canta!" de la PC no muestra ❌ / ✅ ni
  Buscar / Volver: dice "📱 El moderador decide desde el celular".
  `deshacerToque()` y `abrirBusqueda()` de `verify.js` ahora se exportan.
- **Android**: permiso de cámara (`CAMERA`, la cámara no es obligatoria),
  `usesCleartextTraffic` (la conexión `ws://` dentro de la red) y
  `allowMixedContent` en `capacitor.config.ts`.
- `sw.js`: 6 archivos nuevos en `ASSETS`, `CACHE_NAME` v24. Nueva prueba
  `test/vinculo.test.js` (QR, dirección escrita, lo que recibe el celular).

**Cómo se verificó:**
- Lint sin avisos; `npm test`: 152 bien; pruebas de pantallas: 42 bien.
- Prueba real con el juego de PC (Electron) y un "celular" simulado:
  - El código malo se rechaza y el bueno conecta.
  - Funcionaron pausa, continuar, tocar, volver, incorrecta, continuar
    ronda, correcta y siguiente.
- Prueba con la pantalla del celular (navegador tamaño Pixel 7) conectada al
  juego de PC en Alternativo 1:
  - El reloj avanza.
  - ✅ desde el celular da "¡Correcto!" en la PC, y la pausa se abre en la PC.
  - Al cerrar la PC, el celular muestra "Se perdió la conexión".
- `build:desktop` y copia firmada de prueba
  `dist/MusicalShowdown-PRUEBA-control.apk` (1.22, se instala encima).

**Qué quedó abierto:**
- Que el usuario lo pruebe con su celular real. Sin probar todavía: la cámara
  en Android y que Android deje conectarse por `ws://`.
- La primera vez, Windows pide permiso de red para el juego: hay que elegir
  "Redes privadas".
- Nada publicado.

---

## 2026-10-12 — Sesión 8 (parte 25): dos dispositivos — cómo se conectan

**Pedido del usuario:** empezar el pendiente "Partida en dos dispositivos
vinculados". Se le explicó la diferencia entre Wi-Fi e internet; eligió, "por
ahora", la **misma red Wi-Fi sin internet** (router o zona Wi-Fi de un celular,
emparejando con QR, sin servidor). Pidió anotar como pendiente aparte
**mejorar la vinculación por internet con un servidor** (posible costo: va al
final). Ambos en `PENDIENTES.md`. Faltan definir: qué hace el segundo
dispositivo y si la animación de audio usa el micrófono.

**Idea principal del usuario:** vincular celular ↔ PC, celular ↔ TV (Android) y
PC ↔ TV; nunca dos del mismo tipo. Anotada con sus consecuencias (adaptar el
juego a Android TV; entre PC y TV, sin cámara, un código corto en vez de QR;
detectar el tipo de dispositivo).

**Diseño completo definido con el usuario** (en `PENDIENTES.md`): el control
(celular, o PC frente a una TV) muestra los dos botones de los jugadores a
pantalla completa y la pausa; mientras alguien canta, el tiempo o "Finalizar
ronda", ❌ / ✅, "Buscar canción" y "← Volver". La pantalla grande muestra el
tiempo, la palabra, los puntajes, los relevos y la animación "¡Ana canta!".
El micrófono del control mueve la animación (la voz no sale por los parlantes).

---

## 2026-10-12 — Sesión 8 (parte 24): versión 1.22

**Pedido del usuario:** publicar. **Qué incluye la 1.22:** la pantalla "¡Ana
canta!" (el jugador pide cantar con su botón; ❌ / ✅ directos; "← Volver"), la
búsqueda opcional con YouTube (▶ por canción, Enter, sugerencia en gris, Tab y
tocar la canción completan el nombre), y la regla 29 (el juego nunca reproduce
ni descarga música). **Publicación:** marcas "en prueba" → versión 1.22 en el
código, `PENDIENTES.md` y `CONTEXTO`; lista "Listo para la próxima versión"
vaciada; `npm run android:release`, `build:desktop`, commit, etiqueta `v1.22`
y envío a GitHub; se le abrió la versión final.

**Después:** el usuario preguntó qué pasa si publica en una tienda gratis para
quitar el aviso de "app no segura", y qué es "resolver lo de las letras". Se le
explicaron las tiendas (Google Play 25 USD una vez; Galaxy Store y AppGallery
gratis solo en sus marcas; Microsoft Store gratis para personas, por confirmar)
y lo que implica publicar (privacidad, edad, letras, firma de Google Play), y
que las letras guardadas tienen derechos de autor (opciones: licencia, solo
lista de palabras, servicio en línea, solo el moderador). Se agregó al pendiente
"Instalar sin avisos de app no segura".

---

## 2026-10-12 — Sesión 8 (parte 23): completar el nombre de la canción (en prueba)

**Pedido del usuario:** al escribir "des", Enter buscaba "des" en YouTube.
Quiere que tocar la canción complete su nombre, que Tab (PC) también lo
complete, y ver la sugerencia de la canción a la que se quiere llegar.

**Qué se hizo:** `screens/verify.js`: `sugerencia()` (la primera canción
encontrada; si empieza con lo escrito, lo que falta va en gris dentro del campo
—`.busqueda-fantasma`, que copia la letra, los márgenes y el borde del campo—;
si coincide por otra parte, va en una línea debajo con "Tab ↹"),
`textoParaYoutube()` (con el nombre exacto de una canción busca nombre +
artista). Tocar una canción escribe su nombre; Tab completa; ▶ sigue abriendo
esa canción. (?) de la búsqueda actualizado. Pruebas: `test/busqueda.test.js`
(4) y la prueba de pantallas de YouTube ahora prueba Tab, Enter y el clic.

**Cómo se verificó:** lint sin errores; `npm test`: 145 bien; `npm run
test:e2e` (de a una): 42 bien; capturas en celular y PC ("gaso" + "lina" en gris,
alineado).

---

## 2026-10-12 — Sesión 8 (parte 22): "¡Ana canta!", búsqueda opcional y YouTube (en prueba)

**Pedidos del usuario:**
1. Regla de qué cuenta como correcta: la palabra tiene que estar en el
   **fragmento cantado**, no solo en la canción (salvo que diga el nombre de la
   canción). Anotada en `PENDIENTES.md` (voz) y `CONTEXTO` ("Durante la ronda").
2. Pulsador: el jugador toca **su mismo botón con el nombre**. Al tocarlo, una
   pantalla completa indica quién canta; la búsqueda no se abre sola sino con un
   botón; y desde la búsqueda, un enlace a YouTube para escuchar la canción
   (sin que el juego reproduzca música).

**Qué se hizo:**
- `screens/verify.js`: `screenVerify()` es ahora la pantalla **"¡Ana canta!"**
  (`.canta-capa`, color del lado o del equipo, micrófono animado, palabra,
  ❌ / ✅ que llaman a `resolveAnswer`, "← Volver" que restaura el estado previo
  al toque con `antesDelToque`, "🔎 Buscar canción"). La búsqueda es una ventana
  aparte (`abrirBusqueda`) con ▶ por canción y "▶ Buscar en YouTube"; Enter
  busca lo escrito (`urlYoutube`, `abrirEnlace`). Se quitaron "Confirmar" y la
  ventana "¿La respuesta es correcta?".
- `round.js`: guarda `antesDelToque`. `teclado.js`: el Enter de un buscador
  (`enterkeyhint=search`) no pausa la edición. Textos de ayuda: el jugador toca
  su nombre, búsqueda con YouTube, viñeta de "Cómo se juega".
- Pruebas de pantallas: `responder()` usa el flujo nuevo; 2 nuevas ("← Volver"
  y YouTube con ▶ y Enter, sin salir a internet).

**Cómo se verificó:** lint sin errores; `npm test`: 141 bien; `npm run
test:e2e` (de a una): 42 bien; capturas en celular, PC y Grupal.

**Qué quedó abierto:** que el usuario lo pruebe y confirme; se suma a "Listo
para la próxima versión".

**Después:** el usuario preguntó si el enlace a YouTube es legal. Se le
explicó (sin ser asesoría legal) que un enlace a la búsqueda pública no copia ni
reproduce música; que no hay que descargar o extraer audio, reproducir YouTube
dentro del juego sin su reproductor oficial, ni usar su logo; y que lo delicado
son las letras guardadas. A su pedido quedó como **instrucción 29** en
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md` y como regla clave en la guía técnica.

---

## 2026-10-12 — Sesión 8 (parte 21): versión 1.21

**Pedido del usuario:** publicar lo hecho antes de seguir con el próximo
pendiente (con eso confirmó el cambio del reloj).

**Qué incluye la 1.21:** el reloj se detiene mientras una ayuda está abierta
en la ronda; la versión de PC con Electron 44 y electron-builder 26 (sin
vulnerabilidades críticas ni altas); `eslint.config.mjs` (interno).

**Publicación:** `npm run android:release` (versionCode 21 → 22, 1.21, misma
firma), `build:desktop`, commit, etiqueta `v1.21` y envío a GitHub. Lista
"Listo para la próxima versión" vaciada; "en prueba" → versión 1.21 en
`PENDIENTES.md` y `CONTEXTO-MUSICAL-SHOWDOWN.md`. Se le abrió la versión final.

**Después:** al pasar al pendiente "Correcta / Incorrecta", el usuario aclaró
que quiere hacerlo **automático con detección por IA**, como parte del
pendiente crítico de reconocimiento de voz (Vosk). Se juntaron los dos
pendientes en `PENDIENTES.md`; queda anotado que cambia lo decidido el 04-10
(el moderador confirmaba) y que hay que preguntarle si el moderador puede
corregir a la IA.

---

## 2026-10-12 — Sesión 8 (parte 20): pendientes técnicos (lint y Electron 44)

**Pedido del usuario:** hacer los dos pendientes técnicos chicos (se suman a
la próxima versión, sin publicar).

**Qué se hizo:**
- `eslint.config.js` → `eslint.config.mjs` (con `git mv`): ya no sale el aviso
  de Node "Module type … is not specified". Se actualizaron las menciones en
  `CONTEXTO-MUSICAL-SHOWDOWN.md` e `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`.
- `platforms/desktop`: `npm audit` daba 19 vulnerabilidades (1 crítica en
  `tar`, 14 altas; entre ellas el propio Electron 33). Se revisó que el `.exe`
  usa APIs que siguen en Electron 44 (`protocol.handle`, `net.fetch`) y se
  actualizó **Electron 33 → 44.7.0** y **electron-builder 25 → 26.15.3**
  (`package.json` y `package-lock.json`). Quedan 8 moderadas de `sprintf-js`
  (herramienta de descarga usada solo al compilar; el arreglo propuesto era
  bajar de versión): anotado como pendiente 🟢.

**Cómo se verificó:** `npm run lint` sin el aviso y sin errores; `build:desktop`
con Electron 44.7.0; se abrió el `.exe` y, conectando a la ventana, se
comprobó que carga `app://juego/index.html`, quita la pantalla de carga y
muestra el inicio con "v1.20" (`Electron/44.7.0`).

**Qué quedó abierto:** que el usuario pruebe el `.exe`. El cambio de Electron
se suma a "Listo para la próxima versión".

**Después:** el usuario pidió anotar que la app se instale sin avisos de "no
segura" en Android y PC. Se le explicó por qué pasa y las soluciones (Google
Play en Android; firma de código o Microsoft Store en Windows) y se agregó a
`PENDIENTES.md` como "Instalar sin avisos de app no segura", junto con el
pendiente anterior de SmartScreen. Tiene costo: va al final.

---

## 2026-10-12 — Sesión 8 (parte 19): el reloj se detiene con una ayuda abierta (en prueba)

**Pedido del usuario:** siguiente pendiente. Se le preguntó y eligió que el
reloj **se detenga** mientras una ayuda está abierta durante la ronda.

**Qué se hizo:** `modals.js` → `pausarRondaMientras()`: si la ronda está
corriendo, marca `state.round.paused` (el reloj ya la respeta, y esos segundos
no cuentan para el desempate del MVP) y devuelve la función que la reanuda.
La usan `openHelp()` (❓ general y de modo) y los (?) de `ayudaBotones.js`.
`sheet.js` → `openSheet()` acepta `alCerrar` (se llama una sola vez al
cerrar). Prueba de pantallas nueva: en una ronda de Alternativo 1, con un (?)
abierto el reloj no se mueve; al cerrarlo vuelve a correr.

**Cómo se verificó:** lint sin errores; `npm test`: 141 bien; `npm run
test:e2e` (de a una): 38 bien. Juego de prueba abierto al usuario; sin publicar.

**Después:** el usuario preguntó por qué no aparecía la cuenta regresiva antes
de la ronda. No era un error: en los datos del `.exe` el ajuste "Cuenta antes
de cada ronda" estaba guardado en "No" (0); se le explicó cómo volver a
activarlo en Ajustes. Pidió anotar en pendientes **editar los textos del
juego**, para profundizarlo más adelante (agregado a `PENDIENTES.md`).

**Nueva forma de publicar:** el usuario pidió no publicar por cada cambio
mínimo, sino juntar varios para una actualización notable. Instrucción 28 en
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, regla en la guía técnica y sección nueva
"📦 Listo para la próxima versión" en `PENDIENTES.md` (por ahora: el reloj).

**Pendiente del empate exacto** (dos equipos pasan el objetivo con los mismos
puntos por la penalización del relevo): el usuario lo descartó por ser
prácticamente imposible ("gana el primero que llegue"). Se le explicó el único
caso posible; queda anotado el principio por si pasara.

---

## 2026-10-12 — Sesión 8 (parte 18): ayudas confirmadas y versión 1.20

**El usuario confirmó la prueba.** Se quitaron las marcas "PRUEBA" de los
comentarios del código (10 archivos de `src/`) y de los documentos:
`PENDIENTES.md` (el pendiente de los (?) pasa a Resueltos; queda uno nuevo 🟢:
el reloj sigue corriendo con una ayuda abierta en la ronda),
`CONTEXTO-MUSICAL-SHOWDOWN.md` y la guía técnica (confirmado, versión 1.20).

**Publicación:** versión **1.20** (`npm run android:release`), commit, etiqueta
`v1.20` y envío a GitHub; después se le abrió al usuario la versión final.
La 1.20 incluye todo lo hecho desde la 1.19: la ayuda "Cómo se juega" nueva, la
ayuda de cada modo, los (?), "Sin relevos" con 0, el tiempo personalizado de 1
en 1, la lista de jugadores con alto fijo y los documentos al día.

---

## 2026-10-12 — Sesión 8 (parte 17): PRUEBA — textos finales de las ayudas

**Pedido del usuario:** cambiar 14 textos por los suyos (con la ortografía
corregida) y quitar 4 tarjetas.

**Qué se hizo:**
- `ayudaBotones.js`: Géneros ("Eliges todos los géneros", "Eliges solo un
  género" / "Eliges uno o varios géneros"); Puntaje y Tiempo ("Elige … con los
  valores predeterminados…", "Personalizado: elige … con más flexibilidad…");
  Sin tiempo ("Al elegir “Sin tiempo”, las rondas se terminan en cualquier
  momento con el botón “Finalizar ronda”"); Multiplicadores ("Los puntos se
  multiplican al azar durante todo el juego, desde ×2 hasta ×5"); Relevos (el
  relevo entre jugadores del mismo equipo, y `RELEVO_DE_MAS`: "El relevo de más
  sanciona al equipo: resta la mitad de los puntos en juego y suma esa misma
  mitad al equipo contrario", usado también en el (?) del botón Relevo).
  Tarjetas quitadas: "Listo" en puntaje y en tiempo, y en Relevos por equipo,
  "elegir cuántos" y "Sin relevos".
- `ayudaModos.js`: puntos negativos ("se muestran en color rojo"), relevo de
  más de Alternativo 1 ("se aplica una sanción, que se explica al
  confirmarlo") y las opciones de Alternativo 2 con el nombre de la opción en
  otro color (`.ayuda-opcion`, turquesa).

**Cómo se verificó:** lint sin errores; `npm test`: 141 bien; `npm run
test:e2e` (de a una): 36 bien; capturas de tiempo, relevos y la ayuda de
Alternativo 2. APK de prueba `dist/MusicalShowdown-PRUEBA-ayudas-6.apk`.

---

## 2026-10-12 — Sesión 8 (parte 16): PRUEBA — (?) con imágenes y muy breves

**Pedido del usuario:** el puntaje objetivo y el tiempo por ronda, explicados
"con imágenes de manera muy breve" en vez del paso a paso en texto; los demás
(?) también con imágenes, los que lo merecen.

**Qué se hizo:** `ayudaBotones.js` reescrito: cada (?) tiene una frase corta y
tarjetas con dibujito y pocas palabras (mismo estilo que las tarjetas de
"Puntos" de la ayuda de cada modo). Dibujitos nuevos en CSS: la lista (`2000
pts ▾`), la rueda de "Personalizado…" (1900 / **2000** / 2100), botones,
fichas, la ✕ roja e intentos (puntos que se gastan). Se borraron los estilos de
los textos largos (`.tip-img`, `.tip-texto`, `.tip-hueco`).

**Cómo se verificó:** lint sin errores; `npm test`: 141 bien; `npm run
test:e2e` (de a una): 36 bien; capturas de puntaje, tiempo, multiplicadores,
intentos, relevos y jugadores. APK de prueba
`dist/MusicalShowdown-PRUEBA-ayudas-5.apk`.

---

## 2026-10-12 — Sesión 8 (parte 15): PRUEBA — cuarta vuelta de las ayudas

**Pedidos del usuario:**
1. Lista de jugadores: el tamaño de antes (justo para los espacios iniciales),
   pero que no crezca al añadir jugadores. → `players.js` → `fijarAlto()`: mide
   los primeros 2 (Individual) o 4 (Grupal) espacios y deja ese alto fijo; el
   CSS vuelve a `max-height`.
2. Explicar bien cómo se personaliza el puntaje (y el tiempo). → (?) con
   "Personalizado…, paso a paso", rango y qué pasa después.
3. Cada (?) responde "¿qué hace?" y "¿qué pasa si pongo esta opción?" ("Si
   eliges Sí / No", "Qué pasa si lo cambio"). Se reescribieron todos los textos
   de `ayudaBotones.js`. Dato verificado en el código: con multiplicadores, sale
   uno en más o menos la mitad de las rondas.
4. Ayudas de cada modo más atractivas, como la del inicio. → `ayudaModos.js`
   rehecho: frase grande + fichas, "Una ronda" (historieta), "Puntos" en
   tarjetas con imagen y número, "Cómo se gana".
5. Alternativo 1 Grupal: la sección "Relevos" se queda, explicada con una
   historieta de 4 viñetas y una tarjeta del relevo de más.

**Cómo se verificó:** lint sin errores (se corrigió un `getComputedStyle` sin
`window.`); `npm test`: 141 bien; pruebas de pantallas (de a una, por poca
memoria libre): 36 bien con 2 textos de prueba actualizados; capturas de la
lista (2 espacios fijos con 5 jugadores) y de la ayuda de Alternativo 1 Grupal.
APK de prueba `dist/MusicalShowdown-PRUEBA-ayudas-4.apk`.

---

## 2026-10-12 — Sesión 8 (parte 14): documentos al día

**Pedido del usuario:** revisar que todos los `.md` estén actualizados con lo
trabajado. No lo estaban del todo; se corrigió:
- `PENDIENTES.md`: el pendiente de los (?) refleja que está en el juego como
  prueba, los cambios de las 3 vueltas, la pregunta abierta (sección "Relevos"
  de Alternativo 1 Grupal) y que el reloj no se detiene con la ayuda abierta.
- `CONTEXTO-MUSICAL-SHOWDOWN.md`: "Sin relevos" con 0 (en prueba), tiempo
  personalizado de 1 en 1 (en prueba) y la ayuda en tres niveles.
- `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`: reglas 20 y 21 corregidas (decían que
  los multiplicadores solo existían en Alternativo 1 y que Alternativo 2 no
  tenía reglas) y sección nueva "Forma de trabajo" (23 a 26): todo en español,
  probar antes de publicar, permisos sin ventana propia, modos terminados.
- la guía técnica: las ayudas (`ayudaModos.js`, `ayudaBotones.js`) y la regla de
  probar antes de publicar.
- `README.md`: estaba del 21-09 (archivos que ya no existen, sin APK ni pruebas
  de pantallas, modos "por definir"); reescrito sin listar cada archivo.
- Después, el usuario pidió mantener **siempre** al día todos estos archivos:
  instrucción 27 nueva en `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` y regla clave en
  la guía técnica.

---

## 2026-10-11 — Sesión 8 (parte 13): PRUEBA — botoncitos (?) y ayuda de cada modo (sin confirmar)

**Pedido del usuario:** llevar al juego lo de la maqueta `maqueta-botones` para
probarlo ("son parte de pruebas y nada está confirmado"). También pidió: abrirle
el juego después de cada cambio, por mínimo que sea, y publicar solo cuando lo
confirme (guardado en la memoria).

**Qué se hizo (solo en el juego de prueba, sin commit ni versión):**
- `screens/ayudaBotones.js` (nuevo): (?) chico, blanco/gris, al costado derecho
  de cada sección o ventana; ventanita (`.modal` con X, se cierra tocando
  afuera) con título, modo que se juega, imagen y texto solo de ese modo.
  Puestos en Configurar partida (jugadores, géneros, puntaje, tiempo, opciones
  de Alternativo 2), la ronda (centro y barra de relevos), Buscar canción,
  ¿La respuesta es correcta? y Organizar equipos.
- `screens/ayudaModos.js` (nuevo): la ❓ fuera del inicio abre la ayuda del modo
  (Clásico Individual/Grupal, Alternativo 1 Individual/Grupal, Alternativo 2
  Grupal). `openHelp()` de `modals.js` elige cuál.
- `teclado.js`: tocar el (?) de una fila con lista no abre la lista.
- `css/styles.css` (estilos del (?) y su ventanita), `sw.js` (v23), 2 pruebas
  de pantallas nuevas.

**Cómo se verificó:** lint sin avisos; `npm test`: 141 bien; `npm run
test:e2e`: 36 bien; capturas del juego real (Alternativo 2, equipos, ronda de
Alternativo 1 Grupal, ventanita de Relevo). `build:desktop` y copia firmada de
prueba `dist/MusicalShowdown-PRUEBA-ayudas.apk` (1.19, se instala encima).

**Qué quedó abierto:** que el usuario lo pruebe y confirme; nada publicado.
Observación: abrir un (?) o la ❓ durante la ronda no detiene el reloj.

**Segunda prueba (mismo día), pedidos del usuario:** sin sección "Duelos" en
ninguna ayuda de modo; "Una ronda" empieza con cómo se arma el duelo (al azar o
por turnos, según el modo); sin "Lo que eliges" en Alternativo 2; los (?) se
enfocan en cómo funciona cada cosa (por ejemplo, "Tiempo por ronda" ya no
explica qué pasa al acabarse el tiempo) y son más detallados, con párrafos con
título en negrita; "Relevos por equipo" separa qué es, el botón, cómo se cuentan,
el relevo de más y "con 0 en total". Lint, 141 pruebas y 36 de pantallas bien;
APK de prueba `dist/MusicalShowdown-PRUEBA-ayudas-2.apk`.

**Tercera prueba (mismo día), pedidos del usuario:**
- "Finalizar ronda": "se puede terminar la ronda en cualquier momento; nadie
  gana ni pierde puntos" (ayuda de modo y (?) de la ronda en Clásico).
- Sin sección "Quién canta" (Clásico Grupal): va en la viñeta del sorteo.
- (?) "Tiempo por ronda" con los textos del usuario, y el tiempo personalizado
  se elige **de 1 en 1** (5 s a 2 min), no de 5 en 5 (`config/index.js`).
- Sin sección "Relevo comodín" en la ayuda de Alternativo 2: se explica solo en
  el (?) "Relevos por equipo".
- **Regla cambiada a pedido del usuario:** en Alternativo 2, con 0 relevos se
  juega **"Sin relevos"** (no hay botón Relevo; `relayRules` devuelve null).
  Antes, con 0, todos los relevos eran de más con penalización (04-10-2026).
  `relaySummary` y la ventanita muestran "Sin relevos"; pruebas de
  `alternativo2.test.js` y `relevo.test.js` actualizadas.
- Lista de jugadores con **alto fijo** desde el principio (no crece al añadir);
  prueba de pantallas actualizada.
- Verificación: lint sin avisos; `npm test`: 141 bien; `npm run test:e2e`: 36
  bien (el primer intento tardó 11 min y falló por falta de memoria: la PC
  tenía 0,6 GB libres con Minecraft abierto; se repitió al cerrarlo). APK de
  prueba `dist/MusicalShowdown-PRUEBA-ayudas-3.apk`.

---

## 2026-10-11 — Sesión 8 (parte 12): nueva ayuda "Cómo se juega"

**Pedido del usuario:** actualizar la ayuda general. Se le recomendaron dos
niveles (ayuda general breve + botoncitos junto a cada botón) y se le mostró una
maqueta (scratchpad `maqueta-ayuda`). La aprobó con cambios: un resumen breve y
general, **sin** mencionar el botoncito; los botoncitos serán **(?)**, explicarán
solo el modo que se está jugando y llevarán imágenes (anotado en
`PENDIENTES.md`). Además: cada modo se explica sin nombrar a los otros.

**Qué se hizo:**
- `screens/modals.js` → `openHelp()`: hoja (`openSheet`) con 5 partes: la idea
  del juego en una línea, "Una ronda" en 4 viñetas animadas (`animateStory`),
  Individual o Grupal, una línea por modo con "📖 Ver modos de juego" y cómo se
  gana. Se borró la ayuda vieja (explicación botón por botón, con textos
  desactualizados como "No hay empates ni desempates").
- `screens/modesManual.js`: `buildModesManual()` sin `onChoose` es solo para
  leer (sin "Elegir"; desde la ayuda no se cambia el modo); `animateStory`
  exportado. La primera viñeta de Alternativo 2 decía "Clásico + Alt. 1 — Una
  mezcla de los dos modos": ahora "Equipos contra equipos; cada jugador sale en
  orden".
- `css/styles.css`: `.ayuda-linea` y `.ayuda-modo`; se borraron los estilos sin
  uso de la ayuda vieja (`.help-*`, versiones `.mini`) y de la viñeta mezcla
  (`.fx-mix`, `join-left/right`).
- Prueba de pantallas nueva: la ayuda y el manual solo para leer.

**Cómo se verificó:** lint sin avisos; `npm test`: 141 bien; `npm run
test:e2e`: 32 bien; capturas del juego real (inicio, manual y desde la pausa,
en celular y PC) iguales a la maqueta.

**Qué quedó abierto:** los botoncitos (?) (siguiente pendiente). La ❓ sigue en
todas las pantallas hasta que estén.

---

## 2026-10-11 — Sesión 8 (parte 11): diagnóstico en el celular — la campana funciona

**Problema reportado:** con la 1.19, la "Prueba A" (app abierta, en el inicio)
no apareció en la campana.

**Diagnóstico (celular OPPO CPH2695, Android 16, conectado por USB):**
- Con la 1.19 normal, `logcat` mostró que Firebase entrega el mensaje a la app.
- Se instaló por `adb install -r` una copia de la 1.19 con
  `webContentsDebuggingEnabled` y `loggingBehavior: 'production'` (cambio
  **temporal** en `capacitor.config.ts`, revertido enseguida; misma firma y
  versión). Los registros muestran los oyentes `pushNotificationReceived` y
  `pushNotificationActionPerformed` registrados y el evento entregado. También
  el de `appStateChange` (que nunca se había comprobado).
- Inspección de la página por CDP (`adb forward` + Playwright
  `connectOverCDP`): la "Prueba A" estaba guardada en `avisos-recibidos` y
  **marcada como leída**, o sea que el panel se abrió con ella adentro. No se
  encontró falla en el código.
- Prueba en vivo (app abierta en el inicio): a los 4 s, globito "1" y campana
  sacudiéndose; el usuario lo confirmó. Prueba B (app cerrada, tocar la
  notificación): se abrió la app con la campana y el aviso adentro; confirmado.

**Al terminar:** se reinstaló la 1.19 normal (`dist/MusicalShowdown-v1.19.apk`),
se quitó el `adb forward`, se regeneró la copia de Android sin la
configuración de diagnóstico y el script de inspección se borró. Sin cambios
de código.

**Qué quedó abierto:** el usuario puede apagar la Depuración USB. Esta entrada
se sube con el próximo commit.

**Después:** a pedido del usuario se borraron de Descargas
`google-services.json` y la clave de la cuenta de servicio de Firebase (se le
explicó que no necesitan copia porque se pueden regenerar; la clave de firma de
Android sí). La copia del proyecto de `google-services.json` sigue en su lugar.

---

## 2026-10-11 — Sesión 8 (parte 10): el aviso viaja dentro de la notificación

**Pruebas en el celular (1.18):** la Prueba 1 llegó con la app cerrada y con el
ícono ♫; la Prueba 2 llegó con la app abierta. Las dos se enviaron directo
desde la PC (sin `avisos.json`), por eso no aparecieron en la campana.

**Pedido del usuario:** que lo que llega como notificación cuente en la campana
sin esperar a GitHub (revisa cada 3 minutos y `avisos.json` puede tardar unos 5
en verse). Preguntó si con las actualizaciones se puede descargar enseguida:
sí, porque la notificación de versión se envía después de publicar la Release.

**Qué se hizo:**
- `build/notificar.js`: cada mensaje lleva `data.aviso` (el aviso completo en
  JSON). La versión usa `avisoDeVersion()` (mismo id `version-vX` que la
  campana, con el botón "⬇️ Descargar" a la Release).
- `avisos.js`: `avisoDeVersion()` (lo usan la campana y la notificación),
  `avisoRecibido()`, `unirConRecibidos()` y `agregarAvisoRecibido()`. Los
  recibidos se guardan aparte (`avisos-recibidos`) por 24 horas; después manda
  GitHub. Uno de una versión ya instalada no se agrega.
- `notificaciones.js`: escucha `pushNotificationReceived` (app abierta) y
  `pushNotificationActionPerformed` (al tocarla); `main.js` agrega el aviso y
  actualiza el globito.
- Pruebas: 3 nuevas en `avisos.test.js` y una de pantallas (aviso recibido →
  globito "1" → aparece en la campana).

**Cómo se verificó:** lint sin errores; `npm test`: 141 bien; `npm run
test:e2e`: 30 bien; `notificar.js version v1.19 --prueba` muestra el aviso en
`data`; `build:apk` y `build:desktop` sin errores.

**Publicación:** versión **1.19** (`npm run android:release`: versionCode
19 → 20, misma firma, `dist/MusicalShowdown-v1.19.apk`), commit, etiqueta
`v1.19` y envío a GitHub.

**Qué quedó abierto:** con la 1.19 instalada, probar en el celular que el
aviso aparezca en la campana con la app abierta y al tocar la notificación.

---

## 2026-10-11 — Sesión 8 (parte 9): notificaciones con la app abierta

**Problema:** la notificación de prueba del ícono no apareció. Firebase la
aceptó, pero el usuario tenía la app abierta en pantalla: en ese caso Android
no la muestra y se la pasa a la app, y `@capacitor/push-notifications` solo la
muestra si `presentationOptions` incluye `"alert"` (revisado en
`PushNotificationsPlugin.fireNotification`). "Versión 1.17 disponible" sí le
llegó (con la app cerrada).

**Decisión del usuario:** que los avisos importantes salgan arriba también con
la app abierta.

**Qué se hizo:** `platforms/android/capacitor.config.ts`:
`plugins.PushNotifications.presentationOptions: ['alert', 'sound']`.
la guía técnica al día.

**Cómo se verificó:** `build:apk` sin errores; la opción está en
`assets/capacitor.config.json` del APK. En el celular, cuando se publique.

**Publicación:** versión **1.18** (`npm run android:release`: versionCode
18 → 19, misma firma, `dist/MusicalShowdown-v1.18.apk`), commit, etiqueta
`v1.18` y envío a GitHub.

**Qué quedó abierto:** con la 1.18 instalada, mandar dos pruebas (app cerrada y
app abierta) y que el usuario confirme el ícono.

---

## 2026-10-11 — Sesión 8 (parte 8): ícono de las notificaciones

**Pedido del usuario:** le llegaron la notificación de prueba y "Versión 1.16
disponible", pero el ícono chico salía como un cuadrado blanco o gris.

**Qué se hizo:** `res/drawable/ic_notificacion.xml` (dibujo vectorial de dos
corcheas ♫, un solo color, como pide Android), `colorNotificacion` (#FFD23F,
dorado del juego) en `res/values/colors.xml`, y en `AndroidManifest.xml` los
meta-data `default_notification_icon` y `default_notification_color` de
Firebase. Antes se revisó una vista previa: la primera versión del dibujo tenía
un corte en las cabezas de las notas (trazos en sentidos opuestos) y se
corrigió.

**Cómo se verificó:** `build:apk` sin errores; `aapt dump xmltree`: los dos
meta-data están en el manifiesto del APK.

**Publicación:** versión **1.17** (`npm run android:release`: versionCode
17 → 18, misma firma, `dist/MusicalShowdown-v1.17.apk`), commit, etiqueta
`v1.17` y envío a GitHub.

GitHub Actions compiló y publicó la Release v1.17 sin errores. Con la 1.17
instalada, se envió una notificación de prueba ("🔔 Prueba del ícono")
directo desde la PC con `build/notificar.js avisos` (archivos temporales en el
scratchpad y la clave de Descargas en una variable de entorno que se borró
después), sin tocar `avisos.json`. Firebase respondió "Enviada".

**Qué quedó abierto:** que el usuario confirme cómo se ve el ícono. También se le explicó que la clave de firma de Android **no** está en
git (está en `platforms/android/keystore/`, fuera de git, y como secreto en
GitHub) y que conviene guardar los dos `.json` de Firebase en OneDrive.

---

## 2026-10-11 — Sesión 8 (parte 7): notificación de prueba recibida

**Resultado:** el usuario confirmó que le llegó al celular la notificación de
prueba con la app cerrada: Firebase funciona de punta a punta (GitHub Actions →
FCM → tema `importantes` → Android). Se borró el aviso `prueba-notificacion-1`
de `avisos.json` y se marcó como resuelto en `PENDIENTES.md`.

**Qué quedó abierto:** que el usuario diga cómo se ve el ícono chico y si le
llegó "Versión 1.16 disponible"; guardar la clave privada de Firebase fuera de
Descargas.

---

## 2026-10-11 — Sesión 8 (parte 6): permiso de notificaciones sin ventana propia

**Pedido del usuario:** al instalar la 1.15 vio primero "¿Activar
notificaciones?" (ventana del juego) y después el permiso de Android. Quiere
solo el permiso de Android.

**Qué se hizo:** `notificaciones.js`: sin `showConfirm`; la primera vez se pide
directo el permiso de Android (una sola vez). En los arranques siguientes solo
se anota el celular si el permiso ya está dado (también si se da después desde
los ajustes del celular). Compatible con lo que guardaba la 1.15. la guía técnica
al día. Se guardó como preferencia: pedir permisos sin ventana propia.

**Cómo se verificó:** lint sin errores; `npm test`: 138 bien; `npm run
test:e2e`: 28 bien; `build:apk` y `build:desktop` sin errores. En el celular,
cuando se publique la próxima versión.

**Publicación:** con la app cerrada en el celular del usuario, se publicó la
**1.16** (`npm run android:release`: versionCode 16 → 17, misma firma,
`dist/MusicalShowdown-v1.16.apk`) junto con el aviso de prueba
`prueba-notificacion-1` (`"importante": true`) en `avisos.json`. Al subir a
`main` se envía el aviso, y al subir la etiqueta `v1.16`, "Versión 1.16
disponible".

**Qué quedó abierto:** que el usuario confirme si le llegaron las dos
notificaciones con la app cerrada; después, borrar el aviso de prueba de
`avisos.json`.

---

## 2026-10-10 — Sesión 8 (parte 5): Firebase configurado y versión 1.15

**Qué se hizo:** el usuario creó el proyecto de Firebase
(`musical-showdown-4542a`), registró la app con `com.musicalshowdown.app` y
cargó en GitHub los secretos `GOOGLE_SERVICES_JSON` y
`FIREBASE_SERVICE_ACCOUNT`. Se revisó el proyecto y el paquete de los dos
archivos sin mostrar la clave privada; `google-services.json` se copió a
`platforms/android/android/app/` (fuera de git). `npm run android:release`:
versionCode 15 → 16, versionName 1.15, misma firma (SHA-256 e0e0a02f…),
`dist/MusicalShowdown-v1.15.apk` con `CON_FIREBASE = true`. Commit, etiqueta
`v1.15` y envío a GitHub.

**Qué quedó abierto:** en el celular, desinstalar la versión vieja
(`com.palabracantada.app`) e instalar la 1.15; probar la pregunta de la primera
vez y que llegue una notificación con la app cerrada (la de la 1.15 sale antes
de que el celular se anote, así que habrá que probar con la próxima versión o
con un aviso importante en `avisos.json`). La clave privada sigue en Descargas
hasta que el usuario la guarde.

---

## 2026-10-10 — Sesión 8 (parte 4): nombre técnico de Android `com.musicalshowdown.app`

**Pedido del usuario:** al registrar la app en Firebase preguntó si el paquete
podía ser `com.musicalshowdown.app` en vez de `com.palabracantada.app` (nombre
anterior del juego). Se le explicó que Android la toma como otra app (hay que
desinstalar la vieja; se reinician los ajustes guardados en el celular, no se
pierde nada del juego) y que conviene hacerlo antes de configurar Firebase.
Aceptó.

**Qué se hizo:** `capacitor.config.ts` (`appId`), `app/build.gradle`
(`namespace` y `applicationId`), `res/values/strings.xml` (`package_name` y
`custom_url_scheme`) y `MainActivity.java` (paquete; movido con `git mv` a
`java/com/musicalshowdown/app/`). La clave de firma es la misma.
`PENDIENTES.md` y `CONTEXTO-MUSICAL-SHOWDOWN.md` al día.

**Cómo se verificó:** `build:apk` sin errores; `aapt dump badging`:
`package: name='com.musicalshowdown.app'`, actividad
`com.musicalshowdown.app.MainActivity`, nombre visible "Musical Showdown".

**Qué quedó abierto:** registrar la app en Firebase con
`com.musicalshowdown.app`; al publicar la próxima versión, desinstalar la vieja
en el celular antes de instalar la nueva.

---

## 2026-10-10 — Sesión 8 (parte 3): notificaciones fuera de la app (Firebase)

**Pedido del usuario:** que la app muestre notificaciones fuera de la app,
separadas en importantes y no importantes; las importantes (como una
actualización) son las que salen fuera. Decisiones: **Firebase Cloud Messaging**
(push; se le explicó por qué es mejor que revisar en segundo plano), **solo
Android**, importantes = actualizaciones + avisos con `"importante": true`, y el
permiso se pide **una sola vez, al abrir la app la primera vez**.

**Qué se hizo:**
- `src/js/notificaciones.js` (nuevo): la primera vez pregunta "¿Activar
  notificaciones?" (Sí / Ahora no; no vuelve a preguntar). Con "Sí": permiso del
  sistema, canal "Avisos importantes" con prioridad alta (aparece arriba de la
  pantalla), registro y tema `importantes`. Al tocar una notificación se abre la
  campana. Complementos `@capacitor/push-notifications` 6 y
  `@capacitor-community/fcm` 6 (temas), llamados con `nativo()`.
- `avisos.js`: campo `importante` (versiones siempre; archivo solo con `true`) e
  `importantesNuevos()` (cada aviso se envía una sola vez).
- `build/notificar.js` (nuevo): envía al tema con la API v1 de FCM (token
  firmado con `crypto`, sin librerías). `--prueba` muestra sin enviar.
- `compilar.yml`: el APK incluye `google-services.json` del secreto
  `GOOGLE_SERVICES_JSON`; al publicar una versión se notifica; job nuevo
  `avisos` envía los importantes nuevos al cambiar `avisos.json` en `main`
  (secreto `FIREBASE_SERVICE_ACCOUNT`).
- `build/stamp.js` + `version.js`: `CON_FIREBASE` (sin `google-services.json` la
  app no ofrece notificaciones, porque Firebase fallaría).
- `.gitignore`: `google-services.json` y la clave de la cuenta de servicio.
  `avisos/LEEME.md`, `main.js`, `sw.js` (v22), pruebas en `avisos.test.js`.

**Cómo se verificó:** lint sin errores; `npm test`: 138 bien, 1 pendiente
conocido; `npm run test:e2e`: 28 bien; `notificar.js --prueba` elige solo los
avisos importantes nuevos; el APK pide `POST_NOTIFICATIONS` (aapt).

**Qué quedó abierto:** el usuario tiene que crear el proyecto de Firebase y
cargar los secretos; después, probar en el celular (ver `PENDIENTES.md`).

---

## 2026-10-10 — Sesión 8 (parte 2): versión 1.14 publicada

**Pedido del usuario:** commit y publicar la 1.14 con los géneros nuevos.
`npm run android:release`: versionCode 14 → 15, versionName 1.14, misma firma
del proyecto (SHA-256 e0e0a02f…), `dist/MusicalShowdown-v1.14.apk`. Después el
commit, la etiqueta `v1.14` y el envío a GitHub para que Actions compile y
publique la Release (así la app instalada avisa de la actualización).

---

## 2026-10-10 — Sesión 8: géneros con "Todos" y "Más"

**Pedido del usuario:** en vez de un botón "Seleccionar todos", dos botones:
"Todos" (marca todos los géneros disponibles; predeterminado) y "Más" (hoja con
el estilo de "Modos de juego" que muestra cada género con artistas de ejemplo).
Con "Más", en Clásico y Alternativo 1 se elige un solo género; en Alternativo 2,
uno o varios. También pidió que todo lo que ve (preguntas, permisos y
descripciones de comandos) esté en español.

**Qué se hizo:**
- `screens/config/genres.js` (nuevo): botones `#genres-all` / `#genres-more`
  (el de "Más" muestra lo elegido: "Más: Rock"), hoja "Elige un género" (tocar
  un género lo elige y cierra) o "Elige uno o varios géneros" en Alternativo 2
  (se marcan y se confirma con "Listo (N)"; si estaba "Todos", se parte de
  cero). `fixGenresForMode()` vuelve a "Todos" si quedaron varios géneros
  (no todos) fuera de Alternativo 2, o ninguno.
- `data/songs.js`: `availableGenres()` (géneros con canciones) y
  `genreArtists()` (artistas de la base de ejemplo, sin repetir).
- `state.js`: los géneros empiezan en "Todos" (antes, solo Pop).
- `screens/config/index.js`: usa el módulo nuevo. `css/styles.css`: colores de
  "Todos" / "Más" y de cada género en la hoja; se quitaron los colores de las
  fichas viejas. `sw.js`: archivo nuevo en `ASSETS`, caché v21.
- Pruebas: `test/generos.test.js` (5) y 2 pruebas de pantallas nuevas.

**Cómo se verificó:** lint sin errores; `npm test`: 136 bien, 1 pendiente
conocido; `npm run test:e2e`: 28 bien. Capturas en celular y PC: la primera
mostraba "✓ Elegido" en todos los géneros (el CSS de `.home-tag` le ganaba a
`hidden`); corregido y cubierto por la prueba. `build:desktop` y `build:apk`
sin errores (`dist/windows/Musical Showdown.exe`, `dist/android/Musical-Showdown.apk`).

**Qué quedó abierto:** que el usuario lo vea en el `.exe` y en el celular.

---

## 2026-10-10 — Sesión 7 (parte 4): versión 1.13 publicada

**Pedido del usuario:** el APK 1.12 instalado no avisaba de una actualización.
Era lo esperado: los cambios del día estaban en `main`, pero no había una
Release mayor que 1.12. Se publicó la 1.13 con `npm run android:release`
(versionCode 13 → 14, versionName 1.13, firma del proyecto SHA-256 e0e0a02f…,
`dist/MusicalShowdown-v1.13.apk`), y después el commit y la etiqueta `v1.13`
para que GitHub Actions compile y publique la Release.

---

## 2026-10-10 — Sesión 7 (parte 3): aviso de Grupal, música desde la carga y versión en el inicio

**Pedido del usuario:** (1) quitar la nota "Para jugar en Grupal se necesitan
al menos 4 jugadores" de la pantalla y avisarlo solo al confirmar, como en
Individual; (2) mostrar la versión abajo a la derecha del inicio; (3) que la
app abra siempre con la música sonando desde la pantalla de carga. Los cambios
visuales se aprobaron antes sobre maquetas (`maqueta-grupal`, `maqueta-version`).

**Qué se hizo:**
- `screens/config/index.js` y `players.js`: sin la nota `#group-note`; el
  aviso al confirmar dice "Escribe al menos 4 nombres de jugador para jugar en
  Grupal (llevas N)." `refreshGroupAvailability` pasó a `refreshPlayerCount`
  (solo actualiza el contador). Se borró `.config-group-note`.
- `screens/menu.js` + `css/styles.css`: etiqueta `v<versión>` en dorado abajo a
  la derecha del inicio (`.home-version-tag`). Aparece al terminar la entrada
  de la pantalla: la prueba de pantallas detectó que, mientras la pantalla se
  mueve, la etiqueta quedaba más arriba.
- Música: antes, en un celular lento, la música empezaba después de que se iba
  la pantalla de carga, porque esperaba a que se cargaran todos los efectos.
  Ahora `sound.js` pide la música primero y `precargar()` (motor.js) carga lo
  demás después; `main.js` espera `esperarMusica(4000)` antes de quitar la
  pantalla de carga. En la web sigue empezando con el primer toque.
- Pruebas de pantallas nuevas: aviso de Grupal y versión en el inicio.
  la guía técnica al día.

**Cómo se verificó:** lint sin errores; `npm test`: 131 bien; `npm run
test:e2e`: 24 bien. Medición con Edge sin ventana, la app simulada como
instalada y la CPU 6 veces más lenta: antes la carga se iba a los 2,3 s y la
música empezaba a los 3,2 s; ahora la música empieza a los 2,88 s y la carga se
va a los 2,93 s.

**Qué quedó abierto:** que el usuario lo confirme en el celular.

---

## 2026-10-10 — Sesión 7 (parte 2): menos texto, colores nuevos, ✕ roja y pruebas de pantallas

**Pedido del usuario:** quitar el texto innecesario de la app (mostrando antes
cómo quedaría), rediseñar los colores con la paleta del juego, poner en rojo la
✕ de eliminar jugador y agregar pruebas automáticas. Se le mostró una maqueta
"antes / después" de 16 pantallas (scratchpad `maqueta-textos`) y aprobó todo.

**Qué se hizo:**
- Textos quitados o acortados: subtítulo y descripción del tipo de batalla en
  el inicio (`menu.js`); descripciones de cada ajuste; "MODO … · …" arriba de
  la ronda (`round.js`); en grupos, el rango de equipos y la instrucción larga
  ("Toca dos jugadores para intercambiarlos.", `teamOrg.js`); salir de la
  partida ("Se pierde el progreso de esta partida.", `modals.js`); campo de
  búsqueda ("Nombre de la canción") y la línea "jugador · palabra" de la
  confirmación (`verify.js`); respuesta incorrecta ("Turno de X" / "X: N
  intentos más", `roundResult.js`); texto y nota de la hoja de compartir
  (`results.js`). Se borraron las reglas CSS que quedaron sin uso y se ajustó la
  cuadrícula del inicio en PC.
- `css/styles.css`, sección "Colores del juego en toda la app": borde degradado
  rosa → dorado → turquesa en tarjetas y ventanas, títulos en dorado, cada
  género con su color, franja de color en cada opción, botones secundarios en
  turquesa, "Correcta" en verde turquesa, fondos de color en los paneles de la
  ronda (en Grupal se respeta el color de cada grupo) y la ✕ en un círculo rojo.
- Pruebas de pantallas con Playwright (`@playwright/test` en `devDependencies`,
  `npm run test:e2e`, `playwright.config.mjs`, `test/e2e/`): 10 recorridos, en
  tamaño celular y PC. El servidor de prueba escucha solo en `127.0.0.1` (el
  primer intento escuchaba en toda la red y Windows le pidió permiso de red al
  usuario). Se agregaron a GitHub Actions. `test-results/` en `.gitignore`.
- la guía técnica al día.

**Cómo se verificó:** lint sin errores; `npm test`: 131 bien, 1 pendiente
conocido; `npm run test:e2e`: 20 bien. Capturas del juego real con Edge sin
ventana: iguales a la maqueta aprobada; inicio en PC sin huecos.

**Qué quedó abierto:** que el usuario lo vea en el `.exe` y en el celular.

---

## 2026-10-10 — Sesión 7 (parte 1): lista de jugadores con desplazamiento

**Pedido del usuario:** que la lista de jugadores de "Configurar partida" no
alargue la pantalla cuando se agregan muchos jugadores, sino que se desplace por
dentro. Se hizo una maqueta con 3 diseños (scratchpad `maqueta-jugadores`: A,
caja con 2 columnas; B, lista numerada; C, fichas) y el usuario eligió el **B**.

**Qué se hizo:**
- `screens/config/players.js`: cada fila lleva su número (`.player-num`); las
  filas fijas reservan el lugar de la ✕ (`.remove-space`); al tocar "+ Añadir
  jugador" la lista baja hasta el espacio nuevo y lo enfoca
  (`renderPlayers(true)`); `updateScrollShadows()` marca si hay nombres fuera de
  la vista (`more-above` / `more-below`); el contador `#players-count` se
  actualiza en `refreshGroupAvailability()`.
- `screens/config/index.js`: contador de nombres escritos junto a "Jugadores".
- `css/styles.css`: `#players-list` con alto fijo (262 px; 236 px en el
  celular), recuadro, barra amarilla y difuminado; se quitaron las 2 columnas
  del celular.

**Cómo se verificó:** lint sin errores; `npm test`: 131 bien, 1 pendiente
conocido. Capturas con Edge sin ventana (360 px y 760 px) con 2 y 12 jugadores y
después de agregar el 13 (la lista bajó sola y enfocó el espacio nuevo).
Compilados el `.exe` y el APK de prueba (`dist/android/Musical-Showdown.apk`).

**Qué quedó abierto:** que el usuario lo pruebe en el `.exe` y en el celular.

---

## 2026-10-08 — Sesión 6 (parte 46): versión v1.12 publicada

**Pedido del usuario:** publicar la 1.12. Se subió la etiqueta `v1.12`; GitHub
Actions compiló bien y publicó la Release con el `.exe`, el `.AppImage` y el
APK. Se comprobó el APK descargado de la Release: versionCode 13, versionName
1.12, firma del proyecto (SHA-256 e0e0a02f…). Enlace:
https://github.com/maxy26/Musical-showdown/releases/tag/v1.12

---

## 2026-10-08 — Sesión 6 (parte 45): navegación con teclado y lista propia del juego

**Pedido del usuario:** moverse por el juego con el teclado (flechas, Enter,
Backspace para volver), cerrar con Backspace las listas desplegables y la ruleta,
usar la lista rediseñada también con el mouse y en el celular, y arreglar que
después de usar el mouse las flechas dejaban de funcionar. Se hizo primero en una
maqueta (scratchpad `maqueta-teclado`) y el usuario la aprobó.

**Qué se hizo:**
- `src/js/teclado.js` (nuevo): flechas espaciales (`vecinoEn`), Enter = clic,
  edición de nombres, Backspace = volver (`botonVolver`), la marca se recupera
  tras redibujar (`firma` / `recuperar`), y la lista propia del juego
  (`abrirLista`): ↑ ↓ / Enter / Backspace / Esc con el teclado; clic, toque y
  tocar afuera con el mouse o el dedo. Se inicia con `iniciarTeclado()` en `main.js`.
- La lista del sistema ya no recibe toques (`select{pointer-events:none}`); el
  toque lo atiende `teclado.js`. En PC, la fila entera abre la lista (se quitó la
  copia invisible `fila-lista` de `config/index.js`: era la causa de que las
  flechas dejaran de funcionar tras un clic).
- `valuePicker.js`: en la ruleta ↑ ← bajan y ↓ → suben; texto de ayuda nuevo.
- `css/styles.css`: borde amarillo solo con teclado (`html.con-teclado`) y
  estilos de `.lista-teclado`.
- `sw.js`: `teclado.js` en `ASSETS`, `CACHE_NAME` v20. Prueba nueva
  `test/teclado.test.js` (`vecinoEn`).

**Cómo se verificó:** en la maqueta, con Edge sin ventana y CDP: flechas, Enter,
Backspace en cada pantalla, lista con teclado, con mouse y con toques simulados
de celular, ruleta cancelada con Backspace, y flechas después de usar el mouse;
sin errores. `npm test`: 131 bien, 1 pendiente conocido; lint sin errores.

**Ajuste después de la revisión del usuario:** un segundo clic o toque sobre la
misma lista (o su fila) la cierra, como la lista del sistema (`recienCerrada`).
Además, la lista se abre del lado con más espacio y nunca tapa su botón (antes,
si era larga, lo tapaba y en el celular el segundo toque elegía una opción).
Probado con mouse y toques simulados en el juego real.

**Compilado:** `.exe` y `dist/MusicalShowdown-v1.12.apk` (versionCode 13, versionName 1.12, firma del proyecto).

**Qué quedó abierto:** probar la lista nueva y el resto en un celular real.

---

## 2026-10-08 — Sesión 6 (parte 44): sin sonido en segundo plano; v1.11 publicada

**Pedido del usuario:** que la música no suene al salir de la app sin cerrarla;
luego subir y publicar la 1.11.

**Qué se hizo:** `audio/motor.js` → `congelarAudio()` suspende el audio y bloquea
que algo lo reactive (por ejemplo, el tic del reloj si la ronda sigue);
`plataforma.js` → `alCambiarPrimerPlano()` (página oculta y, en Android, el
evento `appStateChange` del complemento App vía `Capacitor.nativeCallback`);
`sound.js` lo conecta. Al volver, sigue desde el mismo punto. El APK 1.11 se
compiló firmado sin subir la versión (`build-android.js` + `gradlew
assembleRelease`) para publicarlo como 1.11. Se subió todo y la etiqueta `v1.11`.

**Cómo se verificó:** lint sin errores; `npm test`: 127 bien. En el navegador:
con la música sonando el audio está "running"; al ocultarse pasa a
"suspended" y sigue así aunque suenen un tic y un clic; al volver, "running".
APK local 1.11 (versionCode 12) con la firma del proyecto. Falta que el usuario
lo confirme en el celular.

---

## 2026-10-08 — Sesión 6 (parte 43): avisos que llegan con la app abierta (versión 1.11) y v1.10 publicada

**Pedido del usuario:** subir los commits y publicar la 1.10; que los avisos
nuevos se noten sin cerrar y abrir la app.

**Qué se hizo:**
- Se subieron `e885a8d` y `3860c72` y la etiqueta `v1.10`.
- `src/js/avisos.js`: `revisarAvisosSeguido()` revisa cada 3 minutos con la app
  a la vista, apenas vuelve internet y al volver a la app (mínimo 1 minuto
  entre revisiones, por el límite gratis de GitHub); `avisosNuevos()` (pura).
  Sin servidor propio no se pueden enviar al instante (eso podría tener costo);
  además GitHub guarda `avisos.json` en caché hasta unos 5 minutos.
- `screens/menu.js` → `avisosLlegaron()`: actualiza el globito y sacude la
  campana (`.campana-nueva` en `styles.css`). Se inicia en `main.js`.
- Pruebas nuevas en `test/avisos.test.js`; la guía técnica al día. Compilados
  `dist/MusicalShowdown-v1.11.apk` y el `.exe`.

**Cómo se verificó:** lint sin errores; `npm test`: 127 bien. En el navegador,
con GitHub simulado: al abrir sin avisos, globito oculto; al publicar un aviso y
volver internet, globito 1 y campana sacudiéndose, sin recargar.

---

## 2026-10-08 — Sesión 6 (parte 42): salir de la partida vuelve a "Configurar partida" (versión 1.10)

**Pedido del usuario:** al salir de una partida a mitad de juego, volver a
"Configurar partida" conservando todo (opción a).

**Qué se hizo:** `screens/modals.js` (pausa): "Sí, salir" guarda la
configuración, reinicia el estado y abre "Configurar partida" con la misma
configuración (jugadores, tipo, modo, géneros, puntaje y tiempo; puntajes en
cero). **Error encontrado y arreglado:** "No, continuar" cerraba la ventana pero
dejaba la ronda en pausa; ahora continúa. CONTEXTO y PENDIENTES al día.
Compilados `dist/MusicalShowdown-v1.10.apk` (versionCode 11) y el `.exe`.

**Cómo se verificó:** lint sin errores; `npm test`: 125 bien. En el navegador,
partida Grupal con 4 jugadores, Pop y Rock y 3000 puntos: "No, continuar" deja
la ronda corriendo; "Sí, salir" abre "Configurar partida" con los mismos datos
y los 4 nombres en pantalla.

---

## 2026-10-08 — Sesión 6 (parte 41): versión v1.9 publicada

**Qué se hizo:** se subieron `acb2cbf` y la etiqueta `v1.9`; GitHub publicó
https://github.com/maxy26/Musical-showdown/releases/tag/v1.9 con el APK, el
`.exe` y el `.AppImage`.

**Cómo se verificó:** el APK publicado es versionCode 10, versión 1.9, con la
firma SHA-256 e0e0a02f… del proyecto (se instala encima de la 1.8).

---

## 2026-10-08 — Sesión 6 (parte 40): compartir el podio y arreglo del botón Salir en Android (versión 1.9)

**Pedido del usuario:** pasar "Compartir el podio" al juego (maqueta aprobada).

**Qué se hizo:**
- `src/js/compartir.js`: imagen del podio (1080 × 1350) y `compartirPodio()`:
  Android con los complementos Share y Filesystem (la imagen se guarda en la
  caché y se comparte), celular en la web con `navigator.share`, PC guarda la
  imagen y copia el texto con el enlace de descargas de GitHub.
- `screens/results.js`: botón "📤 Compartir el podio" con vista previa, como en
  la maqueta. Estilos en `styles.css`.
- **Arreglo encontrado:** en Capacitor 6 `Capacitor.Plugins.App` no existe si el
  juego no incluye la librería del complemento, así que el botón "Salir del
  juego" probablemente no cerraba la app en Android. Ahora `plataforma.js` →
  `nativo()` llama a los complementos con `Capacitor.nativePromise` (incluido
  en el puente nativo); lo usan Salir y Compartir.
- `platforms/android`: `@capacitor/share` y `@capacitor/filesystem` versión 6.
  `platforms/desktop/main.js`: las descargas van directo a Descargas.
- `sw.js` v19; prueba nueva `test/compartir.test.js`; la guía técnica y PENDIENTES.
  Compilados `dist/MusicalShowdown-v1.9.apk` (versionCode 10) y el `.exe`.

**Cómo se verificó:** lint sin errores; `npm test`: 125 bien, 1 pendiente
conocido. En el navegador se ganó una partida: en el podio aparece el botón,
la imagen sale de 1080 × 1350, y en PC se copia el texto y aparece el aviso.
El APK trae registrados App, Filesystem y Share (`capacitor.plugins.json`) y
los nombres de los métodos coinciden con el código nativo.

**Qué quedó abierto:** que el usuario pruebe en el celular Compartir y Salir
(con el APK 1.9); publicar `v1.9` si lo pide.

---

## 2026-10-08 — Sesión 6 (parte 39): primera versión publicada (v1.8) con la firma del proyecto

**Qué se hizo:** el usuario creó los secretos `ANDROID_KEYSTORE_BASE64` y
`ANDROID_KEYSTORE_PROPERTIES`. Se subió `09a43ba` y la etiqueta `v1.8`; GitHub
compiló y publicó https://github.com/maxy26/Musical-showdown/releases/tag/v1.8
con `Musical-Showdown.apk`, `Musical.Showdown.exe` y `Musical-Showdown.AppImage`.
Se borraron los archivos `SECRETO-*.txt` de la carpeta de la clave.

**Cómo se verificó:** se descargó el APK publicado: versionCode 9, versión 1.8 y
firma SHA-256 e0e0a02f… igual a la de los APK de la PC (se instala encima).
Las notas de la versión empiezan con el texto propio, que es lo que mostrará
el aviso de la campana a quien tenga una versión anterior.

**Qué quedó abierto:** pasar "Compartir el podio" al juego (maqueta aprobada).

---

## 2026-10-08 — Sesión 6 (parte 38): maqueta de compartir el podio y firma del APK en GitHub

**Pedido del usuario:** compartir el juego desde el podio con una imagen del
podio (maqueta aprobada tal cual); publicar la versión con el enlace de
descargas de GitHub (temporal hasta una tienda oficial); para publicar, opción
A: guardar la clave de firma como secretos de GitHub.

**Qué se hizo:**
- Maqueta (scratchpad, fuera del juego): botón "📤 Compartir el podio" que
  dibuja una imagen 1080 × 1350 (logo, ganador, podio con medallas y MVP en
  Grupal, invitación con el enlace) y muestra la vista previa; en el celular
  abre el menú de compartir, en PC guarda la imagen y copia el texto.
  Aprobada; falta pasarla al juego.
- `.github/workflows/compilar.yml`: si existen los secretos de la clave, el
  APK se compila firmado (release) con la clave del proyecto; si no, como
  antes. La versión publicada lleva un texto propio en la primera línea.
- `src/js/avisos.js`: el aviso de una versión toma la primera línea de texto
  de sus notas (sin títulos ni marcas de Markdown). Prueba nueva.
- Valores de los secretos preparados en `platforms/android/keystore/`
  (ignorada por git); se comprobó que el texto reconstruye la clave exacta.
- la guía técnica y PENDIENTES al día.

**Cómo se verificó:** lint sin errores; `npm test`: 123 bien, 1 pendiente
conocido. Capturas de la maqueta (Individual y Grupal) y de la imagen generada.

**Qué quedó abierto:** que el usuario cree los 2 secretos en GitHub; luego subir
estos cambios, publicar `v1.8` y comprobar que el APK publicado tiene la firma
del proyecto; pasar "Compartir el podio" al juego.

---

## 2026-10-07 — Sesión 6 (parte 37): avisos de la campana (versión 1.8)

**Pedido del usuario:** avisos de versiones nuevas, novedades y promociones;
de las dos fuentes (versiones publicadas y un archivo de avisos); sin internet,
los últimos guardados; globito con los no leídos. Aprobó la maqueta tal cual y
pidió anotar "Compartir" como pendiente.

**Qué se hizo:**
- `src/js/avisos.js`: trae de GitHub (repositorio público, sin costo) las
  versiones publicadas (solo la más nueva que la instalada → "Actualización"
  con "Descargar") y `avisos/avisos.json` (novedades y promociones); los guarda
  para verlos sin internet; marca leídos al abrir el panel. Funciones puras con
  pruebas (`test/avisos.test.js`).
- `screens/menu.js`: panel con el diseño de la maqueta y globito en la campana.
  `plataforma.js` → `abrirEnlace()`; `platforms/desktop/main.js` abre los
  enlaces externos en el navegador del sistema.
- `avisos/avisos.json` (un aviso de bienvenida) y `avisos/LEEME.md` (cómo
  agregar avisos). `sw.js` v18. la guía técnica y PENDIENTES (notificaciones
  resueltas; nuevos: "Compartir el juego"; la clave ya está en la nube, falta
  protegerla con contraseña). Compilados `dist/MusicalShowdown-v1.8.apk`
  (versionCode 9) y el `.exe`.

**Cómo se verificó:** lint sin errores; `npm test`: 123 bien, 1 pendiente
conocido. En el navegador, simulando las respuestas de GitHub: globito 2,
panel con "Versión 1.8 disponible" y la bienvenida, "Descargar" abre la página
de la versión, el globito se oculta al abrir; sin internet muestra los
guardados con "📡 Sin conexión"; sin nada guardado, el mensaje vacío. Con la
red real (sin versiones publicadas y sin el archivo subido) el panel queda
vacío sin errores. En el `.exe` (app://) GitHub responde 200.

**Qué quedó abierto:** subir `avisos/avisos.json` a `main` para que aparezca
la bienvenida; publicar una versión (etiqueta `v*`) para ver el aviso de
actualización real.

---

## 2026-10-07 — Sesión 6 (parte 36): tipografías dentro del juego y espacios de jugadores (versión 1.7)

**Pedido del usuario:** que las tipografías no cambien sin internet; que
Individual empiece con 2 espacios para nombres y Grupal con 4 (Individual
mostraba 4 después de pasar por Grupal).

**Qué se hizo:**
- Tipografías: `src/fonts/` con Unbounded, Inter, Fredoka y Nunito (`.woff2`
  variables, solo latinas, 168 KB) y `LICENCIAS.txt` (OFL completas);
  `css/fuentes.css` con los `@font-face`; `index.html` ya no usa Google Fonts.
- Espacios: `fitPlayers()` en `config/players.js` (nombres escritos + espacios
  vacíos hasta el mínimo); `config/index.js` la usa solo cuando cambió el tipo
  de batalla (si no, solo completa, para no borrar un espacio recién agregado).
- `sw.js` v17 con los archivos nuevos; pruebas de `fitPlayers`; la guía técnica y
  PENDIENTES (dos resueltos). Compilados `dist/MusicalShowdown-v1.7.apk`
  (versionCode 8) y el `.exe`.

**Cómo se verificó:** lint sin errores; `npm test`: 118 bien, 1 pendiente
conocido. En el navegador: 0 pedidos a Google y las fuentes se cargan de
`/fonts/`; captura de la configuración con Fredoka y Nunito; espacios
Individual 2 → Grupal 4 → Individual 2 (conserva "Ana"); agregar un espacio y
tocar un género no lo borra. El APK trae los 5 archivos de `fonts/`.

---

## 2026-10-07 — Sesión 6 (parte 35): letras ocultas, búsqueda con la palabra y música al abrir (versión 1.6)

**Pedido del usuario:** (1) usar QR sin Wi-Fi para vincular dispositivos; (2) que
la música empiece al abrir el `.exe` y el APK; (3) no mostrar las letras de las
canciones (podría requerir pagar), solo usarlas por dentro para saber si la
canción lleva la palabra; (4) que la búsqueda solo encuentre canciones con la
palabra de la ronda; (5) posible pendiente: cambiar cómo se marca correcta /
incorrecta. Subir los commits.

**Qué se hizo:**
- `screens/verify.js`: nuevo `songHasWord()` (palabra marcada en `words` o
  palabra entera en la letra guardada); `searchSongs(q, word)` filtra por la
  palabra; ya no se muestra la letra ni en la búsqueda ni en "¿La respuesta es
  correcta?" (ahora muestra canción, artista, quién canta y la palabra);
  mensaje nuevo cuando no hay resultados. Ayuda sin la fila "Letra resaltada".
- Música al abrir: `sound.js` arranca la música al iniciar si `esAppInstalada()`;
  `platforms/desktop/main.js` con `autoplay-policy=no-user-gesture-required`
  (Android ya lo permite: Capacitor desactiva el requisito de toque). En la
  web sigue con el primer toque.
- Pruebas nuevas en `test/texto.test.js` (ejemplo "despacito" / "bicicleta").
  `sw.js` v16. CONTEXTO y PENDIENTES al día (música al abrir → Resueltos;
  nuevo pendiente de la forma de marcar correcta / incorrecta; aclaración del
  QR en el pendiente de dos dispositivos; decisión de las letras).
- Compilados `dist/MusicalShowdown-v1.6.apk` (versionCode 7) y el `.exe`.

**Cómo se verificó:** lint sin errores; `npm test`: 118 bien, 1 pendiente
conocido. En el navegador (tamaño celular): palabra DESPACITO → buscar
"bicicleta" no da resultados y "despacito" sí; sin letra en la búsqueda ni en la
decisión. En el `.exe`: un sonido nuevo arranca sin tocar nada (estado
"running") y Ajustes dice versión 1.6.

**Qué quedó abierto:** el pendiente "Letras del rediseño sin internet" se refiere
a las **tipografías** (Fredoka, Nunito…), no a las letras de canciones: aclarárselo
al usuario y preguntarle de nuevo. Cómo quiere marcar correcta / incorrecta.

---

## 2026-10-07 — Sesión 6 (parte 34): pendientes nuevos y orden acordado

**Pedido del usuario:** dejar para el final la búsqueda por voz y todo lo que
necesite un servicio de pago, aunque sea crítico; anotar dos pedidos nuevos:
partida en dos dispositivos vinculados (uno muestra la ronda y el otro elige
quién canta, con animación de audio) y que la música empiece apenas se abre la
app.

**Qué se hizo:** `PENDIENTES.md` (nota de orden en el encabezado y los dos
pendientes en "Diseño / implementación pendiente", con las preguntas a hacer
antes). Commit `519b301`.

**Qué quedó abierto:** seguir con el siguiente pendiente.

---

## 2026-10-07 — Sesión 6 (parte 33): botón "Salir del juego" en Ajustes (versión 1.5)

**Pedido del usuario:** un botón para salir en los Ajustes del juego, en PC y
en Android.

**Qué se hizo:** nuevo `src/js/plataforma.js` con `esAppInstalada()` (lo que
antes era `isNativeShell()` de `main.js`) y `salirDeLaApp()`. En Ajustes, al
final, el botón rojo "🚪 Salir del juego" pregunta "¿Salir del juego?" (en una
partida avisa "Se perderá la partida en curso.") y cierra: en Android con el
complemento oficial `@capacitor/app` (versión 6, instalado en
`platforms/android`; Capacitor agregó `capacitor-app` a los archivos de
Gradle), en Windows cerrando la ventana. En la web no aparece (no se puede
cerrar una pestaña desde la página). `sw.js` v15. Compilados el `.exe` y
`dist/MusicalShowdown-v1.5.apk` (versionCode 6).

**Cómo se verificó:** lint sin errores; `npm test`: 116 bien, 1 pendiente
conocido. En el navegador: en la web el botón no aparece; simulando Android
aparece, "No" no cierra y "Sí" llama a `exitApp`. El APK trae registrado
`@capacitor/app` (`capacitor.plugins.json`). En el `.exe` el botón aparece.
Falta que el usuario confirme que cierra de verdad en el celular y en la PC.

---

## 2026-10-07 — Sesión 6 (parte 32): sonidos nuevos y ajustes pasados al juego real (versión 1.4)

**Pedido del usuario:** pasar al juego real todo lo aprobado en las pruebas de
sonido.

**Qué se hizo:**
- **Sonido nuevo:** `sound.js` reescrito; nuevos `js/audio/catalogo.js` (archivos y
  notas de cada efecto elegido) y `js/audio/motor.js` (Web Audio: mismo volumen
  para todos los efectos con limitador, música igualada por canción, entrada
  con filtro y barrido, bucle sin corte de Coffee Beans, aceleración en los
  últimos 5 s, pausa y vuelta desde donde iba). En Node no hace nada
  (`hayAudio()`), así las pruebas no fallan.
- **Audios** en `src/audio/musica/` y `src/audio/efectos/` (solo los usados;
  aplausos recortados a 5,2 s en mono, 224 KB), créditos en
  `src/audio/CREDITOS.txt`. Se borraron `ambient.mp3` y `click.wav`.
- **Pantallas:** Ajustes con barras de volumen, Sí/No que cambian con cada
  toque y cuenta antes de la ronda (No o 3 a 7 s); en el celular, Ajustes entra
  desde la izquierda; botón 🔊 (solo música) en configuración, grupos y ronda;
  tuerca de Ajustes en la ronda; cuenta con capa transparente que bloquea los
  toques; sonido de fin del tiempo, acertar/fallar, relevo de más, aviso,
  abrir/cerrar (también la ayuda), ruleta y podio; sin parpadeo al redibujar
  la misma pantalla; en PC, filas completas clicables; diseño cara a cara de la
  ronda en el celular.
- **Windows:** `platforms/desktop/main.js` sirve el juego con `app://juego/`
  (Chromium no deja leer audios con fetch desde `file://`); `main.js` trata
  `app:` como app instalada (sin service worker). Ojo: los ajustes guardados en
  el `.exe` anterior no pasan (cambió el origen).
- `sw.js`: `CACHE_NAME` v14 y lista de archivos al día. Prueba nueva
  `test/sonido.test.js`. Reglas 17 y 18 de INSTRUCCIONES, la guía técnica y CONTEXTO
  (sección 4) actualizados; el pendiente de sonidos pasa a Resueltos.
- Compilados `dist/windows/Musical Showdown.exe` y
  `dist/MusicalShowdown-v1.4.apk` (`npm run android:release`, versionCode 5).

**Archivos tocados:** `src/js/sound.js`, `src/js/audio/*`, `src/audio/*`,
`src/js/{gameLogic,main,router,settings}.js`, `src/js/screens/{menu,modals,round,sheet,teamOrg}.js`,
`src/js/screens/config/{index,alt2Options,valuePicker}.js`, `src/css/styles.css`,
`src/sw.js`, `platforms/desktop/main.js`, `platforms/android/android/app/build.gradle`,
`test/sonido.test.js` y la documentación.

**Cómo se verificó:** `npm run lint` sin errores; `npm test`: 116 bien y 1
pendiente conocido. Juego real servido en el navegador a tamaño de celular: los
13 audios cargan y todos los efectos suenan sin errores; Ajustes (panel desde la
izquierda, Sí/No, volumen 0 = No, cuenta − de 3 a No); botón 🔊 presente;
cuenta con capa que bloquea la pausa y luego empieza la ronda; la ronda llena
la pantalla (844/844); podio. En el `.exe` (abierto con depuración) la página
carga desde `app://juego/` y la música, los efectos y los aplausos se
decodifican. El APK trae todos los audios.

**Qué quedó abierto:** que el usuario pruebe el `.exe` y el APK 1.4 en el
celular (instalar encima del 1.3).

---

## 2026-10-06 — Sesión 6 (parte 31): límites de la cuenta antes de la ronda (pruebas)

**Pedido del usuario:** la cuenta no puede ser de menos de 3 segundos, pero sí 0
(No); máximo 7.

**Qué se hizo (juego de prueba):** en Ajustes, − desde 3 pasa a "No" y + desde
"No" pasa a 3; tope en 7. Un valor guardado fuera de rango (por ejemplo 10) se
lleva a 7. Solo scratchpad; `src/` no cambió.

**Cómo se verificó:** Edge sin ventana: guardado 10 → 7; − : 6, 5, 4, 3, No (y
se apaga); + : 3, 4, 5, 6, 7 (y se apaga); la cuenta de la ronda sigue
funcionando; sin errores.

**Qué quedó abierto:** la prueba final del usuario.

---

## 2026-10-06 — Sesión 6 (parte 30): final de la cuenta definido (pruebas)

**Pedido del usuario:** final de la cuenta = 6 (cristal con metal suave). Subir
los commits.

**Qué se hizo:** se subieron `9e19790` y `bae239d`. En la mesa (prueba 21) la
cuenta queda fija: 3, 2 y 1 con cristal; el final, cristal más agudo con metal
suave, un 50 % más fuerte. Todos los sonidos están elegidos. Solo scratchpad.

**Cómo se verificó:** Edge sin ventana: números 0,130 y final 0,195; en el
juego de prueba suenan 3, 2, 1 y el final, la capa se quita y empieza la ronda;
sin errores.

**Qué quedó abierto:** la prueba final del usuario.

---

## 2026-10-06 — Sesión 6 (parte 29): final de la cuenta distinto (pruebas)

**Pedido del usuario:** que el último sonido de la cuenta sea distinto al resto,
con alguna similitud, y más fuerte.

**Qué se hizo:** mesa (prueba 20) con 9 finales a partir del cristal (doble,
acorde, arpegio, cristal medio, con campana, con metal, agudo doble, con
remate grave y el de antes); los números siguen en cristal. Solo scratchpad.

**Cómo se verificó:** Edge sin ventana: en las 9 opciones los números quedan en
0,130 y el final en 0,195 (50 % más fuerte); 85 sonidos se decodifican; sin
errores.

**Qué quedó abierto:** que el usuario elija el final; prueba final.

---

## 2026-10-06 — Sesión 6 (parte 28): podio definido (pruebas)

**Pedido del usuario:** podio = 11 (jingle de victoria con piano) con aplausos;
no pasar nada al juego real hasta una prueba final. Subir los commits.

**Qué se hizo:** se subió `98e0a43`. En la mesa (prueba 19) el podio queda fijo:
piano y, desde el segundo 1,2, aplausos que se desvanecen a los 5 s. Con esto
todos los sonidos están elegidos. Solo scratchpad; `src/` no cambió.

**Cómo se verificó:** Edge sin ventana: partida ganada → en el podio suena la
felicitación (6,2 s) con la música detenida; al salir entra Funky Disco; sin
errores.

**Qué quedó abierto:** la prueba final del usuario antes de pasar todo al juego
real.

---

## 2026-10-06 — Sesión 6 (parte 27): felicitaciones del podio más festivas (pruebas)

**Pedido del usuario:** sonidos de podio más atractivos, más de felicitaciones;
la música de la ronda se detiene y suena el podio. Subir los commits.

**Qué se hizo:** se subieron `51e57dc` y `89f6da5`. Se buscaron en OpenGameArt
sonidos CC0 de celebración (revisando la licencia de cada página) y se
descargaron 14: aplausos, "bien hecho" con aplausos, voces "Congratulations!",
fanfarrias, "nivel completado", "misión cumplida" y un jingle de victoria en 18
instrumentos. Mesa (prueba 18) con 15 opciones, varias combinadas con
aplausos; el motor puede cortar un sonido largo con desvanecimiento. Solo
scratchpad; `src/` no cambió.

**Cómo se verificó:** Edge sin ventana: se ganó una partida y en el podio sonó
la felicitación con la música detenida; las 15 opciones quedan al mismo nivel
(0,13) y duran de 0,9 a 10,5 s; 61 sonidos de la mesa se decodifican; sin
errores (se corrigió un error de orden al cortar los aplausos).

**Qué quedó abierto:** que el usuario elija el sonido del podio.

---

## 2026-10-06 — Sesión 6 (parte 26): sonido del podio (pruebas)

**Pedido del usuario:** un sonido especial de felicitaciones para el podio, sin
bucle.

**Qué se hizo:** momento nuevo "Podio" en la mesa (prueba 17) con 9 opciones:
Funky Victory (canción corta de unos 8 s), jingles de saxofón, tambores
metálicos, pizzicato y golpe de banda, y fanfarrias armadas con los sonidos ya
elegidos. En el juego de prueba suena una vez al llegar al podio; la música de
la ronda se detiene ahí. Solo scratchpad; `src/` no cambió.

**Cómo se verificó:** Edge sin ventana: se ganó una partida (puntaje objetivo
100) y al pasar al podio sonó "podio" con la música detenida; al volver al
inicio entró Funky Disco; las 9 opciones quedan al mismo nivel (0,13); 81
sonidos de la mesa se decodifican; sin errores.

**Qué quedó abierto:** elegir el sonido y confirmar que la música se detenga en
el podio.

---

## 2026-10-06 — Sesión 6 (parte 25): cuenta definida y fila de la lista exacta (pruebas)

**Pedido del usuario:** "más alto" era más fuerte; cuenta = 1 (cristal); que la
fila de "Puntaje objetivo" funcione exactamente como tocar el valor. Subir el
commit.

**Qué se hizo:** se subió `750f9ee`. En el scratchpad: la cuenta queda en
cristal con el final un 50 % más fuerte (se aplica después de igualar el
volumen); la fila lleva encima una copia invisible de la lista (la solución
anterior podía desfasarse con la lista real de Windows, que es una ventana
aparte).

**Archivos del proyecto tocados:** `PENDIENTES.md` y esta auditoría. `src/` no
cambió.

**Cómo se verificó:** Edge sin ventana: la copia cubre toda la fila y tiene las
mismas opciones; elegir 500 desde ella cambia el puntaje y suena un solo clic;
nivel de la cuenta: números 0,130 y final 0,195; sin errores.

**Qué quedó abierto:** aprobación para pasar todo al juego real.

---

## 2026-10-06 — Sesión 6 (parte 24): mismo volumen para todos los efectos (pruebas)

**Pedido del usuario:** que todos los sonidos que no son la música suenen con el
mismo volumen (los clics casi no se oían), respetando las barras de música y
efectos; que tocar otra vez la fila del puntaje cierre la lista; sonidos nuevos
para la cuenta con el final un poco más alto. Subir los commits.

**Qué se hizo:** se subieron `acbcae3`, `b9b19e7` y `302aeaa`. En el motor de
prueba: medición del nivel de cada sonido (grabación sin sonido, ventanas de
30 ms) y ganancia para dejarlos todos en 0,13, con un limitador en los efectos;
cada canción igualada a 0,07. La medición mostró que antes la música al
máximo (0,27) sonaba más fuerte que los efectos. Fila del puntaje: abre y
cierra (al abrirse la lista el campo pierde el foco un instante, por eso no se
usa "blur"). Detalle en PENDIENTES.

**Archivos del proyecto tocados:** `PENDIENTES.md` y esta auditoría. `src/` no
cambió.

**Cómo se verificó:** Edge sin ventana: niveles medidos después de igualar
(efectos entre 0,11 y 0,13); toques reales del mouse en la fila: abre, cierra,
abre; cuenta del juego sin errores; 77 sonidos se decodifican.

**Qué quedó abierto:** elegir la cuenta y confirmar "más alto"; aprobar para
pasar todo al juego real.

---

## 2026-10-06 — Sesión 6 (parte 23): acertar/fallar y fin del tiempo definidos (pruebas)

**Pedido del usuario:** Acertar/Fallar = 7 (la escala alegre / escala que se
apaga), "Se acabó el tiempo" = 7 (tics que bajan con el reloj normal); en la
cuenta, el mismo sonido para 3, 2 y 1 y otro parecido pero distinto al final.

**Qué se hizo:** mesa (prueba 14) con esos dos fijos y 8 opciones nuevas de la
cuenta. Solo scratchpad; `src/` no cambió.

**Cómo se verificó:** Edge sin ventana: 78 sonidos se decodifican; la cuenta del
juego de prueba suena 3, 2, 1 y el final, sin errores.

**Qué quedó abierto:** elegir la cuenta; luego, con todo elegido, pasar los
sonidos al juego real (cambia las reglas 17 y 18).

---

## 2026-10-06 — Sesión 6 (parte 22): opciones nuevas de acertar/fallar, fin del tiempo y cuenta (pruebas)

**Pedido del usuario:** intermedios entre el 3 y el 4 de Acertar/Fallar;
parecidos al 5 de "Se acabó el tiempo" y además un solo sonido de fin parecido
al reloj; parecidos al 4 de la cuenta.

**Qué se hizo:** mesa (prueba 13) con 8, 13 y 8 opciones. Solo scratchpad;
`src/` no cambió.

**Cómo se verificó:** Edge sin ventana: 200 sonidos se decodifican; el recorrido
de la cuenta en el juego de prueba sigue igual (3, 2, 1, final; sin errores).

**Qué quedó abierto:** que el usuario elija esos tres sonidos.

---

## 2026-10-06 — Sesión 6 (parte 21): cuenta en Ajustes, capa de la cuenta y diseño cara a cara (pruebas)

**Pedido del usuario:** fijar Elegir y Abrir/Cerrar, opciones nuevas para
Acertar/Fallar, fin del tiempo y cuenta; mover la cuenta a Ajustes; que no se
pueda tocar nada durante la cuenta (con una pantalla transparente); diseño 4 de
la ronda con casillas grandes. Subir el commit.

**Qué se hizo:** se subió `3805f2e`. En el scratchpad: mesa (prueba 12) y juego
de prueba con los cambios; detalle en PENDIENTES, "Sonidos nuevos".

**Archivos del proyecto tocados:** `PENDIENTES.md` y esta auditoría. `src/` no
cambió.

**Cómo se verificó:** Edge sin ventana a 390×844: la cuenta ya no está en la
configuración de partida y en Ajustes sube y baja; durante la cuenta, "Pausa"
no hace nada y la capa se quita al terminar (suenan 3, 2, 1 y el final);
capturas de la ronda en Individual y Grupal: la página mide justo el alto de la
pantalla y las casillas ocupan el ancho. 185 sonidos de la mesa se decodifican.

**Qué quedó abierto:** elecciones de la mesa y aprobación para pasar todo al
juego real.

---

## 2026-10-06 — Sesión 6 (parte 20): más sonidos, cuenta antes de la ronda y diseños de ronda (pruebas)

**Pedido del usuario:** fijar más sonidos, modo A del botón 🔊, sonido en la
tarjeta de Jugar y en la ayuda, sonido de fin del tiempo, cuenta configurable
antes de cada ronda, fila completa clicable en PC y diseños del orden de los
jugadores en Android. Subir los commits.

**Qué se hizo:** se subieron `a33f77e` y `d7da6ec`. En el scratchpad: mesa
(prueba 11, con los momentos nuevos "Se acabó el tiempo" y "Cuenta antes de la
ronda"), juego de prueba con los 6 pedidos y `disenos-ronda.html` con 4
diseños. Detalle en PENDIENTES, "Sonidos nuevos".

**Archivos del proyecto tocados:** `PENDIENTES.md` y esta auditoría. `src/` no
cambió.

**Cómo se verificó:** Edge sin ventana con CDP: 158 sonidos de la mesa se
decodifican; recorrido del juego: tarjeta de Jugar → clic y pasa a configurar,
ayuda → abrir/cerrar, fila de puntaje clicable, cuenta 3 → 2 → 1 → final con su
sonido, tiempo en 0 → "fin"; sin errores. Captura de los diseños.

**Qué quedó abierto:** elecciones de la mesa, detalles de la cuenta y el
diseño de ronda que elija el usuario.

---

## 2026-10-06 — Sesión 6 (parte 19): sonidos definidos y ajustes de volumen (pruebas)

**Pedido del usuario:** fijar varios sonidos, opciones nuevas para el resto, y
4 pedidos más (Sí/No con cada toque, sin parpadeo, volumen sin "agache" con
barras en Ajustes, dos formas de silenciar) más ver Ajustes en tamaño celular.

**Qué se hizo (solo pruebas en el scratchpad):** mesa (prueba 10) y juego de
prueba actualizados; detalle en PENDIENTES, "Sonidos nuevos". Se encontró la
causa del parpadeo: cada cambio redibuja la pantalla entera y repite la
animación `fadein` de `.screen`.

**Archivos del proyecto tocados:** `PENDIENTES.md` y esta auditoría. `src/` no
cambió.

**Cómo se verificó:** Edge sin ventana con CDP: 117 sonidos de la mesa se
decodifican; recorrido del juego de prueba con Sí/No, barras en 0 y 80, modos A
y B del botón 🔊 (A siguió desde el segundo exacto donde se quitó), sin
animación de entrada al redibujar; captura del panel de Ajustes a 390 px.

**Qué quedó abierto:** elecciones pendientes de la mesa y aprobación de todo
para pasarlo al juego real.

---

## 2026-10-05 — Sesión 6 (parte 18): pruebas de sonido con grabaciones CC0

**Pedido del usuario:** sonidos más profesionales; rechazó los sintetizados y
eligió grabaciones de uso libre.

**Qué se hizo (solo pruebas, fuera del juego, en el scratchpad):** mesa de
sonidos (`sonidos7.html`, prueba 9) y una copia del juego (`/juego/`) con un
motor de prueba (`motor-sonidos.js`): música con entrada, bucle sin corte de
Coffee Beans (44 pulsos medidos), aceleración en los últimos 5 s, efectos por
momento y los 7 pedidos del 05-10-2026 (ver PENDIENTES, "Sonidos nuevos"). Se
subió el commit `fc0ff44`.

**Archivos del proyecto tocados:** `PENDIENTES.md` y esta auditoría. El juego
real (`src/`) no cambió.

**Cómo se verificó:** Edge sin ventana con CDP: los 276 sonidos se decodifican,
y un recorrido del juego de prueba registra el sonido correcto en cada paso, sin
errores.

**Qué quedó abierto:** que el usuario elija los sonidos y apruebe los 7 pedidos;
cambiar las reglas 17 y 18 de INSTRUCCIONES al pasarlo al juego.

---

## 2026-10-04 — Sesión 6 (parte 17): protección de la clave de firma

**Pedido del usuario:** que el script no cree una clave nueva sin querer (por
ejemplo, si el proyecto se baja de nuevo y la clave quedó solo en OneDrive).

**Qué se hizo:** `build/android-release.js` revisa la clave **antes** de
borrar o subir la versión; si falta, se detiene con instrucciones para copiarla
desde la copia de seguridad. Solo crea una nueva con `--nueva-clave`.
Guía técnica actualizada.

**Cómo se verificó:** se movió la carpeta de la clave, se ejecutó el script:
salió con el aviso (código 1) y el versionCode siguió en 4; se devolvió la
carpeta.

---

## 2026-10-04 — Sesión 6 (parte 16): el APK no se actualizaba — diagnóstico y `android:release`

**Pedido del usuario:** diagnosticar y arreglar sin pedir confirmación; crear
`npm run android:release`; caché del service worker por compilación; versión
visible; ejecutarlo y confirmar el versionCode.

**Diagnóstico**
- versionCode 3 / versionName 1.2: correcto.
- Archivos de la app contra `src/`: iguales (solo `index.html` cambia a
  propósito, por el `bundle.js`).
- `capacitor.settings.gradle`: apunta a `./capacitor-android` (correcto).
- Service worker: caché con nombre manual (v13); Capacitor no atiende sus
  peticiones.
- Firma: clave de depuración de esta PC; GitHub Actions firma con otra.
- **Causa:** `android:allowBackup="true"`. Al reinstalar, Android restauraba
  los datos de la app desde la copia de seguridad, incluidos el service worker
  y la caché de una versión vieja, que seguían sirviendo los archivos viejos.

**Qué se hizo**
- `AndroidManifest.xml`: `allowBackup="false"`. `capacitor.config.ts`:
  `server.hostname = "musicalshowdown.app"` (origen nuevo, sin la caché vieja).
- `src/js/version.js` (versión visible en Ajustes) y `build/stamp.js`: en cada
  compilación escribe la versión (de `build.gradle`), la plataforma, fecha y
  hora, y un `CACHE_NAME` único en `www/sw.js` (su "activate" borra las demás).
  Lo usan `build-android.js` y `build-desktop.js`.
- `build/android-release.js` + `npm run android:release`: limpia todo (nunca la
  clave ni `src/`), sube versionCode, sync y corrección de capacitor-android,
  crea la clave la primera vez (`platforms/android/keystore/`, en
  `.gitignore`), `gradlew clean assembleRelease` firmado, copia a
  `dist/MusicalShowdown-v<versión>.apk` y verifica versionCode y firma.
- `app/build.gradle`: firma de la versión de publicación con esa clave.
- la guía técnica, PENDIENTES (resuelto; nuevo: copia de seguridad de la clave).

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente. `npm run android:release` corrió completo: versionCode 3 → 4,
versionName 1.3, `aapt` confirma versionCode 4; firma SHA-256
e0e0a02f…ef5d730. Dentro del APK: `allowBackup` = 0, hostname
`musicalshowdown.app`, versión "1.3 · Android · 04-10-2026 11:43 · compilación
4", caché `musical-showdown-1.3-20261004114318`. `.exe` recompilado (versión
"PC Windows").

**Qué quedó abierto:** que el usuario instale `dist/MusicalShowdown-v1.3.apk`
(una vez desinstalando la anterior, por el cambio de firma) y confirme; copia
de seguridad de la clave.

---

## 2026-10-04 — Sesión 6 (parte 15): logo nuevo "3D premium" y versión 1.2

**Decisión del usuario:** de las 3 mejoras del logo de hoy, la tercera ("3D
premium"), aplicada directamente al juego. Contó que pasa el APK por WhatsApp
y al abrir ve la versión vieja.

**Qué se hizo**
- Los íconos se generaron dibujando el SVG del logo en un lienzo del navegador
  (página en la carpeta temporal + Edge sin ventana con conexión de
  depuración), sin herramientas externas:
  - `src/icons/icon-512.png` y `icon-192.png`.
  - Android: `ic_launcher`, `ic_launcher_round` (48 a 192 px),
    `ic_launcher_foreground` (108 a 432 px, logo al 72 %) y las 11
    `splash.png` (logo al 32 % sobre `#141833`).
  - Windows: `platforms/desktop/build-icon.ico` (16 a 256 px, PNG dentro).
- Fondo del ícono adaptable de Android: blanco → `#141833`; fondo de
  Capacitor (`capacitor.config.ts`): `#150F22` → `#141833`.
- Versión 1.2 (`APP_VERSION`, versionCode 3, versionName "1.2"): el APK sale
  como `Musical-Showdown-v1.2.apk`. `sw.js` v13.
- PENDIENTES (logos resuelto; seguimiento del APK por WhatsApp) y CONTEXTO.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; se vieron el ícono y una pantalla de carga generados; el APK trae el
ícono nuevo (`res/mipmap-xxxhdpi-v4/ic_launcher.png`, 52 513 bytes), el ícono
web nuevo y la versión 1.2. Compilados `.exe` y `.apk`; se abrió el juego.

**Qué quedó abierto:** que el usuario confirme en el celular que ve la 1.2.

---

## 2026-10-04 — Sesión 6 (parte 14): versión visible y APK con la versión en el nombre

**Reporte del usuario:** aun desinstalando la app vieja, el APK que instala no
trae los cambios.

**Qué se encontró:** el APK de `dist/android` sí trae todo (se revisó su
`bundle.js` y `styles.css`); en GitHub no hay versiones publicadas ni APKs
guardados en el repositorio, y todas las compilaciones de Actions salieron
bien. El problema está en cómo llega el archivo al teléfono (probablemente una
copia vieja con el mismo nombre); se le preguntó cómo lo pasa.

**Qué se hizo**
- `menu.js`: `APP_VERSION` ("1.1 · 04-10-2026") visible al final de Ajustes,
  para saber qué versión está instalada.
- `build/build-android.js`: además de `Musical-Showdown.apk`, deja una copia
  `Musical-Showdown-v<versionName>.apk` para no confundirla con APKs viejos.
  (El flujo de GitHub Actions sube el mismo `Musical-Showdown.apk`; no cambia.)
- Guía técnica actualizada. Propuestas de logo: tercera y cuarta tanda en la
  carpeta temporal (fuera del juego).

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; el APK nuevo trae `APP_VERSION`. Compilados `.exe` y `.apk`.

**Qué quedó abierto:** cómo pasa el usuario el APK al teléfono; elección del
logo.

---

## 2026-10-04 — Sesión 6 (parte 13): el APK no se actualizaba en el celular

**Reporte del usuario:** instaló el APK nuevo y el juego seguía viéndose como
la versión anterior.

**Causa:** el service worker de la versión anterior quedó registrado en la
app. En Android, Capacitor no atiende las peticiones del service worker
(`capacitor-android` no usa `ServiceWorkerController`): sus pedidos fallan y
"network-first" cae a la copia guardada, que era la versión vieja. El APK sí
traía el código nuevo.

**Qué se hizo**
- `main.js`: `isNativeShell()` (Capacitor o file://). El service worker solo
  se registra en la web; en Android y en el `.exe` se borran al abrir los
  service workers y copias que hayan quedado.
- `platforms/android/android/app/build.gradle`: versionCode 2, versionName
  "1.1", para ver en el celular qué versión está instalada.
- Guía técnica actualizada.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; el `bundle.js` del APK nuevo trae el cambio. Compilados `.exe` y
`.apk`. **Importante:** en un celular que ya tenía la versión vieja, el
service worker viejo impide que cargue el código nuevo la primera vez; hay que
**desinstalar la app (o borrar sus datos) una vez** antes de instalar este APK.
Desde esta versión no vuelve a pasar.

**Qué quedó abierto:** que el usuario confirme en el celular.

---

## 2026-10-04 — Sesión 6 (parte 12): prueba de reconocimiento de voz (fuera del juego)

**Decisiones del usuario (pendiente crítico de buscar canciones):** Vosk sin
internet; la voz busca la canción; se puede escribir solo el nombre; el juego
sugiere y el moderador confirma. Primero, una prueba aparte.

**Qué se hizo (carpeta temporal, no en el juego):** página `voz.html` con
`vosk-browser` 0.0.8 y el modelo `vosk-model-small-es-0.42` empaquetado como
`.tar.gz`. Muestra lo que va entendiendo y ordena las canciones de la base de
ejemplo por palabras y pares de palabras que coinciden.

**Cómo se verificó:** con Edge sin ventana y su conexión de depuración (tiempo
real): el modelo carga en 3,5 s; con un audio de la voz de Windows en español
("que estás cansado de andar y de andar…") lo entendió exacto y encontró Color
Esperanza. Se le abrió la prueba al usuario en Brave para que cante.

**Qué quedó abierto:** resultado con voz cantada; después, diseño e
integración en el juego (peso de 40 MB en el `.exe`/`.apk`, permiso de
micrófono en Android).

---

## 2026-10-04 — Sesión 6 (parte 11): decisiones pendientes cerradas

**Decisiones del usuario:** (1) pasarse del máximo de relevos por ronda se
sigue penalizando como ahora; (2) la duda de buscar solo por nombre o también
por fragmento se decide en el pendiente crítico de cómo buscar canciones.

**Archivos:** CONTEXTO (relevo) y PENDIENTES (búsqueda). Solo documentos.

---

## 2026-10-04 — Sesión 6 (parte 10): efecto al pasar el mouse (solo PC)

**Decisión del usuario:** dejar el "Rebote" al elegir (vio 6 animaciones en
una muestra) y agregar un efecto nuevo cuando el mouse pasa por encima, solo
en PC.

**Qué se hizo:** `styles.css`, regla `@media (hover:hover) and (pointer:fine)`
(solo equipos con mouse): botones y casillas se elevan 2 px y crecen al 105 %;
las tarjetas grandes (inicio y manual de modos) se elevan 3 px y crecen al
101,5 %. Se usan las propiedades `scale` y `translate` para no chocar con las
animaciones de entrada ni con el rebote al elegir.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; con Edge sin ventana se comprobó que la PC cuenta como equipo con
mouse y que la regla se lee (3 reglas). El efecto en sí se ve moviendo el
mouse en el `.exe`. Compilados `.exe` y `.apk`.

**Qué quedó abierto:** las dos preguntas de la parte 6.

---

## 2026-10-04 — Sesión 6 (parte 9): la animación pasa a ser "crecer al elegir"

**Corrección del usuario:** no quería la onda; quería que el botón o la casilla
que se elige se mueva y se agrande un poco para que se note.

**Qué se hizo:** `tapFeedback.js` reescrito: al terminar el clic, el elemento
tocado recibe `.tap-pop` (crece hasta 112 % y vuelve con un pequeño rebote,
0,32 s). Si la pantalla se redibujó, se busca el elemento equivalente por su
"firma" (tipo, datos, texto y el grupo donde está, para no confundir el "Sí"
de una opción con el de otra). Se quitó la onda (`.tap-ripple`). Se mantiene
el "hundirse" al presionar. Con "Animaciones: No" no se anima.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; prueba con Edge sin ventana: se anima el "Sí" de "El perdedor
resta" (no el de otra opción), el género Rock y el interruptor Individual; con
"Animaciones: No", animación "none". Compilados `.exe` y `.apk`.

**Qué quedó abierto:** las dos preguntas de la parte 6.

---

## 2026-10-04 — Sesión 6 (parte 8): animación al tocar botones y casillas

**Pedido del usuario:** una pequeña animación al tocar y seleccionar cada
casilla y botón.

**Qué se hizo**
- Nuevo `src/js/tapFeedback.js` (`initTapFeedback`, llamado desde `main.js`):
  al tocar un botón o casilla sale una **onda dorada** desde el punto tocado.
  Se dibuja en `<body>` con posición fija, así que se ve aunque al tocar se
  vuelva a dibujar la pantalla (Sí/No, géneros, interruptor). No sale con
  "Animaciones: No".
- CSS: la onda (`.tap-ripple`) y un "hundirse" al presionar en casillas,
  Sí/No, − +, interruptor, nombres de la ronda, ✕ y botones redondos (los
  `.btn` y `.pressable` conservan su efecto de juguete). `sw.js` v12.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; prueba con Edge sin ventana: la onda aparece tras tocar un "Sí" que
redibuja la pantalla y no aparece con "Animaciones: No". Compilados `.exe` y
`.apk`.

**Qué quedó abierto:** las dos preguntas de la parte 6.

---

## 2026-10-04 — Sesión 6 (parte 7): tarjetas tocables, Alternativo 2 desde Individual y 4 jugadores en Grupal

**Pedidos del usuario:** elegir el modo tocando la tarjeta completa del manual;
empezar a jugar tocando la tarjeta grande del inicio; Grupal con 4 espacios de
jugador de entrada; poder elegir Alternativo 2 estando en Individual (cambia a
Grupal); anotar en pendientes recomendar logos nuevos.

**Qué se hizo**
- `modesManual.js`: la tarjeta de cada modo se elige con un toque ("Ver más"
  no elige); Alternativo 2 en Individual dice "Elegir Alternativo 2 (pasa a
  Grupal)". `menu.js`: al elegirlo cambia a Grupal con un aviso; la tarjeta
  grande lleva a "Configurar partida" (también con Enter o espacio).
- `players.js`: `minPlayerRows` (2 o 4) y `padPlayers`; en Grupal los primeros
  4 espacios no tienen ✕. `config/index.js` completa la lista al entrar.
- CSS: cursor y efecto al tocar en las tarjetas. PENDIENTES: logos nuevos.
  CONTEXTO actualizado. Pruebas nuevas en `test/gameLogic.test.js`.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 111 pasan + 1
pendiente; recorrido con clics (Edge sin ventana): "Ver más" no elige;
tocar la tarjeta de Alternativo 2 en Individual → Grupal + aviso; tocar la
tarjeta grande → configuración con 4 espacios sin ✕. Compilados `.exe` y `.apk`.

**Qué quedó abierto:** las dos preguntas de la parte 6 (relevo de más por ronda
y búsqueda solo por nombre).

---

## 2026-10-04 — Sesión 6 (parte 6): buscador de canciones y nombre del relevo

**Pedidos del usuario**
1. En la ronda, con el comodín, mostrar solo el nombre del que responde (no
   "Carlos por Ana").
2. Poder pasar de Ana–Carlos a Ana–Luis con otro relevo, haya respondido Carlos
   o no (ver lo que quedó abierto).
3. Búsqueda rápida: resultados mientras se escribe, mínimo 3 letras con un
   mensaje, y que "hacer" no muestre canciones que no tienen esa palabra en el
   nombre (ver lo que quedó abierto).
4. Una sola versión por artista ("Color Esperanza" y no también "(en vivo)").
5. Pendiente crítico: cambiar la forma de buscar canciones pensando en el canto.

**Qué se hizo**
- `round.js`: con el comodín se ve solo el nombre del compañero.
- `verify.js`: búsqueda mientras se escribe (sin botón "Buscar"), mínimo 3
  letras (`MIN_SEARCH_LETTERS`) con el mensaje "Escribe al menos 3 letras para
  buscar", y `onePerVersion` / `baseSongTitle` para dejar una versión por
  artista (la original; con artistas distintos quedan las dos). Ayuda "Cómo se
  juega" actualizada. Pruebas nuevas en `test/texto.test.js`.
- PENDIENTES: el pendiente crítico del punto 5.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 110 pasan + 1
pendiente; buscador probado letra por letra en el juego real ("a" y "co" →
mensaje; "col" → Color Esperanza una vez; "hacer" → no encontrada). Compilados
`.exe` y `.apk`.

**Qué quedó abierto:** se le preguntó al usuario: (2) con 1 relevo por ronda,
el 2.º relevo es "de más" y se penaliza; ¿quiere que en su lugar gaste otro del
total? (3) la búsqueda por fragmento de letra existe desde antes; ¿buscar solo
por nombre?

---

## 2026-10-04 — Sesión 6 (parte 5): relevo con 0 en total, como en Alternativo 1

**Pedido del usuario:** poder volver a usar el relevo en Alternativo 2 como en
Alternativo 1, respetando las reglas.

**Qué se encontró:** un recorrido con clics de 4 rondas (13 situaciones:
antes y después de responder Ana, tras fallar el compañero, con el compañero
sin responder, con el total agotado) mostró el botón siempre activo. La
diferencia real con Alternativo 1 era que en Alternativo 2, con **0 en total**
en la ventanita, el relevo desaparecía; en Alternativo 1, sin relevos, se
puede usar igual con penalización.

**Qué se hizo:** `relay.js` ya no devuelve "sin relevo" con 0 en total: el
botón sigue y todos son de más. Fila de configuración: "0 · todos con
penalización"; ronda: "0 · con penalización". Pruebas y CONTEXTO actualizados.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 108 pasan + 1
pendiente; recorrido con 0 en total (botón activo, −50 por cada relevo en una
ronda de 100, la ronda sigue). Compilados `.exe` y `.apk`.

**Qué quedó abierto:** confirmar con el usuario que era esto lo que le pasaba.

---

## 2026-10-04 — Sesión 6 (parte 4): relevo mientras el compañero no responde

**Decisión del usuario (opción a):** en Alternativo 2, si el compañero llamado
todavía no respondió, se puede llamar a otro en su lugar; el primero no gastó
intento y el nuevo relevo cuenta para el máximo por ronda o se penaliza.

**Qué se hizo:** `relay.js` ya no bloquea el botón mientras hay un compañero
llamado (solo sin intentos); la lista de `relayModals.js` no muestra al que ya
está llamado. Pruebas actualizadas. El usuario también preguntó por 5 intentos y
5 relevos por ronda: con una prueba de clics se comprobó que funciona en la
versión actual (en la anterior el máximo por ronda no podía pasar del total).

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 108 pasan + 1
pendiente; recorrido con clics de 5 y 5 (5 relevos, intentos 5 → 0, "Ronda"
5 → 0, total 3 → 2). Compilados `.exe` y `.apk`.

**Qué quedó abierto:** nada de este punto.

---

## 2026-10-04 — Sesión 6 (parte 3): conteo nuevo de relevos

**Decisión del usuario:** el total de relevos cuenta las **rondas** en que se
usan. Con el primer relevo de la ronda se descuenta 1 del total; en esa ronda
se pueden usar los que faltan hasta el máximo por ronda sin descontar más; en
la ronda siguiente el máximo se restaura si quedan en el total (ejemplo: 5 y 3,
usa 2 → queda 4). Alternativo 1 (3 y 1) queda igual que antes. Reportó que en
Alternativo 2 no lo dejaba usar el relevo prohibido.

**Qué se hizo**
- `relay.js`: `relayStatus` devuelve `usesTotal` (solo el primero de la ronda);
  `relaysLeftThisRound`; `maxRelaysPerRound` ahora solo depende de los
  intentos. `gameLogic.useRelay`: los relevos de más no cuentan para el máximo
  por ronda ni para el total.
- Ventanita de relevos: el máximo por ronda va de 1 a los intentos (ya no
  limitado por el total) y una nota explica el conteo. Ronda de Alternativo 2:
  "Ronda: N" con los que quedan en esa ronda.
- Pruebas nuevas con el ejemplo del usuario. CONTEXTO actualizado.
- **Relevo prohibido:** con una prueba de clics del flujo real se vio que sí
  funciona después de que el compañero responde (aviso y −/+ la mitad). Lo que
  lo bloquea es que el botón queda apagado **mientras el compañero llamado
  todavía no responde**; eso fue una suposición, se le preguntó al usuario.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 108 pasan + 1
pendiente; recorrido con clics (Edge sin ventana): 5 → 4 tras dos relevos en la
ronda, sin aviso ni penalización, "Ronda: 1". Compilados `.exe` y `.apk`.

**Qué quedó abierto:** si se puede pedir relevo mientras el compañero llamado
todavía no responde.

---

## 2026-10-04 — Sesión 6 (parte 2): Alternativo 2 programado

**Decisiones del usuario (03-10-2026)**
- Relevos de Alternativo 2 configurables en una ventanita: total 0 a 7 (0 = sin
  relevos) y máximo por ronda (1 hasta el total y los intentos); de entrada 3 y 1.
- Relevo tipo comodín de llamada: el compañero responde y gasta un intento; si
  falla, el turno vuelve al representante. Se puede pedir en cualquier turno.
  Para el MVP, el aporte es de quien cantó.
- Relevo de más (sin relevos o pasado del máximo por ronda), en **Alternativo 1
  y 2**: se permite con aviso; en ese momento el equipo resta la mitad del valor
  de la ronda y el rival suma esa mitad; la ronda sigue. El ganador se declara
  al terminar la ronda. Pasarse del máximo por ronda no gasta del total. En
  Alternativo 1, el 2.º relevo de la misma ronda también se permite así.
- Opciones con "Sí / No" y formato compacto en Android.

**Qué se hizo**
- `config/modes.js`: `ALT2_DEFAULTS`, `alt2Options`, `attemptsPerRound`,
  `scoringRules`, `hasMultiplierChoice`; Alternativo 1 con multiplicadores
  siempre activos. `state.js`: `config.alt2`.
- `scoring.js`: `roundScoreChanges` acepta el modo o sus reglas (el perdedor
  resta / si nadie acierta ambos restan).
- `relay.js` reescrito: `relayRules`, `relayStatus` (bloqueado / normal / de
  más), `maxRelaysPerRound`, penalización de mitad y mitad, `relayUsesTotal`.
- `gameLogic.js`: emparejamiento de Alternativo 2, intentos por lado
  (`attemptsLeft`), comodín (`round.sub`, `currentSinger`), `relayCheck`,
  `useRelay` con penalización en vivo; se quitó `applyRelayPenalty` y
  `hasSingleAttempt`. Si nadie acierta o los dos agotan sus intentos, se
  aplican las reglas del modo.
- Pantallas: ronda (intentos que quedan, "🔁 Carlos por Ana", botón de relevo de
  más en rojo), ventanas del relevo, resultado de la ronda (textos nuevos; gana
  el que más puntos tiene si varios pasan el objetivo), verificación (quién
  canta de verdad).
- `config/index.js` + nuevo `config/alt2Options.js`: filas compactas en los
  tres modos y ventanita de relevos. CSS de filas, "Sí / No", "− N +" y
  jugadores en dos columnas en el teléfono. `sw.js` v11.
- Manual de "Modos de juego" actualizado. Pruebas: nuevas en
  `test/alternativo2.test.js` y actualizadas en clasico, modos, puntos y relevo.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 106 pasan + 1
pendiente. Capturas con Edge sin ventana del juego real: configuración de
Alternativo 1 y 2 en el teléfono, ventanita de relevos, ronda de Alternativo 2
y aviso del relevo de más (ronda ×5: −250 / +250). Compilados `.exe` y `.apk` y
se abrió el juego.

**Qué quedó abierto:** empate exacto al llegar al objetivo por la penalización
(PENDIENTES); botón de ayuda en cada opción; actualizar la ayuda general.

---

## 2026-10-03 — Sesión 6: reglas de Alternativo 2 definidas (sin programar)

**Decisiones del usuario:** resumen de los tres modos y reglas completas de
Alternativo 2 (solo Grupal, opciones elegibles en "Configurar partida");
Alternativo 1 con multiplicadores siempre activos; el valor de la ronda es
siempre 100 × multiplicador y el perdedor resta lo mismo que gana el ganador.
Pidió anotar un botón de ayuda en cada opción.

**Archivos tocados:** solo documentos: `CONTEXTO-MUSICAL-SHOWDOWN.md`
(sección 3, resumen de los modos y reglas de Alternativo 2) y `PENDIENTES.md`
(programar Alternativo 2, multiplicadores fijos en Alternativo 1, botón de
ayuda por opción).

Después eligió la opción a ("No resta" / "Sí, resta lo mismo que gana el
otro") y aprobó los textos de las opciones.

**Qué quedó abierto:** maqueta de las opciones en "Configurar partida" y
programación.

---

## 2026-10-01 — Sesión 5 (parte 11): sin botón de silencio; pendientes ordenados

**Decisión del usuario:** quitar el botón 🔊/🔇 de las pantallas, porque el
sonido ya se controla en Ajustes.

**Qué se hizo**
- Se quitó el botón de Configurar partida, Organizar grupos y la ronda.
- `sound.js`: se eliminó el silencio general (`isMuted`, `setMuted`, botones).
  Si alguien había silenciado con el botón, ese valor guardado ya no se lee,
  para que no quede sin sonido y sin forma de volver a activarlo. Ahora cada
  sonido depende solo de Ajustes.
- INSTRUCCIONES (regla 17) y CONTEXTO actualizados con la decisión.
- PENDIENTES: pasaron a "Resueltos" tres entradas que ya estaban hechas y
  seguían abiertas: "el juego se rompe cuando se acaban las canciones", el
  rediseño crítico y las ideas nuevas de Alternativo 1 (sus preguntas 3 y 4
  quedaron respondidas en 2b y 2c).

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 95 pasan + 1
pendiente; captura de la ronda y la configuración sin el botón. Compilados
`.exe` y `.apk`.

**Qué quedó abierto:** siguiente pendiente propuesto: revisar Clásico y luego
las reglas de Alternativo 2.

---

## 2026-10-01 — Sesión 5 (parte 10): estilo en todas las pantallas y ajustes de sonido

**Decisiones del usuario**
- Aprobó el estilo nuevo en todas las pantallas, después de ver una comparación
  hecha en la carpeta temporal (hoy / nuevo en teléfono / nuevo en PC).
- "Volver al menú" pasa a "Volver al inicio".
- En Ajustes (tuerca) se pueden apagar la música de fondo, los efectos y los
  demás sonidos.
- Anotar en pendientes: sonidos nuevos más profesionales, con una melodía
  parecida a la de los juegos de Nintendo.

**Qué se hizo**
- `styles.css`: colores base del rediseño en `:root` y una sección final con
  letras, botones en píldora con sombra, campos, tarjetas, ventanas, ronda,
  grupos y podio. El borde rojo del nombre repetido se mantiene.
- `settings.js`: preferencias `music`, `effects` y `clock` (Sí por defecto).
  `sound.js`: cada sonido revisa su tipo (`kindOn`) y `refreshMusic()` pausa o
  reanuda la música al cambiar el ajuste. El botón 🔊 sigue silenciando todo.
- `menu.js`: Ajustes con secciones "Pantalla" (Animaciones) y "Sonido"
  (Música de fondo, Efectos de sonido, Sonido del reloj).
- `results.js`: "Volver al inicio". Prueba nueva de los sonidos en
  `test/inicio.test.js`.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 95 pasan + 1
pendiente. Capturas con Edge sin ventana de configuración, grupos, ronda,
pausa, resultados y ajustes (teléfono y PC). Se midió el borde de los campos
repetidos (rojo `rgb(255, 71, 71)`). Compilados `.exe` y `.apk`.

**Qué quedó abierto:** sonidos nuevos (PENDIENTES); en la ronda en PC hay mucho
espacio vacío (diseño anterior, sin cambios).

---

## 2026-10-01 — Sesión 5 (parte 9): nueva pantalla de inicio integrada al juego

**Decisiones del usuario**
- El estilo del inicio queda **finalizado** y se programa en el juego.
- Animaciones: **opción C**. Siempre encendidas, aunque el sistema pida reducir
  el movimiento, con un interruptor en Ajustes. Se descubrió que en la PC del
  usuario Windows tiene apagados los "Efectos de animación" y por eso el
  experimento se veía quieto en su navegador.
- Opción A con su cambio: con Grupal y menos de 4 jugadores se avisa y se queda
  en "Configurar partida".

**Qué se hizo**
- `screens/menu.js` reescrito: encabezado (tuerca → Ajustes, campana →
  Notificaciones sin avisos todavía, "?" → ayuda), escenario con el nombre,
  interruptor Individual | Grupal con "Jugar", "Modos de juego" y "Modo: …"
  debajo. Se quitó la nota "La búsqueda de canciones usa una base local de
  ejemplo…" del menú viejo.
- Nuevos: `screens/modesManual.js` (manual con historietas, "Ver más",
  "Elegir…", `modeAllowed()`), `screens/sheet.js` (hoja con X, afuera o
  Escape), `icons.js` (SVG), `settings.js` (Animaciones Sí/No guardadas en el
  dispositivo, con try/catch). `showToast()` en `modals.js`.
- `index.html`: luces de fondo para todas las pantallas, letras Fredoka y
  Nunito, color de la barra del sistema. `main.js`: `applySettings()` antes del
  primer render.
- `config/index.js` y `players.js`: se quitaron "Tipo de batalla" y "Modo de
  juego"; resumen "👤 Individual · Clásico"; nota en vivo y aviso de Grupal con
  menos de 4 sin cambiar a Individual; botón "← Inicio".
- `styles.css`: colores del rediseño en `:root`, fondo de escenario para todo
  el juego, estilos del inicio, la hoja, el manual y
  `html[data-anim="off"]`. Se quitaron los estilos `.hero` del menú viejo.
- `sw.js`: 4 archivos nuevos en `ASSETS` y caché `v10`. Prueba nueva
  `test/inicio.test.js` (preferencias y modos permitidos).
- Documentos: CONTEXTO (pantalla de inicio y configuración), PENDIENTES.

**Cómo se verificó:** `npm run lint` sin errores; `npm test` 94 pasan + 1
pendiente. Medición en tiempo real del ángulo de las luces (cambian de −28° a
−8° en 6 s). Capturas con Edge sin ventana del juego real en 360 px y
1280 × 800. Compilados `.exe` y `.apk` y se abrió el juego.
- Al verificar con Electron, una ejecución fallida le mostró al usuario un
  diálogo para guardar `electron.exe`. Se le explicó que puede borrarlo. Ya no
  se usa Electron para verificar.

**Qué quedó abierto:** llevar el estilo a las demás pantallas; letras sin
internet; fuente de las notificaciones (ver `PENDIENTES.md`). No se revisaron
con capturas el manual, los ajustes ni la configuración en el juego real
(sí en el experimento); los revisa el usuario en el `.exe`.

---

## 2026-10-01 — Sesión 5 (parte 8): X para cerrar en la pausa y en las ventanas informativas

**Decisión del usuario:** las ventanas emergentes con información llevan una X
para cerrar en la esquina superior derecha (también en el celular). Entre las
ventanas que piden una decisión, **solo la pausa** la lleva; ahí la X equivale
a "Continuar". "¿Acertó?", el relevo y las confirmaciones sí/no no la llevan.

**Qué se hizo**
- `modals.js`: nueva función `addCloseButton()`. Se agregó la X a la pausa
  (reanuda el reloj igual que "Continuar"), a la ayuda "Cómo se juega" y a
  `showWarning()`. La pantalla "¿Salir de la partida?" dentro de la pausa no
  lleva X.
- `styles.css`: clase `.modal-close`, fija arriba a la derecha aunque la
  ventana tenga scroll (la ayuda es larga) y sin ocupar alto.

**Cómo se verificó:** página de prueba con Edge sin ventana (copia de `src/` en
la carpeta temporal): capturas de la pausa, la ayuda con scroll y un aviso; al
presionar la X de la pausa queda 0 ventanas y `paused=false`. `npm run lint`
sin errores, `npm test` 89 pasan + 1 pendiente. Compilados el `.exe` y el
`.apk`.

**Qué quedó abierto:** nada de este punto.

---

## 2026-10-01 — Sesión 5 (parte 7): experimentos de diseño de la pantalla de inicio

**Qué se hizo (todo fuera del proyecto, en `scratchpad/diseno-inicio`)**
- Se mostraron 3 estilos (moderno, show de TV, casual) en teléfono y PC. El
  usuario eligió **casual + luces de show de fondo**.
- Se probaron 4 diseños de Individual/Grupal; el usuario eligió el **D**
  (interruptor + botón "Jugar" grande).
- Se quitaron el logo, la oferta y "Juegos/Paquetes". Se agregó el manual de
  modos con historietas animadas, la elección del modo y el texto "Modo:
  Clásico" debajo del botón. Se agregó el panel de notificaciones de ejemplo.

**Archivos del proyecto tocados:** solo `PENDIENTES.md` (decisiones del
usuario sobre el inicio) y este archivo. El juego (`src/`) no se tocó.

**Cómo se verificó:** capturas con Edge sin ventana en 360 px y 1280 × 800, y
revisión en Brave.

**Qué quedó abierto:** seguir con las demás pantallas del rediseño. (La X de
las ventanas se resolvió en la parte 8.)

---

## 2026-10-01 — Sesión 5 (parte 6): relevo con máximo 3 y canciones repetidas

**Decisiones del usuario**
- El relevo se puede gastar y restaurar con un **máximo estricto de 3** por
  partida (antes se había acordado "sin máximo"). El aviso del 4.º relevo debe
  decir exactamente a qué se someten antes de confirmar.
- Confirmó los dos detalles del relevo: el aviso antes de la penalización y la
  pausa mientras está abierto el "±".
- **Las canciones ya no se bloquean:** se puede volver a cantar una canción ya
  dicha. Se le señaló que no existe una regla de "palabra no repetida" en el
  código; decidió **dejarlo como está** (las palabras pueden repetirse).

**Qué se hizo**
1. `relay.js`: `adjustRelays` limita a 0–3. `relayModals.js`: el "+" se apaga
   en 3 y la ventana dice el máximo. El aviso del 4.º relevo ("🚫 Ya usaron sus
   3 relevos") muestra los puntos exactos de esa ronda (con ×2: −100 para ellos y
   +200 para el otro). Commit `3d92669`, subido a GitHub.
2. Canciones repetidas:
   - `gameLogic.js`: se eliminaron `songKey`, `isSongUsed` y el bloqueo al
     acertar; la palabra se elige entre todas las canciones de los géneros.
   - `verify.js`: sin "(ya utilizada)"; cualquier canción se puede elegir.
   - `state.js` y `results.js`: se quitó `usedSongs`.
   - Con esto desaparece el error de "se acaban las canciones".
3. Pruebas:
   - `test/seleccion.test.js`: las dos pruebas del bloqueo se reemplazaron por
     una que comprueba que siempre se pueden pedir todas las palabras de los
     géneros elegidos.
   - `test/gameLogic.test.js`: se quitó la prueba de `songKey`.
   - `test/relevo.test.js`: el límite 0–3.
4. Documentación: contexto (regla de canciones repetidas y máximo de relevos),
   la guía técnica y pendientes.

**Archivos tocados:** `src/js/relay.js`, `src/js/screens/relayModals.js`,
`src/js/gameLogic.js`, `src/js/screens/verify.js`, `src/js/screens/results.js`,
`src/js/state.js`, `test/relevo.test.js`, `test/seleccion.test.js`,
`test/gameLogic.test.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`, la guía técnica,
`PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 89 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge:
  - El "±" no pasa de 3 y el aviso del 4.º relevo muestra −100 / +200 con ×2.
  - 12 rondas seguidas acertando con Pop (4 canciones) sin romperse, y
    "Color Esperanza" se puede elegir otra vez en la ronda 12.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** Alternativo 2; diseño general (crítico, el siguiente);
ayuda "Cómo se juega".

---

## 2026-10-01 — Sesión 5 (parte 5): relevo (paquete de Alternativo 1 completo)

**Respuestas del usuario:** para cuando se acaban las canciones prefiere
liberarlas solo cuando se acaben, pero pidió otras recomendaciones antes de
decidir (queda en pendientes). Confirmó los puestos con empate 1, 2, 2, 3 y que
"Ver más" no aparece si todos están en el podio. Subido a GitHub `51ee95c`.

**Qué se hizo (parte 4)**
1. Nuevo `src/js/relay.js` (funciones puras): `hasRelay` (solo Alternativo 1
   Grupal), `adjustRelays` (sin máximo, mínimo 0), `canRequestRelay` (sin
   relevo usado en la ronda y antes de responder) y `relayPenaltyChanges`
   (−la mitad y +el valor completo).
2. `pairing.js`: `applyRelayToMemory`. Con relevo cuenta el que entró: el que
   pidió no cuenta como que cantó, y la pareja vista pasa a ser la del que entró
   con el rival.
3. `gameLogic.js`:
   - Cada equipo empieza con 3 relevos (`state.relays`).
   - `useRelay(lado, compañero)` cambia quién canta y gasta un relevo.
   - `applyRelayPenalty(lado)` termina la ronda con la penalización.
   - La ronda guarda `attempted` y `relayUsed`.
   - `applyScoreChanges` reúne la suma de puntos y la anotación del MVP.
4. Nuevo `screens/relayModals.js`:
   - Ventana para elegir al compañero: pausa sola y "Confirmar relevo" queda
     apagado hasta elegir.
   - Aviso antes de la penalización si no quedan relevos.
   - Ventana "±" para agregar o quitar relevos, con confirmación.
5. `round.js`: debajo de cada equipo, 3 símbolos 🔁 (encendidos según los
   relevos que quedan, y "+N" si son más de 3), el botón "Relevo" y "±".
   `roundResult.js`: pantalla "🚫 Relevo sin intentos".
6. `styles.css`: estilos `.relay-*`. `sw.js`: `relay.js` y `relayModals.js`,
   y `CACHE_NAME` pasa a v9.
7. Nuevo `test/relevo.test.js` con 5 pruebas, incluido el ejemplo del usuario:
   Ana releva a María → María vs Carlos.

**Decisiones tomadas sin definición explícita** (a confirmar, en pendientes):
- Antes de aplicar la penalización aparece un aviso para confirmar.
- La ventana "±" también pausa la ronda.

**Archivos tocados:** `src/js/relay.js` (nuevo),
`src/js/screens/relayModals.js` (nuevo), `src/js/pairing.js`,
`src/js/gameLogic.js`, `src/js/state.js`, `src/js/screens/round.js`,
`src/js/screens/roundResult.js`, `src/css/styles.css`, `src/sw.js`,
`test/relevo.test.js` (nuevo), `CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 91 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: 15 de 15.
  - Símbolos y botones visibles. El relevo pausa, lista sin el que pidió,
    confirma y cambia quién canta. Quedan 2. El que pidió no cuenta como que
    cantó y el que entró sí.
  - No se puede pedir un segundo relevo en la ronda, pero el otro equipo sí.
    El acierto se le anota al que entró.
  - "±" agrega y no baja de 0. La penalización suma y resta bien, con aviso.
  - Clásico no tiene relevo.
- Capturas de la ronda y de la ventana del relevo revisadas. Una primera captura
  de la ventana no salió porque la prueba la abrió antes de que terminara la
  presentación de la ronda; en el juego real el botón solo se activa después.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** confirmar los dos detalles; el error de las canciones;
Alternativo 2; diseño general (crítico); actualizar la ayuda "Cómo se juega".

---

## 2026-10-01 — Sesión 5 (parte 4): podio y MVP

**El usuario confirmó** los 30 seg al pasar de "Sin tiempo" a Alternativo 1.
Subido a GitHub `4011e7b`.

**Qué se hizo (parte 3 del paquete de Alternativo 1)**
1. Nuevo `src/js/podium.js` (funciones puras):
   - `ranking`: los empatados comparten el puesto (1, 2, 2, 3).
   - `buildPodium`: los 3 primeros puestos, y el resto para "Ver más".
   - `pickMvp`: el que más puntos aportó; si empatan, el más rápido en
     promedio; si siguen empatados, todos.
2. Datos para el MVP:
   - `startTimer` ahora siempre corre y cuenta `round.elapsed` (segundos sin
     pausas); la cuenta regresiva sigue solo en los modos con tiempo.
   - `openVerification` guarda en qué segundo se tocó cada lado.
   - `applyRoundScores` le anota a quien cantó el cambio de puntos de su grupo
     (`state.contrib`).
   - Al acertar se guarda el segundo de la respuesta (`state.answerTimes`).
   - Todo se reinicia con `resetMatchTracking`.
3. `screens/results.js` reescrito: ganador, podio con medallas y bloques de
   distinta altura, MVP en Grupal, puntos negativos en rojo, y "Ver más" solo
   si queda gente fuera del podio.
4. `styles.css`: estilos `.podium*` y `.others-row`. `sw.js`: se agrega
   `podium.js` y `CACHE_NAME` pasa a v8.
5. Nuevo `test/podio.test.js` con 7 pruebas: empates, 2 participantes, el
   ejemplo de MVP con ×5 y el desempate por velocidad.

**Error encontrado (sin corregir, anotado como 🔴):** cuando se acaban las
canciones de los géneros elegidos, el juego se rompe porque no hay palabra.
Con Pop pasa después de 4 aciertos. Falta que el usuario decida qué debe pasar.

**Archivos tocados:** `src/js/podium.js` (nuevo), `src/js/gameLogic.js`,
`src/js/state.js`, `src/js/screens/round.js`, `src/js/screens/results.js`,
`src/css/styles.css`, `src/sw.js`, `test/podio.test.js` (nuevo),
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 86 pasan y 1 pendiente. `npm run lint`: sin errores.
- Partidas completas en Edge: 9 de 9.
  - Grupal, Alternativo 1, 3 equipos: termina al llegar al objetivo; podio con
    3 puestos y 3 MVP; cada MVP es el que más aportó; lo aportado por los
    jugadores suma exactamente el puntaje del equipo; sin "Ver más".
  - Individual, Clásico, 5 jugadores: podio sin MVP; "Ver más" muestra al
    resto con su puesto.
  - Para poder jugar partidas largas, la página de prueba libera las canciones
    usadas (ver el error de arriba).
- Capturas de los dos podios revisadas.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** el error de las canciones; confirmar la numeración con
empates; parte 4 (relevo); diseño general (crítico).

---

## 2026-10-01 — Sesión 5 (parte 3): puntos de Alternativo 1

**Ajustes pedidos por el usuario:**
- Dejar **vacío** el espacio del tiempo en Clásico: se quitó la nota y el campo
  no se muestra.
- Pendiente **crítico** nuevo: experimentar con un diseño general nuevo de la
  app (preguntar primero qué busca y proponer maquetas).
- No entendió la pregunta de los 30 seg al pasar de "Sin tiempo" a Alternativo
  1: se le vuelve a explicar con un ejemplo (queda por confirmar).
- Subido a GitHub `54144fc`.

**Qué se hizo (parte 2 del paquete de Alternativo 1)**
1. Nuevo `src/js/scoring.js` (funciones puras):
   - `roundValue`: 100 × multiplicador.
   - `roundScoreChanges(mode, ganador, multiplicador)`: en Alternativo 1, el
     que acierta suma el valor y el que pierde lo resta; si nadie acierta, los
     dos restan la mitad. En Clásico y en Alternativo 2, el que acierta suma y
     nadie resta.
   - `formatPoints` ("−200") y `formatDelta` ("+200", "−150", "±0").
2. `gameLogic.js`: nueva `applyRoundScores()`, usada al acertar, al acabarse
   el tiempo, con "Finalizar ronda" y cuando los dos fallan. Guarda en
   `lastResult.changes` el cambio de cada lado. Al acertar ahora se detiene el
   reloj (antes quedaba corriendo en pausa).
3. `roundResult.js`: muestra una línea por lado ("Carlos 0 → −200 −200"), y si
   se acaba el tiempo explica que los dos restan la mitad.
4. Puntajes negativos en **rojo con brillo** (`.score-negative`) en la ronda,
   en el resultado y en la lista final. La barra de progreso no baja de 0.
5. `sw.js`: se agrega `scoring.js` y `CACHE_NAME` pasa a v7.
6. Nuevo `test/puntos.test.js` con 6 pruebas, incluido el ejemplo del usuario:
   objetivo 500; María 250 y Carlos 400; Carlos gana → 500, María 150.

**Archivos tocados:** `src/js/scoring.js` (nuevo), `src/js/gameLogic.js`,
`src/js/screens/roundResult.js`, `src/js/screens/round.js`,
`src/js/screens/results.js`, `src/js/screens/config/index.js`,
`src/css/styles.css`, `src/sw.js`, `test/puntos.test.js` (nuevo),
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 79 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: 6 de 6.
  - Alternativo 1 ×2: +200 y −200, con la línea negativa en rojo; en la ronda,
    "−200 pts" en rojo.
  - Fin por tiempo con el reloj real y ×3: los dos restan 150, con el aviso.
  - Clásico: +100 y el otro no resta.
- Capturas del resultado y de la ronda revisadas. Una primera versión de la
  página de prueba quedó rota por una edición automática y se reescribió.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** confirmar los 30 seg; partes 3 (podio y MVP) y 4 (relevo);
diseño general (crítico).

---

## 2026-10-01 — Sesión 5 (parte 2): configuración por modo

**Contexto:** el usuario terminó de definir Alternativo 1:
- Puntos: el ganador suma, el perdedor resta, y si nadie acierta los dos
  restan la mitad.
- Fin de la partida al llegar al objetivo, con podio y MVP.
- Multiplicadores solo en Alternativo 1, con el diseño B, elegido tras una
  maqueta con 3 opciones.
- Clásico sin reloj.
Todo quedó en pendientes, guardado en commits a medida que respondía. Se
acordó programarlo en 4 partes; esta es la 1.

**Qué se hizo**
1. `screens/config/modes.js`: nuevas reglas por modo, `usesRoundTime`,
   `allowsNoTime`, `usesMultipliers`, `effectiveRoundTime`,
   `effectiveMultipliers` y `DEFAULT_ROUND_TIME` (30).
2. `screens/config/index.js`:
   - **Clásico:** no muestra la lista de tiempo; en su lugar, una nota
     explica que no hay reloj. Tampoco muestra multiplicadores.
   - **Alternativo 1:** lista de tiempo sin "Sin tiempo" y el nuevo selector
     "✨ Con multiplicadores | Sin multiplicadores" (`.segmented`).
   - Al cambiar de modo se vuelve a dibujar la pantalla; si el modo no permite
     "Sin tiempo" y estaba elegido, queda en 30 seg (también al confirmar).
3. `gameLogic.js` y `round.js`: la ronda usa `effectiveRoundTime` y
   `effectiveMultipliers`. Clásico juega sin reloj (con "Finalizar ronda") y
   sin multiplicadores aunque la configuración guarde otros valores.
4. `styles.css`: se quitó el interruptor viejo (`.switch*`) y se agregó
   `.segmented`.
5. Nuevo `test/modos.test.js` con 3 pruebas.
6. Contexto (configuración) e instrucción 20 actualizados: multiplicadores
   solo en Alternativo 1, con el selector B; Clásico sin reloj.

**Archivos tocados:** `src/js/screens/config/modes.js`,
`src/js/screens/config/index.js`, `src/js/gameLogic.js`, `src/js/screens/round.js`,
`src/css/styles.css`, `test/modos.test.js` (nuevo),
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`,
`PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 73 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: 11 de 11.
  - Clásico: sin lista de tiempo ni multiplicadores; en 40 rondas, ningún
    multiplicador; la ronda dice "Sin tiempo" y tiene "Finalizar ronda".
  - Alternativo 1: lista sin "Sin tiempo"; el selector cambia los
    multiplicadores y la nota; de "Sin tiempo" pasa a 30 seg; en 40 rondas
    salieron multiplicadores en 23; reloj de 30s.
- Capturas de la configuración en los dos modos revisadas.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** confirmar los 30 seg y la nota de Clásico; partes 2 (puntos),
3 (podio) y 4 (relevo).

---

## 2026-09-30 — Sesión 5: reglas del relevo e intento único en Clásico

**Decisiones del usuario** (en varias rondas de preguntas):
- **Relevo**, solo para Alternativo 1 Grupal: comodín de 3 por equipo por
  partida, 1 por ronda, se pide antes de responder, pausa sola, se elige al
  compañero en una lista y se confirma; el que entra canta y sigue intentando;
  penalización si lo usan sin tener; símbolos de relevos y un botón para
  agregar o quitar; puntos negativos en rojo. Todo quedó en el contexto
  (modos de juego).
- Se le señaló una **contradicción**: "un solo intento para todos" frente a
  "Alternativo 1 sin límite". Resolución: **un solo intento solo en Clásico**
  (Individual y Grupal); en Alternativo 1, intentos ilimitados.
- Pendiente nuevo: revisar y modificar Clásico, empezando por un resumen.

**Qué se hizo**
1. Documentación: contexto (intentos por ronda y relevo) y pendientes. Se
   guardaron las respuestas en commits apenas se dieron, para no perderlas si
   la sesión se cortaba. Subidos a GitHub los 5 commits de documentación.
2. **Intento único en Clásico**:
   - `gameLogic.js`: nueva `hasSingleAttempt(mode)` (true solo en "clasico").
     `resolveAnswer(false)` marca `round.failed[lado]`; si fallan los dos,
     detiene el reloj y termina con `both-failed`.
   - `round.js`: el lado que ya falló queda apagado con "Ya usó su intento".
   - `roundResult.js`: en Clásico, el aviso dice quién ya usó su intento y
     quién puede intentarlo; nueva pantalla "❌ Nadie acertó · +0 puntos".
   - `styles.css`: `.attempt-used` y `.attempt-badge`.
   - Alternativo 2, sin reglas propias, queda sin límite (se le preguntará al
     usuario al definirlo).

**Archivos tocados:** `src/js/gameLogic.js`, `src/js/screens/round.js`,
`src/js/screens/roundResult.js`, `src/css/styles.css`, `test/clasico.test.js`,
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 70 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: 6 de 6.
  - Clásico: al fallar uno, aviso correcto y su botón queda apagado; si fallan
    los dos, "Nadie acertó" sin cambiar los puntos; en la ronda siguiente
    vuelven a tener su intento.
  - Alternativo 1: se puede fallar varias veces sin bloqueo.
  - Captura revisada; una primera captura salió oscura por estar a mitad de la
    animación de entrada, y se comprobó que no quedaba nada encima.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** programar el relevo; definir los puntos y el tiempo de
Alternativo 1; Alternativo 2; revisar Clásico.

---

## 2026-09-29 — Sesión 4 (parte 5): decisiones sobre Alternativo 1 y 2 (sin código)

**Decisiones del usuario:**
- **Alternativo 2** será una combinación llamativa de Alternativo 1 y Clásico.
- **Opción A:** las ideas nuevas que le interesaron (cambiar la forma de jugar,
  los puntos, el tiempo o el fin de la partida, y el relevo) se agregan a
  **Alternativo 1**; Alternativo 2 combina ese Alternativo 1 nuevo con Clásico.
- El **relevo** es **solo para Alternativo 1 Grupal**.
- Pidió ir con calma, paso a paso y a fondo, definiendo cada idea antes de
  programarla.
- Pendientes nuevos:
  - Navegar la lista de jugadores con las flechas y confirmar con Enter.
  - Que "Salir de la partida" vuelva a "Configurar partida".
  - Actualizar la ayuda "Cómo se juega".

**Qué se hizo:** solo documentación.
- `CONTEXTO-MUSICAL-SHOWDOWN.md` (modos de juego): las decisiones de arriba.
- `PENDIENTES.md`: los pendientes nuevos, las preguntas pendientes sobre el
  relevo, los puntos y el tiempo, y las opciones para combinar en
  Alternativo 2.
- Subido a GitHub `5d9b820`; su compilación (run 36634050758) terminó bien.

**Archivos tocados:** `CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md`.

**Quedó abierto:** que el usuario defina el relevo, los puntos y el tiempo de
Alternativo 1, y la combinación de Alternativo 2.

---

## 2026-09-29 — Sesión 4 (parte 4): repeticiones en Clásico, por vuelta

**Decisión del usuario:** opción b. En la regla "no se repite el mismo duelo dos
veces seguidas, salvo que ya se hayan enfrentado con todos los demás", el
"con todos" se cuenta **por vuelta**.

**Qué se hizo**
- `pairing.js`: `recordClassicDuel(memory, a, b, participants)` reinicia
  `memory.faced` cuando todos se enfrentaron con todos (nueva vuelta).
  `gameLogic.js` le pasa los participantes.
- `test/clasico.test.js`: la prueba de la excepción se reescribió y hay 2
  nuevas: la cuenta se reinicia al completar la vuelta, y 20 partidas de 60
  duelos con 4 equipos sin ninguna repetición seguida.
- Subido a GitHub `1296e14`.

**Archivos tocados:** `src/js/pairing.js`, `src/js/gameLogic.js`,
`test/clasico.test.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 69 pasan y 1 pendiente, también en 3 corridas seguidas de
  `clasico.test.js`. `npm run lint`: sin errores.
- Partida de 60 duelos en Edge, repetida 3 veces: sin repeticiones seguidas en
  Individual (6 jugadores) ni en Grupal (4 equipos), y las demás
  comprobaciones siguen en OK.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** reglas de Alternativo 2 y los demás pendientes.

---

## 2026-09-29 — Sesión 4 (parte 3): Clásico (parte 3 del plan; plan completo)

**Qué se hizo:** se programó **Clásico**, Individual y Grupal, según las reglas
del usuario (contexto, sección 3).
1. `pairing.js`:
   - `newClassicMemory`.
   - `isBalanced`: todos con el 60 % del promedio o más; promedio 0 cuenta como
     equilibrio.
   - `nextClassicMode`: 3 al azar; con desequilibrio, 3 con ventaja ↔ 3 al
     azar; con equilibrio se corta y queda al azar; al volver el
     desequilibrio, ventaja de inmediato.
   - `pickClassicPair`:
     - Equilibrio de partidos: los dos salen de los que menos duelos llevan
       (el rival, del siguiente nivel si hace falta).
     - Ventaja: uno por debajo del promedio, ponderado por la distancia; el
       rival, al azar entre los que están en el promedio o por encima.
     - Evita repetir el duelo anterior solo si hay otro rival con los mismos
       duelos, porque el equilibrio de partidos manda.
   - `recordClassicDuel`.
2. `gameLogic.js`: nueva `pickClassicDuel()`, usada en Individual (jugadores) y
   en Grupal (grupos) para Clásico, y por ahora para Alternativo 2. El
   representante sigue saliendo con `pickRepresentative`.
   - Se eliminó `pickIndividualPair` (sorteo ponderado viejo) y, de
     `groups.js`, la regla temporal `pickGroupPairTemporary`, con sus pruebas.
   - `resetMatchTracking` reinicia también `state.classic`.
3. Nuevo `test/clasico.test.js` con 10 pruebas.
4. Subido a GitHub `4e8e120`; su compilación (run 36631506624) terminó bien.

**Hallazgo (anotado para confirmar):** la excepción de la regla "salvo que ya se
hayan enfrentado con todos los demás", aplicada literalmente, permite repetir
duelos seguidos para siempre una vez que todos se cruzaron. Con 4 equipos se vio
en la prueba.

**Archivos tocados:** `src/js/pairing.js`, `src/js/gameLogic.js`,
`src/js/groups.js`, `src/js/state.js`, `test/clasico.test.js` (nuevo),
`test/grupos.test.js`, `test/seleccion.test.js`, la guía técnica,
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 67 pasan y 1 pendiente, también en 3 corridas seguidas de
  `clasico.test.js`. `npm run lint`: sin errores.
- Jugando 60 duelos en Edge con puntos al azar:
  - Individual con 6 jugadores: equilibrio de partidos (20/20/21/20/20/21), sin
    repeticiones seguidas, las fases inicio → ventaja → azar → libre.
  - Grupal con 4 equipos: equilibrio de partidos (30/31/31/30) y todos cantan
    parejo dentro de cada equipo. Hubo repeticiones seguidas, permitidas por la
    excepción de la regla (ver hallazgo).
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** confirmar la excepción de las repeticiones; reglas de
Alternativo 2.

---

## 2026-09-29 — Sesión 4 (parte 2): Alternativo 1 (parte 2 del plan)

**Qué se hizo:** se programó **Alternativo 1**, Individual y Grupal, tal como
lo definió el usuario (contexto, sección 3).
1. Nuevo `src/js/pairing.js` (funciones puras):
   - `roundRobinRounds` y `roundRobinSequence`: todos contra todos "primero
     contra último". El primero queda fijo y los demás rotan; con cantidad
     impar descansa el del medio en la tanda 1 y uno distinto en cada tanda.
   - `groupOrderSequence`: 2 grupos → G1vG2; 3 → G1vG3, G1vG2, G2vG3; 4 o más →
     rotación.
   - `pickGroupDuelPlayers` con `newGroupMemory`: dentro de cada grupo se
     turnan en orden (el que menos jugó) y el rival es el siguiente del otro
     grupo con quien aún no se enfrentó. Al completarse todas las parejas, el
     ciclo se reinicia.
2. `gameLogic.js`: con el modo `alternativo1`, `startNextRound` sigue el orden
   (avanza `state.alt1.step` y usa el módulo del ítem 1; el ciclo se repite).
   Clásico sigue igual hasta la parte 3. Nueva `resetMatchTracking()`, que
   reemplaza los reinicios que estaban repetidos en `config/index.js`,
   `teamOrg.js` y `results.js`.
3. `state.js`: nuevo `alt1: { step, memory }`. `sw.js`: se agrega `pairing.js`
   y `CACHE_NAME` pasa a v6.
4. Nuevo `test/alternativo1.test.js` con 7 pruebas, comparadas con los ejemplos
   del usuario: 1v10…5v6 y 1v9, 10v8…; con 9 descansa el 5; A–G, B–D, E–H,
   C–I, A–F, D–J, B–G, C–E, F–H, A–I; las 33 parejas en el duelo 45.
5. Subidos a GitHub `3c346f6` y `9aa565b`; su compilación (run 36630262440)
   terminó bien.

**Archivos tocados:** `src/js/pairing.js` (nuevo), `src/js/gameLogic.js`,
`src/js/state.js`, `src/js/screens/config/index.js`, `src/js/screens/teamOrg.js`,
`src/js/screens/results.js`, `src/sw.js`, `test/alternativo1.test.js` (nuevo),
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 62 pasan y 1 pendiente. `npm run lint`: sin errores.
- Jugando rondas en Edge sin ventana (con "Siguiente enfrentamiento"): 9 de 9.
  - Individual con 10: Ana-Juan, Beto-Ines, Caro-Hugo, Dani-Gabi, Eva-Fito,
    Ana-Ines, Juan-Hugo. En 45 duelos cada uno juega 9 veces y luego el ciclo
    vuelve a Ana-Juan.
  - Grupal con 3 equipos: G1vG3, G1vG2, G2vG3 repetido; los jugadores salen en
    orden; nunca dos del mismo equipo.
  - Clásico sigue funcionando.
- Capturas de ambas rondas revisadas. `build:apk` y `build:desktop`: ambos bien.
  Se abrió el `.exe` para el usuario.

**Quedó abierto:** parte 3 (Clásico), que reemplaza la regla temporal de grupos
y el sorteo ponderado de Individual.

---

## 2026-09-29 — Sesión 4: verificación de mover e intercambiar jugadores

**Estado encontrado al empezar:** el commit `3c346f6` (mover e intercambiar)
estaba solo en la PC y sin verificar, porque la sesión anterior se cortó por el
límite de uso. La compilación en GitHub de `75626f1` había terminado bien.

**Qué se hizo:** se terminó la verificación pendiente del cambio de la parte 15.
- En Edge sin ventana, con 7 jugadores en 3 equipos (2/2/3): 12 de 12
  comprobaciones. Tocar dos jugadores de equipos distintos los intercambia,
  también entre equipos de distinto tamaño. Tocar el equipo mueve sin
  intercambiar y luego no queda nadie elegido. No deja un equipo con menos de
  2 y avisa "Cada equipo necesita al menos 2 jugadores". Tocar un equipo sin
  nadie elegido, o el mismo equipo del elegido, no hace nada. Tocar el título
  edita el nombre sin mover a nadie. Tocar dos veces a un jugador lo desmarca.
  El texto de ayuda explica las dos formas.
- Captura revisada. `npm test`: 55/55. `build:apk` y `build:desktop`: ambos
  bien. Se abrió el `.exe` para el usuario.
- `CONTEXTO-MUSICAL-SHOWDOWN.md`: la regla de mover jugadores quedó con lo que
  definió el usuario.

**Archivos tocados:** `CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md` (el código ya estaba en `3c346f6`).

**Quedó abierto:** subir los commits a GitHub; partes 2 (Alternativo 1) y 3
(Clásico) del plan.

---

## 2026-09-28 — Sesión 3 (parte 15): mover e intercambiar jugadores (sin verificar)

**Pedido del usuario:** intercambiar solo si se tocan dos jugadores de grupos
distintos; para mover sin intercambiar, tocar el jugador y luego el grupo
(fuera de los nombres).

**Qué se hizo:** `teamOrg.js` separa `swapPlayers` (jugador + jugador de otro
grupo) y `movePlayer` (jugador + tarjeta del grupo; exige que el grupo de origen
quede con 2 o más). El texto de ayuda de la pantalla quedó actualizado. Subidos a GitHub
`1151d5b` y `75626f1`.

**Verificación:** `npm test` 55/55 y `npm run lint` sin errores. **No** se probó
en Edge, **no** se compiló el `.exe`/`.apk` ni se abrió el juego: se alcanzó
el límite de uso de la sesión (ver pendientes).

---

## 2026-09-28 — Sesión 3 (parte 14): reinicio al cambiar la cantidad y colores de grupo en la ronda

**Decisiones del usuario:**
1. Al cambiar la cantidad de grupos se reinicia todo: nuevo reparto al azar y
   nombres predeterminados, manteniendo "Equipos"/"Grupos". Reemplaza lo que se
   había decidido provisionalmente (conservar los nombres).
2. No entendió la pregunta sobre cómo mover jugadores entre grupos del mismo
   tamaño: se le vuelve a explicar con un ejemplo (sigue en pendientes).
3. Sí a usar el color de cada grupo en la ronda.

**Qué se hizo**
- `teamOrg.js`: el cambio de cantidad reparte con `distributeRandom`, sin
  conservar los nombres.
- `styles.css`: los colores de grupo pasan a variables (`--group-color`,
  `--group-soft`, `--group-light`) en las clases `.group-color-N`, que usan
  las tarjetas de "Organizar" y los lados de la ronda (borde y barra de
  progreso).
- `gameLogic.js` / `state.js`: la ronda guarda `groupA` y `groupB` (posición del
  grupo). `round.js` agrega la clase de color a cada lado en Grupal. En
  Individual todo sigue igual (rosa y verde).

**Archivos tocados:** `src/js/screens/teamOrg.js`, `src/css/styles.css`,
`src/js/gameLogic.js`, `src/js/state.js`, `src/js/screens/round.js`,
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 55 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: 5 de 5 (cambiar de 4 a 3 grupos quita los nombres editados, sigue
  elegido "Grupos", se reparte de nuevo en 3/3/4, los lados usan la clase de
  color de su grupo). Capturas de la ronda: el equipo 3 en dorado y el 4 en
  azul; el 1 y el 2 en rosa y verde.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** confirmar cómo mover jugadores entre grupos del mismo
tamaño; partes 2 y 3 del plan.

---

## 2026-09-28 — Sesión 3 (parte 13): grupos múltiples (parte 1 del plan)

**Decisión del usuario:** hacer la parte 1 sola, con una **regla temporal** para
elegir qué grupos se enfrentan, que se reemplaza en las partes 2 y 3.

**Qué se hizo**
1. Nuevo `src/js/groups.js` (funciones puras):
   - `groupCountOptions` y `maxGroups`: de 2 a la mitad de los jugadores.
   - `groupSizes` y `distributeRandom`: reparto parejo al azar, con los que
     sobran en los últimos grupos.
   - `defaultGroupName` y `groupName`: "Equipo N"/"Grupo N" o el nombre editado.
   - `pickGroupPairTemporary`: **REGLA TEMPORAL**, al azar con equilibrio de
     partidos.
   - `pickRepresentative`: al azar entre los que menos han cantado; es la
     regla definitiva de Clásico Grupal.
2. `state.js`:
   - `teams: {a, b}` → `groups: [{ players, customName }]`.
   - Nuevos `config.groupCount` (2) y `config.groupTerm` ("equipo").
   - Nuevos contadores `matchCounts` (duelos jugados) y `singCounts` (veces que
     cantó cada jugador).
   - **Corrección:** `multipliers` empezaba en `[2, 3]`; ahora `[2, 3, 4, 5]`,
     como pide la instrucción 20.
3. `gameLogic.js`: en Grupal, los grupos se eligen con la regla temporal y
   quién canta con `pickRepresentative`; se cuentan los duelos. Se eliminó
   `rotateTeamShown`.
4. `screens/teamOrg.js` reescrito:
   - Listas "Cantidad de equipos" (con el mínimo y el máximo indicados) y "Se
     llaman" (Equipos/Grupos; cambiarla devuelve los nombres a los
     predeterminados).
   - Una tarjeta por grupo, con su color.
   - Nombre editable tocando el título (máximo 20 letras, primera letra de cada
     palabra en mayúscula, vacío = predeterminado). Los repetidos se subrayan
     en rojo con un mensaje, y no deja confirmar.
   - Mover jugadores entre cualquier par de grupos.
   - "Confirmar" crea los puntos con los nombres finales.
5. `config/index.js`: el reparto inicial se hace con `distributeRandom`, y se
   reinician los contadores. `results.js` también los reinicia en "Jugar de
   nuevo".
6. `styles.css`: grilla adaptable, 5 colores de grupo, título editable y el
   error. `sw.js`: se agrega `groups.js` y `CACHE_NAME` pasa a v5.
7. Nuevo `test/grupos.test.js` con 7 pruebas.
8. Subido a GitHub `5c4a888`; su compilación (run 36517272722) terminó bien.

**Decisiones tomadas sin definición del usuario** (anotadas como "confirmar" en
pendientes): al cambiar la cantidad de grupos, los que siguen existiendo
conservan su nombre; al mover entre grupos del mismo tamaño, se intercambian
los dos jugadores tocados.

**Archivos tocados:** `src/js/groups.js` (nuevo), `src/js/state.js`,
`src/js/gameLogic.js`, `src/js/screens/teamOrg.js`, `src/js/screens/config/index.js`,
`src/js/screens/results.js`, `src/css/styles.css`, `src/sw.js`,
`test/grupos.test.js` (nuevo), `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 55 pasan y 1 pendiente. `npm run lint`: sin errores.
- Recorrido completo en Edge sin ventana, con 10 jugadores: 20 de 20
  comprobaciones (cantidad de 2 a 5 con su aviso, 3 grupos de 3/3/4, nadie se
  pierde, renombrar, repetido en rojo que bloquea, vacío vuelve al
  predeterminado, "Grupos" reinicia los nombres, mover e intercambiar, puntos
  con los nombres finales, ronda entre dos grupos distintos con un jugador de
  cada uno). Capturas de "Organizar equipos" y de la ronda revisadas.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** las partes 2 (Alternativo 1) y 3 (Clásico), que reemplazan
la regla temporal; las 2 confirmaciones y la sugerencia de color en pendientes.

---

## 2026-09-28 — Sesión 3 (parte 12): nombres repetidos no permitidos

**Decisión del usuario:** no permitir nombres repetidos, ni de jugadores ni de
grupos. El campo repetido se marca en rojo, aparece un mensaje de error antes
del botón "Añadir jugador" y no deja continuar hasta cambiarlo. Máximo 20 letras
por nombre (jugadores y grupos).

**Qué se hizo**
- `players.js`: `MAX_NAME_LENGTH = 20` (atributo `maxlength` en los campos),
  `cleanName()` (quita espacios sobrantes) y `duplicateNameIndexes()` (posiciones
  de los nombres repetidos, sin contar los vacíos). Al escribir, borrar o
  agregar un jugador, los repetidos se marcan con `.input-error` y se muestra
  `#players-error`.
- `config/index.js`: el mensaje va entre la lista y "Añadir jugador".
  "Confirmar configuración" no avanza mientras haya repetidos (lleva la vista
  al mensaje); los nombres se guardan limpios con `cleanName`.
- `styles.css`: `.input-error` y `.field-error`.
- 2 pruebas nuevas en `test/gameLogic.test.js`.
- Subido a GitHub `56da846`; su compilación (run 36516440412) terminó bien.

**Archivos tocados:** `src/js/screens/config/players.js`,
`src/js/screens/config/index.js`, `src/css/styles.css`, `test/gameLogic.test.js`,
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 48 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: 7 de 7 (máximo 20 letras; "ana" y "ANA" en rojo y "Beto" no; mensaje
  antes de "Añadir jugador"; no deja confirmar; al corregir desaparece el
  error; la partida empieza con los 3 jugadores). Captura revisada.
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** parte 1 del plan (grupos múltiples).

---

## 2026-09-28 — Sesión 3 (parte 11): formato de nombres y detalles de grupos

**Respuestas del usuario sobre los grupos** (guardadas en el contexto,
"Organización de grupos"): viene elegido "Equipos"; el nombre se edita tocando
el título de la tarjeta; no se permiten nombres repetidos; vacío = nombre
predeterminado; cambiar entre "Equipos" y "Grupos" devuelve todos los nombres
a los predeterminados; el nombre se muestra en la ronda, el marcador y los
resultados.

**Qué se hizo**
1. Subidos a GitHub `8a0f301` y `8eb98f6`. Su compilación (run 36515336443)
   terminó bien, lo que confirma que `npm run build:apk` también funciona en
   GitHub Actions.
2. **Formato de nombres** (pedido del usuario): nueva función
   `titleCaseName()` en `utils.js`, que pone la primera letra de cada palabra
   en mayúscula y el resto en minúscula ("mIKE rUIZ" → "Mike Ruiz"). Se usa al
   escribir los nombres de jugadores (`players.js`), en lugar de
   `toUpperCase()`. Se usará también para los nombres de grupos. 2 pruebas
   nuevas en `test/texto.test.js`.
3. **Bug encontrado:** dos jugadores con el mismo nombre se funden en uno
   (los puntos usan el nombre como clave). Se comprobó en Edge ("Ana", "Ana",
   "Beto" → la partida empieza con 2 jugadores). Anotado en pendientes; falta
   que el usuario decida la solución.

**Archivos tocados:** `src/js/utils.js`, `src/js/screens/config/players.js`,
`test/texto.test.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`,
`AUDITORIA-CAMBIOS.md`.

**Verificación**
- `npm test`: 46 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge: escribir "mIKE rUIZ" deja "Mike Ruiz"; "ÁNGEL" deja "Ángel".
- `build:apk` y `build:desktop`: ambos bien. Se abrió el `.exe` para el usuario.

**Quedó abierto:** largo máximo y reglas de repetidos en los nombres de grupos;
qué hacer con los jugadores de nombre repetido; la parte 1 del plan (grupos
múltiples).

---

## 2026-09-28 — Sesión 3 (parte 10): reglas de Clásico y Alternativo 1 definidas

**Qué se hizo:** en varias rondas de preguntas, el usuario definió las reglas
de emparejamiento de **Clásico** y **Alternativo 1** (Individual y Grupal). Se
le señalaron inconsistencias de su ejemplo inicial y se resolvieron:
- "1 vs 10, 2 vs 9…" era solo la primera tanda.
- Contradicción entre "jugar hasta el puntaje objetivo" y "jugar el todos
  contra todos completo": vale lo primero, con el ciclo repitiéndose.
- Con el orden de grupos propuesto, cada jugador siempre enfrentaba al mismo
  rival: se eligió que cada jugador enfrente a todos los de los otros grupos.
- Ventaja para los que van perdiendo frente a equilibrio de partidos: manda
  el equilibrio de partidos.

Para mostrarle casos concretos se usaron dos pequeños programas de simulación
(fuera del repositorio): la rotación de jugadores entre grupos (33 parejas
completas en el duelo 45) y el orden por tandas con 3, 4 y 5 grupos y 9
jugadores.

**Reglas guardadas en:**
- `CONTEXTO-MUSICAL-SHOWDOWN.md`, sección 3: tipos de batalla, modos, la
  sección nueva "Emparejamientos de Clásico y Alternativo 1" y "Organización
  de grupos" (cantidad con lista desplegable, reparto al azar, nombres
  "Grupos"/"Equipos" editables).
- `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, regla 21: programar las reglas tal cual
  y preguntar ante cualquier caso no cubierto.
- `PENDIENTES.md`: plan de implementación en 3 partes y las preguntas que
  faltan sobre los nombres de grupos.

**Archivos tocados:** `CONTEXTO-MUSICAL-SHOWDOWN.md`,
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, `PENDIENTES.md`, `AUDITORIA-CAMBIOS.md`.
No se tocó código.

**Quedó abierto:** los detalles de los nombres de grupos y la implementación.

---

## 2026-09-28 — Sesión 3 (parte 9): `.exe` y `.apk` listos en la PC

**Pedido del usuario:** dejar actualizados y listos el `.exe` y el `.apk`.

**Qué se hizo**
1. Se subieron a GitHub `560ad66` y `71bd094` (el usuario respondió "listo" a la
   pregunta de si subirlos).
2. Se encontró que esta PC tiene lo necesario para generar el APK sin abrir
   Android Studio: Java 17 y el SDK de Android en `%LOCALAPPDATA%\Android\Sdk`.
3. **Nuevo comando `npm run build:apk`:** `build/build-android.js --apk` hace lo
   mismo que `build:android` y además ejecuta `gradlew assembleDebug` y copia
   el resultado a `dist/android/Musical-Showdown.apk`. Primero falló porque
   `cmd.exe` no encontró `gradlew.bat` en la carpeta actual; se corrigió
   llamándolo con la ruta completa.
4. GitHub Actions: el trabajo de Android ahora usa el mismo `npm run build:apk`
   y sube `dist/android/Musical-Showdown.apk`.
5. la guía técnica: comando `build:apk`, rutas de Java y del SDK en esta PC, y la
   rutina de compilar y abrirle el juego al usuario después de cambios
   visuales o de lógica.

**Archivos tocados:** `build/build-android.js`, `package.json`,
`.github/workflows/compilar.yml`, la guía técnica, `AUDITORIA-CAMBIOS.md`,
`PENDIENTES.md`.

**Verificación**
- `npm run build:apk`: "BUILD SUCCESSFUL" y se generó
  `dist/android/Musical-Showdown.apk` (5,6 MB). Por dentro, su `bundle.js`
  trae el selector de rueda (`wheel-item`) y su `sw.js` tiene
  `musical-showdown-v4`.
- `dist/windows/Musical Showdown.exe` (75 MB) compilado después del último
  cambio en `src/`.
- El cambio en GitHub Actions se verifica en su próxima ejecución.

**Quedó abierto:** que el usuario instale el APK en su teléfono y pruebe la
rueda de forma táctil. Siguiente pendiente: reglas de Alternativo 1.

---

## 2026-09-28 — Sesión 3 (parte 8): selector de rueda

**Pedido del usuario:** que la ventana del valor personalizado sea más como un
selector de rueda: que se edite con las flechas ↑ ↓ del teclado (PC) y
deslizando con el dedo (Android), y que el valor se confirme con Enter
(Windows) o con un botón "Listo" en la misma ventana.

**Qué se hizo**
1. `valuePicker.js` reescrito como **rueda**:
   - Columna de valores con el elegido al centro, en una franja resaltada; los
     vecinos se ven más tenues y pequeños y se desvanecen arriba y abajo.
     Debajo se lee el valor completo ("2300 puntos", "1 min 25 seg").
   - Táctil: deslizar mueve la rueda. Al soltar rápido, sigue girando (impulso)
     y se detiene justo en un valor; al soltar despacio, se queda en la fila
     más cercana. Tocar un valor visible lo lleva al centro.
   - PC: ↑ ↓ (una fila), RePág/AvPág (10 filas), Inicio/Fin, rueda del mouse y
     arrastrar. Las pulsaciones seguidas se suman al destino y no se pierden.
   - Enter o "Listo" confirman (aunque la rueda siga girando: se toma el valor
     donde va a parar); Esc o "Cancelar" salen sin cambios. Enter con el foco
     en "Cancelar" no confirma.
   - Se quitaron los botones ▲ / ▼ y los atajos de la versión anterior.
   - Funciones puras: `clampStep`, `wheelValues` y `snapIndex`, con pruebas.
   - Respaldo con `setTimeout`: si el navegador no dibuja cuadros de
     animación, la rueda igual queda en su destino.
2. `screens/config/index.js`: la rueda del puntaje muestra "2300" con "pts" y
   la del tiempo muestra "1:25".
3. `styles.css`: estilos `.wheel*`, en lugar de `.picker-arrow`,
   `.picker-value` y `.picker-quick`.
4. Documentación actualizada: contexto, instrucciones (regla 20) y pendientes.

**Errores encontrados al probar y corregidos**
- Al saltar muchas filas de golpe, la fila anterior conservaba la marca de
  "seleccionada", porque se salía del bucle antes de quitársela.
- Al deslizar despacio, la rueda también seguía girando al soltar. Ahora el
  impulso solo se aplica por encima de una velocidad mínima (`MIN_FLING`).

**Archivos tocados:** `src/js/screens/config/valuePicker.js`,
`src/js/screens/config/index.js`, `src/css/styles.css`, `test/gameLogic.test.js`,
`CONTEXTO-MUSICAL-SHOWDOWN.md`, `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`,
`AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- `npm test`: 44 pasan y 1 pendiente. `npm run lint`: sin errores.
- En Edge sin ventana, con eventos táctiles simulados: 23 de 23 comprobaciones
  (deslizar despacio y rápido, tocar una fila, ↑ ↓ seguidas, RePág, Inicio/Fin,
  límites 100/9900 y 0:05/2:00, Enter durante el giro, "Listo", Esc, Cancelar,
  Enter sobre "Cancelar").
- Capturas en PC y en un marco de teléfono de 360 px revisadas.
- `build:android` y `build:desktop`: ambos bien. Se abrió el `.exe` para el
  usuario.

**Quedó abierto:** probar la rueda en un teléfono real (pendientes).
Después: Alternativo 1.

---

## 2026-09-28 — Sesión 3 (parte 7): ventana táctil para el valor personalizado

**Pedido del usuario:** un diseño más profesional para el modo personalizado.
Se le mostró una maqueta interactiva en Brave con 3 diseños (A: deslizador,
B: ventana emergente, C: contador −/+). Eligió una ventana como la B, que
permita subir y bajar el valor de forma táctil (Android) y también con botones
arriba y abajo (Windows), igual para puntaje y tiempo y respetando sus reglas.

**Qué se hizo**
1. Nuevo `src/js/screens/config/valuePicker.js`:
   - `openValuePicker(...)` abre una ventana con el valor en grande que se
     cambia deslizando el dedo o arrastrando el mouse sobre el valor (22 px por
     paso), con botones ▲ / ▼ (mantenerlos presionados repite), con la rueda
     del mouse o con las flechas del teclado.
   - Tiene atajos. Enter acepta (salvo con el foco en un botón) y Esc cancela.
     Los botones ▲ / ▼ se desactivan en los límites.
   - Función pura `clampStep(v, min, max, step)`.
2. `screens/config/index.js`: "Personalizado…" abre la ventana.
   - Puntaje: 100–9900 de 100 en 100; atajos −1000/−500/+500/+1000.
   - Tiempo: 5 seg–2:00 de 5 en 5; atajos 1:15/1:30/1:45/2:00. Si se viene de
     "Sin tiempo", parte de 1:30.
   - Aceptar deja el valor en la lista (o selecciona el predeterminado si
     coincide); Cancelar deja todo igual.
3. Se eliminó lo que quedó sin uso:
   - `valueBox.js` (borrado) y sus estilos `.value-*`.
   - `state.configEditing`, las cajas de minutos y segundos, el aviso de
     "máximo 2 minutos" (ya no hace falta: la ventana no deja pasar de 2:00) y
     `customTimeSeconds` con su prueba.
4. `styles.css`: estilos `.picker-*`, con ajuste para pantallas angostas.
5. `sw.js`: `valueBox.js` → `valuePicker.js` en `ASSETS`, y `CACHE_NAME` v3 → v4.
6. Se actualizaron `CONTEXTO-MUSICAL-SHOWDOWN.md` (configuración) e
   `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` (regla 20).

**Archivos tocados:** `src/js/screens/config/valuePicker.js` (nuevo),
`src/js/screens/config/valueBox.js` (borrado), `src/js/screens/config/index.js`,
`src/js/screens/config/presets.js`, `src/js/state.js`, `src/css/styles.css`,
`src/sw.js`, `test/gameLogic.test.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`,
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- `npm test`: 42 pasan y 1 pendiente, con código de salida 0 (incluye
  `clampStep` y la prueba de `sw.js` con la lista actualizada). `npm run lint`:
  sin errores.
- En Edge sin ventana, con eventos táctiles simulados: 23 de 23 comprobaciones
  (deslizar arriba y abajo, ▲▼, rueda, teclado, atajos, límites 9900, 2:00 y
  5 seg, Cancelar/Esc, Aceptar/Enter, predeterminado si coincide, arranque
  desde "Sin tiempo", Enter sobre "Cancelar" no acepta).
- Capturas de escritorio y de teléfono (marco de 360 px): la ventana entra
  completa. Una medición detectó que `.modal` pisaba el ancho máximo: se
  corrigió con `.modal.picker-modal`.
- `build:android` y `build:desktop`: ambos bien. Se abrió el `.exe` para el
  usuario. La compilación en GitHub de `63ea23c` (run 36499694531) terminó bien.

**Quedó abierto:** que el usuario lo pruebe en un teléfono real (táctil).
Después: reglas de Alternativo 1 (ideas ya propuestas).

---

## 2026-09-28 — Sesión 3 (parte 6): valor personalizado en la lista

**Pedido del usuario:** al personalizar el puntaje o el tiempo y terminar de
elegir, que el valor personalizado ocupe el lugar donde normalmente se ve el
valor predeterminado. Antes se le recomendaron rediseños (botones + deslizador,
contador −/+); el usuario prefirió este ajuste.

**Qué se hizo**
1. `screens/config/index.js`:
   - Las listas tienen "Personalizado…" al final. Al elegirlo se abre la caja
     (▲▼ + botón nuevo "✓ Listo").
   - Al terminar ("✓ Listo" o Enter) la caja se cierra y se agrega a la lista
     una opción seleccionada con el valor elegido ("3500 pts", "1 min 40 seg").
   - Si el valor coincide con uno predeterminado, se selecciona ese.
   - Qué caja está abierta se guarda en `state.configEditing` (nuevo campo en
     `state.js`), así no se pierde cuando la pantalla se vuelve a dibujar (por
     ejemplo, al tocar un género). "Confirmar configuración" cierra la caja
     que haya quedado abierta.
   - Se quitaron las notas "(Enter para confirmar)" / "Enter para confirmar el
     valor escrito."; ahora está el botón "✓ Listo".
2. **Errores corregidos:**
   - `valueBox.js`: `parseInt(...) || get()` descartaba el 0, así que no se
     podía escribir "0" en minutos ni segundos. Ahora solo se conserva el
     valor anterior si no hay ningún número. Nueva opción `onEnter`.
   - Un tiempo personalizado de 0:00 terminaba en "Sin tiempo". Ahora el
     mínimo es 5 seg (`customTimeSeconds` en `presets.js`).
3. `presets.js`: nuevas funciones `isPresetTarget`, `isPresetTime` y
   `customTimeSeconds`, con 2 pruebas en `test/gameLogic.test.js`.
4. Se actualizaron `CONTEXTO-MUSICAL-SHOWDOWN.md` (configuración) e
   `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` (regla 20).

**Archivos tocados:** `src/js/state.js`, `src/js/screens/config/index.js`,
`src/js/screens/config/valueBox.js`, `src/js/screens/config/presets.js`,
`test/gameLogic.test.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`,
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- Antes del cambio, una prueba en Edge confirmó el error de no poder escribir 0.
- `npm test`: 42 pasan y 1 pendiente. `npm run lint`: sin errores.
- Recorrido completo en Edge sin ventana: 14 de 14 comprobaciones (abrir y
  cerrar la caja, que las flechas no la cierren, la lista muestra el valor,
  que Enter también cierre, que se use el valor predeterminado si coincide,
  que se pueda escribir 0, el mínimo de 5 seg y que tocar un género no pierda
  los valores). Capturas revisadas con la caja abierta y cerrada.
- `build:android` y `build:desktop`: ambos bien. La compilación en GitHub de
  `3fadd19` (run 36498418003) terminó bien.

**Quedó abierto:** nada. Lo siguiente: reglas de Alternativo 1.

---

## 2026-09-28 — Sesión 3 (parte 5): etiquetas de la configuración

**Qué se hizo:** a pedido del usuario, se quitó "(lista desplegable)" de las
etiquetas "Puntaje objetivo" y "Tiempo por ronda" en
`src/js/screens/config/index.js`.

**Archivos tocados:** `src/js/screens/config/index.js`, `AUDITORIA-CAMBIOS.md`,
`PENDIENTES.md`.

**Verificación**
- "lista desplegable" ya no aparece en `src/`. `npm test`: código de salida 0.
  `npm run lint`: sin errores.
- Captura de la configuración revisada.
- `build:android` y `build:desktop`: ambos bien.
- La compilación en GitHub del commit anterior (`c027fd9`, run 36496215192)
  terminó bien.

**Quedó abierto:** nada.

---

## 2026-09-28 — Sesión 3 (parte 4): tildes y nombres visibles

**Qué se hizo**
1. `src/js/data/songs.js`: `corazon`, `razon` y `reir` pasan a `corazón`,
   `razón` y `reír`, cambiados a la vez en `chorusWords` y en `words` (gameLogic
   los compara de forma exacta).
2. Al revisar capturas aparecieron dos casos más de identificadores internos
   mostrados en pantalla:
   - En la ronda, el modo salía como "CLASICO" y "ALTERNATIVO1". Nueva función
     `modeName(id)` en `screens/config/modes.js`: la usan las etiquetas de
     configuración y la ronda (`round.js`).
   - En la configuración, los géneros salían como "pop" o "reggaeton". Nueva
     función `genreName(id)` junto a `GENRES` en `data/songs.js`: "Pop", "Rock",
     "Reggaetón", "Salsa", "Balada".
3. Nuevo `test/canciones.test.js` (9 pruebas: datos completos y géneros
   válidos; coro coherente con `words`; palabras en minúsculas; lista de
   palabras que deben llevar tilde; `modeName`; `genreName`). Incluye una
   prueba marcada como pendiente (`todo`), que no hace fallar la compilación:
   "cada palabra aparece en su letra" (ver pendientes).
4. Pendiente nuevo (sugerencia, sin cambiar): las etiquetas "(lista
   desplegable)" en la configuración.

**Archivos tocados:** `src/js/data/songs.js`, `src/js/screens/config/modes.js`,
`src/js/screens/config/index.js`, `src/js/screens/round.js`,
`test/canciones.test.js` (nuevo), `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- `npm test`: 40 pasan y 1 pendiente, con código de salida 0. `npm run lint`:
  sin errores.
- Capturas en Edge sin ventana: la configuración muestra "Clásico", "Alternativo
  1" y los géneros con mayúscula y tilde; la ronda muestra "MODO INDIVIDUAL ·
  ALTERNATIVO 1" y las palabras "CORAZÓN" y "REÍR" con tilde, bien dibujadas en
  la tipografía Unbounded.
- `build:android` y `build:desktop`: ambos bien.
- La compilación en GitHub del commit anterior (`9b2f1bc`, run 36495434938)
  terminó bien.

**Quedó abierto:** nada.

---

## 2026-09-28 — Sesión 3 (parte 3): buscador y resaltado de la letra

**Decisión del usuario:** la parte legal de las letras queda para después; no
bloquea los demás pendientes (queda registrado en `PENDIENTES.md`).

**Qué se hizo**
1. Funciones puras nuevas en `src/js/utils.js`:
   - `normalizeText(s)`: pasa a minúsculas y quita tildes y diéresis, pero
     conserva la ñ ("año" ≠ "ano").
   - `normalizeForSearch(s)`: además cambia los signos de puntuación y los
     saltos de línea por espacios.
   - `escapeHtml(s)`.
   - `highlightWord(text, word)`: devuelve la letra como HTML seguro, con
     `<mark>` solo en palabras completas y sin distinguir mayúsculas ni tildes.
2. `src/js/screens/verify.js`:
   - `searchSongs` (ahora exportada) usa `normalizeForSearch`: "corazon"
     encuentra "corazón", y un fragmento con comas o que ocupa dos líneas de
     la letra se encuentra igual.
   - Los 2 sitios que resaltaban con `new RegExp(r.word)` (la búsqueda y la
     decisión del moderador) usan `highlightWord`. Antes marcaban "amor"
     dentro de "amores", no toleraban tildes y podían fallar con caracteres
     especiales.
3. Nuevo `test/texto.test.js` con 15 pruebas.

**Archivos tocados:** `src/js/utils.js`, `src/js/screens/verify.js`,
`test/texto.test.js` (nuevo), `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

**Verificación**
- `npm test`: 32/32. `npm run lint`: sin errores.
- Prueba en el juego real (Edge sin ventana, con una página temporal fuera del
  repositorio): 7 de 7. La búsqueda "que estas cansado, de andar" encuentra
  "Color Esperanza"; se resalta "abrir" una sola vez; se conservan los saltos
  de línea; la decisión del moderador también resalta; una búsqueda sin
  resultados muestra el aviso. Captura revisada.
- `build:android` y `build:desktop`: ambos bien.

**Quedó abierto:** nada.

---

## 2026-09-28 — Sesión 3 (parte 2): pruebas de elección de palabra y enfrentamiento

**Decisión del usuario:** la publicación queda en pausa. Antes de publicar se
harán los pendientes que falten, mejoras visuales y de lógica, y la parte legal
de agregar canciones (solo letras, sin audio). Quedó registrado al inicio de
`PENDIENTES.md`.

**Qué se hizo**
1. Nuevo archivo `test/seleccion.test.js` con 9 pruebas que usan la base de
   ejemplo real y reinician `state` en cada prueba:
   - `pickWeightedWord`: solo elige palabras de los géneros elegidos; nunca
     elige palabras marcadas `false`; no elige palabras que solo están en
     canciones ya usadas; devuelve `null` si no quedan canciones o si el género
     no tiene canciones; da más peso a una palabra que está en más canciones.
   - `pickIndividualPair`: con 2 jugadores siempre enfrenta a esos dos; con
     más, elige dos distintos de la lista; favorece al que va perdiendo.
2. **Hallazgos en `data/songs.js`**, registrados en pendientes y sin corregir
   (dependen de la parte legal de las letras):
   - Solo 11 de las 25 palabras que se pueden pedir aparecen en el fragmento de
     letra de su canción.
   - `corazon`, `razon` y `reir` no tienen tilde.
   - En `verify.js`, el buscador y el resaltado no toleran tildes y el
     resaltado no respeta palabras completas.
   - No se puede probar aparte el peso del coro, porque en la base de ejemplo
     todas las palabras que se pueden pedir están en el coro.
3. `PENDIENTES.md` reorganizado: nueva sección "Canciones y letras", la
   distribución marcada como en pausa, y una sección para mejoras visuales y de
   lógica.

**Archivos tocados:** `test/seleccion.test.js` (nuevo), la guía técnica,
`AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`. No se tocó `src/`, así que no se
recompiló.

**Verificación**
- `npm test`: 17/17, en tres corridas seguidas (algunas pruebas dependen del
  azar y tienen márgenes amplios).
- Se rompió a propósito `gameLogic.js` por un momento (se ignoraron las
  canciones usadas y se quitó el favorecer al que va perdiendo): fallaron las 3
  pruebas correspondientes. Después se restauró con `git checkout`.

**Quedó abierto:** la parte legal de las letras.

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
- la guía técnica: se explica qué hace la prueba nueva.
- Nota de la sesión anterior: la revisión en segundo plano de la compilación 3
  de GitHub no encontró la ejecución por un error en su búsqueda y se detuvo
  sin avisar. La compilación sí terminó bien.

**Archivos tocados:** `test/sw.test.js` (nuevo), la guía técnica,
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
   `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` (regla 10) y la guía técnica.

**Archivos tocados:** `src/js/screens/modals.js`, `src/js/screens/round.js`,
`src/js/screens/teamOrg.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`,
`INSTRUCCIONES-MUSICAL-SHOWDOWN.md`, la guía técnica, `AUDITORIA-CAMBIOS.md`,
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
la guía técnica, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

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
`build/build-desktop.js`, la guía técnica, `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`.

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
`platforms/desktop/package-lock.json` (nuevo), la guía técnica,
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

## 2026-09-26 — Sesión 1: arranque del registro

**Qué se hizo**
1. Se creó la guía técnica (en español) con comandos, arquitectura y
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
   las sesiones anteriores).

**Archivos tocados:** `src/sw.js`, la guía técnica, `AUDITORIA-CAMBIOS.md`,
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

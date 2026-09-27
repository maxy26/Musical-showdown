# Contexto del proyecto — Musical Showdown

> Este documento resume todo lo definido y construido hasta ahora sobre
> **Musical Showdown**, un juego de fiesta/familiar donde el sistema
> muestra una palabra y los participantes deben cantar cualquier canción
> que la contenga. Está pensado para que otra sesión de Claude (o
> Claude Code) retome el proyecto sin haber visto la conversación
> original.

## 1. Qué es el juego

- Juego de batallas **1 vs 1 (Individual)** o **por equipos (Grupal)**.
- Cada ronda el sistema elige una **palabra exacta**; los participantes
  cantan cualquier canción que la contenga.
- El juego **no reproduce canciones**: solo permite buscar una canción
  (por nombre o por el fragmento cantado) y muestra su letra para que un
  **moderador humano** decida si la respuesta es correcta.
- Gana el primer jugador/equipo que alcance o supere el **puntaje
  objetivo**. No hay empates ni desempates.
- Metodología del proyecto: primero se definieron las reglas de diseño
  con calma (39 puntos originales, ver sección 3), y luego se pasó a
  construirlo en código de forma iterativa, agregando/corrigiendo
  funcionalidad pantalla por pantalla.

## 2. Estado actual y stack técnico

- **Stack**: HTML/CSS/JavaScript vanilla (sin frameworks), módulos ES
  (`import`/`export`), sin dependencias de runtime.
- **Nombre y marca**: "Musical Showdown" (antes "Palabra Cantada").
  Ícono propio: una nota musical con barras de ecualizador sobre
  degradado morado/rosa, recortado en forma circular para todos los
  usos (PWA, `.ico` de Windows, `mipmap` de Android).
- **Disponible en 3 plataformas** desde una única fuente (`src/`):
  - **Web/PWA**: instalable, funciona offline (service worker).
  - **Windows**: empaquetado con Electron (app portable, sin instalador).
  - **Android**: empaquetado con Capacitor (el juego queda embebido en
    el `.apk`, no depende de ninguna URL ni de internet).
- **Base de datos de canciones**: es un **mock local** (~9 canciones en
  español, en `src/js/data/songs.js`) con género, letra, si la palabra
  aparece en el coro y si la canción es "famosa" (para ponderar la
  selección de palabras). **Pendiente**: reemplazar por una fuente/API
  real de letras — hay que investigar cuál permite legalmente ese uso
  (las letras tienen derechos de autor; no asumir que una fuente
  gratuita permite copiarlas/redistribuirlas).
- **Estructura de carpetas** (monorepo — ver sección 6 para el detalle
  completo y el porqué): `src/` es la ÚNICA fuente de verdad del juego;
  `platforms/desktop` y `platforms/android` son envoltorios nativos
  delgados; `build/` arma cada plataforma automáticamente a partir de
  `src/`; `test/` tiene pruebas con `node --test`; hay un `eslint.config.js`
  y el proyecto es un repositorio git con commits.

## 3. Reglas de diseño (resumen de las 39 originales + cambios posteriores)

### Tipos de batalla
- **Individual**: selección de próximo enfrentamiento ponderada por
  puntaje (los que van perdiendo tienen más probabilidad de salir), para
  mantener el equilibrio. El primer enfrentamiento es aleatorio.
- **Grupal**: los jugadores se reparten en 2 equipos (tarjetas). El
  puntaje es del equipo, no del participante mostrado (que es solo
  estético/rotativo). Requiere **4 o más jugadores escritos** para
  poder elegirse (si hay menos, el botón "Grupal" queda deshabilitado
  con un aviso).

### Modos de juego
- **Clásico**: el único con reglas completamente definidas e
  implementadas.
- **Alternativo 1** y **Alternativo 2**: reglas exactas **aún
  pendientes de definir** (son placeholders en el código, marcados con
  `TODO`).
- Disponibilidad: si el tipo de batalla es **Individual**, solo se
  muestran Clásico y Alternativo 1 (Alternativo 2 no aparece). Si es
  **Grupal**, se muestran los tres modos, todos libres de seleccionar
  (sin candado).

### Configuración de partida
- Todo en una sola pantalla: jugadores, tipo de batalla, modo, géneros,
  puntaje objetivo, tiempo por ronda, multiplicadores. Se bloquea al
  iniciar la partida.
- **Jugadores**: campos con placeholder "Jugador N" (no un valor
  precargado que haya que borrar). El texto se convierte a
  **MAYÚSCULAS automáticamente** mientras se escribe. Los primeros 2
  jugadores no tienen botón de eliminar (✕); desde el tercero en
  adelante sí. **Validación**: no se puede iniciar partida sin al menos
  2 nombres realmente escritos (no se autocompletan vacíos).
- **Géneros musicales**: los 5 más reconocidos — Pop, Rock, Reggaetón,
  Salsa, Balada (selección múltiple).
- **Puntaje objetivo**: lista desplegable con valores fijos de 500 en
  500 hasta 5000, más una opción "Personalizado". En personalizado hay
  **una sola caja editable** (no por dígito) con flechas ▲▼ que suben o
  bajan de 100 en 100; también se puede escribir el número directo y
  confirmar con **Enter** (se redondea al múltiplo de 100 más cercano,
  entre 100 y 9900). Al confirmar, la opción "Personalizado" del select
  cambia su texto para mostrar el valor real (ej. "2100 pts").
- **Tiempo por ronda**: lista desplegable de 5 en 5 segundos hasta 60
  ("1 min"), más "Sin tiempo", más "Personalizado". En personalizado
  hay dos cajas (minutos 0–2, segundos 0–55 de 5 en 5), mismo patrón de
  flechas + escribir + Enter. Al llegar a 2 minutos, los segundos se
  bloquean en 0 con un aviso ("el tiempo máximo por ronda es de 2
  minutos"); por debajo de 2 min quedan libres.
- **Multiplicadores**: son exactamente 4, fijos (×2, ×3, ×4, ×5), y se
  activan/desactivan **todos juntos** con un único interruptor maestro
  (no hay interruptores individuales por multiplicador).
- Sin multiplicador, cada acierto suma **100 puntos** (ese es el valor
  base; con multiplicador se multiplica por él).

### Organización de equipos (modo Grupal)
- Pantalla aparte tras confirmar la configuración. Tarjetas por equipo,
  numeración desde 1 en cada equipo.
- **Volver a organizar**: redistribuye aleatoriamente sin pedir
  confirmación, manteniendo los tamaños de equipo.
- **Mover jugadores**: tocar un jugador y luego el equipo destino; si
  los equipos tienen igual tamaño se intercambian posiciones, si no,
  simplemente se mueve (respetando que no puede quedar un equipo más
  lleno que el otro permite).
- **Confirmar equipos**: pide confirmación (sí/no) y bloquea la
  posibilidad de mover jugadores durante la partida.

### Durante la ronda
- Antes de cada ronda hay una **mini pantalla de carga** de 1.5s
  (mismo estilo visual que la pantalla de carga inicial: micrófono
  rebotando, nombre del enfrentamiento, barra de progreso) — reemplaza
  lo que originalmente era un texto estático "Jugador1 VS Jugador2" con
  el reloj congelado (eso se sentía como si el juego se hubiera
  trabado).
- Pantalla de ronda: nombre/equipo + puntaje como botón (lo toca el
  moderador para indicar quién responde), barra de progreso hacia el
  objetivo, reloj (en rojo con los últimos 5 segundos), la palabra en
  grande al centro, el multiplicador si aplica.
- **Selección de palabra**: ponderada por exactitud, si aparece en el
  coro (más peso), si la canción es "famosa" (más peso), disponibilidad
  de canciones válidas restantes, manteniendo aleatoriedad (no
  determinista).
- **Canciones usadas**: una canción correcta queda bloqueada el resto de
  la partida. La identidad de una canción es **nombre + letra** (el
  artista es opcional/no determinante) — así covers, versiones en vivo
  o acústicas de la misma canción cuentan como "la misma".
- **Interfaz de verificación**: una sola caja de búsqueda (por nombre o
  por fragmento cantado). Muestra resultados, letra con la palabra
  resaltada, y botones Correcta/Incorrecta que decide el moderador
  (no hay reconocimiento de voz automático).
- **Respuesta incorrecta**: no bloquea la canción, no hay límite de
  intentos, se puede volver a intentar cualquier participante de esa
  ronda.
- **Tiempo agotado**: si nadie acierta, nadie gana puntos, pasa a la
  siguiente ronda.
- **Sin tiempo**: opción de ronda sin cronómetro, con botón para
  finalizar manualmente (pide confirmación).

### Pausa / Ayuda / Salir
- Botón de pausa (detiene el reloj) con submenú: Continuar, Ayuda, Salir
  de la partida (pide confirmación, se pierde el progreso, no hay
  guardado de partidas).
- **Ayuda ("Cómo se juega")**: es un modal **visual, no solo texto** —
  muestra cada elemento real de la UI (el botón de jugador, la barra de
  progreso, el reloj, la palabra, el multiplicador, el botón de pausa,
  el buscador, un resultado, la letra resaltada, los botones de
  correcta/incorrecta) junto a una explicación corta de qué hace cada
  uno. Pensado para ser "a prueba de tontos".
- **Ubicación de botones** (regla explícita del usuario): fuera de la
  pantalla inicial, el botón de ayuda (❓, redondo) va **a la derecha**
  del botón de menú/volver (pantallas de configuración y organizar
  equipos) y, durante la partida, **a la derecha** del botón de pausa.
  El botón de silencio (🔊/🔇) tiene el mismo estilo redondo y va
  **justo al lado** del botón de ayuda en esos mismos lugares (ya no es
  un botón flotante suelto).

### Resultados y "jugar de nuevo"
- Pantalla final: ganador + puntaje, botón "Ver más" con los puntajes
  del resto, "Jugar de nuevo" (mantiene configuración, reinicia
  puntajes; en grupal vuelve a la pantalla de organizar equipos) y
  "Volver al menú".

## 4. Sonido

- **Clic de botones**: enganchado globalmente (delegación de eventos en
  `document`), así que cualquier botón de la app suena, incluidos los
  que se agreguen después, sin tocar cada pantalla.
- **Ambiente**: un pad suave en loop de fondo, volumen bajo. Arranca en
  el primer clic dentro de la app (los navegadores bloquean el
  autoplay hasta que hay una interacción real).
- **Tick del reloj**: uno suave cada segundo, y uno más agudo/urgente en
  los últimos 5 segundos.
- Todos los sonidos son **sintetizados** (generados con Python/numpy),
  no son samples de terceros — para evitar cualquier problema de
  derechos de autor.
- Botón de silencio (🔊/🔇) persistente entre sesiones (`localStorage`).

## 5. Advertencias y diálogos propios

- Reemplazamos el `alert()` nativo del navegador por una **ventana de
  advertencia propia** (mismo estilo visual del juego: ícono ⚠️,
  mensaje, botón "Aceptar") para: jugadores insuficientes, género no
  seleccionado, equipo lleno, etc.
- **Pendiente** (mencionado pero no pedido explícitamente): todavía
  quedan 2 diálogos usando el `confirm()` nativo del navegador
  ("¿Confirmar equipos?" y "¿Desean finalizar esta ronda?"). Se le avisó
  al usuario y no ha pedido cambiarlos aún.

## 6. Estructura de carpetas (monorepo) — usar SIEMPRE esta forma

El usuario pidió explícitamente que **toda entrega futura en .zip use
esta misma estructura profesional**, para no perderse entre archivos
duplicados o desactualizados:

```
MusicalShowdown/
├── src/                    ← ÚNICA fuente de verdad del juego
│   ├── index.html, manifest.json, sw.js
│   ├── css/styles.css
│   ├── icons/, audio/
│   └── js/
│       ├── main.js, router.js, state.js, gameLogic.js, sound.js, utils.js
│       ├── data/songs.js
│       └── screens/
│           ├── menu.js, teamOrg.js, round.js, verify.js,
│           │   roundResult.js, results.js, modals.js
│           └── config/              (pantalla de configuración dividida)
│               ├── index.js           orquestador
│               ├── players.js          sección de jugadores
│               ├── modes.js             modos disponibles
│               ├── presets.js            valores predeterminados
│               └── valueBox.js            caja ▲▼+Enter reutilizable
│
├── platforms/
│   ├── desktop/             Electron: main.js, ícono .ico, package.json
│   │                         (NO copia el juego a mano — ver build/)
│   └── android/               Capacitor: capacitor.config.ts,
│                                package.json, proyecto nativo android/
│
├── build/
│   ├── build-desktop.js      arma Windows desde src/ (esbuild + electron-builder)
│   └── build-android.js       arma Android desde src/ (esbuild + cap sync)
│                                Y CORRIGE SOLO un bug recurrente (ver abajo)
│
├── test/
│   └── gameLogic.test.js      pruebas con `node --test` (lógica pura)
│
├── eslint.config.js            lint básico sobre src/
├── package.json                 scripts: build:desktop, build:android,
│                                  build:all, test, lint
├── README.md
└── dist/                          SALIDA generada (no se edita a mano)
    └── windows/                     Musical Showdown.exe
```

**Por qué existe esta estructura**: antes el juego se copiaba a mano
tres veces (una por plataforma) y era fácil que una copia quedara
desactualizada respecto a las otras. Ahora `src/` es la única fuente;
`platforms/` solo tiene lo específico de cada plataforma; y los scripts
de `build/` arman cada versión automáticamente.

### Bug recurrente ya resuelto (automatizado)

`npx cap sync android` **regenera** el archivo
`platforms/android/android/capacitor.settings.gradle` apuntando a
`../node_modules/@capacitor/android/capacitor` — una carpeta que nunca
viaja en las entregas del proyecto. Esto rompía la compilación en
Android Studio con el error *"No matching variant of project
:capacitor-android was found... No variants exist"*. Costó varias
vueltas manuales antes de automatizarlo. **La solución ya vive dentro
de `build/build-android.js`**: después de correr `cap sync`, el script
copia esa carpeta dentro de `android/capacitor-android/` y corrige la
ruta a `./capacitor-android` automáticamente. Si en el futuro se
reescribe este script, **no perder ese paso**.

### Cómo compilar cada plataforma

```bash
# Windows (.exe)
npm install --prefix platforms/desktop   # solo la primera vez
npm run build:desktop
# → dist/windows/Musical Showdown.exe

# Android (proyecto listo para Android Studio)
npm install --prefix platforms/android   # solo la primera vez
npm run build:android
# → abrir platforms/android/android en Android Studio
# → Build → Generate App Bundles or APKs → Generate APKs
```

## 7. Detalles técnicos y decisiones de implementación a tener en cuenta

- Los módulos ES (`import`/`export`) **no funcionan abriendo
  `index.html` con doble clic** (bloqueo CORS del navegador con
  `file://`). Para jugar la versión Web hay que servirla con un
  servidor local (`python3 -m http.server`) o subirla a un hosting.
  Para Windows/Android, esto se resuelve empaquetando todo con
  **esbuild** en un solo archivo `bundle.js` (formato IIFE, sin
  módulos) que sí funciona sin servidor.
- `sound.js` usa **inicialización perezosa** (nada de `localStorage`
  ni `new Audio(...)` en el nivel superior del módulo) para poder
  importarse con seguridad desde Node (tests, herramientas de build)
  sin necesitar un navegador. Mantener este patrón si se edita.
- El service worker (`sw.js`) usa estrategia **"network-first"**
  (intenta traer la versión más nueva primero; solo usa la copia en
  caché si no hay conexión) — al principio usaba "cache-first para
  siempre", lo que causaba que el juego se quedara pegado en una
  versión vieja después de cada actualización. Si se toca este
  archivo, no volver a "cache-first" sin querer.
- Paleta de colores / tokens de diseño (en `css/styles.css`, variables
  `:root`): fondo violeta oscuro `#150F22`, rosa `#FF5C7A`, dorado
  `#FFC857`, verde azulado `#3AC7A0` (equipo B). Tipografía: `Unbounded`
  para títulos/números grandes, `Inter` para texto normal (Google
  Fonts).
- El `appId`/paquete de Android quedó como `com.palabracantada.app`
  (nombre técnico interno, del nombre anterior del juego) — no se
  renombró al cambiar el nombre visible a "Musical Showdown" para no
  arriesgar romper el proyecto ya generado. Si se quiere corregir esto
  en algún momento, hay que regenerar/renombrar el paquete Android con
  cuidado (afecta rutas de carpetas Java/Kotlin).

## 8. Pendientes conocidos (no son errores, son diseño sin terminar)

- Reglas exactas de **Alternativo 1** y **Alternativo 2**.
- Reglas exactas de **rotación grupal** por modo (hoy es simple: el
  participante mostrado pasa al final de la fila de su equipo tras un
  acierto).
- Cantidad de equipos: hoy fijo en **2**; sin manejo especial de
  cantidades impares de jugadores.
- Reemplazar la base de canciones local (mock) por una fuente/API real
  de letras, ya decidido el tema legal.
- Los 2 diálogos `confirm()` nativos mencionados en la sección 5.

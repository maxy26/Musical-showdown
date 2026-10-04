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
   `CLAUDE.md` y pendientes.

**Archivos tocados:** `src/js/relay.js`, `src/js/screens/relayModals.js`,
`src/js/gameLogic.js`, `src/js/screens/verify.js`, `src/js/screens/results.js`,
`src/js/state.js`, `test/relevo.test.js`, `test/seleccion.test.js`,
`test/gameLogic.test.js`, `CONTEXTO-MUSICAL-SHOWDOWN.md`, `CLAUDE.md`,
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
`test/grupos.test.js`, `test/seleccion.test.js`, `CLAUDE.md`,
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
5. `CLAUDE.md`: comando `build:apk`, rutas de Java y del SDK en esta PC, y la
   rutina de compilar y abrirle el juego al usuario después de cambios
   visuales o de lógica.

**Archivos tocados:** `build/build-android.js`, `package.json`,
`.github/workflows/compilar.yml`, `CLAUDE.md`, `AUDITORIA-CAMBIOS.md`,
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

**Archivos tocados:** `test/seleccion.test.js` (nuevo), `CLAUDE.md`,
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

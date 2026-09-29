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

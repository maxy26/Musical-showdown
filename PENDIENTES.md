# Pendientes — Musical Showdown

> Lista viva de inconsistencias, bugs, mejoras, implementaciones y
> avances por hacer. Al empezar una conversación, revisar esta lista
> junto con `AUDITORIA-CAMBIOS.md`. Al resolver algo, marcarlo `[x]`,
> anotar la fecha y registrar el cambio en la auditoría. Los resueltos
> se mueven a la sección final.
>
> Prioridad: 🔴 alta · 🟡 media · 🟢 baja
>
> **Plan acordado (28-09-2026):** la publicación queda **en pausa**. Antes de
> publicar se harán los pendientes que falten, mejoras visuales y de lógica
> (las que pida el usuario o se le recomienden) y la parte legal de agregar
> canciones (solo letras, sin audio).

## 🎵 Canciones y letras (antes de publicar)

- [ ] 🟡 **Resolver la parte legal de las letras** (sin audio): qué fuente se
  puede usar, qué se puede guardar dentro de la app (fragmentos o letra
  completa), si hace falta licencia y cuál. Hasta entonces, `data/songs.js`
  sigue siendo de ejemplo (instrucción 22). **El usuario decidió dejarlo para
  después (28-09-2026)**: no bloquea los demás pendientes, solo el siguiente
  (palabras que no están en la letra) y la publicación.
- [ ] 🟡 **Las palabras que se piden no siempre están en la letra guardada.**
  De 25 palabras que el juego puede pedir en `data/songs.js`, solo 11
  aparecen en el fragmento de letra de su canción. Ejemplo: puede pedir
  "CIELO" diciendo que está en "Color Esperanza", pero el moderador no la ve
  en la letra ni queda resaltada. Pasa porque las letras guardadas son
  fragmentos cortos. Hay que resolverlo junto con la fuente real de letras:
  por ejemplo, calcular `words` a partir de la letra en vez de escribirlo a mano.

## 🐛 Bugs e inconsistencias


- [ ] 🟢 **El nombre técnico de Android sigue siendo `com.palabracantada.app`**
  (nombre anterior del juego). Renombrarlo es delicado porque afecta
  las rutas de Java. Solo hacerlo si el usuario lo pide
  (contexto, sección 7).

## 🔧 Entorno / herramientas

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

## 📦 Distribución a otros equipos (en pausa hasta decidir publicar)

- [ ] 🟡 **Probar el APK en un teléfono Android real.** Se descarga desde
  GitHub Actions ("Artifacts" → `musical-showdown-android`). Para instalarlo
  hay que permitir "instalar apps de origen desconocido".
- [ ] 🟡 **Probar la versión de Linux en un equipo con Linux real.** El
  `.AppImage` sale de GitHub Actions. Para abrirlo: darle permiso de
  ejecución (`chmod +x Musical-Showdown.AppImage`) y hacer doble clic. En
  algunas distribuciones hace falta instalar `libfuse2`.
- [ ] 🟡 **Probar el `.exe` portátil en otra PC con Windows.** En esta PC ya
  se comprobó que abre. El `.exe` se descomprime en una carpeta temporal cada
  vez que se abre, así que puede tardar unos segundos en arrancar.
- [ ] 🟢 **Publicar una versión descargable:** crear y subir una etiqueta
  (por ejemplo, `git tag v1.0.0` y luego `git push origin v1.0.0`). GitHub
  Actions creará una "Release" con los 3 archivos.
- [ ] 🟢 **Windows SmartScreen en otros equipos.** El `.exe` no está firmado,
  así que en otra PC Windows mostrará "Windows protegió su PC" y habrá que
  hacer clic en "Más información → Ejecutar de todas formas". Para quitar el
  aviso hace falta un certificado de firma de código, que cuesta dinero.

## ✨ Mejoras visuales y de lógica

> Se irán agregando las que pida el usuario o se le recomienden.

- [ ] 🟡 **Lista de jugadores: navegar con las flechas del teclado y confirmar
  con Enter** (pedido del usuario, 29-09-2026). En "Configurar partida", poder
  moverse entre los campos de jugadores con ↑ ↓ y confirmar con Enter. Antes de
  programarlo, preguntar los detalles: ¿Enter en el último campo agrega un
  jugador nuevo, pasa al siguiente campo o confirma la configuración? ¿Las
  flechas también sirven en el resto de la pantalla (tipo de batalla, modo,
  géneros…)?
- [ ] 🟡 **Terminar la partida a mitad de juego debe volver a "Configurar
  partida"** (pedido del usuario, 29-09-2026). Hoy "Pausa → Salir de la
  partida" vuelve al menú principal y borra todo. Preguntar: ¿se conservan los
  jugadores y la configuración elegida al volver?


- [ ] 🟡 **Probar el selector de rueda en un teléfono Android real.** El APK
  está en `dist/android/Musical-Showdown.apk` (se genera con
  `npm run build:apk`). El deslizamiento y el "lanzamiento" solo se probaron
  con eventos simulados.
  Puede que haya que ajustar la sensibilidad (`MIN_FLING`, `MOMENTUM_MS` en
  `valuePicker.js`).


## 🎮 Diseño / implementación pendiente (decisión del usuario)

> No inventar reglas: preguntar antes (instrucción 21).

> El usuario pidió ir **con calma, paso a paso y a fondo**: definir cada idea
> por completo con preguntas antes de programarla.

- [ ] 🔴 **Ideas nuevas de Alternativo 1** (decididas el 29-09-2026, opción A;
  detalles por definir con el usuario, en este orden):
  1. **Relevo (solo Alternativo 1 Grupal)**. Lo ya confirmado por el usuario
     (29 y 30-09-2026), todavía sin programar:
     - Es un **comodín**: **3 por equipo para toda la partida**, sin recuperarse,
       y **como mucho 1 por ronda**.
     - Se pide **antes de responder**. Al presionar "Relevo" el reloj **se pausa
       solo**, se elige al compañero que entra, se **confirma** y la ronda
       continúa con el **mismo tiempo** de la ronda.
     - El duelo pasa a ser con el que entró ("Ana vs Carlos", Ana pide relevo a
       María → "María vs Carlos"). Para los emparejamientos de Alternativo 1
       cuenta María vs Carlos, **no** Ana vs Carlos.
     - El que entró **gasta el único intento** del equipo. Si acierta, el equipo
       suma normal (100 × multiplicador); si falla, no suma (ver "un solo
       intento").
     - **Sin relevos y lo usan igual:** el botón se puede presionar igual y
       aplica la penalización: **la mitad del valor de la ronda en contra**, la
       ronda se pierde y **el otro equipo gana la ronda** con sus puntos (con ×2:
       −100 y el otro equipo +200).
     - **3 símbolos visibles** con los relevos que le quedan a cada equipo, y un
       botón para **agregar o quitar** relevos con confirmación (por ejemplo,
       para devolver uno usado por error).
     - **Puntos negativos** permitidos, mostrados en **rojo bien visible**.
     - Confirmado el 30-09-2026:
       - El botón de agregar o quitar relevos va en la **pantalla de la ronda**,
         junto a los 3 símbolos de cada equipo. **Sin límite** de máximo.
       - El **jugador elige** a su compañero en una lista que muestra la
         aplicación, y luego confirma. Puede elegir a **cualquiera de su
         equipo**, aunque ya haya cantado.
       - El que **pide** el relevo **no cuenta** como que cantó; el que
         **entra**, sí.
       - Después de que un equipo falla, el otro **sí puede** usar su relevo.
       - Penalización por usar un relevo que no tienen: el otro equipo suma el
         valor completo de la ronda **sin cantar**, y la ronda termina.
       - El relevo es **solo para Alternativo 1** (no para Clásico).
     - Si el que entró **falla**, **sigue intentando él** todas las veces que
       quiera hasta que se acabe el tiempo; el relevo ya se gastó. El botón para
       quitar relevos no baja de **0**.
     - ✅ **El relevo quedó completamente definido** (30-09-2026); falta programarlo.
  1b. **Intentos por ronda** (contradicción resuelta por el usuario, 30-09-2026):
     - **Clásico** (Individual y Grupal): **un solo intento** por jugador o
       equipo. Si los dos fallan, la ronda **termina de inmediato** con 0 para
       ambos.
     - **Alternativo 1** (Individual y Grupal): **intentos ilimitados**, como
       hoy, hasta que alguien acierte o se acabe el tiempo; sin aciertos, 0 para
       ambos.
- [ ] 🟡 **Revisar y modificar Clásico** (pedido del usuario, 30-09-2026): darle
  un resumen de cómo funciona hoy Clásico y luego modificarlo según lo que decida.
  2. **Puntos:** ¿restar al fallar? ¿Cuánto? ¿Bonos? ¿Por qué?
  3. **Tiempo / fin de la partida:** ¿cambia el tiempo por ronda? ¿Se sigue
     ganando al llegar al puntaje objetivo?
  4. ¿Qué de esto aplica también a Alternativo 1 Individual (salvo el relevo)?
- [ ] 🔴 **Reglas de Alternativo 2:** combinación llamativa de Alternativo 1
  (con sus ideas nuevas) y Clásico. Falta definir cómo se combinan. Opciones
  que se le mostraron: alternar por bloques, orden con ayuda de la ventaja,
  por mitades de la partida, u otra. Mientras tanto usa las reglas de Clásico.
- [ ] 🟡 **Actualizar la ayuda "Cómo se juega"** (pedido del usuario,
  29-09-2026). Hoy describe solo la ronda clásica. Debe explicar lo nuevo:
  equipos múltiples y sus nombres, los modos (Clásico, Alternativo 1 y 2, con
  sus reglas cuando estén definidas), el selector de rueda del valor
  personalizado y cómo mover e intercambiar jugadores. Conviene hacerlo al
  terminar de definir Alternativo 1 y 2.

---

## ✅ Resueltos

- [x] 2026-09-29: Repeticiones seguidas en Clásico: "enfrentarse con todos" se
  cuenta **por vuelta** (opción b del usuario). Al completarse, la cuenta empieza
  de nuevo, así se siguen evitando las repeticiones seguidas.

- [x] 2026-09-29: 🔴 Parte 3 del plan, **Clásico** (Individual y Grupal): fases
  (3 al azar; con desequilibrio 3 con ventaja ↔ 3 al azar; con equilibrio solo
  al azar), equilibrio = todos con el 60 % del promedio, ventaja ponderada por
  la distancia al promedio, equilibrio de partidos por encima de todo, y sin
  repetir el duelo anterior (con la excepción de la regla). Reemplazó el sorteo
  ponderado viejo (`pickIndividualPair`) y la regla temporal de grupos
  (`pickGroupPairTemporary`). **Con esto el plan de 3 partes está completo.**

- [x] 2026-09-29: 🔴 Parte 2 del plan, **Alternativo 1** (Individual y Grupal),
  programado según las reglas del usuario: orden fijo "primero contra último"
  que rota, y orden de grupos G1vG3 → G1vG2 → G2vG3 (o rotación con 4 o más),
  con jugadores en orden y rivales nuevos; el ciclo se repite hasta el puntaje
  objetivo.

- [x] 2026-09-29: Mover e intercambiar jugadores en "Organizar" (pedido del
  usuario): tocar un jugador y luego otro de otro grupo los **intercambia**;
  tocar un jugador y luego el grupo (fuera de los nombres) lo **mueve** sin
  intercambiar, si su grupo queda con 2 o más. Verificado en Edge y compilado.

- [x] 2026-09-28: Al cambiar la cantidad de grupos **se reinicia todo**: nuevo
  reparto al azar y nombres predeterminados, manteniendo "Equipos"/"Grupos"
  según lo elegido (lo decidió el usuario).
- [x] 2026-09-28: En la ronda, cada lado usa **el color de su grupo**, el mismo
  de "Organizar" (lo pidió el usuario).

- [x] 2026-09-28: 🔴 Parte 1 del plan, **grupos múltiples**: cantidad (de 2 a la
  mitad de los jugadores), "Equipos"/"Grupos", nombres editables tocando el
  título, sin repetidos, reparto al azar con los que sobran al final, puntos
  por grupo y el representante al azar entre los que menos han cantado.
- [x] 2026-09-28: 🟡 Los multiplicadores empezaban como ×2 y ×3 en lugar de los 4
  (×2 a ×5) que pide la instrucción 20. Corregido en `state.js`.

- [x] 2026-09-28: 🔴 Dos jugadores con el mismo nombre se fundían en uno (los
  puntos usan el nombre como clave). Ahora **no se permiten nombres
  repetidos**: los campos se marcan en rojo, aparece un mensaje antes de
  "Añadir jugador" y no se puede confirmar la configuración hasta corregirlo
  (lo decidió el usuario). Máximo 20 letras por nombre.

- [x] 2026-09-28: Nombres de jugadores con la primera letra de cada palabra en
  mayúscula ("Mike Ruiz"), en lugar de todo en MAYÚSCULAS (pedido del usuario).

- [x] 2026-09-28: Reglas de emparejamiento de **Clásico** y **Alternativo 1**
  (Individual y Grupal), cantidad de grupos, "rotación grupal" y reparto en
  grupos: **definidas por el usuario** y guardadas en el contexto (sección 3).
  Falta implementarlas (ver arriba).

- [x] 2026-09-28: 🟡 Nuevo diseño del valor personalizado (puntaje y tiempo):
  **selector de rueda** (`valuePicker.js`), táctil en Android y con flechas
  ↑ ↓ en PC; se confirma con Enter o "Listo". Se eligió después de una
  maqueta interactiva y de una primera versión con botones ▲ / ▼.

- [x] 2026-09-28: 🟡 Puntaje y tiempo personalizados: al terminar ("✓ Listo"
  o Enter) la caja se cierra y el valor ocupa el lugar de los predeterminados
  en la lista (pedido del usuario). Se corrigieron además dos errores: no se
  podía escribir 0 en las cajas, y 0:00 personalizado terminaba en "Sin tiempo"
  (ahora el mínimo es 5 seg).

- [x] 2026-09-28: 🟢 Se quitó "(lista desplegable)" de las etiquetas
  "Puntaje objetivo" y "Tiempo por ronda" en la configuración (lo pidió el usuario).

- [x] 2026-09-28: 🟡 Tildes en pantalla: las palabras `corazón`, `razón` y
  `reír` en `data/songs.js`; el modo en la ronda ("CLASICO" → "CLÁSICO",
  "ALTERNATIVO1" → "ALTERNATIVO 1") con `modeName()`; y los géneros en la
  configuración ("reggaeton" → "Reggaetón", con mayúscula inicial) con
  `genreName()`.

- [x] 2026-09-28: 🟡 Buscador y resaltado (`screens/verify.js`): ahora no
  distinguen mayúsculas, tildes ni signos de puntuación, y el resaltado marca
  solo palabras completas ("amor" ya no marca "amores").

- [x] 2026-09-28: 🟢 Pruebas ampliadas: `test/seleccion.test.js` cubre
  `pickWeightedWord` y `pickIndividualPair` (9 pruebas nuevas).

- [x] 2026-09-28: 🟢 Prueba `test/sw.test.js`: falla si `ASSETS` de `sw.js`
  lista un archivo inexistente, omite un archivo de `src/` o repite rutas.

- [x] 2026-09-27: 🟡 Los 2 `confirm()` nativos ("¿Confirmar equipos?" y
  "¿Desean finalizar esta ronda?") se reemplazaron por `showConfirm()`
  en `modals.js`, con el estilo del juego.

- [x] 2026-09-27: 🔴 Token de GitHub sin permiso `workflow`: el usuario creó
  un token nuevo (`repo` + `workflow`) y se borró la credencial vieja.
- [x] 2026-09-27: 🔴 Primera ejecución de GitHub Actions
  ([run 36349478749](https://github.com/maxy26/Musical-showdown/actions/runs/36349478749)):
  pruebas, Windows, Linux y Android terminaron bien. Archivos generados:
  `.exe` (75 MB), `.AppImage` (108 MB) y `.apk` (5 MB).

- [x] 2026-09-27: 🔴 Compilación de Windows: con el Modo de desarrollador
  activado, `build:desktop` funciona.
- [x] 2026-09-27: 🟡 Windows en un solo archivo: `dist/windows/` tiene solo
  `Musical Showdown.exe` (75 MB), que abre bien con doble clic.
- [x] 2026-09-27: 🟡 Versión de Linux configurada (`npm run build:linux`,
  AppImage). Se compila en GitHub Actions; falta probarla en un equipo real.
- [x] 2026-09-27: 🟢 GitHub Actions configurado: compila las 3 plataformas.

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

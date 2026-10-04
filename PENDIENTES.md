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

- [ ] 🟡 **Sonidos nuevos, más profesionales y envolventes** (pedido del
  usuario, 01-10-2026). Cambiar los sonidos actuales (música de fondo, clic,
  tic-tac) por unos mejores y más acordes al juego. Por ahora le interesa una
  **melodía muy parecida a la de los juegos de Nintendo** (alegre, tipo
  chiptune/8 bits). Hoy no hay efectos especiales (acierto, fallo, victoria):
  proponerlos también. Antes de hacerlo: preguntar si los sonidos deben ser
  sintetizados (regla de INSTRUCCIONES) o archivos, mostrar opciones para que
  elija y cuidar que sean de uso libre (no copiar melodías de Nintendo).
- [ ] 🟡 **Letras del rediseño sin internet.** Fredoka y Nunito (igual que
  Unbounded e Inter) se cargan desde Google Fonts. En el `.exe` o el `.apk` sin
  conexión se ven con una letra genérica. Solución: incluir los archivos de las
  letras en `src/` (son de licencia libre OFL) y agregarlos a `sw.js`.
  Preguntar al usuario antes.
- [ ] 🟡 **Notificaciones sin fuente de avisos.** La campana abre un panel que
  por ahora dice "No hay notificaciones". Para mostrar actualizaciones,
  promoción y avisos hace falta decidir de dónde salen (un archivo en internet,
  la página de Releases de GitHub, etc.). Preguntar al usuario.

- [ ] 🟡 **Botón para que los jugadores pidan cantar** (anotado por el usuario,
  30-09-2026). Hoy no hay forma de que los jugadores presionen un botón para
  pedir el turno: el moderador toca el nombre de quien va a responder. Por eso
  la velocidad del MVP se mide hasta que el moderador toca ese botón. Definir
  con el usuario si quiere un "pulsador" para los jugadores y cómo funcionaría.

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

- [ ] 🟢 **Empate al llegar al objetivo por la penalización del relevo.** Con
  la penalización en vivo, al terminar la ronda dos equipos podrían pasar el
  objetivo. Se programó que gana el que tiene más puntos; si quedan con los
  mismos puntos, hoy gana el primero de la lista. Preguntar al usuario qué
  debe pasar en ese empate exacto (desempate, ronda extra, ganan los dos…).

> No inventar reglas: preguntar antes (instrucción 21).

> El usuario pidió ir **con calma, paso a paso y a fondo**: definir cada idea
> por completo con preguntas antes de programarla.

- [ ] 🟡 **Revisar y modificar Clásico** (pedido del usuario, 30-09-2026): darle
  un resumen de cómo funciona hoy Clásico y luego modificarlo según lo que decida.

- [ ] 🟡 **Botón de ayuda en cada opción** (pedido del usuario, 03-10-2026).
  Poner un pequeño botón de ayuda junto a cada opción de la configuración (tiempo,
  multiplicadores, intentos, cuánto resta el perdedor, etc.) que explique cómo
  funciona esa opción en particular. La idea es que reemplace a la ayuda general
  de arriba a la derecha (❓), para que sea más directo y simple de leer. El
  usuario quiere verlo más adelante: antes de hacerlo, preguntarle el diseño y
  si se quita la ayuda general.
- [ ] 🟡 **Actualizar la ayuda "Cómo se juega"** (pedido del usuario,
  29-09-2026). Hoy describe solo la ronda clásica. Debe explicar lo nuevo:
  equipos múltiples y sus nombres, los modos (Clásico, Alternativo 1 y 2, con
  sus reglas cuando estén definidas), el selector de rueda del valor
  personalizado y cómo mover e intercambiar jugadores. Conviene hacerlo al
  terminar de definir Alternativo 1 y 2.

---

## ✅ Resueltos

- [x] 🔴 **(Resuelto 04-10-2026)** **Programar las reglas de Alternativo 2** (definidas por el usuario el
  03-10-2026; detalle en CONTEXTO, sección 3). "El perdedor resta" tiene dos
  opciones: "No resta" / "Sí, resta lo mismo que gana el otro" (opción a,
  03-10-2026). Textos aprobados (ver CONTEXTO). Antes de programar, mostrarle
  una maqueta de las opciones en "Configurar partida".
  → Programado con el relevo comodín configurable (total 0 a 7 y máximo por
    ronda) y la penalización nueva del relevo de más. Configuración en filas
    compactas para los tres modos.

- [x] 🔴 **(Resuelto 04-10-2026)** **Alternativo 1: multiplicadores siempre activos** (usuario,
  03-10-2026). Quitar el selector "Con / Sin multiplicadores" de Alternativo 1;
  ese selector queda solo en Alternativo 2. Programarlo junto con Alternativo 2
  y actualizar el manual de modos ("Se pueden usar multiplicadores").

- [x] 🔴 **(Resuelto 01-10-2026)** **El juego se rompe cuando se acaban las canciones** (encontrado el
  01-10-2026 al probar el podio). Cada canción acertada queda bloqueada para
  toda la partida. Cuando ya no quedan canciones de los géneros elegidos, el
  juego no tiene palabra para la siguiente ronda y la pantalla de la ronda se
  rompe (`r.word` es `null`). Con la base de ejemplo pasa rápido: Pop tiene 4
  canciones, así que se rompe después de 4 aciertos. Preguntarle al usuario qué
  debe pasar: ¿terminar la partida, liberar las canciones ya usadas, avisar y
  pedir más géneros…?
  → Decisión del usuario: las canciones ya no se bloquean; una ya cantada se
    puede volver a elegir (commit 9771708).

- [x] 🔴 **(Resuelto 01-10-2026)** **CRÍTICO — Experimentar con un diseño general nuevo de la aplicación**
  (pedido del usuario, 01-10-2026). Quiere intentar modificar o experimentar el
  diseño de toda la app. Antes de tocar nada: preguntarle qué le gustaría
  cambiar o qué estilo busca, y proponerle maquetas interactivas para comparar,
  como se hizo con la rueda y el selector de multiplicadores.
  - 01-10-2026: le gustan los estilos "show de TV", "moderno y limpio" y "casual
    y divertido". Se conservan el nombre, el ícono y estructuras como la lista
    de nombres y la pausa; cambian colores y letras. Empezar por la **pantalla
    de inicio**.
  - **Experimento 1** (01-10-2026, fuera del proyecto, en la carpeta temporal
    `scratchpad/diseno-inicio`): inicio en modo oscuro con encabezado de botones
    circulares, imagen con el nombre, tarjetas Individual/Grupal, banner con
    cuenta regresiva y accesos rápidos, según una especificación del usuario.
    **No se integra al juego hasta que el usuario elija el diseño final.**
  - ✅ **Estilo aplicado a todas las pantallas** (01-10-2026, aprobado por el
    usuario tras ver la comparación): colores, letras Fredoka/Nunito, botones
    en píldora con sombra, tarjetas y ventanas redondeadas. La estructura de
    cada pantalla no cambió. Sección final de `styles.css`.
  - ✅ **Pantalla de inicio integrada al juego** (01-10-2026, el usuario dio el
    estilo por finalizado): `screens/menu.js`, `modesManual.js`, `sheet.js`,
    `icons.js`, `settings.js`, luces en `index.html` y opción A en
    `config/index.js`.
  - **Decisiones del usuario sobre el inicio** (01-10-2026, ya aplicadas):
    - Estilo: "casual y divertido" con las luces de "show de TV" moviéndose en
      el **fondo**, detrás del contenido, sin estorbar la vista.
    - Sin logo en el inicio: solo el nombre. Sin "Oferta Exclusiva" ni botones
      "Juegos"/"Paquetes".
    - Notificaciones (campana): avisos de actualizaciones, promoción del juego
      y avisos en general.
    - Individual/Grupal: **interruptor** grande con una tarjeta y un botón
      "Jugar" grande (diseño D).
    - Un solo botón **"Modos de juego"**: manual con historietas animadas
      ("a prueba de todo"), datos rápidos, "Ver más" y "Elegir…". Debajo del
      botón, un texto "Modo: Clásico" (Clásico por defecto), sin botón
      "Cambiar".
    - Alternativo 2 solo en Grupal: con Individual no se puede elegir; si se
      cambia a Individual con Alternativo 2 elegido, vuelve a Clásico con un
      aviso.
    - **Opción A:** Individual/Grupal y el modo se eligen **solo en el
      inicio**; se quitan de "Configurar partida". Si en Grupal escriben menos
      de 4 jugadores, se les avisa, pero **no** se les devuelve al inicio.
    - Toda ventana emergente con información lleva una **X para cerrar en la
      esquina superior derecha**, también en el celular. De las ventanas con
      decisión, **solo la pausa** (la X = "Continuar"). Ya está en el juego
      actual desde el 01-10-2026 (ayuda, avisos y pausa); mantenerlo en el
      rediseño.
    - Animaciones **siempre encendidas** aunque Windows o el celular pidan
      reducir el movimiento (en la PC del usuario, Windows tiene apagados los
      "Efectos de animación"), con un interruptor **Ajustes → Animaciones: Sí /
      No** en la tuerca del inicio (opción C, 01-10-2026).
  → Inicio nuevo y estilo en todas las pantallas programados (commits
    2e6f8ad y 9586816). Lo que sigue va en pendientes aparte: sonidos nuevos,
    letras sin internet y fuente de las notificaciones.

- [x] 🔴 **(Resuelto 01-10-2026)** **Ideas nuevas de Alternativo 1** (decididas el 29-09-2026, opción A;
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
     - ✅ **El relevo quedó definido (30-09-2026) y programado (01-10-2026).**
  1b. ✅ **Intentos por ronda — programado el 30-09-2026** (contradicción resuelta por el usuario):
     - **Clásico** (Individual y Grupal): **un solo intento** por jugador o
       equipo. Si los dos fallan, la ronda **termina de inmediato** con 0 para
       ambos.
     - **Alternativo 1** (Individual y Grupal): **intentos ilimitados**, como
       hoy, hasta que alguien acierte o se acabe el tiempo; sin aciertos, 0 para
       ambos.
  2. ✅ **Puntos de Alternativo 1 — programado el 01-10-2026** (confirmado por el usuario el 30-09-2026):
     - Los intentos fallidos **no restan durante la ronda**. Al terminar:
       - el que acierta **suma** el valor de la ronda (100 × multiplicador);
       - el que pierde la ronda **resta ese mismo valor**, **siempre**, aunque no
         haya intentado (con ×2: +200 y −200);
       - si **nadie acierta** (se acaba el tiempo), **ambos restan la mitad**
         (con ×3: −150 cada uno). Reemplaza el "0 para ambos" de antes.
     - La penalización del relevo **no cambia** (−la mitad para el que lo usó
       sin tener, + el valor completo para el otro), porque el motivo es otro.
     - **No hay bonos.** Los **multiplicadores** son **solo para Alternativo 1**,
       con un interruptor que el usuario activa o desactiva. **Diseño elegido
       (30-09-2026, tras una maqueta con 3 opciones): B, selector de dos
       opciones** — dos botones unidos "✨ Con multiplicadores | Sin
       multiplicadores", con el elegido resaltado en dorado y una nota debajo
       ("Pueden salir ×2, ×3, ×4 o ×5 en cualquier ronda" / "Todas las rondas
       valen 100 puntos"). En Clásico el selector desaparece.
     - Igual en Individual y en Grupal.
  2c. ✅ **Fin de la partida y podio — programado el 01-10-2026** (usuario, 30-09-2026):
     - Gana el **primero que llega al puntaje objetivo** (positivo). Los puntajes
       negativos **no tienen límite** y nadie queda eliminado.
     - Ejemplo del usuario: objetivo 500; María 250 y Carlos 400; Carlos gana la
       ronda (sin multiplicador): Carlos 500 → **gana**; María −100 → 150.
     - Al final se muestra un **podio de los 3 mejores** con nombres y puntos
       (Individual). En **Grupal**, el podio de los 3 mejores grupos muestra
       además el **MVP de cada grupo**.
     - El podio va en **todos los modos**, y se mantiene el botón **"Ver más"**
       con la lista de **todos los demás** (del 4.º en adelante). Con solo 2
       participantes, el podio tiene 2 puestos. En caso de **empate**, los
       empatados **comparten el puesto**. (Confirmado el 30-09-2026.)
     - **MVP** (usuario, 30-09-2026): opción a), **el que más puntos le aportó a
       su grupo** (lo que ganó cuando cantó menos lo que perdió en sus rondas),
       teniendo en cuenta además **la velocidad** con que respondió ("el que
       adivinó en un segundo se lo merece más que el que respondió al final").
       Confirmado: la velocidad **solo desempata** (primero los puntos aportados;
       si empatan, el que respondió más rápido en promedio) y **afecta solo al
       MVP**, no a los puntos del juego. Se mide **desde que aparece la palabra
       hasta que se toca el botón del jugador o equipo para responder**; hoy ese
       botón lo toca el moderador (ver el pendiente del "botón para pedir cantar").
  2b. **Tiempo** (aclarado por el usuario, 30-09-2026):
     - **Clásico no tiene selector de tiempo por ronda**, porque es a un solo
       intento. Las rondas van **sin reloj**: duran hasta que alguien acierta,
       los dos fallan, o el moderador toca **"Finalizar ronda"** (como hoy con
       "Sin tiempo"). Confirmado el 30-09-2026.
     - **Alternativo 1 sí tiene selector de tiempo** (intentos ilimitados), pero
       **no permite "Sin tiempo"**.
  3. ✅ **Tiempo / fin de la partida:** respondido en 2b (tiempo obligatorio,
     sin "Sin tiempo") y 2c (gana el primero que llega al objetivo).
  4. ✅ **Individual:** todo aplica igual salvo el relevo, que es solo Grupal.

- [x] 2026-10-01: 🔴 **El juego se rompía al acabarse las canciones.** Ya no
  puede pasar: por decisión del usuario, **las canciones ya no se bloquean**
  (se puede volver a cantar una canción ya dicha) y desaparece la marca "(ya
  utilizada)" del buscador. Probado con 12 rondas seguidas con Pop (4 canciones).

- [x] 2026-10-01: **Relevo** (parte 4, solo Alternativo 1 – Grupal): 3 símbolos
  con los relevos de cada equipo, botón "Relevo" (pausa sola, lista de
  compañeros, confirmar; 1 por equipo y por ronda, antes de responder), botón
  "±" para agregar o quitar (sin máximo, mínimo 0) y penalización si lo usan
  sin tener (−la mitad para ellos y el valor completo para el otro, con aviso
  previo). Con esto **el paquete de Alternativo 1 quedó completo**. El usuario
  confirmó el aviso y la pausa del "±". **Ajuste del 01-10-2026:** 3 relevos es el
  **máximo estricto** por partida (el "±" no deja pasar de 3), y el aviso del
  4.º relevo dice exactamente a qué se someten, con los puntos de esa ronda.

- [x] 2026-10-01: **Podio y MVP** (parte 3), en todos los modos: ganador, podio
  de los 3 mejores puestos (empatados en el mismo puesto), MVP de cada equipo en
  Grupal (más puntos aportados; si empatan, el más rápido en promedio) y "Ver
  más" con el resto. El usuario confirmó los puestos con empate **1, 2, 2, 3** y
  que "Ver más" no aparece cuando todos están en el podio (también con menos de
  3, en Individual y en Grupal).

- [x] 2026-10-01: **Puntos de Alternativo 1** (parte 2): el que acierta suma el
  valor de la ronda y el que pierde lo resta; si se acaba el tiempo sin aciertos,
  los dos restan la mitad. Puntajes negativos en rojo con brillo, en la ronda, en
  el resultado y en la lista final. Clásico sigue igual: el que acierta suma y
  nadie resta.

- [x] 2026-10-01: **Configuración por modo** (parte 1 del paquete de Alternativo 1):
  Clásico sin reloj ni multiplicadores; Alternativo 1 con tiempo obligatorio (sin
  "Sin tiempo"; si estaba elegido queda en 30 seg) y el selector "Con / Sin
  multiplicadores" (diseño B). Alternativo 2, sin reglas propias, queda como
  antes. En Clásico el espacio del tiempo queda **vacío** (el usuario no quiso la
  nota). El usuario confirmó los **30 seg** al pasar de "Sin tiempo" a
  Alternativo 1.

- [x] 2026-09-30: **Un solo intento por ronda en Clásico** (Individual y Grupal): el
  lado que falla queda apagado ("Ya usó su intento") y si los dos fallan la ronda
  termina de inmediato con 0 para ambos. Alternativo 1 sigue con intentos
  ilimitados. Alternativo 2, sin reglas propias todavía, también sin límite.

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

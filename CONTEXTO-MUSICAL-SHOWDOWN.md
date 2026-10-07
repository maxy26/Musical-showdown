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
- **Individual**: duelos 1 vs 1 entre jugadores.
- **Grupal**: los jugadores se reparten en **2 o más grupos** y los duelos
  son 1 vs 1 entre representantes de **grupos distintos** (nunca del mismo
  grupo). El puntaje es **del grupo**. Requiere **4 o más jugadores
  escritos** para empezar. Desde el 01-10-2026 se elige en el inicio
  (antes de escribir los nombres); si al confirmar hay menos de 4, se avisa
  y no se puede empezar hasta agregar jugadores.

### Modos de juego
- Disponibilidad: si el tipo de batalla es **Individual**, solo se
  muestran Clásico y Alternativo 1 (Alternativo 2 no aparece). Si es
  **Grupal**, se muestran los tres modos, todos libres de seleccionar
  (sin candado).
- **Resumen de los tres modos** (usuario, 03-10-2026). En los tres gana el
  primero que llega al puntaje objetivo. El valor de la ronda es siempre
  **100 × el multiplicador** de la ronda (×1 si no salió ninguno).
  - **Clásico** (Individual y Grupal): duelos al azar (con la ventaja de
    Clásico), sin reloj, un solo intento, sin multiplicadores, el perdedor no
    resta.
  - **Alternativo 1** (Individual y Grupal): duelos en orden (Individual:
    primero contra último; Grupal: G1-1 contra G3-1…), reloj obligatorio,
    intentos ilimitados, **multiplicadores siempre activos** (desde el
    03-10-2026 no se pueden desactivar; en cada ronda puede salir ×2 a ×5),
    el perdedor resta el valor de la ronda, si nadie acierta los dos restan la
    mitad, relevo en Grupal.
  - **Alternativo 2** (solo Grupal; reglas definidas el 03-10-2026 y
    programadas el 04-10-2026):
    - **Emparejamiento:** los equipos se emparejan al azar con las reglas de
      Clásico (fases al azar / con ventaja, equilibrio de partidos); los
      jugadores de cada equipo salen en orden como en Alternativo 1 (el que
      menos ha cantado; el rival es el siguiente del otro equipo con quien aún
      no se enfrentó).
    - **Opciones que se eligen en "Configurar partida"** (una fila por
      opción con Sí / No o − N +; en negrita el valor de entrada):
      - ⏱️ Tiempo por ronda: **30 segundos** · otros tiempos · Sin tiempo.
      - ✨ Multiplicadores: **Sí, pueden salir ×2 a ×5** · No, todas las
        rondas valen 100.
      - 🎯 Intentos de cada jugador (el que representa a su equipo en la
        ronda): de 1 a 10 (**5**).
      - 😢 ¿El que pierde la ronda resta puntos?: **No resta** · Sí, resta lo
        mismo que gana el otro.
      - ⌛ Si nadie acierta: **Nadie resta** · Los dos restan la mitad.
      - 🔁 Relevos por equipo: **3 en total · 1 por ronda**, se cambia en una
        ventanita (ver "Relevo" abajo).
    - **Puntos:** ejemplo del usuario: ronda ×3 → el ganador +300 y, si se
      eligió que el perdedor resta, el perdedor −300; si nadie acierta y se
      eligió que resten, los dos −150. Primero se calcula 100 × multiplicador
      y luego se suma o resta.
    - **La ronda termina** cuando alguien acierta, cuando los dos agotan sus
      intentos, cuando se acaba el tiempo (con reloj) o cuando el moderador
      toca "Finalizar ronda" (sin reloj).
    - **Relevo (cambiado por el usuario el 03-10-2026; solo Alternativo 2):**
      - Se configura en una ventanita desde "Configurar partida": relevos **en
        total** (0 a 7) y **como máximo por ronda** (1 hasta
        los intentos). Valor de entrada: 3 en total y 1 por ronda. Alternativo 1
        sigue con 3 fijos y 1 por ronda.
      - **Con 0 en total** (04-10-2026, para que funcione como Alternativo 1 sin
        relevos): el botón sigue y **todos** los relevos son de más (aviso y
        penalización). En la ronda dice "0 · con penalización".
      - **Conteo (usuario, 04-10-2026):** el total cuenta las **rondas** en que
        se usan relevos. Apenas se usa el primero de la ronda se descuenta 1 del
        total; en esa ronda se pueden usar los que faltan hasta el máximo por
        ronda sin descontar más. En la ronda siguiente el máximo se restaura si
        quedan en el total. Ejemplo del usuario: 5 en total y 3 por ronda; usa
        2 en una ronda → queda 4 en total (y 1 más en esa ronda). En la ronda
        se muestra "Ronda: N" con los que quedan en esa ronda.
      - Funciona como el comodín de llamada de "¿Quién quiere ser
        millonario?": Ana le pasa el turno a Carlos, Carlos responde; si se
        equivoca, el turno **vuelve a Ana**, que puede pedir otro relevo.
      - Cada relevo **gasta un relevo y un intento**. Ejemplo del usuario: con
        5 intentos y 4 relevos por ronda, si usa los 4 relevos le queda 1
        intento sin relevo.
      - **Relevo de más** (pasarse del máximo por ronda o del total; cambiado
        por el usuario el 03-10-2026): el botón se puede presionar, se **avisa
        antes la consecuencia** y el relevo **sí se aplica** (el compañero
        responde y gasta un intento). Cada vez que se usa uno de más, **en ese
        momento** el equipo resta **la mitad del valor de la ronda** y el
        rival suma **esa misma mitad** (no el valor completo). La ronda **no
        termina**. Se aplica aunque se haya elegido que el perdedor no resta.
        Si se le acaban los relevos pero tiene intentos, Ana puede seguir
        respondiendo ella o usar relevos de más con esta penalización.
        Después del relevo de más la ronda sigue normal: si el compañero
        acierta, el equipo suma lo que corresponde; si falla, el rival todavía
        puede acertar y sumar. Antes de cada relevo de más sale un aviso con
        los puntos exactos y hay que confirmarlo.
      - Pasarse del máximo por ronda **se sigue penalizando** aunque queden
        relevos en el total (confirmado por el usuario el 04-10-2026; se
        descartó que gastara otro del total en su lugar).
      - Un relevo de más por pasarse del **máximo por ronda** **no gasta**
        del total (ya se pagó con puntos). Ejemplo: 3 en total y 1 por ronda;
        si en una ronda usa 2, le quedan 2 para el resto de la partida.
      - **Ganar con puntos de penalización:** si esos puntos hacen que el
        rival llegue al objetivo a mitad de ronda, se suman en ese momento,
        pero el ganador se declara **al terminar la ronda**.
      - **Cuándo:** en cualquier turno de Ana mientras le queden intentos (y
        relevos): puede responder ella, fallar y en el turno siguiente llamar
        a un compañero. Puede llamar a **cualquier compañero**, aunque ya lo
        haya llamado en esa ronda.
        Si el compañero llamado **todavía no respondió**, se puede llamar a otro
        en su lugar (usuario, 04-10-2026, opción a): el primero no gastó
        intento y el nuevo relevo cuenta para el máximo por ronda (o se
        penaliza si se pasa).
      - **Si el compañero acierta:** el equipo suma los puntos de la ronda; para
        el **MVP**, el aporte es de **quien cantó** (el compañero). Para los
        turnos, el que jugó el duelo es **Ana** (la representante); los
        compañeros que ayudaron no pierden su turno.
      - **Máximo por ronda ≤ intentos:** en la ventanita, el máximo de relevos
        por ronda no puede pasar de la cantidad de intentos elegida.
      - **Reloj:** se pausa mientras se elige a quién llamar y sigue con el
        mismo tiempo al confirmar.
- **Ideas nuevas para Alternativo 1** (decisión del usuario, 29-09-2026,
  opción A): los cambios en la **forma de jugar**, los **puntos** (ej. restar
  al fallar, bonos), el **tiempo / fin de la partida** y el **relevo** se
  agregan a **Alternativo 1**, y Alternativo 2 combina ese Alternativo 1 nuevo
  con Clásico. El **relevo** es **solo para Alternativo 1 Grupal** (en
  Individual no hay con quién turnarse). Los detalles de cada idea se definen
  con el usuario paso a paso, a fondo y sin asumir nada (ver `PENDIENTES.md`).
- **Intentos por ronda** (definido por el usuario el 30-09-2026):
  - **Clásico** (Individual y Grupal): **un solo intento** por jugador o equipo
    en cada ronda. Si el primero falla, el otro todavía puede intentarlo. Si los
    dos fallan, la ronda **termina de inmediato** con 0 para ambos.
  - **Alternativo 1** (Individual y Grupal): **intentos ilimitados** hasta que
    alguien acierte o se acabe el tiempo; sin aciertos, 0 para ambos.
- **Relevo** (solo Alternativo 1 Grupal; definido por el usuario el 29 y
  30-09-2026; programado el 01-10-2026 en `relay.js` y `screens/relayModals.js`):
  - Comodín: **3 por equipo para toda la partida**, sin recuperarse; como mucho
    **1 por ronda**.
  - Se pide **antes de responder**. Al presionar "Relevo" el reloj **se pausa
    solo**, el jugador **elige en una lista** a cualquier compañero de su equipo
    y **confirma**; la ronda sigue con el **mismo tiempo**.
  - El duelo pasa a ser con el que entró ("Ana vs Carlos" → "María vs Carlos").
    Para los emparejamientos cuenta María vs Carlos. El que pidió el relevo
    **no** cuenta como que cantó; el que entró, **sí**.
  - Si el que entró falla, **sigue intentando él** hasta que se acabe el tiempo
    (intentos ilimitados). Si acierta, el equipo suma normal (100 × multiplicador).
  - Después de que un equipo falla, el otro **también** puede usar su relevo.
  - **Usar un relevo que ya no tienen** (regla cambiada por el usuario el
    03-10-2026, igual que en Alternativo 2): el botón se puede presionar, se
    avisa antes y el relevo **sí se aplica**. En ese momento el equipo resta
    **la mitad del valor de la ronda** y el rival suma **esa misma mitad** (con
    ×2: −100 y +100). La ronda **no termina**: si el que entró acierta, suma
    normal; si no, el rival todavía puede acertar. Si esos puntos hacen llegar
    al rival al objetivo, el ganador se declara al terminar la ronda.
    *(Antes: la ronda se perdía y el otro equipo sumaba el valor completo.)*
  - En la pantalla de la ronda: **3 símbolos** con los relevos que le quedan a
    cada equipo y, al lado, un botón **"±"** para agregar o quitar relevos con
    confirmación. **3 es el máximo estricto** por partida (decisión del usuario,
    01-10-2026, en lugar de "sin máximo"); no baja de 0.
  - **2.º relevo en la misma ronda** (usuario, 03-10-2026, igual que en
    Alternativo 2): el botón se puede presionar, con aviso, y se penaliza igual
    que el relevo de más (−la mitad / +la mitad, la ronda sigue). No gasta del
    total.
  - **Relevo prohibido (el 4.º):** antes de confirmar aparece un aviso con lo
    que pierden, con los puntos exactos de esa ronda.
  - **Puntos negativos** permitidos, mostrados en **rojo bien visible**.

### Emparejamientos de Clásico y Alternativo 1 (definidos por el usuario el 28-09-2026)

> Estado: **Alternativo 1 y Clásico implementados** el 29-09-2026
> (`src/js/pairing.js`). Alternativo 2, mientras no tenga reglas, usa las de
> Clásico.

**Comunes a los dos modos**
- Cada **ronda es un duelo** 1 vs 1, con su propia palabra.
- Gana quien llega primero al **puntaje objetivo**. Si se completa el orden
  de duelos sin ganador, **el ciclo se repite**.
- **Equilibrio de partidos**, como en una tabla de fútbol: siempre tienen
  prioridad los que llevan menos duelos, para que todos terminen con la
  misma cantidad de partidos o casi. Esta regla **manda sobre todas las demás**.

**Clásico – Individual** (sorteo por fases)
1. Los **3 primeros duelos: al azar**.
2. Si hay **desequilibrio** de puntos: **3 duelos con ventaja → 3 al azar →
   3 con ventaja → …**
3. En cuanto hay **equilibrio**, se corta la fase en ese momento y queda
   **solo al azar**. Si reaparece el desequilibrio, empieza **de inmediato**
   la ventaja.
- **Equilibrio:** todos los jugadores tienen al menos el **60 % del
  promedio** de puntos (como "aprobar" con 3.0 sobre 5.0). Ejemplo: si el
  promedio es 1000, hay equilibrio cuando nadie tiene menos de 600.
- **Duelo con ventaja:** uno de los dos sale de entre los que están **por
  debajo del promedio**, con más probabilidad **cuanto más lejos del
  promedio** estén (no está garantizado). Su rival sale **al azar** entre
  los que están en el promedio o por encima.
- La ventaja y el azar solo eligen entre los que llevan **menos duelos**.
- **No se repite el mismo duelo dos veces seguidas**, salvo que esos
  jugadores ya se hayan enfrentado con todos los demás. "Con todos" se cuenta
  **por vuelta** (decisión del usuario, 29-09-2026): cuando todos se
  enfrentaron con todos, la cuenta empieza de nuevo. Si no hay otra opción
  (por ejemplo, solo 2 participantes), sí se repite.

**Clásico – Grupal**
- Igual que Clásico Individual, pero **entre grupos**: mismas fases,
  ventaja para los grupos por debajo del promedio y equilibrio de
  partidos entre grupos.
- El **jugador que representa al grupo** sale **al azar** entre los
  compañeros que **menos han participado**.

**Alternativo 1 – Individual** (orden fijo, sin ventaja)
- **Primero contra último**, y luego rota: el jugador 1 queda fijo y los
  demás giran una posición en cada tanda, como en los torneos. Con 10
  jugadores:
  - Tanda 1: 1v10, 2v9, 3v8, 4v7, 5v6
  - Tanda 2: 1v9, 10v8, 2v7, 3v6, 4v5
  - …hasta que todos se enfrentan con todos (con 10 jugadores: 9 tandas
    y 45 duelos). Después el ciclo se repite.
- Con número **impar**, descansa uno distinto en cada tanda (con 9
  jugadores, en la tanda 1 descansa el 5).
- **Sin ventaja** para los que van perdiendo.
- El número de cada jugador es el orden en que se escribió su nombre en
  la configuración.

**Alternativo 1 – Grupal** (orden fijo, sin ventaja)
- **Orden de los grupos:**
  - **2 grupos:** siempre G1 vs G2.
  - **3 grupos:** G1 vs G3 → G1 vs G2 → G2 vs G3, y se repite.
  - **4 o más grupos:** primero contra último y luego rota, igual que en
    Alternativo 1 Individual. Con 4 grupos: G1vG4, G2vG3 · G1vG3, G4vG2 ·
    G1vG2, G3vG4.
- **Jugadores:** dentro de cada grupo se turnan en orden (sale el que menos
  ha jugado), y el rival es el siguiente del otro grupo **con quien todavía
  no se haya enfrentado**. Con el tiempo, cada jugador se enfrenta a todos
  los de los otros grupos.
  - Ejemplo con G1 = A, B, C; G2 = D, E, F; G3 = G, H, I, J: A–G, B–D, E–H,
    C–I, A–F, D–J, B–G, C–E…
  - Las 33 parejas posibles se completan en el duelo 45.
- El número de cada jugador es su orden dentro de la tarjeta de su grupo;
  el de cada grupo, el orden de las tarjetas.

### Logo (04-10-2026)
- El usuario eligió **"3D premium"**: el logo de siempre (círculo con degradado
  azul-violeta → rosa, ecualizador de cuadritos rosa y turquesa, nota doble rosa
  con rayas turquesa) mejorado con volumen, reflejo, destellos y borde
  brillante. Está en `src/icons/`, en los íconos y pantallas de carga de
  Android (fondo azul marino `#141833`) y en `platforms/desktop/build-icon.ico`.

### Pantalla de inicio (rediseño del 01-10-2026)
- Estilo "casual y divertido" con **luces de show** moviéndose en el fondo de
  todas las pantallas. Solo el nombre (sin logo).
- Encabezado: tuerca (Ajustes → **Animaciones: Sí / No**, encendidas por
  defecto aunque el sistema pida reducir el movimiento), campana
  (notificaciones; todavía sin avisos) y "?" (ayuda).
- **Tipo de batalla y modo se eligen aquí** (opción A del usuario):
  interruptor Individual | Grupal con un botón "Jugar", y "Modos de juego"
  (manual con historietas animadas, "Ver más" y "Elegir…"). Debajo, "Modo:
  Clásico" (por defecto). Alternativo 2 solo en Grupal: al pasar a
  Individual vuelve a Clásico con un aviso; y si se elige Alternativo 2 estando
  en Individual, el juego pasa a Grupal con un aviso (usuario, 04-10-2026).
- En el manual, el modo se elige tocando **la tarjeta completa** o el botón; se
  empieza a jugar tocando **la tarjeta grande** (Individual o Grupal) o
  "Jugar" (04-10-2026).

### Configuración de partida
- En una sola pantalla: jugadores, géneros, puntaje objetivo, tiempo por
  ronda y multiplicadores. El tipo de batalla y el modo vienen del inicio y
  aquí solo se muestran en un resumen. En Grupal con menos de 4 jugadores
  se avisa al confirmar y se queda en esta pantalla (no se cambia a
  Individual ni se vuelve al inicio). Se bloquea al iniciar la partida.
- **Espacios de jugador al empezar** (04-10-2026): 2 en Individual y **4 en
  Grupal**; esos primeros espacios no se pueden borrar.
- **Jugadores**: campos con placeholder "Jugador N" (no un valor
  precargado que haya que borrar). Mientras se escribe, **la primera letra
  de cada palabra pasa a mayúscula y el resto a minúscula**, sin importar
  cómo se escriba ("mIKE rUIZ" → "Mike Ruiz"). Así lo pidió el usuario el
  28-09-2026, en lugar de las MAYÚSCULAS de antes, y es igual para los
  nombres de grupos. Máximo **20 letras**.
- **Nombres repetidos no permitidos** (28-09-2026): los campos repetidos se
  marcan en rojo, aparece un mensaje de error antes del botón "Añadir
  jugador" y no se puede confirmar la configuración hasta corregirlo. Se
  comparan sin espacios sobrantes; con y sin tilde cuentan como distintos
  ("Ángel" ≠ "Angel"). Los primeros 2
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
  entre 100 y 9900).
- **Selector de rueda para el valor personalizado** (28-09-2026, pedido por
  el usuario; reemplaza a las cajas con flechas descritas arriba): al elegir
  "Personalizado…" en el puntaje o en el tiempo se abre una ventana con una
  **rueda** de valores, como las de los relojes y alarmas del teléfono. El
  valor elegido queda al centro, resaltado, y los vecinos se ven tenues.
  - **Android:** se desliza con el dedo; si se lanza rápido, sigue girando
    y se detiene justo en un valor. Tocar un valor visible lo lleva al centro.
  - **PC:** flechas ↑ ↓ del teclado (también RePág/AvPág, Inicio/Fin, la
    rueda del mouse o arrastrar).
  - Bajo la rueda se lee el valor completo ("2300 puntos", "1 min 25 seg").
  - **Enter** o **"Listo"** confirman; **Esc** o **"Cancelar"** salen sin
    cambios.
  - Al confirmar, el valor ocupa el lugar de los predeterminados en la lista
    (ej. "3500 pts" o "1 min 40 seg"). Si coincide con uno predeterminado,
    se selecciona ese.
  - Reglas: puntaje de 100 a 9900, de 100 en 100; tiempo de 5 seg a 2 min, de
    5 en 5.
- **Tiempo por ronda**: lista desplegable de 5 en 5 segundos hasta 60
  ("1 min"), más "Sin tiempo", más "Personalizado". En personalizado
  hay dos cajas (minutos 0–2, segundos 0–55 de 5 en 5), mismo patrón de
  flechas + escribir + Enter. Al llegar a 2 minutos, los segundos se
  bloquean en 0 con un aviso ("el tiempo máximo por ronda es de 2
  minutos"); por debajo de 2 min quedan libres. El mínimo es 5 segundos
  (0:00 sería "Sin tiempo", que ya es otra opción).
- **Multiplicadores**: son exactamente 4, fijos (×2, ×3, ×4, ×5), y se
  activan/desactivan **todos juntos** con el selector de dos opciones "✨ Con
  multiplicadores | Sin multiplicadores" (diseño elegido por el usuario el
  30-09-2026). **Solo aparecen en Alternativo 1** (y por ahora en
  Alternativo 2); en **Clásico no hay multiplicadores**.
- **Tiempo por ronda según el modo** (30-09-2026): en **Clásico no hay
  reloj** (en su lugar, una nota lo explica); en **Alternativo 1** el tiempo
  es obligatorio y no existe "Sin tiempo" (si estaba elegido, al pasar a
  Alternativo 1 queda en 30 seg).
- **Puntos de Alternativo 1** (usuario, 30-09-2026; programado el 01-10-2026):
  el que acierta suma el valor de la ronda y **el que pierde la ronda resta ese
  mismo valor**, siempre; si nadie acierta, **los dos restan la mitad**. Los
  puntajes pueden quedar negativos, sin límite, y se muestran en **rojo**.
- Sin multiplicador, cada acierto suma **100 puntos** (ese es el valor
  base; con multiplicador se multiplica por él).

### Organización de grupos (modo Grupal)
- Pantalla aparte tras confirmar la configuración. Una tarjeta por grupo,
  numeración desde 1 en cada grupo.
- **Cantidad de grupos** (definido el 28-09-2026; por implementar): una
  **lista desplegable en esta misma pantalla**, que solo ofrece opciones
  válidas: de **2** hasta **la mitad de los jugadores**, porque cada grupo
  necesita 2 o más (10 jugadores → de 2 a 5; 7 jugadores → de 2 a 3). La
  lista empieza en **2**. **Cambiar la cantidad reinicia todo:** nuevo reparto
  al azar y nombres predeterminados, manteniendo "Equipos" o "Grupos" según
  lo elegido.
- **Colores:** cada grupo tiene su color (rosa, verde, dorado, azul, naranja;
  se repiten desde el sexto), el mismo en "Organizar" y en la ronda.
- **Reparto inicial al azar**, con los jugadores que sobran en los
  **últimos** grupos (10 jugadores en 3 grupos → 3, 3 y 4).
- **Nombres** (definido el 28-09-2026; por implementar):
  - Al lado de la lista de cantidad hay otra lista desplegable para elegir
    si se llaman **"Equipos"** (viene elegida) o **"Grupos"**. Nombres
    predeterminados: "Equipo 1", "Equipo 2"… o "Grupo 1", "Grupo 2"…
  - **Editar un nombre:** se toca el título de la tarjeta, que se convierte en
    un campo para escribir (ej. "Equipo 1" → "Los Fantasmas"). Primera letra
    de cada palabra en mayúscula, igual que los jugadores.
  - Máximo **20 letras**. **No se permiten nombres repetidos**: igual que
    con los jugadores, el campo se marca en rojo con un mensaje y no deja
    continuar hasta cambiarlo. Si se deja vacío, vuelve al predeterminado. Cada grupo sin editar conserva su predeterminado (ej. si
    se renombran 3 de 4, el cuarto sigue siendo "Equipo 4").
  - Cambiar entre "Equipos" y "Grupos" **devuelve todos los nombres** a los
    predeterminados.
  - El nombre elegido se muestra en la ronda, en el marcador y en los
    resultados.
- **Volver a organizar**: redistribuye aleatoriamente sin pedir
  confirmación, manteniendo los tamaños de equipo.
- **Mover e intercambiar jugadores** (definido por el usuario el 28-09-2026):
  - **Intercambiar:** tocar un jugador y luego **a un jugador** de otro
    grupo; esos dos cambian de lugar, sin importar el tamaño de los grupos.
  - **Mover sin intercambiar:** tocar un jugador y luego **el grupo** (la
    tarjeta, fuera de los nombres); el jugador pasa a ese grupo, siempre que
    su grupo quede con **2 o más** jugadores (si no, aparece un aviso).
  - Tocar dos veces al mismo jugador lo desmarca. Tocar el título de un grupo
    siempre abre la edición del nombre (no mueve a nadie).
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
- **Canciones repetidas** (cambiado por el usuario el 01-10-2026): las
  canciones **ya no se bloquean**. Se puede volver a cantar una canción
  aunque ya se haya dicho antes en la partida, y en el buscador cualquier
  canción se puede elegir siempre. (Antes, una canción acertada quedaba
  bloqueada el resto de la partida.) Las palabras de la ronda pueden
  repetirse, como siempre: el usuario decidió no agregar una regla de
  "palabra no repetida".
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
  A su derecha va el botón 🔊/🔇, que solo quita o pone la música (volvió
  el 05-10-2026 con esa función); en la ronda va además la tuerca de Ajustes.

### Resultados y "jugar de nuevo"
- **Podio** (usuario, 30-09-2026; programado el 01-10-2026), en **todos los
  modos**: el ganador arriba, y debajo un podio con los **3 mejores puestos**
  (2.º a la izquierda, 1.º al centro, 3.º a la derecha), con medallas, nombres
  y puntos. Los **empatados comparten el puesto** (1, 2, 2, 3). En **Grupal**,
  cada equipo del podio muestra su **MVP**: el jugador que más puntos le aportó
  (lo que ganó menos lo que perdió cuando cantó); si empatan, el que respondió
  más rápido en promedio (segundos desde que apareció la palabra hasta que se
  tocó su botón, sin contar pausas). "Ver más" muestra a los demás con su
  puesto, y no aparece si todos están en el podio.
- Pantalla final: ganador + puntaje, botón "Ver más" con los puntajes
  del resto, "Jugar de nuevo" (mantiene configuración, reinicia
  puntajes; en grupal vuelve a la pantalla de organizar equipos) y
  "Volver al menú".

## 4. Sonido

Rediseñado entre el 04 y el 07-10-2026: el usuario eligió cada sonido en una
"mesa de sonidos" de prueba. Son **grabaciones CC0** (Kenney y OpenGameArt;
créditos en `src/audio/CREDITOS.txt`). Código: `sound.js` (qué suena en cada
momento), `audio/catalogo.js` (archivos y notas de cada efecto) y
`audio/motor.js` (Web Audio).

- **Música**: "Funky Disco" en el inicio y la configuración; "Coffee Beans" en
  las rondas, en bucle sin corte (se repite justo a los 44 pulsos, con un cruce
  de 0,3 s). Las dos entran con un filtro que se abre y un barrido de subida
  (4 s); cada ronda nueva repite la entrada. En los últimos 5 segundos la música
  se acelera (más rápida y más aguda). En el podio se detiene y suena la
  felicitación. Arranca en el primer toque (los navegadores bloquean el sonido
  hasta que hay una interacción real).
- **Efectos** (enganchados globalmente en `document`, así que los botones
  nuevos suenan solos): clic de botones (también la tarjeta de Jugar, las
  listas, los nombres y, en PC, las filas completas), elegir (modo, tipo de
  batalla, géneros), interruptor (Sí / No, + / −, 🔊), ruleta (cada número),
  abrir / cerrar ventanas (también la ayuda), aviso, acertar / fallar (cuando el
  moderador confirma), relevo de más (el relevo normal suena como un clic),
  fin del tiempo, cuenta antes de la ronda (el final más fuerte) y podio (piano
  con aplausos). El reloj sigue con sus dos tics de siempre.
- **Mismo volumen**: el motor mide cada efecto una vez y lo lleva al mismo
  nivel; los clics, que son golpes muy cortos, se suben más y un limitador
  suave evita que saturen. Cada canción se iguala a un nivel por debajo de los
  efectos. Ningún sonido baja el volumen de otro.
- **Ajustes → Sonido**: música, efectos y reloj se encienden o apagan por
  separado; la música y los efectos tienen barra de volumen (0 = "No"). Se
  recuerdan en el dispositivo (`settings.js`).
- **Ajustes → Partida**: cuenta antes de cada ronda, No o de 3 a 7 segundos
  (por defecto 3). Una capa transparente con el número no deja tocar nada.

## 5. Advertencias y diálogos propios

- Reemplazamos el `alert()` nativo del navegador por una **ventana de
  advertencia propia** (mismo estilo visual del juego: ícono ⚠️,
  mensaje, botón "Aceptar") para: jugadores insuficientes, género no
  seleccionado, equipo lleno, etc.
- **Confirmaciones propias** (27-09-2026): los 2 diálogos que usaban el
  `confirm()` nativo del navegador ("¿Confirmar equipos?" y "¿Desean
  finalizar esta ronda?") ahora usan `showConfirm()` de `modals.js`, con
  el mismo diseño que "¿Salir de la partida?". Ya no queda ningún
  `alert()` ni `confirm()` nativo en el juego.

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

- Reglas de **Alternativo 2** (el usuario lo dejó para después).
- **Implementar** los emparejamientos de Clásico y Alternativo 1, la
  cantidad de grupos y sus nombres (reglas ya definidas en la sección 3;
  hoy el juego todavía tiene 2 equipos fijos y un solo sorteo ponderado).
- Reemplazar la base de canciones local (mock) por una fuente/API real
  de letras, ya decidido el tema legal.

# Instrucciones para trabajar en Musical Showdown

> Convenciones y reglas de trabajo acordadas a lo largo del desarrollo.
> Léase junto con `CONTEXTO-MUSICAL-SHOWDOWN.md` (ese archivo tiene el
> qué; este tiene el cómo).

## Estructura y entregas

1. **`src/` es la única fuente de verdad.** Nunca editar directamente
   `platforms/desktop/www` ni `platforms/android/www` — esas carpetas
   se regeneran solas con `npm run build:desktop` / `build:android`.
   Si hay que cambiar algo del juego, se cambia en `src/` y se
   reconstruye.
2. **Cada entrega debe mantener la estructura de monorepo** descrita en
   `CONTEXTO-MUSICAL-SHOWDOWN.md` (sección 6): `src/`, `platforms/`,
   `build/`, `test/`, `dist/`, `README.md`, `package.json`,
   `eslint.config.mjs`. No volver a la versión anterior de "tres copias
   sueltas en carpetas Web/Windows/Android".
3. Después de tocar `src/`, **siempre correr los dos builds** antes de
   entregar algo (`npm run build:desktop` y `npm run build:android`),
   para que Windows y Android no queden desactualizados respecto a la
   Web.
4. Al tocar el proyecto de Android, **nunca editar a mano**
   `capacitor.settings.gradle` para "arreglar" la ruta de
   `capacitor-android` — eso ya está automatizado en
   `build/build-android.js`. Si el bug reaparece, revisar que ese paso
   del script siga ahí, no parchear el archivo generado directamente.
5. Antes de entregar un `.zip`, verificar (aunque sea con
   `unzip -l`) que estén presentes: `dist/windows/Musical Showdown.exe`,
   `platforms/android/android/capacitor-android/build.gradle` y
   `platforms/android/android/app/src/main/assets/public/bundle.js` —
   son las tres señales de que ambos builds corrieron bien.
6. Excluir siempre `node_modules/` de cualquier `.zip` que se entregue
   (son reinstalables con `npm install`); si hace falta, avisar que hay
   que correr `npm install --prefix platforms/desktop` /
   `--prefix platforms/android` la primera vez.

## Estilo de código

7. Todo el código (comentarios incluidos) va **en español**, salvo
   nombres de variables/funciones en inglés cuando sea lo natural en
   JS (`state`, `render`, `startNextRound`, etc.) — así se ha escrito
   hasta ahora.
8. Mantener los archivos de pantalla (`src/js/screens/*.js`) enfocados
   en una sola responsabilidad. Si un archivo de pantalla crece mucho
   (como pasó con `config.js`, que llegó a 396 líneas), dividirlo en una
   carpeta con un `index.js` orquestador + módulos chicos, como se hizo
   con `screens/config/`. No dejar que un archivo se vuelva un cajón de
   sastre.
9. Evitar efectos secundarios en el nivel superior de un módulo
   (`localStorage`, `new Audio()`, `document.querySelector` fuera de una
   función) — así el módulo se puede importar de forma segura desde
   Node para pruebas o herramientas de build. Ver `sound.js` como
   ejemplo del patrón (inicialización perezosa).
10. Los diálogos de confirmación/aviso deben usar los componentes
    propios del juego — `showWarning()` para avisos y `showConfirm()`
    para preguntas sí/no, ambos en `modals.js` — en vez de
    `alert()`/`confirm()` nativos del navegador. Ya no queda ningún uso
    nativo; no agregar nuevos.
11. Todo el HTML generado dinámicamente reutiliza las clases CSS ya
    definidas en `css/styles.css` (paleta, tipografías, componentes
    `.btn`, `.chip`, `.value-box`, `.modal`, etc.) en vez de crear
    estilos inline nuevos, para que la ayuda visual y cualquier vista
    previa se vea "real" (coherente con el resto del juego).

## Pruebas y calidad

12. Cualquier función de lógica pura nueva (sin tocar `document`/DOM)
    que se agregue a `gameLogic.js`, `utils.js` o los módulos de
    `screens/config/` debería llevar su prueba en `test/`, siguiendo el
    estilo de `test/gameLogic.test.js` (usa `node --test`, sin
    dependencias externas).
13. Correr `npm run lint` y `npm test` antes de dar por terminado un
    cambio grande. El lint debe quedar en 0 errores (los `warn` de
    variables sin usar se pueden dejar si son deliberados, pero
    conviene revisarlos).
14. Usar `git` para llevar el historial: un commit por cambio
    significativo, con mensaje descriptivo (en español), como se hizo
    en el commit inicial de la reestructuración.

## Decisiones ya tomadas — no revertir sin que el usuario lo pida

15. El nombre del juego es **"Musical Showdown"**; debe aparecer así en
    el título web, la pantalla de carga, el menú, la ventana de
    Windows y el nombre de la app en Android — en las tres
    plataformas por igual.
16. El ícono es el de la nota musical con ecualizador, **recortado en
    forma circular** (sin el texto del logo original) — así se usa en
    todos los tamaños/plataformas.
17. El botón de ayuda (❓) va redondo, a la derecha del botón de
    volver/pausa correspondiente (ver contexto, sección 3 → "Pausa / Ayuda /
    Salir"). A su derecha va el botón 🔊/🔇 (configuración, grupos y ronda),
    que **solo quita o pone la música de fondo** (usuario, 05-10-2026; antes
    se había quitado el 01-10-2026): al volver, la música sigue desde donde
    iba. En la ronda va además la tuerca de Ajustes. Música, efectos y reloj
    se ajustan por separado en Ajustes.
18. Los sonidos y la música son **grabaciones con licencia CC0** (uso libre,
    sin derechos de autor; decisión del usuario del 04-10-2026, antes eran
    sintetizados). Si se agregan sonidos nuevos: solo CC0 (revisar la licencia
    en la página de cada uno; CC-BY no, porque pide crédito), anotarlos en
    `src/audio/CREDITOS.txt` y agregarlos a `audio/catalogo.js`. Todos los
    efectos suenan al mismo volumen (el motor los iguala) y nunca bajan el
    volumen de la música.
19. El service worker usa **network-first**, nunca volver a
    "cache-first para siempre" (causaba que el juego se quedara pegado
    en versiones viejas).
20. Multiplicadores: exactamente 4 (×2, ×3, ×4, ×5), que se activan o
    desactivan todos juntos con el selector de dos opciones "✨ Con
    multiplicadores | Sin multiplicadores" (diseño B elegido por el usuario
    el 30-09-2026). En Clásico no hay multiplicadores ni reloj. En
    **Alternativo 1** los multiplicadores están **siempre activos** (desde el
    03-10-2026 no se desactivan) y el tiempo por ronda es obligatorio (no hay
    "Sin tiempo"). En **Alternativo 2** se elige "Sí / No" en Configurar
    partida (actualizado el 12-10-2026; antes decía que solo existían en
    Alternativo 1). Puntaje objetivo y tiempo por ronda: el valor
    personalizado se elige en un **selector de rueda** (`valuePicker.js`),
    igual para puntaje y tiempo: se desliza con el dedo (Android) o con las
    flechas ↑ ↓ del teclado (PC), y se confirma con Enter o con "Listo". Al
    confirmar, el valor ocupa el lugar de los predeterminados en la lista.
    No volver a los diseños anteriores de estos controles (cajas por
    dígito, cajas con flechas, ventana con botones ▲ / ▼) salvo pedido
    explícito.

## Forma de trabajo con el usuario (pedidas entre el 10 y el 12-10-2026)

23. **Todo en español**, también las preguntas, los pedidos de permiso y la
    descripción de cada comando que se ejecuta.
24. **Probar antes de publicar:** después de **cada cambio, por mínimo que
    sea**, compilar y **abrirle el juego** (`dist/windows/Musical Showdown.exe`)
    para que lo pruebe. Para el celular, una copia firmada sin subir la versión
    (`dist/MusicalShowdown-PRUEBA-….apk`, se instala encima; si el celular
    está conectado por USB, instalarla con `adb install -r`). Lo que está en
    prueba **no está confirmado**: no hacer commit de versión ni publicar
    (`android:release`, etiqueta `v*`) hasta que el usuario lo confirme. Una
    vez publicado, abrirle también la versión final. Antes de recompilar,
    cerrar el juego si está abierto.
25. **Permisos del sistema** (notificaciones, micrófono, cámara…): pedirlos
    directo con la ventana del celular, **sin** una ventana propia del juego
    antes.
26. **Los modos de juego están terminados** (11-10-2026): no proponer cambios
    a sus reglas. Si un pendiente toca una regla, preguntar solo lo puntual.
27. **Documentos siempre al día** (12-10-2026): con cada cambio, actualizar
    todos los `.md` que correspondan, no solo la auditoría:
    `AUDITORIA-CAMBIOS.md`, `PENDIENTES.md`, `CONTEXTO-MUSICAL-SHOWDOWN.md`,
    este archivo, `CLAUDE.md`, `README.md` y `avisos/LEEME.md`. Lo que esté en
    prueba se anota como "en prueba", y se corrigen las frases que el cambio
    deja viejas.
28. **Juntar cambios antes de publicar** (12-10-2026): no publicar una versión
    por cada cambio mínimo. Los cambios confirmados se acumulan (lista "Listo
    para la próxima versión" en `PENDIENTES.md`) mientras se sigue con los
    pendientes, y se publica cuando hay una actualización buena y notable.
    Ayudar al usuario a detectarlo: avisar si algo es chico para publicarlo
    solo, y proponer publicar cuando lo acumulado valga la pena.

## Música de terceros y YouTube (12-10-2026)

29. **El juego nunca reproduce, descarga ni guarda música de terceros.** Para
    escuchar una canción solo se **abre un enlace** a la búsqueda de YouTube
    (`urlYoutube` en `screens/verify.js`, con `abrirEnlace`), fuera del juego.
    No agregar: descargar o extraer audio de YouTube (va contra sus condiciones
    y los derechos de autor), reproducir YouTube dentro del juego (salvo con su
    reproductor oficial y revisando antes sus reglas) ni el **logo** de YouTube
    (solo el texto "YouTube" y un ▶ común). Mostrar títulos y artistas está
    bien. Lo delicado son las **letras** guardadas por dentro (ver
    `PENDIENTES.md`, parte legal de las letras).

## Cuando falte información

21. Las reglas de emparejamiento de **Clásico** y **Alternativo 1**
    (Individual y Grupal), la cantidad de grupos y sus nombres las
    definió el usuario el 28-09-2026 (contexto, sección 3). Se programan
    **tal cual**: ante cualquier caso que no cubran, **preguntar**; el
    usuario pidió expresamente que no se asuma nada. **Alternativo 2**
    tiene reglas desde el 03-10-2026 (contexto, sección 3). En los tres
    modos: ante cualquier caso no cubierto, preguntar antes de inventar.
22. Si se toca la base de canciones (`src/js/data/songs.js`), recordar
    que es un mock temporal — no asumir que se pueden agregar letras
    reales completas de canciones con derechos de autor sin antes
    resolver el tema legal (ver contexto, sección 1 y 8).

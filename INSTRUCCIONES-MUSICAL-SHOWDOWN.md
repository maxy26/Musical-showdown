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
   `eslint.config.js`. No volver a la versión anterior de "tres copias
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
    propios del juego (`showWarning()` en `modals.js`, o un modal nuevo
    del mismo estilo) en vez de `alert()`/`confirm()` nativos del
    navegador — salvo los 2 casos legacy que quedan pendientes (ver
    contexto, sección 5), no agregar más usos nativos nuevos.
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
17. El botón de ayuda (❓) y el de silencio (🔊/🔇) van **juntos**, con
    el mismo estilo redondo, a la derecha del botón de menú/pausa
    correspondiente (ver contexto, sección 3 → "Pausa / Ayuda / Salir").
18. Los sonidos son sintetizados (no samples de terceros) — si se
    agregan sonidos nuevos, mantener ese enfoque para no introducir
    problemas de derechos de autor.
19. El service worker usa **network-first**, nunca volver a
    "cache-first para siempre" (causaba que el juego se quedara pegado
    en versiones viejas).
20. Multiplicadores: exactamente 4 (×2, ×3, ×4, ×5), con un único
    interruptor maestro. Puntaje objetivo y tiempo por ronda: una sola
    caja editable con flechas + Enter (no cajas por dígito). No volver
    a los diseños anteriores de estos controles salvo pedido explícito.

## Cuando falte información

21. Si hace falta decidir algo de las reglas de **Alternativo 1**,
    **Alternativo 2** o la **rotación grupal exacta**, son puntos que el
    usuario dejó pendientes a propósito — preguntar antes de inventar
    una regla definitiva, o implementarlo como variante claramente
    marcada y reversible.
22. Si se toca la base de canciones (`src/js/data/songs.js`), recordar
    que es un mock temporal — no asumir que se pueden agregar letras
    reales completas de canciones con derechos de autor sin antes
    resolver el tema legal (ver contexto, sección 1 y 8).

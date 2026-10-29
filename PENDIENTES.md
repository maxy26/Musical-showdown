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
>
> **Orden acordado (07-10-2026):** la búsqueda de canciones por voz (el
> pendiente CRÍTICO) y todo lo que pueda necesitar un servicio de pago (por
> ejemplo, la fuente legal de letras o la firma del `.exe`) se dejan **para el
> final**, aunque sean críticos. Se sigue con el resto.

## 🧭 Plan por partes del proyecto (usuario, 25-10-2026): app 1 demo, app 2 mía, app 3 oficial

> El proyecto se divide en 3 apps. **Orden: primero la demo, terminada por
> completo y publicada; después la app 2 (mía) y la app 3 (oficial) a la vez.**
> Hasta que la demo esté lista, lo demás espera salvo que el usuario pida otra
> cosa.

1. **App 1: demo** (Microsoft Store, gratis; solo Clásico; solo pop, rock y
   reggaetón) — **EN PAUSA (usuario, 25-10-2026), es lo primero al retomar.**
   Aprobada por el usuario; capturas de la ficha hechas (`tiendas/imagenes/demo/`,
   con los íconos nuevos). **Siguiente paso al retomar:**
   1. el usuario reserva "Musical Showdown Demo" en Partner Center (producto
      nuevo, aparte de "Musical Showdown") y pasa su identidad (Package/Identity
      Name, Publisher) y su Store ID (pregunta 5); guiarlo paso a paso;
   2. crear `platforms/desktop/tienda-microsoft-demo.json` y poner `"microsoft-demo"`
      en `tienda.js`; compilar `npm run build:store-demo`;
   3. llenar la ficha con `TIENDAS.md` (sección "Demo gratis") y subir el `.appx`
      y las capturas de PC.
   - Catálogo de la demo (pop, rock, reggaetón): revisado contra las letras.
   - cambiar "Muy pronto" por el enlace a la completa cuando exista;
   - probar el `.exe` en otra PC (pregunta 12).
2. **App 2: mía (propia)** (`build:personal`, todo desbloqueado, nunca se publica) —
   después de la demo. Es el `.exe` y el APK del usuario; sigue compilándose
   con cada cambio (instrucción 30).
3. **App 3: oficial (completa)** — después de la demo, junto con la app 2: Alternativo
   2, escuchar el canto, Premium, anuncios, Google Play, compras en la Store,
   vinculación de dispositivos, IA que reconoce la canción (versión 2.0).

## 🎨 Rediseño "Escenario nocturno", pantalla por pantalla (usuario, 28-10-2026) 🟡

El usuario eligió el estilo A de las propuestas: casi negro (`#0B0D17`), acento de
violeta a rosa (`#8B6CFF` → `#FF5FA2`), botones y tarjetas de vidrio, letra Inter y
fondo con colores que se mueven en lugar de las luces. Se hace **una pantalla a la vez**:
se muestra en una vista previa (celular y PC juntos), el usuario elige o descarta cada
cambio, se aplica a las tres apps y se pasa a la siguiente.

- [ ] **Inicio:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo confirme.
  En la PC, título grande arriba sin recuadro y una columna centrada con botones más
  grandes (opción 1 «Centrado»); el celular conserva su acomodo, sin recuadro en el título.
- [ ] **Configurar partida:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo
  pruebe. En la PC, dos columnas (jugadores a la izquierda; géneros y opciones a la derecha),
  letra más grande y todo entra en 1440 × 900 y 1366 × 768. En el celular, opción B
  «Secciones»: sin la tarjeta grande, cada parte en su panel y «Confirmar» pegado abajo;
  «Añadir» y «Borrar nombres» en una fila y «Relevos por equipo» ya no se parte en tres líneas.
- [ ] **Ronda:** aplicada a las tres apps el 28-10-2026; falta que el usuario la pruebe. Cada
  lado con su color (rosa y celeste; en Grupal, el de su grupo) en casillas de vidrio; reloj de
  vidrio (rojo rosado en los últimos 5 s); palabra blanca con halo violeta que se achica sola
  según sus letras para entrar en una línea. En la PC, acomodo «Escenario» (opción 1): lados
  altos a los costados y la palabra en el medio, todo más grande y a todo el alto. El celular
  conserva el «cara a cara».
- [ ] **Resultado de la ronda** (acierto, fallo y sin ganador): aplicado a las tres apps el
  28-10-2026; falta que el usuario lo pruebe. Ícono en un círculo de color (verde, rosado o
  violeta), «+100» en degradado, filas verdes si suben y rosadas si bajan, botón en degradado.
  En la PC, opción B «Pantalla completa»: sin tarjeta, todo enorme y los dos lados lado a lado.
  En el celular, tarjeta de vidrio centrada.
- [ ] **Podio:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo pruebe.
  Pantalla completa sin tarjeta en celular y PC: «GANADOR» chico, nombre del ganador grande en
  degradado, bloques de vidrio de oro, plata y bronce (el primero con brillo), MVP en pastilla
  de degradado, «Jugar de nuevo» en degradado y los demás botones de vidrio.
- [ ] **Organizar equipos:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo
  pruebe. Sin la tarjeta grande: cantidad y nombre en un panel de vidrio y cada grupo en su
  panel teñido con su color (el de la ronda) y un punto de color; jugador elegido en violeta;
  «Confirmar» en degradado. En la PC, opción B: todos los grupos en una sola fila y todo más
  grande. En el celular, también lado a lado (de a dos por fila) y los botones pegados abajo.
- [ ] **Ajustes:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo pruebe.
  Panel de vidrio oscuro a todo el alto que entra desde la izquierda, en el celular y también en
  la PC (opción B); cada opción en su panel, «Sí / No» con la elegida en blanco, volumen
  violeta, «Premium» en degradado, los demás botones de vidrio y «Salir» en rosado.
- [ ] **Avisos (la campana):** aplicado a las tres apps el 28-10-2026; falta que el usuario lo
  pruebe. Vidrio oscuro como Ajustes; cada aviso en su panel con el ícono en un cuadrito del
  color de su tipo (rosa novedad, dorado promoción, violeta actualización); nuevos con borde
  violeta y «● Nuevo» en rosa; botón en degradado; sin avisos, la campana en un círculo. En la
  PC, opción B: panel a todo el alto desde la derecha. En el celular sube desde abajo.
  Además (usuario, 28-10-2026): «Borrar notificaciones» fijo abajo de la ventana (pregunta
  antes y la deja vacía) y la campana con un (!) rojo mientras quede al menos un aviso.
- [ ] **Ventanas «Sí / No», aviso y pausa:** aplicado a las tres apps el 29-10-2026 (ícono arriba,
  botones uno debajo del otro, más grandes en la PC; en el celular suben desde abajo); falta que
  el usuario las pruebe.
- [ ] **Rueda para elegir números:** aplicada el 29-10-2026: se abre encima de la lista del valor,
  del mismo ancho, diseño «Líneas» y flechas ▲ ▼; tocar afuera confirma. Falta que el usuario la pruebe.
- [ ] **Ventanas de relevos:** aplicadas el 29-10-2026 (estilo de las ventanas chicas, compañeros en
  lista con su inicial, ajustar con número grande); falta que el usuario las pruebe.
- [ ] **Devolver relevos es de Premium** (usuario, 29-10-2026): en la versión completa sin Premium el
  botón ± de la ronda lleva 🔒 y abre Premium (`ajustaRelevos()` de `edicion.js`). Probar con una
  compra de prueba cuando esté la consola de Google Play.
- [ ] **Editar una opción en «Configurar partida»:** aplicado el 29-10-2026. Todo queda borroso
  menos la fila que se edita, marcada con «Editando · <nombre>» (`resaltarFila` de `valuePicker.js`):
  ventana «Relevos por equipo» (bloques con número grande, globo arriba de la fila, tocar afuera la cierra)
  y la rueda de Puntaje objetivo y Tiempo por ronda. Falta que el usuario lo pruebe. La copia de la
  fila no se mueve si se gira el celular con la ventana abierta.
- [ ] **Ventanas chicas según la pantalla** (29-10-2026): escalan con `--e` (más chicas en laptops bajas
  y celulares chicos, más grandes en monitores grandes). Falta que el usuario lo pruebe en sus pantallas.
- [ ] **Pantalla de carga:** aplicada el 29-10-2026 (C3 «Ondas y enfoque»: micrófono con ondas, título que se
  enfoca, ecualizador; dura al menos 1,5 s). Falta que el usuario la vea en PC y celular.
- [ ] **Listas desplegables:** aplicadas el 29-10-2026 (opción B «Líneas», fondo borroso y la fila marcada).
  Falta que el usuario las pruebe con mouse, teclado y dedo.
- [ ] **Ventana de Premium:** aplicada el 29-10-2026 (opción D: estrella en círculo, beneficios en cuadritos,
  planes en filas). Falta que el usuario la pruebe y verla con los precios reales de Google Play.
- [ ] **Ayudas:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo pruebe.
  «Cómo se juega» y la ayuda del modo en dos columnas (PC y celular); la ventanita de los (?)
  como globo junto a su botón, con flechita, el (?) encendido y el fondo borroso.
- [ ] El globo de los (?) no se reubica si se gira el celular o cambia el tamaño de la ventana
  con él abierto (se arregla al cerrarlo y abrirlo).
- [ ] **Modos de juego:** aplicado a las tres apps el 28-10-2026; falta que el usuario lo
  pruebe. Tarjetas de vidrio, el elegido en violeta. PC: los tres modos uno al lado del otro.
  Celular: lista compacta (la historieta solo en el elegido o con «Ver más»). En la PC el tamaño
  sigue el alto de la pantalla (entra sin desplazar de 1280 × 720 a 1920 × 1080) y «Ver más»
  agranda solo su modo.
- [ ] **Verificar canción** («¡X canta!» y «Buscar canción»): aplicado a las tres apps el
  29-10-2026; falta que el usuario lo pruebe. Resplandor del color de quien canta, micrófono
  con ondas, «Correcta» verde e «Incorrecta» rojo rosado; en la búsqueda, YouTube en rojo. PC:
  centrado y más grande.
- [ ] **Compartir el podio:** aplicado a las tres apps el 29-10-2026; falta que el usuario lo
  pruebe (también compartir de verdad en Android). Imagen nueva (escenario oscuro, Inter, podio de
  vidrio) con colores del fondo a elegir: flechitas en la PC, deslizar en el celular y
  «Personalizar colores»; se recuerda el último.
- [ ] **Vincular:** aplicado a las tres apps el 29-10-2026; falta que el usuario lo pruebe
  vinculando de verdad. Pasos en paneles con número, QR con brillo, código en degradado con un
  relojito circular (sin números) en lugar de la barra; en la PC, «Vincular celular» en dos columnas.
- [ ] **Pregunta para el usuario (29-10-2026):** al vincular con el QR, hoy el celular queda de
  control de la partida de la PC. El usuario lo describió como «continuar la partida del
  escritorio en el móvil»; si quiere que la partida pase a jugarse en el celular, es una función
  nueva (no solo diseño). Esperar su respuesta.
- [ ] **Control del celular y PC vinculada:** aplicado a las tres apps el 29-10-2026; falta
  probarlo vinculando de verdad. En la PC, avisos de que los nombres y Correcta / Incorrecta se
  tocan en el celular y «📱 Vinculado» en verde.
- [ ] **Reloj de la ronda:** anillo en degradado con punto de luz (aplicado el 29-10-2026); falta
  que el usuario lo pruebe.
- Mientras dure el rediseño, el inicio tiene el fondo nuevo y las demás pantallas las luces
  de antes: el cambio se nota al pasar de una pantalla a otra. Se resuelve al terminar.

## 🔒 Privacidad y parte legal (usuario, 27-10-2026) 🟡

> **En pausa desde el 28-10-2026 (decisión del usuario): se retoma cuando haga
> falta; no se cierra.** La página `docs/privacidad/` (español) y `docs/privacy/`
> (inglés) es una **base viva**: se actualiza con cada cambio de la app. Base:
> plantillas CC0 de `General-Legal/legal-templates`. Público: **adolescentes y
> adultos (13+)**. Publicada con GitHub Pages; versión 1.27 de la app.

**Hecho**
- [x] Política (17 secciones) y términos de uso (16) unidos en una sola página, estilo «claro profesional», en español e inglés (`test/legal.test.js` vigila que coincidan).
- [x] GitHub Pages activado y comprobado (28-10-2026).
- [x] Ajustes tiene «Política de privacidad» y «Términos de uso» y abre el idioma del dispositivo (publicado en la 1.27).
- [x] Decisiones: correo `showdownmusical@gmail.com`, edad 13+, país provisional Colombia, anuncios con AdMob **no personalizados** (solo versión gratis de Android), sin análisis de uso ni servidor propio.
- [x] `TIENDAS.md` alineado con la política y `GOOGLE-PLAY.md` con las respuestas para la Play Console.
- [x] `docs/vincular/` con el mismo estilo; el destino de descarga se cambia en dos variables (`DESCARGA_ANDROID`, `DESCARGA_OTROS`).

**Falta**
- [ ] 🟡 **Nombre del estudio o titular** y, si se quiere, dirección postal. Hoy dice «su desarrollador» y Colombia provisional (política sección 1 y términos «Ley aplicable»). Ideas habladas: nombre neutro para todos los proyectos, con juego de palabras y terminado en «Studio» (con o sin su nombre; Mikuiz, Lumbrix). Elegir uno y comprobar que esté libre (Play, Microsoft Store, GitHub, dominio).
- [ ] 🟡 **Revisión legal por una persona** (sobre todo antes de cobrar Premium): limitación de responsabilidad, ley aplicable y compras.
- [ ] 🟢 **Revisión de la traducción al inglés** por una persona.
- [ ] 🟢 Repasar `GOOGLE-PLAY.md` contra la Play Console real al abrirla (Google cambia las preguntas) y enlazar la política en cada ficha de tienda.
- [ ] 🟢 La descripción de las tiendas dice «amigos y familia» pero el público es 13+: revisarla para no caer en la política de Familias de Play.
- [ ] 🟡 **Al integrar AdMob:** ventana de consentimiento (UMP) para la UE, formularios de anuncios de Play y repetir la revisión de política y `TIENDAS.md`.
- [ ] 🟢 Si se agrega análisis de uso, informes de fallos o un servidor propio: declararlo en la política y en Play.
- [ ] 🟢 Al definir planes y precios de Premium: que `screens/premium.js` muestre precio, renovación y cómo cancelar, y que coincida con los términos.
- [ ] 🟢 Al publicar en Google Play: poner la ficha de Play en `docs/vincular/`.
- [ ] 🟢 Representante en la UE/Reino Unido, solo si la ley llega a exigirlo.
- [ ] 🟢 Cada cambio de `docs/privacidad/` se copia a `docs/privacy/`.

## 🎨 Íconos Material Design en las tres apps (usuario, 25-10-2026)

- [x] 🟡 **Íconos de https://github.com/google/material-design-icons en las tres
  apps** (hecho el 25-10-2026, EN PRUEBA; el usuario pidió cambiar **todos** los
  emojis, también los de las ayudas). `iconosEmoji.js` cambia cada emoji por su
  ícono al dibujar la pantalla; `iconosMaterial.js` tiene solo los 67 trazos
  usados (Material Symbols Rounded); licencia Apache 2.0 en
  `icons/LICENCIA-MATERIAL.txt`. El texto para compartir (WhatsApp) sigue con
  emojis. Confirmado y publicado en la 1.26 junto con el diseño nuevo.

## 🎼 Catálogo gratis vs. Premium (usuario, 25-10-2026)

> Lo que se está haciendo ahora (catálogo limpio, apto para toda la familia) es
> para la **app gratis / demo**. En **Premium** se agregan las canciones que se
> fueron quitando. Antes de agregarlas, **nueva revisión** de esas canciones y se
> eligen **las mejores de las peores** (las menos problemáticas).

- [ ] 🟡 Dividir el catálogo en dos: **base** (gratis/demo) y **Premium** (la base
  más las quitadas). Falta decidir cómo se marca cada canción (`premium: true`
  en `data/songs.js`, regla en `edicion.js`) y que la demo solo use la base.
- [ ] 🟡 Revisar de nuevo y elegir las mejores de las quitadas. Lista de
  quitadas (motivo): Safaera (explícita; sus palabras seguras eran genéricas);
  Sobredosis (drogas/adulto); Abusadora y Mamichula (sin letra); Los Infieles
  (coro de infidelidad); Bichota (sin palabra propia en el coro); La Bebé
  (Remix) (alcohol, drogas en versos); Jefe de Jefes y Contrabando y Traición
  (narco); Te Boté (coro sin comprobar); Yonaguni, Mónaco, La Jumpa y Todo de Ti
  (palabras vulgares dichas directamente; Todo de Ti también drogas); Callaíta
  (marihuana, "culito"); Provenza ("hierba"); Saoko ("fuck", "cógela"); Sola
  (insinuación y "fumando"); TQG ("culito"); Despechá ("fuck" en un verso);
  Feliz Cumpleaños Ferxxo (pastillas; "cumpleaños" no se canta).

## 🎚️ Demo con menos géneros (usuario, 25-10-2026)

- [x] 🔴 **La demo solo trae pop, rock y reggaetón** (usuario, 25-10-2026; 60
  canciones, las nuevas y las viejas de esos géneros). Hecho en `availableGenres()`
  de `data/songs.js` (`GENRES_DEMO`); la app propia y la oficial traen los 10.
  EN PRUEBA. `TIENDAS.md` ya dice "60 canciones en 3 géneros" para la demo.
- [ ] 🟡 **Pregunta:** en la app oficial, ¿los 7 géneros extra son gratis o solo
  con Premium?
- Con el catálogo revisado (balada a urbano), el siguiente paso es la **app 2
  (propia)** y la **app 3 (oficial)**.

## ❓ Preguntas para el usuario (sin responder)

> Lo que falta que el usuario conteste (pedido del 24-10-2026). Al contestar,
> pasar la respuesta a su sección y quitarla de aquí.

1. **Palabra familiar para 7 canciones** (catálogo "apto para toda la familia"):
   el usuario pidió **la misma canción con otra palabra más familiar**, no
   cambiar la canción. En 6 ya se hizo con una palabra del título ("mujer",
   "propuesta", "pégame", "traición", "amor", "nena"). En estas 7 el título
   solo tiene la palabra dudosa. **25-10-2026:** el usuario pidió buscar la
   letra y poner la canción solo si tiene palabras normales. **Regla (usuario,
   25-10-2026): si una canción no tiene palabras seguras que la representen e
   identifiquen, se quita directamente (no importa si son obvias).** Hecho:
   "La Diabla" (`diabla`, `revancha`, `barajas`) volvió. "Safaera" se quitó
   (sus palabras seguras eran genéricas) y quedó "Provenza". **Quedan quitadas,
   con su reemplazo definitivo:** Sobredosis (Frío, Frío), Abusadora (El
   Tiburón), Los Infieles (Dile al Amor), Bichota (Mañana Será Bonito) y
   Mamichula (Todo de Ti). Falta: confirmar las palabras de "La Diabla" (salen
   de un resumen de páginas de letras). Aplicar la misma regla a la pregunta 3.
2. **Revisar las palabras nuevas** que se escribieron de memoria (24-10-2026)
   contra las letras. **25-10-2026: pasada hecha** sobre todo el catálogo
   (página de letras `lyricfluent.com`, comprobando si cada palabra aparece).
   Unas 155 de 200 canciones quedaron confirmadas; ~45 no se pudieron
   comprobar (la página no las tiene). Palabras que **no** aparecieron en la
   letra: `viaje` (Tren al Sur); y solo-título (la clave es el título pero no
   se canta, o la página la omitió): Ginza, La Rebelión, La Cumbia Cienaguera,
   17 Años, Bidi Bidi Bom Bom, La Cosquillita, Rompecintura, El Africano, El
   Sinaloense, Callaíta, Despechá, Feliz Cumpleaños Ferxxo y `bachata` (Bachata
   Rosa). Varias son falsos negativos casi seguros (Bidi Bidi, Despechá). No se
   cambió el catálogo: falta decidir qué hacer con ellas.
3. **Otras canciones que podrían no ser familiares** (25-10-2026, aplicando la
   regla de quitar lo que no sea familiar; coro revisado en `lyricfluent.com`):
   - "Odio" y "Hasta el Amanecer": coro familiar y la palabra clave está en el
     coro → **se quedan**.
   - "La Bebé (Remix)": el coro habla de beber y tiene insinuaciones sexuales →
     **quitada** (urbano queda en 19 canciones).
   - "Jefe de Jefes": coro de narco y violencia → **quitada**, y entra "La Bamba"
     (`bamba`, familiar, en el coro) en regional.
   - "Te Boté": no se pudo leer el coro → **reemplazada** (usuario, 25-10-2026)
     por "Súbeme la Radio" (`radio`, `súbeme`, `canción`; las tres están en el
     coro; la letra solo menciona tomar para olvidar un desamor).
   - Ojo: el catálogo ahora tiene **199** canciones; `TIENDAS.md` y `ESTADO.md`
     dicen 200. Falta agregar una de urbano (limpia) o corregir los textos.
4. **Mejoras del proyecto:** cuál se hace primero (ver "Mejora recomendada por
   publicación" abajo).
5. **Demo de la Microsoft Store:** reservar "Musical Showdown Demo" en Partner
   Center y pasar su identidad y Store ID.
6. **Catálogo:** revisar por tandas de 20 los 6 géneros sin revisar (balada,
   cumbia, bachata, merengue, regional mexicano, trap y urbano).
7. **Diseño del sistema de pago:** terminarlo antes de seguir con Google Play.
8. **Google Play:** ¿subir nuestra clave de firma (recomendado) o dejar que
   Google firme con la suya?
9. **Clave de firma de Android:** protegerla con contraseña (OneDrive o ZIP
   cifrado).
10. **IA que reconoce la canción:** ¿el moderador puede corregirla? ¿vale decir
    el título? ¿qué servicio de letras (costo)?
11. **Textos del juego:** cuáles quiere editar.
12. **Probar:** el `.AppImage` en Linux, el `.exe` en otra PC y cantar de
    verdad los 3 segundos (`UMBRAL_VOZ`).

## 🚀 Mejora recomendada por publicación (24-10-2026)

> Una mejora por cada publicación o actualización prevista; el usuario elige.

| Publicación | Mejora recomendada | Por qué |
|---|---|---|
| Demo de la Microsoft Store | Revisar los 6 géneros sin revisar y las palabras nuevas | La ficha dice "200 canciones": es lo primero que se nota al jugar |
| Completa de la Microsoft Store (PC) | Compras de Premium en la Store | Sin eso, en PC no se pueden abrir Alternativo 2 ni escuchar el canto |
| Google Play, prueba cerrada (14 días) | ~~Recordar a los jugadores entre partidas~~ (hecho en la 1.25) | Los 12+ probadores juegan varias veces; ahorra escribir los nombres |
| Google Play, publicación abierta | Vibración en el celular y pedir una calificación una sola vez | Se siente como un pulsador y las reseñas suben el juego en la tienda |
| Actualización 1.25 de GitHub | Historial y récords del grupo | Da ganas de revancha y es un cambio notable para anunciar en la campana |
| Versión 2.0 | La IA que reconoce la canción | Es el último gran paso: marcar solo Correcta / Incorrecta |

## 📦 Listo para la próxima versión (sin publicar)

> Cambios terminados que se juntan para sacar una actualización notable
> (instrucción 28). Al publicar, vaciar esta lista. Última versión: **1.27** (28-10-2026: Ajustes con «Términos de uso» y la política en el idioma del dispositivo; política y términos unidos y en inglés; ver AUDITORIA-CAMBIOS.md).

- **Rediseño «Escenario nocturno» completo** (28 y 29-10-2026; subido a `main` el 29-10-2026, sin versión todavía):
  Organizar equipos, Ajustes, avisos (con «Borrar notificaciones» y el (!) en la campana), ayudas (globo junto
  al (?)), Modos de juego, verificar canción, compartir el podio (colores del fondo a elegir), vincular, control
  del celular y PC vinculada, reloj de la ronda en anillo, ventanas «Sí / No» / aviso / pausa, rueda de números
  encima del valor, ventanas de relevos, «Relevos por equipo» con la fila marcada, ventanas chicas según el
  tamaño de la pantalla, Premium, listas desplegables y pantalla de carga con bienvenida.
- **Devolver relevos es de Premium** (botón ± con 🔒 en la versión completa sin Premium).

## 🎵 Canciones y letras (antes de publicar)

- Los dos pendientes de esta sección (la parte legal de las letras guardadas y las palabras que no estaban en la letra) quedaron **resueltos el 12-10-2026** con el catálogo sin letras: ver "Resueltos".

## 🐛 Bugs e inconsistencias


## 🔧 Entorno / herramientas

- [ ] 🟡 **Las pruebas de pantallas no abren con Edge desde el 24-10-2026.** Edge
  se actualizó a 156.0.4314.42 y en modo sin ventana se cierra al abrir
  (código 0xC0000135, falta una librería); abrirlo directo también falla.
  Mientras tanto se corrieron con Brave (archivo temporal que apunta a su
  `brave.exe`, ya borrado). Reintentar tras reiniciar la PC o reinstalar
  Edge; si sigue, cambiar `channel: "msedge"` de `playwright.config.mjs` por
  la ruta de Brave. En GitHub Actions no afecta (usa el Chromium de Playwright).

- [ ] 🟢 **«Buscar canción» falla en las pruebas de pantallas con Brave en tamaño PC** (29-10-2026): el texto
  que completa el nombre (`.busqueda-fantasma .resto`) queda vacío. Falla igual en la versión publicada y en
  GitHub Actions (Chromium) pasa, así que parece propio de Brave. Revisar cuando Edge vuelva a abrir.

- [ ] 🟢 **Electron no se puede ejecutar en modo desarrollo**
  (`npx electron .` en `platforms/desktop`). npm 11 bloqueó su script de
  instalación, que descarga el binario. No afecta la compilación. Si hace
  falta, aprobarlo con `npm install-scripts approve electron --prefix
  platforms/desktop` y reinstalar.
- [ ] 🟢 **Quedan 8 avisos moderados de `npm audit` en `platforms/desktop`**
  (12-10-2026): todos vienen de `sprintf-js`, que usa `global-agent` → 
  `@electron/get`, una herramienta de descarga **que solo se usa al compilar**
  (no va dentro del `.exe`). El "arreglo" que propone npm es bajar
  electron-builder a 26.5.0, así que no conviene. Revisar cuando salga una
  versión nueva de electron-builder que lo corrija.

## 📦 Distribución a otros equipos (en pausa hasta decidir publicar)

- [ ] 🔴 **Publicar en tiendas: primero Galaxy Store y Microsoft Store**
  (usuario, 12-10-2026; después las demás).
  - **Ya hecho:**
    - política de privacidad;
    - `TIENDAS.md` con todos los textos;
    - imágenes en `tiendas/imagenes/`;
    - paquete de la Microsoft Store (`npm run build:store-windows`).
    Ver AUDITORÍA parte 32.
  - **Hecho por el usuario (12-10-2026):**
    - correo del juego `showdownmusical@gmail.com`;
    - cuenta de la Microsoft Store (individual), con el nombre reservado,
      Store ID `9PP0CFQWMWKT` e identidad en
      `platforms/desktop/tienda-microsoft.json`.
  - **Galaxy Store descartada por ahora:** Samsung solo acepta apps de
    Android de empresas registradas ("Corporate Commercial Seller"). Para
    Android, **Google Play**: 25 USD una vez, y las cuentas nuevas de persona
    necesitan una prueba cerrada con 12 personas durante 14 días.
  - **Ya hecho también:** política de privacidad publicada (con el correo) y
    enlaces a la tienda en la versión de la Microsoft Store (AUDITORÍA parte
    33).
  - **Falta:**
    1. ~~Publicar la **1.24** en GitHub~~ (hecho el 13-10-2026). En la Microsoft Store va primero una **demo gratis** (ver "Demo para la Microsoft Store"); la 1.24 completa se sube aparte más adelante. Nota vieja: publicar la **1.24**
       en GitHub y en la Microsoft Store a la vez (`npm run android:release`
       sube la versión; después `npm run build:store-windows`).
    2. Subir `dist/store/Musical Showdown.appx` y llenar la ficha en Partner
       Center con `TIENDAS.md` y `tiendas/imagenes/` (con guía paso a paso).
    3. Google Play: más adelante, cuando el usuario decida pagar la cuenta.
- [ ] 🔴 **Demo gratis para la Microsoft Store** (usuario, 13-10-2026).
  - **21-10-2026: CONFIRMADA por el usuario** ("está bien así"). Antes de
    subirla quiere ver recomendaciones de mejoras para la demo.
  - Qué tiene (AUDITORÍA partes 35 y 36):
    - se juega solo Clásico;
    - Alternativo 1 con 🔒; al tocarlo, la ventana "Versión completa";
    - Alternativo 2 no aparece;
    - no escucha el canto (solo "Buscar canción");
    - sin anuncios; etiqueta "Versión · demo".
  - **Mejoras del 21-10-2026 (EN PRUEBA, AUDITORÍA del 21-10):**
    1. el paquete de la Store ya no pide micrófono ni red local;
    2. sin "📱 Vincular";
    3. la campana no muestra versiones de GitHub (la Store la actualiza sola);
    4. ventana "Versión completa" (qué trae, "Muy pronto en la Microsoft
       Store"), sin enlace de descarga a GitHub. **Solo lista Alternativo 1**:
       Alternativo 2 y escuchar el canto son de Premium, que en PC aún no se
       puede comprar; agregarlos cuando haya compras en la Store;
    5. "Cómo se juega" se abre sola la primera vez;
    6. "⭐ Versión completa" en Ajustes;
    7. en el podio, "✨ ¿Les gustó? Mira qué trae la versión completa".
    8. "Compartir el podio" de la demo no lleva el enlace de GitHub (dice
       "Búscalo gratis en la Microsoft Store") hasta tener el Store ID de la
       demo (`tienda.js`);
    9. pruebas de pantallas de la demo (`test/e2e/demo.spec.mjs`);
    10. Falta: revisar con el usuario los 7 géneros sin revisar (ver "Catálogo
       grande sin letras"); empezó por salsa.
  - Cuando la completa esté en la Store, cambiar "Muy pronto" por el enlace a
    ella (`abrirVersionCompleta` en `screens/modesManual.js`).
  - Va como **otro producto** en Partner Center, "Musical Showdown Demo". El
    producto "Musical Showdown" (`9PP0CFQWMWKT`) queda para la versión
    completa, que se sube después.
  - Falta: reservar el nombre de la demo y pasar su identidad y Store ID
    (`platforms/desktop/tienda-microsoft-demo.json` y `"microsoft-demo"` en
    `tienda.js`); `npm run build:store-demo`; llenar la ficha guiado.
- [ ] 🔴 **Google Play: app gratis con Premium** (usuario, 13-10-2026; ya
  tiene cuenta).
  - **En pausa:** el usuario quiere terminar antes el **diseño del sistema de
    pago**.
  - Ya hecho: cómo se ve con Premium (AUDITORÍA parte 39) y la política de
    privacidad nueva publicada.
  - **Hecho (EN PRUEBA, AUDITORÍA parte 37):**
    - el sistema de compras (`ComprasPlugin.java`, `compras.js`,
      `screens/premium.js`);
    - el `.aab` en `npm run android:release`.
  - **Falta, en la consola de Google Play (con guía paso a paso):**
    1. crear la app y completar la configuración (privacidad, acceso,
       anuncios, clasificación, público 13+, seguridad de datos);
    2. perfil de pagos;
    3. crear la suscripción `premium` con los planes `mensual` y `anual` y
       una oferta de prueba de 7 días;
    4. agregar cuentas de prueba de licencias;
    5. subir el `.aab` a prueba cerrada con 15–20 verificadores;
    6. probar la compra;
    7. pedir la publicación después de 14 días con 12 o más inscritos.
  - **Decidir:** si Google firma con su propia clave (Play App Signing), los
    APK de GitHub ya no se instalan encima de la versión de Google Play.
    Recomendado: al crear la app, subir **nuestra clave** como clave de firma,
    para que las dos versiones sean compatibles.
  - **Precio sugerido:** 1,99 USD al mes o 14,99 USD al año, con 7 días
    gratis, más barato en Latinoamérica (se fija en la consola, por país).
- [ ] 🟡 **Compras dentro de la app** (usuario, 13-10-2026): la versión
  completa es gratis; **se cobra el modo Alternativo 2 y escuchar el canto**
  (los 3 segundos y la futura IA que identifica la canción). Sin compra, solo
  "Buscar canción". La regla ya está (`edicion.js`, `compras.js`); falta el
  sistema de pago y definir precios.
  - **Ojo:** mientras no haya compras, la versión completa compilada (GitHub
    y tiendas) **no tiene Alternativo 2 ni la escucha del canto**. Avisarle al
    usuario antes de publicar la próxima versión.
  - Implementación:
    - Microsoft Store: complementos ("add-ons") con la API de la Store desde
      Electron;
    - Google Play: Google Play Billing (complemento de Capacitor).
  - Ojo: la versión completa sigue gratis en GitHub con todos los modos;
    decidir qué pasa con ella cuando se cobre.
- [ ] 🟡 **Anuncios reales** (usuario, 13-10-2026): **solo en la versión
  completa del celular**; en la PC no.
  - Los lugares ya están (`anuncios.js`: inicio, configurar, resultado y
    podio; nunca en la ronda). Quedan vacíos e invisibles hasta que haya un
    anuncio.
  - Red: **AdMob** (complemento de Capacitor).
  - Al poner anuncios hay que actualizar la política de privacidad (datos para
    anuncios, consentimiento en Europa), la clasificación por edad
    ("contiene anuncios") y `TIENDAS.md`. Cuidado con anuncios en un juego
    para toda la familia (políticas para niños).
- [ ] 🟡 **12 personas para Google Play** (usuario, 13-10-2026): tienen que
  instalar el juego desde la **prueba cerrada de Google Play** (con su cuenta
  de Google, invitadas desde la consola) y seguir 14 días. Quienes instalen
  la demo de la Microsoft Store **no cuentan**. Primero hay que pagar la
  cuenta de Google Play (25 USD).
- [ ] 🔴 **Guardar una copia de la clave de firma de Android** (04-10-2026):
  **07-10-2026: el usuario ya subió una copia a la nube**; falta protegerla con
  contraseña (Almacén personal de OneDrive o un ZIP con 7-Zip y AES-256), porque
  `keystore.properties` guarda la contraseña de la clave en texto normal.
  `platforms/android/keystore/` (archivo `.jks` y `keystore.properties`). No está
  en git. Si se pierde, las versiones nuevas no se podrán instalar encima de
  las anteriores (habrá que desinstalar). Pedirle al usuario que la guarde en un
  lugar seguro (Drive, memoria USB).
- [ ] 🟡 **Probar la versión de Linux en un equipo con Linux real.** El
  `.AppImage` sale de GitHub Actions. Para abrirlo: darle permiso de
  ejecución (`chmod +x Musical-Showdown.AppImage`) y hacer doble clic. En
  algunas distribuciones hace falta instalar `libfuse2`.
- [ ] 🟡 **Probar el `.exe` portátil en otra PC con Windows.** En esta PC ya
  se comprobó que abre. El `.exe` se descomprime en una carpeta temporal cada
  vez que se abre, así que puede tardar unos segundos en arrancar.
- [ ] 🟡 **Instalar sin avisos de "app no segura" (Android y PC)** (pedido del
  usuario, 12-10-2026; junta el pendiente anterior de Windows SmartScreen).
  Que al instalar el juego el celular o la PC lo reconozcan como seguro y no
  pidan permiso para ignorar un aviso.
  - **Android:** el aviso sale porque el APK no viene de una tienda (pide
    "instalar apps de origen desconocido" y a veces Play Protect lo marca).
    Solución: publicarlo en **Google Play** (cuenta de desarrollador con pago
    único de 25 dólares; ficha con fotos, descripción y política de
    privacidad).
  - **Windows:** "Windows protegió su PC" (SmartScreen) porque el `.exe` no está
    firmado. Soluciones: **firmar el `.exe`** con un certificado de firma de
    código (pago anual; el aviso puede tardar en desaparecer hasta que el
    programa gane reputación) o publicarlo en la **Microsoft Store** (revisar
    el costo actual de la cuenta).
  - Tiene costo, así que va **al final** según el orden acordado (07-10-2026),
    junto con la decisión de publicar el juego.
  - **Tiendas gratis vs. pagas (se le explicó al usuario el 12-10-2026):**
    - Android: el aviso solo se va instalando desde una tienda que trae el
      celular. **Google Play** (25 dólares una vez) lo quita en todos los
      Android con Google; **Galaxy Store** (gratis) solo en Samsung;
      **AppGallery** (gratis) solo en Huawei; itch.io o páginas de descarga no
      lo quitan. Las cuentas nuevas de persona en Google Play tienen que hacer
      antes una **prueba cerrada con al menos 12 personas durante 14 días**.
    - Windows: la **Microsoft Store** firma la app y quita SmartScreen; para
      personas la cuenta hoy es gratis (confirmarlo al registrarse). Se puede
      empaquetar con electron-builder (destino de la Store).
    - Al publicar en una tienda: hace falta **política de privacidad** (hay
      Firebase), **clasificación por edad** y resolver **lo legal de las
      letras**; las actualizaciones pasan por la revisión de la tienda; y si
      Google Play firma con su clave, los APK de GitHub ya no se instalan encima
      (elegir un solo camino y llevar los avisos de versión a la tienda).

## ✨ Mejoras visuales y de lógica

> Se irán agregando las que pida el usuario o se le recomienden.

- [ ] 🔴 **CRÍTICO — Cambiar la forma en que se buscan las canciones** (pedido
  del usuario, 04-10-2026), teniendo en cuenta que el juego es de **canto**.
  Hoy el moderador escribe el nombre o un fragmento y elige la canción de una
  lista. Antes de hacer nada: preguntarle al usuario cómo lo imagina (por
  ejemplo, por lo que se cantó, por artista, por voz…) y mostrarle maquetas.
  Relacionado: la parte legal de las letras y que las palabras no siempre están
  en la letra guardada (sección de canciones).
  - 04-10-2026: el usuario dejó para este pendiente la duda de si se busca
    **solo por nombre** o también **por fragmento de la letra** (hoy busca por
    los dos). Ya se hizo: búsqueda mientras se escribe, mínimo 3 letras y una
    versión por artista.
  - 04-10-2026: el usuario eligió usar **reconocimiento de voz** (entre lista
    automática, votación, voz y tipo Shazam). Falta definir con él: en qué
    plataformas, si puede necesitar internet, si puede tener costo, qué hace
    el reconocimiento (detectar la palabra, buscar la canción o ambas) y si el
    juego decide solo o el moderador confirma. Probar primero qué tan bien
    reconoce voz **cantada** antes de programarlo en el juego.
  - **Decisiones del usuario (04-10-2026):** opción 2, **Vosk sin internet**
    (modelo de español dentro del juego, gratis, funciona igual en web, `.exe`
    y Android); lo que entiende se usa para **buscar la canción**; también se
    puede **escribir, solo el nombre de la canción**; el juego **sugiere** y el
    moderador confirma "Correcta / Incorrecta". Primero, una página de prueba
    aparte para cantarle y medir qué tan bien entiende.
  - 04-10-2026, página de prueba (carpeta temporal, fuera del juego): Vosk
    para el navegador (`vosk-browser` 0.0.8) + modelo `vosk-model-small-es-0.42`
    (40 MB). Carga en 3,5 s sin internet. Con una frase **hablada** de Color
    Esperanza la entendió palabra por palabra y encontró la canción (8
    palabras). Falta que el usuario la pruebe **cantando**.
  - **12-10-2026:** el usuario aclaró que el pendiente "Cambiar la forma de
    marcar si la canción es correcta o incorrecta" es parte de este: quiere que
    sea **automático, mediante la detección de una IA** (se juntaron los dos
    pendientes). Cambia lo decidido el 04-10 ("el juego sugiere y el moderador
    confirma"): **preguntarle** si el moderador puede corregir a la IA cuando
    se equivoca. Sigue para el final según el orden acordado (07-10-2026).
  - **Regla del usuario (12-10-2026) — qué cuenta como correcta:** la IA
    compara con la letra original y verifica que la palabra esté **en el
    fragmento cantado / escuchado**, no solo en algún lugar de la canción. Si
    canta una canción que tiene "Amor" pero un fragmento donde no está, **el
    punto no vale**, a menos que diga el nombre de la canción (supuesto: vale si
    el título tiene la palabra, como "Amor Eterno"; confirmarlo con el
    usuario). El usuario espera que la IA no se equivoque; depende de qué tan
    bien entienda voz **cantada**: probar primero la página de prueba cantando.
  - **12-10-2026 — la letra no se guarda en la app:** el catálogo pasa a tener
    solo nombre, artista, género y palabras sueltas (ver "Catálogo grande sin
    letras"). El usuario quiere que la IA **busque la letra en internet** al
    momento (él mencionó YouTube) para comprobar lo cantado, sin tenerla
    descargada.
    - Al reconocer la canción, la pantalla muestra su nombre; si no la
      reconoce, queda la búsqueda por nombre.
    - Ojo: YouTube no da letras (los subtítulos solo los descarga el dueño del
      video), y leer letras de otros sitios tiene derechos de autor. Al llegar
      aquí, mostrarle opciones: servicio de letras con licencia (por ejemplo
      Musixmatch), reconocimiento de canciones cantadas (tipo SoundHound /
      ACRCloud), costos y qué funciona sin internet. Va al final, según el
      orden acordado.
- [ ] 🟡 **Catálogo grande sin letras** (usuario, 12-10-2026).
  - Cada canción: nombre, artista, género, si es famosa, palabras sueltas y
    palabras del coro. **Sin letra.**
  - "Buscar canción" busca **solo por el nombre**; YouTube sigue siendo solo el
    enlace ▶.
  - Meta: las **100 mejores canciones de cada género**, en español, y **más
    géneros**.
  - Las listas de palabras se arman y **el usuario las revisa de a 20**
    antes de que entren al juego. Una palabra equivocada haría que la canción
    no aparezca al buscar.
  - Al terminar, se resuelve también el pendiente legal de las letras guardadas
    (sección de canciones).
  - **Criterio (usuario, 12-10-2026):**
    - Palabras de la parte más famosa o pegadiza (el coro).
    - Una **palabra clave** propia de cada canción, más palabras compartidas.
    - Ronda mezclada: mitad clave, mitad compartida.
    - **Apto para toda la familia (usuario, 21-10-2026):** ni palabras ni
      canciones de contenido adulto, drogas o narco.
  - **Géneros (10):** pop, rock en español, reggaetón, salsa, balada, cumbia,
    bachata, merengue, regional mexicano y trap/urbano.
  - **Avance (12-10-2026):** formato nuevo hecho y confirmado (AUDITORÍA
    parte 30). **200 canciones cargadas, 20 por género** (AUDITORÍA parte 31):
    - Revisadas por el usuario: reggaetón, pop y rock en español (las aprobó
      "por ahora") y **salsa** (21-10-2026).
    - **Criterio (usuario, 24-10-2026): la misma canción, con una palabra más
      familiar; no se cambia la canción.** Hecho en 7 canciones: "Desnúdate
      Mujer" (palabra "mujer"), "Propuesta Indecente" ("propuesta"), "Pégame Tu
      Vicio" ("pégame"), "Contrabando y Traición" ("traición"), "Por Tu Maldito
      Amor" ("amor"), "Nena Maldición" ("nena") y "Lamento Boliviano" (sin
      "borracho"). Para otras 7 siguen puestas canciones de reemplazo mientras
      se confirma una palabra (ver "Preguntas para el usuario", punto 1).
    - Armadas y cargadas sin revisión, a pedido del usuario:
      balada, cumbia, bachata, merengue, regional mexicano y trap y
      urbano.
  - **En pausa hasta que el usuario pida retomarlo (12-10-2026):** "tenlo en
    cuenta para las futuras actualizaciones oficiales; haz lo mismo con los
    demás géneros hasta que te pida retomar el tema para modificar alguna
    cosa". Al retomarlo:
    - revisar con él las 10 tandas (sobre todo las 7 sin revisar);
    - agregar palabras a las canciones que quedaron solo con la clave;
    - seguir hasta 100 por género.
- [ ] 🟡 **Probar el selector de rueda en un teléfono Android real.** El APK
  está en `dist/android/Musical-Showdown.apk` (se genera con
  `npm run build:apk`). El deslizamiento y el "lanzamiento" solo se probaron
  con eventos simulados.
  Puede que haya que ajustar la sensibilidad (`MIN_FLING`, `MOMENTUM_MS` en
  `valuePicker.js`).


## 🎮 Diseño / implementación pendiente (decisión del usuario)

- [ ] 🟡 **Partida en dos dispositivos vinculados** (pedido del usuario,
  07-10-2026). Un dispositivo muestra la pantalla de la ronda (la pantalla
  principal) como hoy; el segundo sirve para **elegir quién canta**. Al
  elegir, la pantalla principal muestra el nombre (o nombre y grupo) de quien
  canta, y la secundaria muestra una **animación de audio** que indica que se
  escucha la voz de esa persona cantando. Antes de programarlo, preguntar y
  mostrar una maqueta: cómo se vinculan (código, QR, misma red Wi-Fi o
  internet), qué más hace la pantalla secundaria (confirmar Correcta /
  Incorrecta, relevo, pausa…), si la animación usa el micrófono de verdad y en
  qué dispositivos. Ojo: conectar dos dispositivos sin internet (misma red
  Wi-Fi) es posible entre apps instaladas; por internet puede necesitar un
  servidor (posible costo, entonces va al final según el orden acordado).
  - 07-10-2026: el usuario prefiere **QR sin Wi-Fi**. Aclaración pendiente de
    conversar: el QR solo sirve para *encontrarse* (lleva el "código" de la
    partida); los dos dispositivos igual necesitan un camino para hablar:
    la misma red Wi-Fi (aunque no tenga internet; sirve el punto de acceso de
    un celular), internet (posible servidor) o Bluetooth (solo entre apps
    instaladas y más complejo).
  - **12-10-2026, decisión del usuario ("por ahora"):** **misma red Wi-Fi, sin
    internet**: los dos dispositivos conectados a la misma red (router o zona
    Wi-Fi de un celular, aunque no tenga datos), emparejados con QR y hablándose
    directo entre ellos, sin servidor. Faltan: qué hace el segundo dispositivo y
    si la animación de audio usa el micrófono.
  - **Idea principal del usuario (12-10-2026) — qué se vincula con qué:**
    celular ↔ PC, celular ↔ TV (Android), PC ↔ TV (Android). **No** se vinculan
    dos del mismo tipo (celular-celular, PC-PC, TV-TV).
  - Consecuencias a tener en cuenta (explicadas al usuario):
    - **TV con Android:** hoy el juego no está preparado para Android TV
      (aparecer en el menú de la TV, manejarse con el control remoto). Hay que
      adaptarlo; la navegación con flechas que ya existe (`teclado.js`) ayuda.
    - **QR:** escanea el que tiene cámara (el celular). Entre **PC y TV**, que
      normalmente no tienen cámara, hace falta otra forma: por ejemplo, un
      **código corto** que se escribe en el otro dispositivo.
    - Hay que saber de qué tipo es cada dispositivo (celular, PC o TV) para
      no dejar vincular dos iguales.
  - **Qué muestra cada uno (usuario, 12-10-2026):**
    1. **Control** (el celular, o la PC si se vincula PC ↔ TV): toda la pantalla
       son **los dos botones de los jugadores** (los pulsadores con su nombre),
       sin la palabra ni el tiempo.
    2. **Pantalla grande** (PC o TV): el resto de la ronda: **el tiempo, la
       palabra** y los demás botones.
    3. La animación **"¡Ana canta!"** sale también en la pantalla grande;
       mientras tanto, en el control se ve **el tiempo** o, sin tiempo,
       **"Finalizar ronda"**.
    4. La animación **usa el micrófono** para oír al que canta; el micrófono es
       siempre el del **celular** (o el de la **PC** si se vincula PC ↔ TV). Base
       para la futura IA de voz.
    5. Mientras alguien canta, **❌ / ✅, "🔎 Buscar canción" y "← Volver" van en
       el control**, junto al tiempo o a "Finalizar ronda": el moderador decide
       desde su mano.
    6. La voz **no** se escucha por los parlantes de la pantalla grande: solo
       mueve la animación (así no se acopla el sonido).
    7. **Puntajes y relevos en la pantalla grande**; la **pausa en el control**,
       junto a los botones de los jugadores o equipos (interpretación; el usuario
       puede corregirla).
  - **Etapas acordadas (12-10-2026):**
    1. **Celular + PC — HECHA, versión 1.23 (12-10-2026).** Ver
       AUDITORÍA, partes 26 y 27; probada en el celular del usuario.
       - "📱 Vincular" en la ronda de la PC muestra el QR y un código de 6
         números que cambia cada minuto. El reloj se detiene mientras está
         abierta.
       - En el celular, el botón a la izquierda de Ajustes escanea el QR o
         permite escribir el código.
       - El QR también se puede escanear con la cámara del celular, fuera de
         la app.
       - Al revés: "📱 Vincular" en la ronda del celular muestra un código; en
         el inicio de la PC (botón a la izquierda de Ajustes) se escribe y la
         partida pasa a la PC.
       - El celular muestra los dos botones y la pausa; mientras alguien
         canta, ❌ / ✅, el tiempo o "Finalizar", Buscar y Volver.
       - Los relevos y las ventanas (relevo, ayuda) se manejan en la PC.
  - [ ] 🟢 **Ajustar el volumen mínimo que cuenta como voz** (`UMBRAL_VOZ` en `src/js/microfono.js`) si al probar cantando no detecta bien o detecta ruido (usuario, 12-10-2026).
  - [ ] 🟢 **Que la cámara del celular abra la app con el QR en cualquier
    celular** (usuario, 12-10-2026). **En espera (usuario, 12-10-2026): se hace
    cuando la app esté publicada en Play Store** (preparado el 28-10-2026: en `docs/vincular/index.html` basta cambiar `DESCARGA_ANDROID` y `DESCARGA_OTROS`), porque el enlace de descarga
    de GitHub es temporal. Entonces la página `docs/vincular/` y el respaldo
    del enlace (`browser_fallback_url`) deben llevar a Play Store, y se revisa
    si conviene otro dominio. La app ya está preparada
    (`AndroidManifest.xml`, `docs/vincular/`, `docs/assetlinks.json`). Falta
    publicar en GitHub, con el OK del usuario:
    1. Activar **GitHub Pages** en el repositorio (Settings → Pages → rama
       `main`, carpeta `/docs`): así, sin la app instalada, se abre la página
       que lleva a descargarla.
    2. Crear el repositorio público **`maxy26.github.io`** con el archivo
       `.well-known/assetlinks.json` (copia de `docs/assetlinks.json`, con la
       huella de la clave del proyecto). Sin él, Android abre el enlace en el
       navegador en vez de la app. Funciona sin internet una vez que Android
       lo verificó, cuando se instala la app.
    - Mientras tanto, en un celular se puede activar a mano: Ajustes de
      Android → Apps → Musical Showdown → Abrir de forma predeterminada →
      agregar el enlace.
  - Ojo, Windows: la red Wi-Fi de la PC del usuario está marcada como
    **pública**; el permiso del Firewall tiene que ser para esa red (al
    usuario ya le funciona).
    2. Micrófono: la animación de "¡X canta!" se mueve con la voz (celular).
    3. Android TV como pantalla grande (adaptar a la TV y al control remoto;
       la TV necesita abrir la conexión desde un complemento nativo).
    4. PC como control de la TV, con un código corto en vez de QR.

- [ ] 🟡 **Mejorar la vinculación de dispositivos: por internet, con servidor**
  (pedido del usuario, 12-10-2026). La partida en dos dispositivos empieza
  "por ahora" con la misma red Wi-Fi sin internet. Más adelante, cambiarla (o
  sumarle) la conexión **por internet con un servidor**, para que funcione
  aunque los dispositivos estén en redes distintas (por ejemplo, uno con datos
  móviles). Puede tener **costo** (servidor propio o un servicio de terceros),
  así que va **al final** según el orden acordado (07-10-2026). Antes de
  hacerlo, mostrarle al usuario opciones y costos.

- [x] ~~🟢 **Empate al llegar al objetivo por la penalización del relevo.**~~
  **Descartado por el usuario (12-10-2026):** "es prácticamente imposible que
  lleguen dos al puntaje objetivo, teniendo en cuenta que gana el primero que
  llegue". Si alguna vez pasara, seguir ese principio: gana el que llegó primero.
  Texto original: Con
  la penalización en vivo, al terminar la ronda dos equipos podrían pasar el
  objetivo. Se programó que gana el que tiene más puntos; si quedan con los
  mismos puntos, hoy gana el primero de la lista. Preguntar al usuario qué
  debe pasar en ese empate exacto (desempate, ronda extra, ganan los dos…).

- [ ] 🟡 **Editar los textos del juego** (pedido del usuario, 12-10-2026). El
  usuario quiere revisar y editar los textos (por ejemplo, los de las ayudas y
  los (?), donde ya cambió 14 frases el 12-10-2026). Lo va a profundizar más
  adelante: antes de hacer nada, preguntarle qué textos y cómo los quiere.

> No inventar reglas: preguntar antes (instrucción 21).

> El usuario pidió ir **con calma, paso a paso y a fondo**: definir cada idea
> por completo con preguntas antes de programarla.



---

## ✅ Resueltos

- [x] 🟡 **Diseño más profesional, modificación general** (resuelto el
  26-10-2026, versión 1.26). Primero 12 propuestas en una página de prueba; el
  usuario aceptó 1, 2, 3, 4, 7, 8, 9, 11 y 12 y rechazó 5, 6 y 10. Se probó solo
  en la personal y, al confirmarlo, pasó a las tres apps. La equis de
  multiplicar (✖️, `cancel`) reemplaza al ✨ de los multiplicadores, del mismo
  color que los demás íconos.

- [x] 🟡 **Menciones de herramientas en los archivos del proyecto** (resuelto el
  21-10-2026): se quitaron de los documentos y comentarios, y la guía técnica
  queda solo en la PC (fuera de git). Lo que ya estaba en el historial de git
  se deja como está.

- [x] **Resolver la parte legal de las letras** — resuelto 12-10-2026: el catálogo ya no guarda letras, solo nombre, artista, género y palabras sueltas (AUDITORÍA parte 30). Queda aparte la IA que reconozca lo cantado (servicio de letras con licencia, al final). (sin audio): qué fuente se
  puede usar, qué se puede guardar dentro de la app (fragmentos o letra
  completa), si hace falta licencia y cuál. Hasta entonces, `data/songs.js`
  sigue siendo de ejemplo (instrucción 22). **El usuario decidió dejarlo para
  después (28-09-2026)**: no bloquea los demás pendientes, solo el siguiente
  (palabras que no están en la letra) y la publicación.
  - **Decisión del usuario (07-10-2026):** la letra **ya no se muestra** en el
    juego (podría requerir pagar); se guarda solo por dentro para saber si la
    canción lleva la palabra, y la búsqueda solo trae canciones con la palabra
    de la ronda (hecho, ver auditoría). Falta averiguar si guardar la letra
    por dentro también necesita licencia (si es de pago, va al final).
- [x] **Las palabras que se piden no siempre están en la letra guardada.** — resuelto 12-10-2026: ya no hay letra guardada; cada palabra viene de la parte famosa de la canción y la revisa el usuario.
  De 25 palabras que el juego puede pedir en `data/songs.js`, solo 11
  aparecen en el fragmento de letra de su canción. Ejemplo: puede pedir
  "CIELO" diciendo que está en "Color Esperanza", pero el moderador no la ve
  en la letra ni queda resaltada. Pasa porque las letras guardadas son
  fragmentos cortos. Hay que resolverlo junto con la fuente real de letras:
  por ejemplo, calcular `words` a partir de la letra en vez de escribirlo a mano.


- [x] **Botón para que los jugadores pidan cantar** (anotado por el usuario,
  30-09-2026; hecho el 12-10-2026, versión 1.22): el pulsador es el mismo botón
  con el nombre; lo toca el jugador. Al tocarlo sale la pantalla "¡Ana canta!"
  con ❌ / ✅ directos, "← Volver", "🔎 Buscar canción" opcional y ▶ YouTube.

- [x] **Aviso de Node al correr el lint** (resuelto 12-10-2026):
  `eslint.config.js` → `eslint.config.mjs`.
- [x] **Vulnerabilidades de `npm audit` en `platforms/desktop`** (resuelto
  12-10-2026): de 19 (1 crítica, 14 altas) a 8 moderadas que solo afectan a una
  herramienta de compilación. Electron 33 → 44 y electron-builder 25 → 26; se
  comprobó que el `.exe` compila y abre (inicio, versión, `app://`).

- [x] **El reloj seguía corriendo con una ayuda abierta** (detectado el
  11-10-2026; resuelto el 12-10-2026, publicado en la versión 1.21): ahora, si
  durante la ronda se abre un (?) o la ❓, el reloj se
  detiene y sigue desde el mismo segundo al cerrarla (decisión del usuario).

- [x] **Botoncitos de ayuda (?) y ayuda de cada modo** (pedido del usuario,
  03-10-2026; probado en 6 vueltas y confirmado el 12-10-2026, versión 1.20).
  (?) chico, blanco/gris, al costado derecho de cada sección o ventana, con una
  frase corta y tarjetas con imagen; la ❓ del inicio explica todo el juego y,
  dentro de un modo, ese modo (5 combinaciones). Cada texto explica solo el
  modo que se juega. Con la versión: "Sin relevos" con 0 en Alternativo 2,
  tiempo personalizado de 1 en 1 y lista de jugadores con alto fijo. Ver la
  auditoría (sesión 8, partes 13 a 18).

- [x] **Actualizar la ayuda "Cómo se juega"** (pedido del usuario, 29-09-2026;
  resuelto 11-10-2026): ahora es un resumen breve y general del juego (hoja con
  historieta, aprobado sobre una maqueta). Ver la auditoría (sesión 8, parte 12).

- [x] **Revisar y modificar Clásico** (pedido del usuario, 30-09-2026; cerrado
  11-10-2026): se le dio el resumen y respondió que los modos de juego ya están
  hechos y no hay que cambiarlos.

- [x] **Ícono chico de las notificaciones** (10-10-2026; resuelto 11-10-2026):
  `ic_notificacion.xml` (♫, dorado) desde la 1.17; el usuario confirmó que se
  ven las notas en la barra.
- [x] **Probar el APK en un teléfono Android real** (resuelto 11-10-2026): el
  usuario instala y usa las versiones en su celular (OPPO CPH2695, Android 16).

- [x] **Archivos de Firebase en Descargas** (resuelto 11-10-2026): se borraron
  a pedido del usuario. No necesitan copia: `google-services.json` se vuelve a
  bajar de Firebase (y el proyecto tiene la suya en
  `platforms/android/android/app/`), y la clave de la cuenta de servicio se
  genera de nuevo en Firebase y se carga en el secreto `FIREBASE_SERVICE_ACCOUNT`.
  Para mandar pruebas desde la PC hay que generar una clave nueva (o usar un
  aviso con `"importante": true` en `avisos.json`).

- [x] **Notificaciones fuera de la app con Firebase** (pedido del usuario,
  10-10-2026; resuelto 11-10-2026). Proyecto `musical-showdown-4542a`, secretos
  cargados en GitHub. Probado en el celular del usuario con la 1.15: la
  notificación de prueba llegó con la app cerrada.

- [x] **El nombre técnico de Android era `com.palabracantada.app`** (nombre
  anterior del juego; resuelto 10-10-2026 a pedido del usuario): ahora es
  `com.musicalshowdown.app`. Android lo toma como otra app: hay que desinstalar
  la vieja (hasta la 1.14) e instalar la nueva. Ver la auditoría (sesión 8, parte 4).

- [x] **Botón "Seleccionar todos" en Géneros musicales** (pedido del usuario,
  08-10-2026; resuelto 10-10-2026). Quedó como dos botones: "Todos"
  (predeterminado) y "Más" (hoja con cada género y artistas de ejemplo; uno
  solo en Clásico y Alternativo 1, varios en Alternativo 2). Ver la auditoría
  del 10-10-2026 (sesión 8).
- [x] **Quitar el texto innecesario, colores nuevos y ✕ roja** (pedido del
  usuario, 10-10-2026; resuelto 10-10-2026). Aprobado sobre una maqueta "antes /
  después" de 16 pantallas. Ver la auditoría del 10-10-2026 (parte 2).
- [x] **Pruebas automáticas de pantallas** (pedido del usuario, 10-10-2026;
  resuelto 10-10-2026): Playwright en `test/e2e`, `npm run test:e2e`, también
  en GitHub Actions.

- [x] **Lista de jugadores con desplazamiento** (pedido del usuario,
  10-10-2026; resuelto 10-10-2026). La lista tiene un alto fijo y se desplaza
  por dentro, así la pantalla no se alarga. Diseño B elegido por el usuario
  entre 3 maquetas: una columna numerada en un recuadro, contador de nombres
  junto a "Jugadores", difuminado arriba y abajo, y al agregar un jugador
  la lista baja sola hasta el espacio nuevo.

- [x] 🟡 **(Resuelto 08-10-2026)** **Navegar con el teclado** (pedido del usuario,
  29-09-2026; antes "Lista de jugadores: navegar con las flechas y confirmar con
  Enter"). Se hizo con maqueta aprobada (`src/js/teclado.js`): las flechas
  recorren toda la pantalla hacia donde apuntan (dentro de una ventana, solo esa
  ventana); Enter es un clic; en un nombre se escribe al llegar y Enter apaga /
  enciende la edición; → llega a la ✕ y Enter elimina al jugador; Backspace es
  "volver" (cierra o cancela ventanas y la ruleta, "← Inicio", Pausa en la
  ronda); en la ruleta ↑ ← bajan y ↓ → suben. Las listas desplegables usan una
  lista propia del juego con teclado, mouse y en el celular (Backspace / Esc la
  cierran). Después de usar el mouse, la primera flecha sigue desde lo último
  tocado. Un segundo toque sobre la misma lista la cierra. Falta probar la lista
  nueva en un celular real.

- [x] 🟡 **(Resuelto 08-10-2026)** **Terminar la partida a mitad de juego debe volver a "Configurar
  partida"** (pedido del usuario, 29-09-2026). Hoy "Pausa → Salir de la
  partida" vuelve al menú principal y borra todo. Preguntar: ¿se conservan los
  jugadores y la configuración elegida al volver?
  El usuario eligió conservar todo (opción a). "Sí, salir" vuelve a
  "Configurar partida" con la misma configuración y los puntajes en cero.
  De paso se arregló que "No, continuar" dejaba la ronda en pausa.

- [x] 🟡 **(Resuelto 08-10-2026)** **Compartir el juego desde el podio** (pedido del usuario, 07 y
  08-10-2026; la idea salió del aviso "Invita a tus amigos" de la maqueta de
  notificaciones). Un botón "Compartir" **en el podio** (no en las
  notificaciones) que arme una **imagen del podio** (tipo foto) para compartir
  el juego con otras personas. Falta confirmar con el usuario: qué lleva la
  imagen y qué texto/enlace acompaña; en el celular, menú de compartir
  (WhatsApp, etc.); en PC, guardar la imagen y copiar el texto. Mostrar maqueta
  antes de programar.
  Hecho con la maqueta aprobada (`src/js/compartir.js`, botón "📤 Compartir
  el podio"). Falta que el usuario lo pruebe en el celular (menú de compartir).

- [x] 🟡 **(Resuelto 08-10-2026)** **Firma del APK en GitHub y primera versión publicada** (08-10-2026).
  El usuario eligió guardar la clave como secretos de GitHub (opción A) para
  que las versiones publicadas se puedan instalar una encima de otra. El flujo
  ya está listo; falta que el usuario cree los 2 secretos
  (`ANDROID_KEYSTORE_BASE64` y `ANDROID_KEYSTORE_PROPERTIES`; los valores están
  en `platforms/android/keystore/SECRETO-*.txt`, borrarlos después) y publicar
  `v1.8`. Es temporal hasta publicar en una tienda oficial: en Google Play se
  puede usar **la misma clave** (Play App Signing con clave propia), así
  quienes instalaron desde GitHub podrán actualizar desde la tienda.
  Hecho: el usuario creó los 2 secretos; se publicó `v1.8`
  (https://github.com/maxy26/Musical-showdown/releases/tag/v1.8) con el APK,
  el `.exe` y el `.AppImage`. El APK publicado tiene la misma firma que los
  compilados en la PC (SHA-256 e0e0a02f…). Se borraron los archivos
  `SECRETO-*.txt`.
- [x] 🟢 **(Resuelto 08-10-2026, versión v1.8)** **Publicar una versión descargable:** crear y subir una etiqueta
  (por ejemplo, `git tag v1.0.0` y luego `git push origin v1.0.0`). GitHub
  Actions creará una "Release" con los 3 archivos.

- [x] 🟡 **(Resuelto 07-10-2026)** **Notificaciones sin fuente de avisos.** La campana abre un panel que
  por ahora dice "No hay notificaciones". Para mostrar actualizaciones,
  promoción y avisos hace falta decidir de dónde salen (un archivo en internet,
  la página de Releases de GitHub, etc.). Preguntar al usuario.
  Hecho con la maqueta aprobada: los avisos salen de GitHub (versiones
  publicadas más nuevas que la instalada → "Actualización" con "Descargar";
  `avisos/avisos.json` → novedades y promociones, ver `avisos/LEEME.md`),
  globito con los no leídos, y sin internet se ven los últimos guardados
  (`src/js/avisos.js`).

- [x] 🟡 **(Resuelto 07-10-2026)** **Letras del rediseño sin internet** (tipografías, no letras de canciones). Fredoka y Nunito (igual que
  Unbounded e Inter) se cargan desde Google Fonts. En el `.exe` o el `.apk` sin
  conexión se ven con una letra genérica. Solución: incluir los archivos de las
  letras en `src/` (son de licencia libre OFL) y agregarlos a `sw.js`.
  Preguntar al usuario antes.
  Hecho: las cuatro tipografías (archivos `.woff2`, 168 KB) están en
  `src/fonts/` con sus licencias OFL (`LICENCIAS.txt`) y se cargan desde
  `css/fuentes.css`; ya no se pide nada a Google Fonts.
- [x] 🟡 **(Resuelto 07-10-2026)** **Individual empezaba con 4 espacios para nombres**
  después de pasar por Grupal (el usuario quería 2 en Individual y 4 en
  Grupal, los mínimos para empezar). Al cambiar el tipo de batalla, la lista
  conserva los nombres escritos y deja espacios vacíos solo hasta el mínimo
  (`fitPlayers` en `config/players.js`).

- [x] 🟡 **(Resuelto 07-10-2026)** **La música de fondo empieza apenas se abre la
  app** (pedido del usuario). En el `.exe` (Electron con
  `autoplay-policy=no-user-gesture-required`) y en Android (Capacitor ya lo
  permite) suena sola al abrir; en la web sigue empezando con el primer toque,
  porque los navegadores no dejan sonar nada antes.

- [x] 🟡 **(Resuelto 07-10-2026)** **Sonidos nuevos, más profesionales y envolventes** (pedido del
  usuario, 01-10-2026). Cambiar los sonidos actuales (música de fondo, clic,
  tic-tac) por unos mejores y más acordes al juego. Por ahora le interesa una
  **melodía muy parecida a la de los juegos de Nintendo** (alegre, tipo
  chiptune/8 bits). Hoy no hay efectos especiales (acierto, fallo, victoria):
  proponerlos también. Antes de hacerlo: preguntar si los sonidos deben ser
  sintetizados (regla de INSTRUCCIONES) o archivos, mostrar opciones para que
  elija y cuidar que sean de uso libre (no copiar melodías de Nintendo).
  - **Decisiones del usuario (04-10-2026):** sonidos **sintetizados** en estilo
    chiptune de 8 bits; agregar efectos al acertar, fallar, cambiar de ronda,
    usar el relevo (y el relevo de más) y una fanfarria de victoria. Se le
    mostró una página de prueba (fuera del juego) con 3 músicas de fondo
    originales y 9 efectos generados con Web Audio; falta que elija.
  - **Cambio de rumbo (04/05-10-2026):** rechazó los sintetizados (8 bits,
    piano, sintetizador moderno). Ahora se usan **grabaciones CC0** (Kenney y
    OpenGameArt): hay que cambiar la regla 18 de INSTRUCCIONES al pasarlo al
    juego. Elegido hasta ahora (pruebas 5 a 9, en el scratchpad, fuera del
    juego): Funky Disco para el inicio y la configuración, Coffee Beans en
    bucle sin corte para las rondas, las dos con una entrada de 4 s (filtro que
    se abre con barrido de subida). En los últimos 5 s la música se acelera
    (más rápida y más aguda) y el reloj sigue siendo el de hoy. Clic de botones
    elegido; los demás momentos (elegir, acertar/fallar, relevo, relevo de más,
    aviso, interruptor, ruleta) siguen en elección. Falta decir para qué es el
    "Bong".
  - **Pedidos del usuario del 05-10-2026** (hechos solo en el juego de prueba,
    falta que los apruebe para pasarlos al juego real):
    1. Botones + y − de intentos y relevos con el sonido del interruptor.
    2. Clic también en las listas de puntaje y tiempo y en los nombres.
    3. Sonido propio en la ruleta de puntaje y tiempo (uno por número).
    4. Efectos bien audibles frente a la música: volúmenes separados y la
       música baja un momento cuando suena un efecto (confirmar que esto es lo
       que quiso decir).
    5. Volver a poner el botón 🔊 donde estaba (configuración, grupos y ronda),
       ahora **solo para la música de fondo** (cambia la regla 17).
    6. Botón de Ajustes también en las rondas (preguntar si la ronda se pausa
       mientras está abierto).
    7. En el celular, Ajustes como panel que entra desde la izquierda (hoy sube
       desde abajo). En PC sigue la ventana centrada.
  - **Elecciones definidas (06-10-2026):** Elegir = cristal doble; Acertar /
    Fallar = acorde de cinco notas con "Elegir 7" (sube / baja); Falla (relevo
    de más) = nota repetida y caída; Interruptor = gemelo más grave
    (switch14 a 0,8). Siguen en elección: clic (intermedio entre Clic 2 y
    Clic 3), relevo, aviso (el zap doble rápido más suave), ruleta y
    abrir/cerrar.
  - **Pedidos del 06-10-2026** (hechos en el juego de prueba, falta aprobarlos):
    1. Los Sí / No cambian con cada toque, aunque se toque la opción ya elegida.
    2. Sin parpadeo al tocar Sí / No o + / −: el juego volvía a dibujar la
       pantalla y repetía su animación de entrada (`.screen{animation:fadein}`);
       ahora al redibujar la misma pantalla no se repite y se conserva la
       posición.
    3. Los efectos ya **no bajan la música** (se quitó eso); volúmenes fijos y
       barras de volumen en Ajustes para música y efectos (al máximo: música
       0,45 y efectos 0,9, para que no quede muy fuerte). Volumen en 0 = "No".
    4. Botón 🔊: el usuario duda entre **A** (al quitarla se detiene y al volver
       sigue donde iba) y **B** (sigue corriendo en silencio). Las dos están en
       la mesa para que elija. **Eligió A (06-10-2026).**
  - **Más elecciones (06-10-2026):** clic = Clic 3 presionar y soltar; aviso =
    zap doble rápido más suave; ruleta = tic suave; relevo **sin sonido propio**
    (suena el clic). Siguen en elección: versión más suave de Elegir y de
    Acertar/Fallar, abrir/cerrar (parecidos al punteo de dos notas), y los
    sonidos de "fin del tiempo" y de la cuenta.
  - **Pedidos del 06-10-2026, parte 2** (hechos en el juego de prueba):
    1. La tarjeta completa de "Jugar" suena con el clic.
    2. El botón de ayuda ❓ suena como abrir/cerrar ventana.
    3. Sonido propio cuando se acaba el tiempo de la ronda.
    4. Cuenta antes de cada ronda (3, 2, 1…) configurable en "Configurar
       partida" (No o de 1 a 10 s; por defecto 3), con su sonido (por defecto el
       mismo del reloj). Se muestra en lugar de la barra de carga del "VS".
       Confirmar con el usuario: duración por defecto, si va antes de mostrar
       la palabra (así está) y si se puede pausar.
    5. Solo en PC: tocar la fila completa de "Puntaje objetivo", "Tiempo por
       ronda", los Sí/No y "Relevos por equipo" hace lo mismo que su control
       (las filas con − / + no, porque tienen dos acciones).
    6. Android: maqueta con 4 diseños del orden de los jugadores en la ronda
       (`disenos-ronda.html` en el scratchpad); falta que el usuario elija.
  - **Más elecciones (06-10-2026, parte 3):** Elegir = cristal doble suave y
    más lento; Abrir/Cerrar (y ❓) = metal suave de dos notas. Siguen en
    elección: Acertar/Fallar (melodías nuevas con el timbre del 3), fin del
    tiempo (parecidos a los tres tics rápidos) y la cuenta (cada número con
    su nota y un remate final).
  - **Pedidos del 06-10-2026, parte 3** (hechos en el juego de prueba):
    1. La cuenta antes de la ronda se ajusta en **Ajustes** (grupo "Partida"),
       no en "Configurar partida".
       Valores permitidos (06-10-2026): **No (0) o de 3 a 7 segundos**; por
       defecto 3.
    2. Durante la cuenta no se puede tocar nada (antes la pausa funcionaba mal
       en ese momento): una capa transparente con el número tapa la pantalla y
       bloquea toques y teclado.
    3. Ronda en el celular con el **diseño 4 (cara a cara)** y casillas grandes
       que, con la palabra y el reloj, llenan la pantalla (hasta 720 px de
       ancho).
  - **06-10-2026, parte 4:** Acertar/Fallar = escala alegre / escala que se
    apaga; fin del tiempo = tics que bajan con el reloj normal; el Bong se
    ignora. Hechos en el juego de prueba:
    1. **Todos los efectos al mismo volumen:** el motor mide cada sonido y lo
       lleva al mismo nivel (0,13); los clics, que son golpes muy cortos, se
       suben más y un limitador suave contiene su pico. La música también se
       iguala por canción (0,07, siempre por debajo de los efectos). Las barras
       de Ajustes siguen igual (0 = "No").
    2. En PC, tocar otra vez la fila de "Puntaje objetivo" (o "Tiempo por
       ronda") cierra la lista, igual que al tocar el valor.
    3. Cuenta: 10 sonidos nuevos, el mismo en 3, 2 y 1 y el final un poco más
       agudo (5 semitonos). Confirmar si "más alto" era más agudo o más fuerte.
       → **Definido (06-10-2026):** cristal en 3, 2 y 1, y el final el mismo
       cristal un 50 % **más fuerte** ("más alto" era volumen).
    4. La fila completa de "Puntaje objetivo" y "Tiempo por ronda" (PC) lleva
       encima una copia invisible de la misma lista: cada toque abre o cierra
       la lista exactamente como al tocar el valor.
  - **Falta elegir el sonido del podio** (pedido del usuario, 06-10-2026: una
    felicitación, sin bucle). En el juego de prueba suena una vez al llegar al
    podio y la música de la ronda se detiene; al volver al inicio entra Funky
    Disco. **Confirmado (06-10-2026): la música se detiene y suena el podio.**
    Opciones nuevas (prueba 18), todas CC0 de OpenGameArt: fanfarrias,
    aplausos de público, voces "Congratulations!" (pack Voiceover 40 lines) y
    jingles de victoria con varios instrumentos. Al pasarlo al juego, los
    aplausos (`aplausos.wav`, 6,9 MB) hay que convertirlos a OGG y recortarlos
    para que no pesen tanto. Se descartaron "Fireworks with applause" y "Video
    game cheerful ending" porque piden dar crédito (CC-BY), no son CC0.
  - Después falta la aprobación para pasarlo todo al juego real (cambia las
    reglas 17 y 18).
  - **Pasado al juego real (07-10-2026)** después de la prueba final del
    usuario: `sound.js`, `audio/catalogo.js`, `audio/motor.js`, audios en
    `src/audio/` (créditos en `CREDITOS.txt`), Ajustes con volumen y cuenta,
    botón 🔊, capa de la cuenta, filas completas en PC, diseño cara a cara de
    la ronda en el celular. Reglas 17 y 18 de INSTRUCCIONES actualizadas. El
    `.exe` ahora sirve el juego con `app://` para que el sonido pueda leer los
    audios.

- [x] 🟡 **(Resuelto 04-10-2026)** **El usuario ve la versión vieja al instalar el APK**. Lo
  pasa por WhatsApp (arrastrando el APK al chat) y, aun desinstalando la app,
  al abrir ve la versión anterior. El APK de `dist/android` sí trae todo. Se
  agregó la versión visible en Ajustes y el APK con la versión en el nombre
  (`Musical-Showdown-v1.2.apk`); confirmar con el usuario si con eso se ve la
  1.2. Si no, probar pasarlo por cable o Drive.
  → Causa: `android:allowBackup="true"`: Android restauraba al reinstalar el
    service worker y la caché de la versión vieja (Capacitor no atiende las
    peticiones del service worker, así que servía la copia guardada). Arreglo:
    `allowBackup="false"`, origen nuevo `musicalshowdown.app`, caché única por
    compilación, versión visible y `npm run android:release` con firma fija.

- [x] 🟡 **(Resuelto 04-10-2026)** **Recomendar logos nuevos** (pedido del usuario, 04-10-2026). Proponerle
  distintos logos basados en el logo actual (`src/icons/icon-512.png`) que
  combinen con el diseño nuevo (casual y divertido, luces de show, colores
  azul marino, amarillo, naranja-rosa y turquesa, letras Fredoka). Mostrarlos
  como maqueta para que elija; el ícono cambia en la web, el `.exe` y el `.apk`.
  → Se mostraron 4 tandas (fuera del juego). El usuario eligió **"3D premium"**:
    el logo de hoy mejorado (misma composición y colores) con volumen, reflejo,
    destellos y borde brillante. Se aplicó a la web, Android (íconos,
    adaptable y pantallas de carga) y Windows (`build-icon.ico`).

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

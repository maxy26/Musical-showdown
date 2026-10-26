# Publicar en tiendas — Musical Showdown

> Todo lo que piden las tiendas, listo para copiar y pegar (12-10-2026).
> Orden decidido por el usuario: primero **Galaxy Store** y **Microsoft
> Store**; después las demás (Google Play, etc.). Si cambia algo del juego que
> afecte estos textos (permisos, funciones, datos), actualizar este archivo y la
> política de privacidad (`docs/privacidad/index.html`).

## Datos generales

| Campo | Valor |
|---|---|
| Nombre | Musical Showdown |
| Desarrollador | Musical Showdown (cuenta individual) |
| Correo de contacto | showdownmusical@gmail.com |
| Política de privacidad | https://maxy26.github.io/Musical-showdown/privacidad/ |
| Categoría | Juegos → Música (Galaxy: "Juegos / Música"; Microsoft: "Juegos > Música") |
| Clasificación por edad | Para todos (sin violencia, sin compras, sin chat, sin publicidad) |
| Precio | Gratis, sin compras dentro de la app ni publicidad |
| Idioma | Español |
| Ícono | `src/icons/icon-512.png` (512 × 512) |
| Imágenes | `tiendas/imagenes/` (ver "Imágenes") |

## Descripción corta (hasta 80 caracteres)

> ¡Sale una palabra y gana quien cante primero una canción que la tenga!

## Descripción larga

> 🎤 **Musical Showdown** es el juego de fiesta para cantar con amigos y familia.
>
> El juego muestra una palabra, como "corazón", "bailando" o "noche", y quien
> primero canta una canción que la tenga se lleva los puntos. ¡Gana el primero
> que llega al puntaje objetivo!
>
> **Cómo se juega**
> • Escribe los nombres de los jugadores o arma equipos.
> • Sale una palabra: toca tu nombre y canta.
> • El moderador decide si la canción es correcta. Si hay dudas, puede buscar
> la canción por su nombre y escucharla en YouTube.
>
> **Modos de juego**
> • Clásico: sin reloj, un intento cada uno.
> • Alternativo 1: con reloj, se suma y se resta.
> • Alternativo 2: por equipos, tú eliges las reglas, con relevos.
>
> **Para jugar en grupo**
> • Individual o por equipos (de 2 a muchos jugadores).
> • 10 géneros: pop, rock en español, reggaetón, salsa, balada, cumbia, bachata,
> merengue, regional mexicano y trap y urbano.
> • Podio final con los mejores, listo para compartir.
>
> **Celular + PC**
> Usa la PC como pantalla grande y el celular como control: escanea el código
> QR y listo. Funciona en la misma red Wi-Fi, sin internet.
>
> Sin cuentas, sin anuncios y sin compras. Funciona sin internet.

## Novedades de esta versión (para "Qué hay de nuevo")

> • Celular + PC: usa la PC como pantalla grande y el celular como control.
> • Casi 200 canciones en 10 géneros.
> • Los puntos de cada ronda, animados.
> • Reloj más grande y cuenta regresiva en las dos pantallas.

## Permisos y por qué se piden

| Permiso | Para qué | Si no se da |
|---|---|---|
| Micrófono (`RECORD_AUDIO`) | Al tocar un nombre, escuchar 3 segundos si alguien canta. Solo mide el volumen, no graba. | Funciona igual (no vuelve sola a la ronda). |
| Cámara (`CAMERA`) | Leer el QR de la PC para vincular el celular. | Se vincula escribiendo el código. |
| Notificaciones | Avisar de versiones y novedades importantes. | No llegan avisos fuera de la app. |
| Internet / red local | Avisos (GitHub), enlaces a YouTube y vincular con la PC en la misma Wi-Fi. | Sin internet funciona igual. |

## Preguntas de privacidad / seguridad de datos

- ¿Recopila datos personales? **No.** Sin cuentas ni formularios.
- ¿Comparte datos con terceros? **Solo** el identificador de notificaciones de
  Firebase (Google) en Android, para enviar avisos. No se usa para publicidad.
- ¿Graba audio? **No.** El micrófono solo mide el volumen en el momento.
- ¿Guarda fotos o video? **No.** La cámara solo lee el QR en el momento.
- ¿Ubicación, contactos, archivos? **No.**
- ¿Los datos viajan cifrados? La conexión con GitHub y Google, sí (https). La
  conexión entre celular y PC va dentro de la red Wi-Fi del usuario.
- ¿Se pueden borrar los datos? Sí: borrando los datos de la app o
  desinstalándola (todo queda en el dispositivo).

## Clasificación por edad (cuestionario IARC u otro)

Responder **No** a todo: violencia, sangre, miedo, sexo o desnudez, lenguaje
vulgar, drogas, alcohol o tabaco, apuestas, discriminación, interacción entre
usuarios en línea, compartir ubicación, compras digitales y publicidad.

- Nota: los nombres de canciones y artistas son reales. Algunas canciones de
  trap y reggaetón pueden tener letras para adultos, pero **el juego no muestra
  letras**: solo el nombre de la canción y una palabra.
- "¿Los usuarios pueden comunicarse?": **No** (los nombres de jugadores se
  escriben en el mismo dispositivo; vincular es entre dispositivos propios).

## Imágenes

En `tiendas/imagenes/` (generadas con capturas del juego):
- **Celular** (vertical, 1080 × 2400 aprox.): inicio, configurar partida,
  ronda, "¡X canta!", resultado con puntos, podio.
- **PC** (1920 × 1080): las mismas pantallas y "Vincular celular".
- **Imagen destacada** 1024 × 500 (Google Play; Galaxy la acepta como portada).

## Demo gratis (Microsoft Store, producto aparte)

| Campo | Valor |
|---|---|
| Nombre | Musical Showdown Demo |
| Qué trae | Modo Clásico (Individual o en equipos) con 60 canciones de 3 géneros (pop, rock en español y reggaetón). Alternativo 1 se ve con candado y enlace a la versión completa. Sin escuchar el canto, sin anuncios. |
| Paquete | `npm run build:store-demo` → `dist/store-demo/Musical Showdown.appx` |
| Capturas | `tiendas/imagenes/demo/` (25-10-2026): `pc-1-inicio` a `pc-6-podio` y `pc-7-generos` (1920 × 1080, solo pop, rock y reggaetón, con la etiqueta "Versión · demo"). Para la Microsoft Store (Windows) sirven las de **PC**; las de celular (`celular-*`, 1082 × 2202) sobran salvo que se use en otra tienda. |

**Descripción corta:**
> Demo gratis: ¡sale una palabra y gana quien cante primero una canción que la tenga!

**Descripción larga:**
> 🎤 **Musical Showdown Demo** es la versión de prueba gratis del juego de fiesta
> para cantar con amigos y familia.
>
> El juego muestra una palabra y quien primero canta una canción que la tenga
> se lleva los puntos. ¡Gana el primero que llega al puntaje objetivo!
>
> **En esta demo**
> • Modo Clásico: sin reloj, un intento cada uno.
> • Individual o por equipos.
> • 60 canciones en 3 géneros: pop, rock en español y reggaetón.
> • Busca la canción por su nombre y escúchala en YouTube.
> • Podio final, listo para compartir.
>
> ¿Quieres más? En la versión completa hay 10 géneros (salsa, balada, cumbia,
> bachata, merengue, regional mexicano y trap y urbano), el modo Alternativo 1,
> con reloj, y mucho más.
>
> Sin cuentas, sin anuncios y sin compras. Funciona sin internet.

- **Permisos:** la demo no escucha el canto ni se vincula con el celular, así
  que no pide el micrófono ni la red local (solo internet, para los avisos).

## Galaxy Store (Samsung) — descartada por ahora (solo acepta empresas)

1. Cuenta gratis en https://seller.samsungapps.com (Samsung Galaxy Store Seller
   Portal). Pide datos personales y, para apps gratis, no pide datos bancarios.
2. "Agregar nueva aplicación" → Android.
3. Subir el **APK firmado** de la versión (`dist/MusicalShowdown-vX.Y.apk`).
   La firma tiene que ser siempre la misma clave del proyecto.
4. Completar la ficha con los textos de arriba, el ícono, las capturas del
   celular, la política de privacidad y la clasificación por edad.
5. Países: todos los de habla hispana (o "todos").
6. Enviar a revisión (suele tardar algunos días).

## Microsoft Store (PC)

1. Cuenta de desarrollador individual en https://partner.microsoft.com
   (para personas hoy es gratis; confirmar al registrarse).
2. "Crear una nueva aplicación" → reservar el nombre **Musical Showdown**.
3. En "Identidad del producto" aparecen tres datos que hacen falta para
   armar el paquete: **Package/Identity/Name**,
   **Package/Identity/Publisher** (empieza con `CN=`) y
   **Package/Properties/PublisherDisplayName**.
4. Se genera el paquete **MSIX** (`npm run build:store-windows`) y la
   Store lo firma: así desaparece el aviso de "Windows protegió su PC".
5. Completar la ficha (textos, capturas de PC, política de privacidad,
   clasificación por edad) y enviar a revisión.

## Antes de cada envío

- Compilar y probar la versión (instrucciones 23 a 26).
- Revisar que los textos de este archivo sigan siendo ciertos.
- Las tiendas revisan cada actualización: puede tardar días en salir.

# Google Play — respuestas para los formularios de la Play Console

> Hoja interna (28-10-2026): las respuestas listas para copiar. **No se publica**
> (está fuera de `docs/`). Se basa en la política (`docs/privacidad/index.html`)
> y en `TIENDAS.md`; las tres tienen que decir lo mismo. Si cambia algo del
> juego (permisos, servicios, anuncios, compras), actualizar los tres.
>
> **Aviso:** está escrito sin ver los formularios reales (no hay consola de Play
> abierta todavía). Google cambia las preguntas de vez en cuando: al rellenarlos,
> leer cada una y, si no encaja, ajustar aquí. Lo marcado **[AdMob]** solo vale
> cuando AdMob esté integrado; hasta entonces, contestar sin anuncios.

## Datos de la app

| Campo | Valor |
|---|---|
| Nombre de la app | Musical Showdown |
| Identificador (`applicationId`) | `com.musicalshowdown.app` |
| Versión actual | 1.26 (`versionName`); se sube con `npm run android:release` |
| Archivo para subir | `dist/MusicalShowdown-v<versión>.aab` (firmado con la clave del proyecto) |
| Tipo | Juego, categoría Música (o Trivia / Fiesta, la que Play ofrezca) |
| Gratis o de pago | Gratis (con suscripción Premium opcional) |
| Correo de contacto | showdownmusical@gmail.com |
| Política de privacidad | https://maxy26.github.io/Musical-showdown/privacidad/ |
| Términos de uso | https://maxy26.github.io/Musical-showdown/privacidad/#parte-2 |
| País del desarrollador | Colombia (provisional; nombre del estudio pendiente) |

## 1. Contenido de la app (App content)

| Pregunta | Respuesta |
|---|---|
| Política de privacidad | Pegar la dirección de arriba. |
| Anuncios | **[AdMob] Sí, contiene anuncios.** Antes de integrarlo: No. |
| Acceso a la app | Todo es accesible sin cuenta ni contraseña. Las funciones Premium se desbloquean con la suscripción (no hace falta una cuenta de prueba: se puede probar con un probador de licencias). |
| Público objetivo | **13–15, 16–17 y 18 o más.** No marcar menores de 13. |
| ¿Atrae a niños? | No debería: ver el aviso de abajo. |
| Apps de noticias, COVID-19, finanzas, salud, gobierno | No a todas. |
| Anuncios: ID de publicidad | **[AdMob] Sí**, la app usa el ID de publicidad, para **publicidad**. |
| Clasificación de contenido | Cuestionario IARC (sección 3). |

**Aviso — público objetivo y niños.** La descripción habla de «amigos y familia» y el
catálogo es apto para toda la familia, mientras que el público declarado es 13+.
Si Play considera que la app atrae a menores de 13, aplicaría la política de
**Familias** (reglas estrictas para anuncios y datos). Para evitarlo: no marcar
menores de 13, no usar imágenes ni textos pensados para niños, y revisar la
descripción larga de la ficha. Es una decisión a vigilar, no un problema hoy.

## 2. Seguridad de los datos (Data safety)

**¿La app recopila o comparte datos del usuario?** Sí (el identificador de
notificaciones y, con AdMob, datos de publicidad).

**¿Todos los datos se cifran en tránsito?** Sí: la conexión con Google (Firebase,
AdMob, Play) y GitHub va por HTTPS. La conexión celular–PC dentro de la red Wi-Fi
(`ws://`, `usesCleartextTraffic`) no sale de la red del usuario y no recopilamos
esos datos en ningún servidor.

**¿Puede el usuario pedir que se borren los datos?** No hay cuentas ni datos en
un servidor nuestro: lo guardado vive en el dispositivo y se borra al borrar los
datos de la app o desinstalarla. Para lo que pueda tener Google, el usuario
escribe a showdownmusical@gmail.com (política, sección 13). No se necesita una
página aparte de borrado porque no hay cuentas.

### Datos que se declaran

| Categoría de Play | ¿Recopilado? | ¿Compartido? | Para qué |
|---|---|---|---|
| **Identificadores de dispositivo u otros** → token de notificaciones (Firebase Cloud Messaging) | Sí | No (Google lo procesa por encargo nuestro) | Funcionalidad de la app (avisos) |
| **[AdMob] Identificadores de dispositivo u otros** → ID de publicidad | Sí | **Sí**, con Google | Publicidad o marketing |
| **[AdMob] Interacciones con la app** → interacción con anuncios | Sí | **Sí**, con Google | Publicidad o marketing |
| **[AdMob] Ubicación aproximada** (por la IP) | Sí | **Sí**, con Google | Publicidad o marketing |

> Para AdMob, copiar la lista exacta de la guía de Google («AdMob: divulgación de
> datos de Play») del momento: cambia con las versiones del SDK.

### Datos que NO se declaran (y por qué)

| Dato | Motivo |
|---|---|
| Audio / voz | El micrófono solo mide el volumen en el momento; no se graba, no se guarda ni se envía (procesamiento efímero en el dispositivo). |
| Fotos o video | La cámara solo lee el código QR en el momento y no se guarda ni se envía. |
| Nombres de jugadores, ajustes, puntajes | Se quedan en el dispositivo, no se envían a ningún servidor. |
| Compras / historial de compras | Las procesa Google Play; el juego solo consulta si la suscripción está activa y no recibe datos de pago. |
| Ubicación precisa, contactos, archivos, mensajes, salud, financieros | No se usan. |
| Análisis de uso, informes de fallos | No se usan (la política lo dice). Si se agrega Firebase Analytics o Crashlytics, hay que declararlos aquí y en la política. |

## 3. Clasificación de contenido (IARC)

Categoría: **Juego**.

| Pregunta | Respuesta |
|---|---|
| Violencia, sangre, miedo | No |
| Sexo, desnudez | No |
| Lenguaje vulgar | No (el juego no muestra letras; solo título de canción y una palabra) |
| Drogas, alcohol, tabaco | No |
| Apuestas | No |
| Discriminación | No |
| Interacción entre usuarios | No (los nombres se escriben en el mismo dispositivo; vincular es entre dispositivos propios) |
| Compartir ubicación | No |
| Compras digitales | **Sí** (suscripción Premium) |
| Anuncios | **[AdMob] Sí** |

El resultado depende de estas respuestas y lo calcula IARC; no se puede elegir.

## 4. Permisos de Android

Lista comprobada el 28-10-2026 en el manifiesto ya combinado de la versión de lanzamiento (`merged_manifests/release`):

| Permiso | Para qué | ¿Opcional? |
|---|---|---|
| `INTERNET` | Avisos (GitHub), enlaces, compras, notificaciones | — |
| `CAMERA` | Leer el QR de la PC (`uses-feature` no obligatorio) | Sí, se puede escribir el código |
| `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` | Escuchar si alguien canta (solo volumen); función de pago | Sí |
| `POST_NOTIFICATIONS` | Avisos de versiones y novedades (Android 13+) | Sí |
| `com.android.vending.BILLING` | Suscripción Premium | — |
| `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `com.google.android.c2dm.permission.RECEIVE` | Los suman Capacitor y Firebase (estado de red, notificaciones). Son permisos normales | — |
| **[AdMob]** `com.google.android.gms.permission.AD_ID` | ID de publicidad para anuncios | — |

Ninguno de estos está entre los permisos restringidos que piden un formulario
especial (SMS, registro de llamadas, ubicación en segundo plano, todos los archivos).

## 5. Suscripción Premium

- Producto: suscripción con identificador `premium` (el que lee `compras.js`).
- El precio sale de la tienda; el juego no lo guarda. Falta decidir los planes
  (mensual, anual…) y los precios: ver `PENDIENTES.md`.
- Play exige que, antes de comprar, la app muestre claramente precio, periodo,
  que se renueva sola y cómo cancelar. Revisar `screens/premium.js` para que lo
  diga, y que los términos de uso (sección 4) coincidan.
- Para probar: agregar el correo del probador en «Probadores de licencias».

## 6. Ficha de la tienda

- Textos, ícono y capturas: `TIENDAS.md` y `tiendas/imagenes/`.
- Imagen destacada 1024 × 500 y capturas de celular: ya preparadas.
- Descripción larga: contiene «amigos y familia»; ver el aviso del apartado 1.

## 7. Antes de lanzar

- Las cuentas de desarrollador personales nuevas suelen tener que pasar por
  **pruebas cerradas** con un mínimo de probadores durante cierto tiempo antes de
  publicar en producción. Confirmar los números exactos en la Play Console.
- Subir primero a **prueba interna** para comprobar compras y notificaciones.
- Verificar que `google-services.json` esté (notificaciones) y que el `.aab` salga
  firmado con la clave del proyecto (`npm run android:release`).
- Releer este archivo contra la política: si algo no coincide, corregir ambos.

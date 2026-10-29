# Estado del proyecto — Musical Showdown

> Foto del proyecto al **26-10-2026**. El detalle de cada cambio está en
> `AUDITORIA-CAMBIOS.md` y la lista completa de tareas, en `PENDIENTES.md`.
> Si este resumen y esos archivos no coinciden, valen esos archivos.

## En una línea

Juego de fiesta: sale una palabra y gana quien cante primero una canción que
la tenga. Se publica como `.exe` de Windows, APK de Android y `.AppImage` de
Linux en GitHub. **Última versión publicada: 1.27** (28-10-2026). Se está
preparando su llegada a las tiendas con un modelo **gratis + Premium**.

## Qué está hecho

**El juego**
- Tres modos terminados: **Clásico**, **Alternativo 1** y **Alternativo 2**
  (solo Grupal), en Individual o por equipos. No se proponen cambios a sus
  reglas.
- Relevos y podio con MVP. "Compartir el podio" genera una imagen.
- Ayudas: "Cómo se juega", la ayuda de cada modo y los botoncitos (?).
- Pantalla **"¡X canta!"**: el moderador marca ❌ / ✅. "🔎 Buscar canción"
  busca por nombre y abre YouTube; solo es un enlace, nunca se reproduce
  música.
- **3 segundos escuchando:** al tocar un nombre, el micrófono mide si alguien
  canta. Si no, vuelve a la ronda. No graba.
- Reloj grande, cuenta regresiva y puntos animados al responder.
- Sonido propio (música y efectos CC0), animaciones y control con teclado.

**Canciones**
- Catálogo **sin letras**: de cada canción se guarda solo el nombre, el
  artista, el género y palabras sueltas de su parte famosa.
  - Cada canción tiene una **palabra clave** y otras palabras compartidas.
  - La ronda es mitad palabra clave y mitad compartida.
- **198 canciones en 10 géneros** (25-10-2026), apto para toda la familia.
  - Los 10 géneros se revisaron contra las letras (palabras, vulgaridades y drogas).
  - **La demo solo trae pop, rock y reggaetón (60 canciones);** la app propia y la oficial traen los 10 (`GENRES_DEMO` en `data/songs.js`).
  - Las canciones quitadas por no ser familiares se anotan en `PENDIENTES.md` y volverán en Premium.

**Íconos (25-10-2026)**
- Íconos de Material Design (Google, Apache 2.0) en lugar de los emojis, en las tres apps: `iconosEmoji.js` los cambia al dibujar; la imagen del podio los dibuja con `dibujarIcono`.
- **Diseño más profesional (26-10-2026, versión 1.26)**, en las tres apps: íconos de contorno (también los de los botones de arriba), botones de ícono iguales, la misma barra arriba (volver o pausa a la izquierda), luces más suaves, dos tipografías (Fredoka y Nunito), tamaños de texto fijos, (?) discretos y géneros más claros. Se probó primero solo en la personal (instrucción 31, "modificación general").
- **Rediseño "Escenario nocturno" (28-10-2026, en curso, una pantalla a la vez)**: casi negro, acento de violeta a rosa, vidrio, letra Inter y fondo con colores que se mueven. Ya están el **inicio** (en la PC, título grande arriba y una columna centrada con botones más grandes) y **Configurar partida** (en la PC, dos columnas: jugadores a la izquierda y géneros y opciones a la derecha; en el celular, opción B «Secciones», cada parte en su panel y «Confirmar» pegado abajo) y la **ronda** (en la PC, acomodo «Escenario» a todo el alto; el celular conserva el «cara a cara»; la palabra se ajusta a su espacio según sus letras) el **resultado de la ronda** (en la PC, «Pantalla completa» sin tarjeta; en el celular, tarjeta centrada) el **podio** (pantalla completa sin tarjeta en celular y PC) y **Organizar equipos** (cada grupo en su panel de vidrio con su color, lado a lado: en la PC en una sola fila y en el celular de a dos) , **Ajustes** (panel de vidrio a todo el alto desde la izquierda, en celular y PC) y los **avisos de la campana** (cada aviso con el color de su tipo; en la PC, panel a todo el alto desde la derecha; botón «Borrar notificaciones» fijo abajo y un (!) rojo en la campana mientras quede alguno) y las **ayudas** («Cómo se juega» y la del modo en dos columnas; los (?) abren un globo junto a su botón con el fondo borroso) , **Modos de juego** (en la PC los tres uno al lado del otro; en el celular, lista compacta) , **verificar canción** («¡X canta!» con el color de quien canta y «Buscar canción» con YouTube en rojo) , **compartir el podio** (imagen nueva con colores del fondo a elegir) , **vincular** (código con un relojito circular; en la PC, QR a la derecha), el **control del celular** (y avisos en la PC vinculada) y el **reloj de la ronda** (anillo en degradado que se vacía), y las **ventanas «Sí / No», aviso y pausa**, en las tres apps. También la **rueda para elegir números**, que se abre encima del valor (diseño «Líneas» y flechas ▲ ▼). Y las **ventanas de relevos** (compañeros en lista) y la de **«Relevos por equipo»** de Alternativo 2: al editar una opción, todo queda borroso menos su fila, marcada con «Editando · <nombre>» (también con la rueda). Las ventanas chicas cambian de tamaño según la pantalla. Y la **ventana de Premium** (estrella en un círculo, beneficios en cuadritos y planes en filas) y las **listas desplegables** (líneas como la rueda, con el fondo borroso y la fila marcada), y la **pantalla de carga** (micrófono con ondas, título que se enfoca y ecualizador). Ya no quedan pantallas con el estilo anterior en la lista; falta que el usuario las pruebe (`PENDIENTES.md`).

**Celular + PC (versión 1.23)**
- La PC es la pantalla grande y el celular, el control.
- Se vinculan con un **QR** o con un **código de 6 números que cambia cada
  minuto**, en la misma Wi-Fi y sin internet.
- Una partida empezada en el celular se puede pasar a la PC.
- La cuenta regresiva, la pausa, la ayuda y la música se manejan desde el
  celular.

**Plataformas y publicación**
- GitHub Actions compila y publica las tres versiones al subir una etiqueta
  `v*`.
- Notificaciones en Android (Firebase) y avisos en la campana.
- Arreglo de Android 15/16: el juego ya no queda debajo de la barra de la
  hora.
- El `.exe` se descomprime siempre en la misma carpeta, así el permiso del
  Firewall se pide una sola vez.

**Tiendas y dinero (sin publicar todavía)**
- **Política de privacidad** (GitHub Pages activado y comprobado el 28-10-2026) publicada en
  https://maxy26.github.io/Musical-showdown/privacidad/ (contacto
  `showdownmusical@gmail.com`), con enlace en Ajustes. Desde el 27-10-2026 es
  la versión completa en español, unida a los términos de uso en una sola página (Parte I: política, 17 secciones; Parte II: términos, 16; anuncios con AdMob no personalizados previstos, sin análisis de uso, país provisional Colombia; basada en plantillas CC0 de
  General Legal; estilo «claro profesional» con Inter). Público: adolescentes y
  adultos. Se completa paso a paso con los datos que falten (ver `PENDIENTES.md`).
- **`TIENDAS.md`**: todos los textos, permisos, respuestas de privacidad y
  pasos. Las imágenes de las fichas están en `tiendas/imagenes/`.
- **Microsoft Store**:
  - cuenta creada y producto "Musical Showdown" reservado (Store ID
    `9PP0CFQWMWKT`);
  - el paquete `.appx` se arma con `npm run build:store-windows`.
- **Demo para la Microsoft Store**, preparada (`npm run build:store-demo`):
  - solo Clásico jugable;
  - Alternativo 1 con candado y la ventana "Versión completa" (también en
    Ajustes y en el podio);
  - sin Alternativo 2, sin escuchar el canto y sin vincular; al compartir el
    podio no lleva enlace de GitHub;
  - "Cómo se juega" se abre sola la primera vez;
  - el paquete no pide micrófono ni red local.
- **Premium (Google Play)**:
  - el sistema de compras está programado (complemento propio
    `ComprasPlugin.java` + `compras.js` + ventana `screens/premium.js`) y
    compila;
  - ya está cómo se ve el juego con Premium: insignia ⭐ PREMIUM, "Premium
    activo" y Alternativo 2 con ⭐;
  - `npm run android:release` genera también el `.aab`.
- **Lugares para anuncios** reservados (solo celular, nunca en la ronda). Son
  invisibles hasta que haya anuncios.
- **Versión personal** del dueño, con todo desbloqueado
  (`npm run build:personal`). Nunca se publica.

## Decisiones importantes (no revertir)

- **Una sola app gratis con Premium adentro** en Google Play (sin demo aparte
  allí).
  - **Gratis:** Clásico y Alternativo 1, con anuncios en el celular.
  - **Premium:** Alternativo 2, escuchar el canto (y la futura IA), devolver relevos (botón ± de la ronda; usuario, 29-10-2026) y sin
    anuncios.
- **Precios confirmados:** 1,99 USD al mes o 14,99 USD al año, con 7 días
  gratis. Se ponen en la consola, por país; se sugiere más barato en
  Latinoamérica.
- **Anuncios solo en el celular**, nunca en la PC ni durante la ronda.
- **Galaxy Store descartada por ahora:** solo acepta empresas. Para Android
  se usa Google Play.
- La **1.24 queda en GitHub** como versión completa.
- **El juego nunca reproduce, descarga ni guarda música ni letras** de
  terceros. YouTube es solo un enlace, sin su logo.
- **Forma de trabajo:**
  - todo en español;
  - después de cada cambio, compilar **PC y celular, en versión normal y
    personal**, y abrírselo al usuario;
  - publicar solo con su OK, juntando cambios;
  - actualizar **todos** los `.md`;
  - pedir permisos del sistema directo, sin ventana propia antes.
- **Al publicar:** el mensaje del commit va en un archivo (`git commit -F`), y
  la etiqueta se crea recién después de comprobar el commit.
- **Secretos:** nunca subir la clave de firma (`platforms/android/keystore/`),
  `google-services.json` ni la clave de Firebase.

## Qué falta

**Lo próximo**
0. **Elegido el 21-10-2026:** la **demo para la Microsoft Store**. El
   usuario la confirmó ("está bien así"); antes de subirla quiere ver mejoras
   recomendadas para la demo. Después: reservar su nombre y subirla.
1. **Terminar el diseño del sistema de pago.** El usuario lo pidió antes de
   seguir con Google Play.
2. **Consola de Google Play** (con guía paso a paso):
   - crear la app y completar la configuración;
   - decidir la clave de firma (se recomienda subir la nuestra, para que los
     APK de GitHub sigan siendo compatibles);
   - perfil de pagos y suscripción `premium` (mensual y anual + 7 días
     gratis);
   - cuentas de prueba;
   - subir el `.aab` a prueba cerrada.
3. **Prueba cerrada de Google Play: 12 personas inscritas durante 14 días
   seguidos.** Conviene invitar a 15–20.
4. **Microsoft Store:**
   - reservar "Musical Showdown Demo" y pasar su identidad y Store ID;
   - subir el paquete y llenar la ficha.

**Cuidado al publicar la próxima versión completa:** sin Premium comprado,
Alternativo 2 y escuchar el canto quedan bloqueados para todos. Avisarle al
usuario antes de publicar.

**Del usuario**
- Las preguntas sin responder están en `PENDIENTES.md` (sección "Preguntas para el
  usuario"), junto con una mejora recomendada por publicación.
- Proteger con contraseña la copia de la clave de firma (Almacén personal de
  OneDrive o un ZIP cifrado).
- Probar el `.AppImage` en su Linux y el `.exe` en otra PC.
- Probar cantando de verdad los 3 segundos (puede hacer falta ajustar
  `UMBRAL_VOZ`).
- Definir los textos del juego que quiere editar.

**Más adelante (al final, varios con costo)**
- **IA de voz** que reconozca la canción cantada (servicio de letras con
  licencia o de reconocimiento; costo por uso).
- **Catálogo:** revisar las 7 tandas sin revisar y llegar a 100 canciones por
  género. En pausa hasta que el usuario lo retome.
- **Anuncios reales** con AdMob: actualizar la política y el consentimiento.
- **Compras en la PC** (Microsoft Store).
- **Dos dispositivos:**
  - etapa 2: la animación se mueve con el micrófono;
  - etapa 3: Android TV;
  - etapa 4: PC como control de la TV;
  - vinculación por internet con servidor.
- **Que la cámara del celular abra la app con el QR:** cuando esté en Play
  Store, con `assetlinks.json`.
- **Instalar sin el aviso de "app no segura"** (llega al publicar en las
  tiendas).

**Detalles técnicos menores**
- 8 avisos moderados de `npm audit`, solo en herramientas de compilación.
- Electron no corre en modo desarrollo; no afecta la compilación.

## Sin subir a GitHub

Nada: todo está en GitHub (versión 1.27). La demo, Premium y los anuncios están en el código, pero todavía no en las tiendas.

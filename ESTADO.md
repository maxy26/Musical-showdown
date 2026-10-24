# Estado del proyecto — Musical Showdown

> Foto del proyecto al **21-10-2026**. El detalle de cada cambio está en
> `AUDITORIA-CAMBIOS.md` y la lista completa de tareas, en `PENDIENTES.md`.
> Si este resumen y esos archivos no coinciden, valen esos archivos.

## En una línea

Juego de fiesta: sale una palabra y gana quien cante primero una canción que
la tenga. Se publica como `.exe` de Windows, APK de Android y `.AppImage` de
Linux en GitHub. **Última versión publicada: 1.24** (13-10-2026). Se está
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
- **200 canciones en 10 géneros**, 20 por género.
  - El usuario revisó reggaetón, pop y rock.
  - Los otros 7 géneros se armaron sin su revisión y están pendientes de revisión.

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
- **Política de privacidad** publicada en
  https://maxy26.github.io/Musical-showdown/privacidad/ (contacto
  `showdownmusical@gmail.com`), con enlace en Ajustes.
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
  - **Premium:** Alternativo 2, escuchar el canto (y la futura IA) y sin
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

Hay cambios en prueba que todavía no están en un commit:
- la demo;
- Premium y el sistema de compras;
- la versión personal;
- los lugares de anuncios.

Salen en la próxima versión, cuando el usuario la confirme.

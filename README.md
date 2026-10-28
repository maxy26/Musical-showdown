# Musical Showdown

Juego de fiesta/familiar: el sistema muestra una palabra y hay que cantar
cualquier canción que la contenga. Disponible para Web, Windows, Linux y
Android. Tres modos de juego (Clásico, Alternativo 1 y Alternativo 2), en
Individual o Grupal.

## 📥 Descargar

Las versiones publicadas están en la sección **Releases** del repositorio:
APK para Android, `.exe` para Windows (portátil, no hace falta instalar) y
`.AppImage` para Linux. La app avisa sola cuando hay una versión nueva.

## 📁 Estructura del proyecto

```
Musical_Showdown/
├── src/          ← ÚNICA fuente de verdad del juego (HTML/CSS/JS, sin bundler)
│   ├── index.html, sw.js (service worker), manifest.json (PWA)
│   ├── css/, fonts/, icons/, audio/ (sonidos CC0, créditos en CREDITOS.txt)
│   └── js/
│       ├── main.js, router.js, state.js, gameLogic.js, pairing.js, relay.js…
│       ├── avisos.js, notificaciones.js   (campana y notificaciones)
│       ├── vinculo.js                     (celular como control de la PC, misma red Wi-Fi)
│       ├── lib/                           (librerías de terceros sin cambios: QR; LICENCIAS.txt)
│       ├── data/songs.js                  (catálogo de canciones, sin letras)
│       └── screens/                        (cada pantalla; config/ = Configurar partida)
├── platforms/    ← "envoltorios" nativos, NO duplican el juego
│   ├── desktop/      Electron (Windows y Linux)
│   └── android/      Capacitor (proyecto nativo en android/)
├── build/        ← scripts que arman cada plataforma desde src/
├── avisos/       ← avisos.json: novedades de la campana (ver avisos/LEEME.md)
├── docs/         ← GitHub Pages: política de privacidad, página del QR de vincular, assetlinks.json y fonts/ (Inter)
├── tiendas/      ← imágenes para las fichas de las tiendas (ver TIENDAS.md)
├── test/         ← pruebas: lógica (node --test) y pantallas (test/e2e, Playwright)
└── dist/         ← salida de los builds (generado, no editar)
```

**Por qué así:** `src/` es la única fuente de verdad; `platforms/` solo tiene
lo propio de cada plataforma, y los scripts de `build/` arman cada versión a
partir de `src/`, así nada queda desincronizado.

## 🚀 Cómo trabajar

### Web
```bash
cd src
python3 -m http.server 8000
# abrir http://localhost:8000
```

### Windows (.exe)
```bash
npm install --prefix platforms/desktop   # solo la primera vez
npm run build:desktop                     # -> dist/windows/Musical Showdown.exe
```

### Android (.apk)
```bash
npm install --prefix platforms/android   # solo la primera vez
npm run build:apk                         # APK de prueba (firma de depuración)
npm run android:release                   # APK y .aab (Google Play) para publicar: sube la versión y firma con la clave del proyecto
```
La clave de firma (`platforms/android/keystore/`) y `google-services.json`
(Firebase, notificaciones) no están en git.

### En la nube
GitHub Actions (`.github/workflows/compilar.yml`) corre las pruebas y compila
Windows, Linux y Android en cada envío a `main`. Al subir una etiqueta `v*`
publica la Release y envía la notificación de versión nueva.

## 🧪 Pruebas

```bash
npm run lint
npm test            # lógica del juego
npm run test:e2e    # pantallas, en tamaño celular y PC
```

## 📚 Documentación del proyecto

- `ESTADO.md`: resumen del estado del proyecto (qué está hecho, qué falta y decisiones).
- `CONTEXTO-MUSICAL-SHOWDOWN.md`: reglas del juego y decisiones de diseño.
- `INSTRUCCIONES-MUSICAL-SHOWDOWN.md`: reglas de trabajo.
- `PENDIENTES.md`: lo que falta hacer.
- `AUDITORIA-CAMBIOS.md`: historial de cambios, el más reciente arriba.
- `TIENDAS.md`: textos, permisos y pasos para publicar en las tiendas.

## Pendiente / próximos pasos

Ver `PENDIENTES.md`. Lo principal: completar el catálogo de canciones (`src/js/data/songs.js`,
sin letras) y el reconocimiento de canciones por voz.

# Musical Showdown

Juego de fiesta/familiar: el sistema muestra una palabra y hay que cantar
cualquier canción que la contenga. Disponible para Web, Windows y Android.

## 📁 Estructura del proyecto

```
MusicalShowdown/
├── src/                    ← ÚNICA fuente de verdad del juego (HTML/CSS/JS)
│   ├── index.html
│   ├── manifest.json       (PWA)
│   ├── sw.js                (service worker, offline)
│   ├── css/styles.css
│   ├── icons/               (íconos de la app, todos los tamaños)
│   ├── audio/                (clic, ticks, ambiente)
│   └── js/
│       ├── main.js           punto de entrada
│       ├── router.js         registro de pantallas + render()
│       ├── state.js           estado global de la partida
│       ├── gameLogic.js       reglas: palabras, puntaje, temporizador
│       ├── sound.js            gestor de audio
│       ├── utils.js             helpers genéricos
│       ├── data/songs.js         base de canciones (mock)
│       └── screens/
│           ├── menu.js, teamOrg.js, round.js, verify.js,
│           │   roundResult.js, results.js, modals.js
│           └── config/            (pantalla de configuración, dividida)
│               ├── index.js         orquestador de la pantalla
│               ├── players.js        sección de jugadores
│               ├── modes.js           modos de juego disponibles
│               ├── presets.js          valores predeterminados
│               └── valueBox.js         caja de valor reutilizable (▲▼ + Enter)
│
├── platforms/               ← "envoltorios" nativos, NO duplican el juego
│   ├── desktop/                Electron: main.js, ícono, package.json
│   └── android/                 Capacitor: capacitor.config.ts, proyecto
│                                  nativo android/, package.json
│
├── build/                    ← scripts que arman cada plataforma desde src/
│   ├── build-desktop.js
│   └── build-android.js
│
├── test/                      ← pruebas automatizadas (node --test)
│   └── gameLogic.test.js
│
└── dist/                       ← SALIDA de los builds (generado, no editar)
    └── windows/                  Musical Showdown.exe listo para usar
```

**Por qué así:** antes el juego vivía copiado tres veces (una por
plataforma) y era fácil que una quedara desactualizada respecto a las
otras. Ahora `src/` es la única fuente de verdad; `platforms/` solo
contiene lo específico de cada plataforma (íconos nativos, manifest,
config de Electron/Capacitor), y los scripts de `build/` arman cada
versión automáticamente a partir de `src/` — así no hay que acordarse de
copiar archivos a mano, y nada queda desincronizado.

## 🚀 Cómo trabajar en cada versión

### Web (jugar en el navegador)
```bash
cd src
python3 -m http.server 8000
# abrir http://localhost:8000
```
También puedes arrastrar la carpeta `src/` a https://app.netlify.com/drop
para tener un enlace público.

### Windows (.exe)
Ya viene compilado en `dist/windows/Musical Showdown.exe` — ábrelo
directamente, es portable.

Para volver a compilarlo (por ejemplo tras un cambio en `src/`):
```bash
npm install --prefix platforms/desktop   # solo la primera vez
npm run build:desktop
```

### Android (.apk)
1. `npm install --prefix platforms/android` (solo la primera vez)
2. `npm run build:android` — esto sincroniza `src/` dentro del proyecto
   nativo **y corrige automáticamente** un problema conocido de Capacitor
   (ver comentario en `build/build-android.js`).
3. Abre Android Studio → "Open" → selecciona `platforms/android/android`.
4. Espera el "Gradle sync".
5. **Build → Generate App Bundles or APKs → Generate APKs**.

## 🧪 Pruebas

```bash
npm test
```
Cubren la lógica pura del juego (selección de jugadores, formato de
tiempo, selección ponderada de palabras, identidad de canciones).

## 🗂️ Control de versiones

El proyecto es un repositorio git desde ahora. Cada entrega nueva se
puede comparar contra la anterior con `git log` / `git diff` en vez de
depender solo de la memoria de la conversación.

## Pendiente / próximos pasos

- Modo Alternativo 1 y Alternativo 2: reglas exactas aún por definir.
- Reglas exactas de rotación grupal por modo.
- Reemplazar `src/js/data/songs.js` (base local de ejemplo) por una
  fuente/API real de letras, una vez decidida cuál permite legalmente el
  uso necesario.

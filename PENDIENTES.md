# Pendientes — Musical Showdown

> Lista viva de inconsistencias, bugs, mejoras, implementaciones y
> avances por hacer. Al empezar una conversación, revisar esta lista
> junto con `AUDITORIA-CAMBIOS.md`. Al resolver algo, marcarlo `[x]`,
> anotar la fecha y registrar el cambio en la auditoría. Los resueltos
> se mueven a la sección final.
>
> Prioridad: 🔴 alta · 🟡 media · 🟢 baja

## 🐛 Bugs e inconsistencias

- [ ] 🟡 **Permisos de `gradlew` alterados en git.** Git en Windows marca
  como modificados `platforms/android/android/gradlew` y 3 archivos
  `.java` de `capacitor-android/` solo porque perdieron el bit de
  ejecución (100755 → 100644); el contenido no cambió. Opciones:
  `git config core.fileMode false` en este repo, o restaurarlos con
  `git checkout -- <archivos>`. Hay que decidir cuál antes del próximo commit.
- [ ] 🟢 **El nombre técnico de Android sigue siendo `com.palabracantada.app`**
  (nombre anterior del juego). Renombrarlo es delicado porque afecta
  las rutas de Java. Solo hacerlo si el usuario lo pide
  (contexto, sección 7).

## 🔧 Entorno / herramientas

- [ ] 🔴 **Correr `npm run lint`.** Las dependencias de la raíz ya están
  instaladas (2026-09-27, `eslint` presente), pero el lint aún no se ha corrido.
- [ ] 🔴 **Instalar dependencias de plataformas y correr los builds.**
  La instalación se interrumpió en la sesión anterior: faltan
  `platforms/desktop/node_modules` y `platforms/android/node_modules`.
  Después, correr `npm run build:desktop` y `npm run build:android` para
  llevar el arreglo de `sw.js` a Windows y Android (instrucción 3).
- [ ] 🟡 **Commitear los cambios de la sesión 1** (`sw.js`, `CLAUDE.md`,
  documentos de contexto, auditoría y pendientes). Un commit por cambio
  significativo, en español (instrucción 14).

## ✨ Mejoras

- [ ] 🟡 **Reemplazar los 2 `confirm()` nativos** por un modal propio,
  del mismo estilo que `showWarning()` en `modals.js`:
  - `src/js/screens/round.js:73`: "¿Desean finalizar esta ronda?"
  - `src/js/screens/teamOrg.js:81`: "¿Confirmar equipos?"
  (El usuario aún no lo pidió explícitamente; contexto, sección 5.)
- [ ] 🟢 **Evitar que la lista `ASSETS` de `sw.js` vuelva a quedar
  desactualizada.** Idea: una prueba en `test/` que verifique que cada
  archivo listado existe y que todo `.js` de `src/js/` esté en la lista.
- [ ] 🟢 **Ampliar las pruebas**: hoy solo cubren 4 funciones puras.
  Candidatas: `pickWeightedWord` y `pickIndividualPair` (requieren
  preparar `state` y `SONG_DB`).

## 🎮 Diseño / implementación pendiente (decisión del usuario)

> No inventar reglas: preguntar antes (instrucción 21).

- [ ] **Reglas de Alternativo 1** (`state.config.mode`, `screens/config/modes.js`).
- [ ] **Reglas de Alternativo 2.**
- [ ] **Rotación grupal exacta por modo.** Hoy `rotateTeamShown` en
  `gameLogic.js` solo manda al participante mostrado al final de su fila.
- [ ] **Cantidad de equipos.** Hoy es fijo en 2, sin manejo especial
  cuando el número de jugadores es impar.
- [ ] **Fuente real de letras** en lugar del mock `data/songs.js`.
  Primero hay que resolver el tema legal (instrucción 22).

---

## ✅ Resueltos

- [x] 2026-09-26: 🔴 `sw.js` apuntaba a `js/screens/config.js`, que ya no
  existe, y eso rompía la instalación del service worker (modo offline
  de la web). Detalle en la auditoría, sesión 1.

# Auditoría de cambios — Musical Showdown

> Registro cronológico de cada cambio o ajuste hecho al proyecto con
> Claude Code. Sirve para saber **en qué nos quedamos** al empezar una
> nueva conversación. La entrada más reciente va **arriba**.
>
> Formato de cada entrada: fecha · qué se hizo · archivos tocados ·
> cómo se verificó · qué quedó abierto (con referencia a `PENDIENTES.md`).
>
> El historial anterior a Claude Code (hecho con Claude en el chat) está
> resumido en `CONTEXTO-MUSICAL-SHOWDOWN.md`; el commit base es
> `59438fd` (reestructuración a monorepo).

---

## 2026-09-26 — Sesión 1: arranque con Claude Code

**Qué se hizo**
1. Se creó `CLAUDE.md` (en español) con comandos, arquitectura y
   referencias a los documentos de contexto e instrucciones.
2. **Bug corregido en `src/sw.js`**: la lista `ASSETS` del service worker
   todavía apuntaba a `./js/screens/config.js`, que ya no existe (se
   dividió en la carpeta `screens/config/`). Como `cache.addAll()` falla
   completo si falta un solo archivo, el service worker no se instalaba
   y **la versión web no funcionaba sin conexión**.
   - Se reemplazó por los 5 módulos reales de `screens/config/`
     (`index.js`, `players.js`, `modes.js`, `presets.js`, `valueBox.js`).
   - Se subió `CACHE_NAME` de `musical-showdown-v2` a `musical-showdown-v3`
     para que los navegadores descarten la caché vieja.
3. Se crearon `AUDITORIA-CAMBIOS.md` (este archivo) y `PENDIENTES.md`.
4. El usuario agregó `CONTEXTO-MUSICAL-SHOWDOWN.md` e
   `INSTRUCCIONES-MUSICAL-SHOWDOWN.md` (historial y reglas de trabajo de
   las sesiones con Claude en el chat).

**Archivos tocados:** `src/sw.js`, `CLAUDE.md`, `AUDITORIA-CAMBIOS.md`,
`PENDIENTES.md`.

**Verificación**
- Script que confirma que todos los archivos de `ASSETS` existen en
  `src/`: OK, no falta ninguno.
- `npm test`: 5/5 pruebas pasan.
- `npm run lint`: **no se pudo correr** porque `eslint` no está
  instalado en la raíz (falta `npm install`). Ver `PENDIENTES.md`.
- **No** se corrieron `build:desktop` ni `build:android` (según la
  instrucción 3 habría que hacerlo antes de entregar). Ver `PENDIENTES.md`.

**Quedó abierto:** nada de este cambio se ha commiteado todavía.

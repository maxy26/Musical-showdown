# Avisos de la campana

El juego lee `avisos.json` desde GitHub (rama `main`) al abrirse y muestra cada
aviso en el panel de la campana. Para publicar uno, agregarlo arriba de la lista
y subir el cambio a `main`.

Cada aviso:

```json
{
  "id": "un-nombre-unico",
  "tipo": "novedad",
  "fecha": "2026-10-07",
  "titulo": "Título corto",
  "texto": "Una o dos frases.",
  "boton": { "texto": "Ver más", "url": "https://..." }
}
```

- `tipo`: `novedad` (✨) o `promo` (🎁). Las **actualizaciones** (⬆️) no van
  aquí: salen solas de las versiones publicadas en GitHub (Releases), cuando
  la versión es más nueva que la instalada.
- `id`: no repetir; si cambia, el aviso vuelve a aparecer como nuevo.
- `boton` es opcional; abre el enlace en el navegador.
- Un aviso al que le falte `id`, `tipo`, `titulo` o `fecha` no se muestra.

/**
 * Lugares para anuncios (usuario, 13-10-2026): abajo en el inicio, Configurar
 * partida, el resultado de la ronda y el podio. Nunca durante la ronda (no se
 * interrumpe a quien canta). Solo en la versión completa del celular
 * (edicion.js → conAnuncios). Mientras no haya un anuncio, el lugar queda
 * vacío y no ocupa espacio: cuando se agregue la red de anuncios (AdMob), el
 * anuncio se pone dentro de `[data-anuncio]`. Ver PENDIENTES.md.
 */
import { conAnuncios } from "./edicion.js";

/** HTML del lugar para un anuncio (vacío e invisible hasta que haya uno), o "" si esta edición no lleva anuncios. */
export function espacioAnuncio(lugar) {
  if (!conAnuncios()) return "";
  return `<aside class="anuncio-espacio" data-anuncio="${lugar}" aria-label="Publicidad"></aside>`;
}

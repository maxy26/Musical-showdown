/**
 * ¿Esta copia del juego se instaló desde una tienda? (12-10-2026)
 * `TIENDA` (version.js) lo escribe build/stamp.js al compilar: "microsoft" en
 * el paquete de la Microsoft Store (`npm run build:store-windows`) y vacío en
 * las demás (el .exe y el APK de GitHub). En la versión de tienda, el aviso de
 * "Actualización" y el enlace de "Compartir el podio" llevan a la tienda, no a
 * GitHub.
 */
import { TIENDA } from "./version.js";

export const TIENDAS = {
  microsoft: {
    nombre: "Microsoft Store",
    enlace: "https://apps.microsoft.com/detail/9PP0CFQWMWKT", // Store ID de Partner Center
    corto: "Microsoft Store",
  },
  // Demo gratis: otro producto de la Store. Falta su Store ID (PENDIENTES.md);
  // mientras tanto, los enlaces siguen yendo a GitHub.
  "microsoft-demo": { nombre: "Microsoft Store", enlace: null, corto: "Microsoft Store" },
};

/** La tienda de esta copia ({ nombre, enlace, corto }) o null si viene de GitHub (o si su enlace todavía no se sabe). */
export function tiendaActual(tienda = TIENDA) {
  return TIENDAS[tienda]?.enlace ? TIENDAS[tienda] : null;
}

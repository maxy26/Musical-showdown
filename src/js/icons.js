import { svgIcono } from "./iconosEmoji.js";

/**
 * Íconos de los botones, de Material Design (de contorno, como el resto del
 * juego; 26-10-2026), del color del texto.
 * Uso: ICONS.bell() o ICONS.user(28) para cambiar el tamaño.
 */
const icono = (nombre) => (s = 22) => svgIcono(nombre).replace("<svg ", `<svg style="width:${s}px;height:${s}px" `);

export const ICONS = {
  settings: icono("settings"),
  bell: icono("notifications"),
  help: icono("help"),
  // Vincular dispositivos (12-10-2026): escanear el QR de la PC / seguir en la PC una partida del celular
  scan: icono("qr_code_scanner"),
  link: icono("devices"),
  user: icono("person"),
  users: icono("group"),
  book: icono("tune"), // "Modos de juego"
  play: icono("play_arrow"),
};

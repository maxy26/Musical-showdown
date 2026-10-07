/**
 * Dónde corre el juego: en la web (PWA) o como app instalada (Android con
 * Capacitor, o el .exe de Windows con Electron, que sirve el juego con app://).
 * Solo se consulta dentro de funciones: se puede importar desde Node.
 */

/** ¿Corre como app instalada? En la web, no. */
export function esAppInstalada() {
  return Boolean(window.Capacitor?.isNativePlatform?.()) || ["file:", "app:"].includes(window.location.protocol);
}

/**
 * Cierra la app (botón "Salir del juego" de Ajustes, usuario, 07-10-2026).
 * Android: complemento App de Capacitor (@capacitor/app). Windows: cerrar la
 * ventana cierra el programa. En la web no se puede cerrar la pestaña, por eso
 * el botón no se muestra ahí.
 */
export function salirDeLaApp() {
  const app = window.Capacitor?.Plugins?.App;
  if (app?.exitApp) app.exitApp();
  else window.close();
}

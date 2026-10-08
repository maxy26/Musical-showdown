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
 * Llama a un complemento nativo de Capacitor (Android) sin incluir sus librerías:
 * `Capacitor.nativePromise` viene en el puente nativo de la app. Ojo: en
 * Capacitor 6, `Capacitor.Plugins.X` solo existe si se incluye la librería del
 * complemento, por eso no se usa (08-10-2026).
 */
export function nativo(complemento, metodo, opciones = {}) {
  return window.Capacitor.nativePromise(complemento, metodo, opciones);
}

/**
 * Cierra la app (botón "Salir del juego" de Ajustes, usuario, 07-10-2026).
 * Android: complemento App de Capacitor (@capacitor/app). Windows: cerrar la
 * ventana cierra el programa. En la web no se puede cerrar la pestaña, por eso
 * el botón no se muestra ahí.
 */
export function salirDeLaApp() {
  if (window.Capacitor?.isNativePlatform?.()) nativo("App", "exitApp").catch(() => {});
  else window.close();
}

/**
 * Abre un enlace fuera del juego, en el navegador del sistema (por ejemplo,
 * "Descargar" de un aviso). En Android, Capacitor abre en el navegador las
 * direcciones de otros sitios; en el .exe lo hace platforms/desktop/main.js.
 */
export function abrirEnlace(url) {
  if (window.Capacitor?.isNativePlatform?.()) window.location.href = url;
  else window.open(url, "_blank", "noopener");
}

/**
 * Avisa cuando la app pasa a segundo plano (`fn(true)`) o vuelve (`fn(false)`):
 * la página se oculta (web, .exe minimizado, Android) y, en Android, además
 * el evento appStateChange del complemento App.
 */
export function alCambiarPrimerPlano(fn) {
  document.addEventListener("visibilitychange", () => fn(document.hidden));
  if (window.Capacitor?.isNativePlatform?.() && window.Capacitor.nativeCallback) {
    window.Capacitor.nativeCallback("App", "addListener", { eventName: "appStateChange" }, (datos) => {
      if (datos && typeof datos.isActive === "boolean") fn(!datos.isActive);
    });
  }
}

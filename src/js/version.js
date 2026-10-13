/**
 * Versión del juego que se muestra en Ajustes (la tuerca del inicio).
 * Los scripts de build/ reescriben este archivo en la copia www/ con la versión
 * de Android (versionName de platforms/android/android/app/build.gradle) y la
 * fecha y hora de la compilación. En src/ queda la versión de desarrollo.
 */
export const APP_VERSION = "1.2";
export const BUILD_INFO = "desarrollo";
// ¿Se compiló con google-services.json (Firebase)? Sin él no hay notificaciones (notificaciones.js).
export const CON_FIREBASE = false;
// Tienda de la que se instaló ("microsoft" en la Microsoft Store; vacío en GitHub). Ver tienda.js.
export const TIENDA = "";

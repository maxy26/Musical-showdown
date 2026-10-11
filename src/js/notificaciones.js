/**
 * Notificaciones fuera de la app (pedido del usuario, 10-10-2026). Solo en la
 * app de Android, con Firebase Cloud Messaging:
 *   - Al abrir la app por primera vez se pide directamente el permiso del
 *     sistema (Android 13+), una sola vez y sin ventana propia del juego
 *     (usuario, 11-10-2026). Con el permiso dado, se registra el celular y se
 *     anota en el tema TEMA en cada arranque; si se da después desde los
 *     ajustes del celular, también.
 *   - Lo que llega a ese tema son los avisos importantes: las actualizaciones y
 *     los de avisos/avisos.json con "importante": true. Los envía GitHub
 *     Actions con build/notificar.js; los demás quedan solo en la campana.
 *   - Con la app cerrada o en segundo plano, Android muestra la notificación
 *     solo; con la app abierta, también (presentationOptions de
 *     capacitor.config.ts). Al tocarla se abre la app con el panel de la campana.
 *   - La notificación trae el aviso: al recibirla con la app abierta, o al
 *     tocarla, se agrega a la campana sin esperar a GitHub (avisos.js).
 *
 * Complementos: @capacitor/push-notifications (permiso y registro) y
 * @capacitor-community/fcm (temas), llamados con nativo() de plataforma.js.
 */
import { nativo } from "./plataforma.js";
import { CON_FIREBASE } from "./version.js";

export const TEMA = "importantes";
// Con cualquier valor, el permiso ya se pidió (la 1.15 guardaba "si" / "no")
const CLAVE = "musical-showdown:notificaciones";

function yaSePidio() {
  try { return window.localStorage.getItem(CLAVE) !== null; } catch { return true; }
}
function guardar(valor) {
  try { window.localStorage.setItem(CLAVE, valor); } catch { /* sin almacenamiento */ }
}

/**
 * ¿Hay notificaciones en esta app? Solo en Android, con los dos complementos.
 * Se mira PluginHeaders (lo pone la app nativa): isPluginAvailable() mira
 * Capacitor.Plugins, que está vacío sin las librerías (ver plataforma.js).
 */
function hayNotificaciones() {
  const cap = window.Capacitor;
  if (!CON_FIREBASE || !cap?.isNativePlatform?.() || cap.getPlatform?.() !== "android") return false;
  const nombres = (cap.PluginHeaders || []).map((p) => p.name);
  return nombres.includes("PushNotifications") && nombres.includes("FCM");
}

/**
 * Con permiso, registra el celular y lo anota en el tema de los avisos
 * importantes. Con `pedir`, si no hay permiso, lo pide (ventana de Android).
 */
async function activar(pedir) {
  let { receive } = await nativo("PushNotifications", "checkPermissions");
  if (receive !== "granted" && pedir) ({ receive } = await nativo("PushNotifications", "requestPermissions"));
  if (receive !== "granted") return;
  // Canal con prioridad alta: la notificación aparece arriba de la pantalla
  // (mismo id que usa build/notificar.js)
  await nativo("PushNotifications", "createChannel", {
    id: TEMA, name: "Avisos importantes", description: "Versiones nuevas del juego y avisos importantes", importance: 4, visibility: 1,
  });
  await nativo("PushNotifications", "register");
  await nativo("FCM", "subscribeTo", { topic: TEMA });
}

/**
 * Se llama al arrancar (main.js). `alRecibir(datosDelAviso)` se llama con el
 * aviso que trae la notificación (texto JSON, ver build/notificar.js) cuando
 * llega con la app abierta o cuando se abre la app tocándola; después de
 * tocarla se llama además a `alTocar()`.
 */
export function iniciarNotificaciones({ alRecibir, alTocar }) {
  if (!hayNotificaciones()) return;
  const escuchar = (evento, fn) => window.Capacitor.nativeCallback("PushNotifications", "addListener", { eventName: evento }, fn);
  escuchar("pushNotificationReceived", (n) => { if (n?.data?.aviso) alRecibir(n.data.aviso); });
  escuchar("pushNotificationActionPerformed", (accion) => {
    const datos = accion?.notification?.data?.aviso;
    if (datos) alRecibir(datos);
    alTocar();
  });

  // Primera vez: se pide el permiso de Android. Después, solo se anota si ya está dado.
  const pedir = !yaSePidio();
  if (pedir) guardar("pedido");
  activar(pedir).catch(() => {});
}

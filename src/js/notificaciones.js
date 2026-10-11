/**
 * Notificaciones fuera de la app (pedido del usuario, 10-10-2026). Solo en la
 * app de Android, con Firebase Cloud Messaging:
 *   - Al abrir la app por primera vez se pregunta una sola vez si se quieren
 *     recibir. Con "Sí" se pide el permiso del sistema (Android 13+), se
 *     registra el celular y se anota en el tema TEMA.
 *   - Lo que llega a ese tema son los avisos importantes: las actualizaciones y
 *     los de avisos/avisos.json con "importante": true. Los envía GitHub
 *     Actions con build/notificar.js; los demás quedan solo en la campana.
 *   - Con la app cerrada o en segundo plano, Android muestra la notificación
 *     solo. Al tocarla se abre la app con el panel de la campana.
 *
 * Complementos: @capacitor/push-notifications (permiso y registro) y
 * @capacitor-community/fcm (temas), llamados con nativo() de plataforma.js.
 */
import { nativo } from "./plataforma.js";
import { showConfirm } from "./screens/modals.js";
import { CON_FIREBASE } from "./version.js";

export const TEMA = "importantes";
const CLAVE = "musical-showdown:notificaciones"; // "si" | "no" (ya se preguntó)

function leer() {
  try { return window.localStorage.getItem(CLAVE); } catch { return null; }
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

/** Pide el permiso, registra el celular y lo anota en el tema de los avisos importantes. */
async function activar() {
  let { receive } = await nativo("PushNotifications", "checkPermissions");
  if (receive !== "granted") ({ receive } = await nativo("PushNotifications", "requestPermissions"));
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
 * Se llama al arrancar (main.js). `alTocar()` se llama cuando se abre la app
 * tocando una notificación.
 */
export function iniciarNotificaciones(alTocar) {
  if (!hayNotificaciones()) return;
  window.Capacitor.nativeCallback("PushNotifications", "addListener", { eventName: "pushNotificationActionPerformed" }, () => alTocar());

  const respuesta = leer();
  // Ya dijo que sí: se vuelve a anotar en cada arranque (por si cambió el registro)
  if (respuesta === "si") { activar().catch(() => {}); return; }
  if (respuesta === "no") return;
  // Primera vez: se pregunta una sola vez (usuario, 10-10-2026). "Ahora no" no vuelve a preguntar.
  guardar("no");
  showConfirm({
    title: "¿Activar notificaciones?",
    message: "Te avisaremos cuando haya una versión nueva del juego.",
    yesText: "Sí",
    noText: "Ahora no",
    onYes: () => { guardar("si"); activar().catch(() => {}); },
  });
}

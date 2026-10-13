// Puente entre el juego (la página) y main.js para vincular el celular
// (partida en dos dispositivos, 12-10-2026). Solo expone estas funciones;
// el juego no tiene acceso a Node ni al resto de Electron.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vinculoPC", {
  /** Abre la conexión en la red Wi-Fi. Devuelve { ips, puerto, codigo, vence }. */
  abrir: () => ipcRenderer.invoke("vinculo:abrir"),
  /** Cierra la conexión y desconecta al celular. */
  cerrar: () => ipcRenderer.invoke("vinculo:cerrar"),
  /** Espera al celular que muestra este código (la partida está en el celular). */
  esperar: (codigo) => ipcRenderer.invoke("vinculo:esperar", codigo),
  /** Envía un mensaje al celular conectado. */
  enviar: (mensaje) => ipcRenderer.send("vinculo:enviar", mensaje),
  /** Mensajes que llegan del celular. */
  alRecibir: (fn) => ipcRenderer.on("vinculo:mensaje", (_e, mensaje) => fn(mensaje)),
  /** Cambios de conexión: { conectado, dispositivo, traspaso }. */
  alCambiar: (fn) => ipcRenderer.on("vinculo:estado", (_e, estado) => fn(estado)),
  /** El código de vinculación cambió (cada minuto): { ips, puerto, codigo, vence }. */
  alCambiarCodigo: (fn) => ipcRenderer.on("vinculo:codigo", (_e, datos) => fn(datos)),
});

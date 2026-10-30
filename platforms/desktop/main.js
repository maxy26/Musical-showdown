const { app, BrowserWindow, protocol, net, shell, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const http = require("http");
const crypto = require("crypto");
const dgram = require("dgram");
const { pathToFileURL } = require("url");
const { WebSocketServer } = require("ws");

// La música empieza apenas se abre el juego, sin esperar el primer toque (usuario, 07-10-2026).
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// El juego se sirve con app://juego/ en lugar de abrir el archivo (file://):
// el sonido (Web Audio) necesita leer los audios con fetch, y Chromium no lo
// permite con file:// (07-10-2026).
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const WWW = path.join(__dirname, "www");

function servirJuego() {
  protocol.handle("app", (request) => {
    const ruta = decodeURIComponent(new URL(request.url).pathname);
    const archivo = path.normalize(path.join(WWW, ruta === "/" ? "index.html" : ruta));
    if (!archivo.startsWith(WWW)) return new Response("No permitido", { status: 403 });
    return net.fetch(pathToFileURL(archivo).toString());
  });
}

// ---------- Vincular celular (partida en dos dispositivos, 12-10-2026) ----------
// La PC es la "pantalla grande": abre una conexión dentro de la red Wi-Fi (no
// usa internet) y el celular se conecta escaneando el QR o escribiendo el
// código de vinculación. Solo un celular a la vez, y solo con el código correcto.
// - El código tiene 6 números y cambia cada minuto (también vale el anterior,
//   por si cambió justo mientras se escribía).
// - Con el código escrito, el celular no sabe la dirección de la PC: grita a
//   toda la red por UDP ("MSV1 BUSCAR 123456") y la PC que lo tiene le contesta
//   ("MSV1 AQUI 123456 47821"). Lo hace VinculoPlugin.java en Android.
// - Al revés (la partida está en el celular): el celular muestra su código y
//   grita "MSV1 COMPARTE 123456"; cuando ese código se escribe en la PC, la PC
//   le contesta ("MSV1 PC 123456 47821") y el celular se conecta y le pasa la partida.
const PUERTO = 47821;
const PUERTO_UDP = 47822;
const VIGENCIA = 60_000;
let servidor = null;
let cliente = null;
let puerto = null;
let ventana = null;
let codigos = { actual: null, anterior: null, vence: 0, reloj: null };
let esperado = null; // código del celular que se escribió en la PC (partida del celular)
let llave = null; // se le da al celular conectado: con ella vuelve a entrar ("Reconectar") aunque el código haya cambiado

/**
 * Direcciones de esta PC en la red local (192.168…, 10…, 172.16–31…). Las de
 * redes virtuales (VirtualBox, VMware, Hyper-V, WSL…) van al final: el celular
 * no está en esas redes y la primera es la que se muestra.
 */
function ipsLocales() {
  const privada = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
  const virtual = (nombre, ip) => /virtual|vmware|vethernet|hyper-v|wsl|docker|vbox|loopback/i.test(nombre) || ip.startsWith("192.168.56.");
  return Object.entries(os.networkInterfaces())
    .flatMap(([nombre, lista]) => (lista || []).map((i) => ({ ...i, nombre })))
    .filter((i) => i.family === "IPv4" && !i.internal && privada(i.address))
    .sort((x, y) => virtual(x.nombre, x.address) - virtual(y.nombre, y.address))
    .map((i) => i.address);
}

function avisar(canal, contenido) {
  if (ventana && !ventana.isDestroyed()) ventana.webContents.send(canal, contenido);
}

function nuevoCodigo() {
  let c;
  do c = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0"); while (c === codigos.actual);
  codigos.anterior = codigos.actual;
  codigos.actual = c;
  codigos.vence = Date.now() + VIGENCIA;
  avisar("vinculo:codigo", datosVinculo());
}

const codigoValido = (c) => Boolean(c) && (c === codigos.actual || c === codigos.anterior);
const datosVinculo = () => ({ ips: ipsLocales(), puerto, codigo: codigos.actual, vence: codigos.vence });

/** Contesta por UDP al celular que busca esta PC por su código. */
function atenderUdp(texto, desde, udp) {
  const [marca, tipo, codigo] = String(texto).trim().split(" ");
  if (marca !== "MSV1") return;
  let respuesta = null;
  if (tipo === "BUSCAR" && codigoValido(codigo)) respuesta = `MSV1 AQUI ${codigo} ${puerto}`;
  if (tipo === "COMPARTE" && esperado && codigo === esperado) respuesta = `MSV1 PC ${codigo} ${puerto}`;
  if (respuesta) udp.send(respuesta, desde.port, desde.address);
}

function abrirVinculo() {
  if (servidor) return Promise.resolve(datosVinculo());
  return new Promise((resolve, reject) => {
    const http_ = http.createServer((_req, res) => { res.writeHead(404); res.end(); });
    const wss = new WebSocketServer({ server: http_ });
    wss.on("connection", (ws) => {
      let aceptado = false;
      ws.on("message", (texto) => {
        let msg;
        try { msg = JSON.parse(texto); } catch { return; }
        if (!aceptado) {
          // El primer mensaje tiene que traer el código; solo un celular a la vez
          const pin = String(msg.pin);
          const traspaso = Boolean(esperado) && pin === esperado;
          const conLlave = Boolean(llave) && msg.llave === llave;
          if (msg.tipo !== "hola" || !(codigoValido(pin) || traspaso || conLlave)) {
            ws.send(JSON.stringify({ tipo: "rechazado", motivo: "codigo" }));
            ws.close();
            return;
          }
          if (cliente) {
            ws.send(JSON.stringify({ tipo: "rechazado", motivo: "ocupado" }));
            ws.close();
            return;
          }
          aceptado = true;
          cliente = ws;
          if (traspaso) esperado = null;
          ws.send(JSON.stringify({ tipo: "bienvenido", llave }));
          avisar("vinculo:estado", { conectado: true, dispositivo: msg.dispositivo || "celular", traspaso });
          return;
        }
        avisar("vinculo:mensaje", msg);
      });
      ws.on("close", () => {
        if (ws === cliente) {
          cliente = null;
          avisar("vinculo:estado", { conectado: false });
        }
      });
    });
    const udp = dgram.createSocket({ type: "udp4", reuseAddr: true });
    udp.on("message", (texto, desde) => atenderUdp(texto, desde, udp));
    udp.on("error", (e) => console.warn("Vincular (UDP):", e.message));
    udp.bind(PUERTO_UDP);
    const escuchar = (p) => http_.listen(p, "0.0.0.0");
    http_.on("listening", () => {
      servidor = { http: http_, wss, udp };
      llave = crypto.randomBytes(12).toString("hex");
      puerto = http_.address().port;
      nuevoCodigo();
      codigos.reloj = setInterval(nuevoCodigo, VIGENCIA);
      resolve(datosVinculo());
    });
    http_.on("error", (e) => {
      if (e.code === "EADDRINUSE" && !servidor) escuchar(0); // puerto ocupado: cualquiera libre
      else reject(e);
    });
    escuchar(PUERTO);
  });
}

function cerrarVinculo() {
  if (!servidor) return;
  for (const ws of servidor.wss.clients) ws.close();
  servidor.wss.close();
  servidor.http.close();
  try { servidor.udp.close(); } catch { /* ya cerrado */ }
  clearInterval(codigos.reloj);
  codigos = { actual: null, anterior: null, vence: 0, reloj: null };
  servidor = null;
  cliente = null;
  esperado = null;
  llave = null;
}

ipcMain.handle("vinculo:abrir", () => abrirVinculo());
ipcMain.handle("vinculo:cerrar", () => cerrarVinculo());
ipcMain.handle("vinculo:esperar", async (_e, codigo) => {
  // Se escribió en la PC el código que muestra el celular (la partida está en el celular)
  await abrirVinculo();
  esperado = /^\d{6}$/.test(String(codigo)) ? String(codigo) : null;
  return Boolean(esperado);
});
ipcMain.on("vinculo:enviar", (_e, mensaje) => {
  if (cliente && cliente.readyState === 1) cliente.send(JSON.stringify(mensaje));
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 480,
    minHeight: 640,
    backgroundColor: "#0B0D17",
    title: "Musical Showdown",
    icon: path.join(__dirname, "build-icon.ico"),
    autoHideMenuBar: true,
    fullscreen: true, // pantalla completa (usuario, 29-10-2026); F11 entra y sale
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"), // puente para "Vincular celular"
    },
  });
  ventana = win;
  // Opción 1B «Agrandar» (usuario, 29-10-2026): todo crece en proporción a la pantalla, tomando como
  // base una laptop de 1366 × 768 (en pantallas más chicas queda igual, como antes).
  const ajustarZoom = () => {
    const { width, height } = win.getContentBounds();
    win.webContents.setZoomFactor(Math.min(2, Math.max(1, Math.min(width / 1366, height / 768))));
  };
  win.on("resize", ajustarZoom);
  win.webContents.on("did-finish-load", ajustarZoom);
  win.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F11") { e.preventDefault(); win.setFullScreen(!win.isFullScreen()); }
  });
  // Los enlaces externos (por ejemplo, "Descargar" de un aviso) se abren en el
  // navegador del sistema, no en una ventana del juego.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  // Las descargas (imagen del podio para compartir) van directo a la carpeta
  // Descargas, sin preguntar dónde guardar.
  win.webContents.session.on("will-download", (_e, item) => {
    item.setSavePath(path.join(app.getPath("downloads"), item.getFilename()));
  });
  win.loadURL("app://juego/index.html");
}

app.whenReady().then(() => {
  servirJuego();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

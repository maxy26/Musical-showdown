const { app, BrowserWindow, protocol, net, shell } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 480,
    minHeight: 640,
    backgroundColor: "#150F22",
    title: "Musical Showdown",
    icon: path.join(__dirname, "build-icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // Los enlaces externos (por ejemplo, "Descargar" de un aviso) se abren en el
  // navegador del sistema, no en una ventana del juego.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
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

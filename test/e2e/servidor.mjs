// Servidor mínimo para las pruebas de pantallas: sirve src/ sin caché.
// Uso: node test/e2e/servidor.mjs <puerto>
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../src");
const TIPOS = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".webmanifest": "application/manifest+json",
};

http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const archivo = path.join(RAIZ, ruta === "/" ? "index.html" : ruta);
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(datos);
  });
}).listen(Number(process.argv[2] || 4173), "127.0.0.1"); // solo esta PC: así Windows no pide permiso de red

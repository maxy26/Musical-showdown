/**
 * Envía los avisos importantes como notificación a los celulares con Android
 * (Firebase Cloud Messaging, tema "importantes"; ver src/js/notificaciones.js).
 * Lo corre GitHub Actions (.github/workflows/compilar.yml):
 *
 *   node build/notificar.js version v1.15
 *       Al publicar una versión: "Versión 1.15 disponible".
 *   node build/notificar.js avisos <avisos-antes.json> <avisos-ahora.json>
 *       Al cambiar avisos/avisos.json en main: envía los avisos con
 *       "importante": true que no estaban antes (cada uno una sola vez).
 *
 * Necesita la variable FIREBASE_SERVICE_ACCOUNT con el contenido del .json de
 * la cuenta de servicio de Firebase (secreto del repositorio). Con --prueba
 * solo muestra lo que enviaría, sin la clave ni internet.
 * No usa librerías: la firma del token se hace con crypto de Node.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");

const TEMA = "importantes";
const CANAL = "importantes"; // mismo id que crea la app (notificaciones.js)

function base64url(datos) {
  return Buffer.from(datos).toString("base64url");
}

/** Token de acceso de Google a partir de la cuenta de servicio (OAuth con JWT firmado). */
async function tokenDeAcceso(cuenta) {
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const datos = base64url(JSON.stringify({
    iss: cuenta.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: ahora,
    exp: ahora + 3600,
  }));
  const firma = crypto.sign("RSA-SHA256", Buffer.from(`${cabecera}.${datos}`), cuenta.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${cabecera}.${datos}.${firma}` }),
  });
  if (!r.ok) throw new Error(`No se pudo obtener el token de Google (${r.status}): ${await r.text()}`);
  return (await r.json()).access_token;
}

/**
 * Mensaje de FCM para el tema de los avisos importantes. `data.aviso` lleva el
 * aviso completo: la app lo agrega a la campana al recibirlo, sin esperar a
 * GitHub (agregarAvisoRecibido de src/js/avisos.js).
 */
function mensaje({ titulo, texto, aviso }) {
  return {
    message: {
      topic: TEMA,
      notification: { title: titulo, body: texto },
      data: { aviso: JSON.stringify(aviso) },
      android: { priority: "high", notification: { channel_id: CANAL } },
    },
  };
}

async function enviar(avisos, prueba) {
  if (avisos.length === 0) { console.log("No hay avisos importantes nuevos para enviar."); return; }
  if (prueba) {
    for (const a of avisos) console.log("[prueba] Enviaría:", JSON.stringify(mensaje(a)));
    return;
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Falta el secreto FIREBASE_SERVICE_ACCOUNT: no se envían notificaciones.");
    return;
  }
  const cuenta = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const token = await tokenDeAcceso(cuenta);
  for (const a of avisos) {
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${cuenta.project_id}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(mensaje(a)),
    });
    if (!r.ok) throw new Error(`Firebase rechazó "${a.titulo}" (${r.status}): ${await r.text()}`);
    console.log(`✔ Enviada: ${a.titulo}`);
  }
}

function leerJson(archivo) {
  // Sin archivo (por ejemplo, el primer avisos.json) es una lista vacía; se quita la marca BOM si la tiene
  try { return JSON.parse(fs.readFileSync(archivo, "utf8").replace(/^﻿/, "")); } catch { return []; }
}

async function principal() {
  const args = process.argv.slice(2);
  const prueba = args.includes("--prueba");
  const [modo, ...resto] = args.filter((a) => a !== "--prueba");
  const avisosJs = await import(pathToFileURL(path.join(__dirname, "..", "src", "js", "avisos.js")).href);

  if (modo === "version" && resto[0]) {
    // Se envía después de publicar la Release (compilar.yml): el botón ya puede descargarla.
    // El texto es el de la primera línea de la Release (mismo que muestra la campana).
    const aviso = avisosJs.avisoDeVersion({ tag: resto[0], fecha: new Date().toISOString(),
      texto: "Nueva versión de Musical Showdown: descarga el APK para Android o el .exe para Windows." });
    await enviar([{ titulo: aviso.titulo, texto: "Toca para ver la novedad y descargarla.", aviso }], prueba);
  } else if (modo === "avisos" && resto.length === 2) {
    const nuevos = avisosJs.importantesNuevos(leerJson(resto[0]), leerJson(resto[1]));
    await enviar(nuevos.map((aviso) => ({ titulo: aviso.titulo, texto: aviso.texto || "Toca para verlo.", aviso })), prueba);
  } else {
    console.error("Uso: node build/notificar.js version v1.15 | avisos <antes.json> <ahora.json> [--prueba]");
    process.exit(1);
  }
}

principal().catch((e) => { console.error("✖", e.message); process.exit(1); });

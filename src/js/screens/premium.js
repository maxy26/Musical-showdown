import { el, escapeHtml } from "../utils.js";
import { openSheet } from "./sheet.js";
import { showToast } from "./modals.js";
import { abrirEnlace } from "../plataforma.js";
import { EDICION } from "../version.js";
import { premiumActivo } from "../edicion.js";
import {
  comprasDisponibles, planesPremium, comprarPremium, revisarCompras,
  textoPeriodo, textoPrueba, ADMINISTRAR_SUSCRIPCION,
} from "../compras.js";

/**
 * Ventana de Premium (usuario, 13-10-2026): qué incluye, los planes con el
 * precio que da Google Play (en la moneda del jugador) y "Restaurar compras".
 * Se abre desde Ajustes y desde el candado de Alternativo 2. Por ahora solo
 * se puede comprar en la app de Android (compras.js).
 */
const BENEFICIOS = [
  ["🎮", "Modo <b>Alternativo 2</b>: por equipos, tú eliges las reglas"],
  ["🎤", "El juego <b>escucha el canto</b> (y pronto, la IA que reconoce la canción)"],
  ["🔁", "<b>Devolver relevos</b> en los equipos (botón ± de la ronda)"],
  ["🚫", "<b>Sin anuncios</b>"],
];

/** `alCerrar`: por ejemplo, para que la ronda siga al cerrarla (candado de los relevos). */
export function abrirPremium({ alCerrar } = {}) {
  const body = el(`<div class="premium">
    <div class="premium-icono">⭐</div>
    <ul class="premium-lista">${BENEFICIOS.map(([i, t]) => `<li><span>${i}</span><span>${t}</span></li>`).join("")}</ul>
    <div class="premium-planes"></div>
    <p class="premium-legal"></p>
    <button type="button" class="btn btn-ghost btn-block" id="restaurar">Restaurar compras</button>
  </div>`);
  const planes = body.querySelector(".premium-planes");
  const legal = body.querySelector(".premium-legal");
  const cerrar = openSheet({ title: "Musical Showdown Premium", body, alCerrar });

  const yaPremium = () => {
    body.classList.add("is-activo");
    // Copia personal del dueño: Premium siempre, sin suscripción que administrar
    if (EDICION === "personal") {
      planes.innerHTML = `<p class="premium-activo">✅ Premium activo (versión personal)</p>`;
      body.querySelector("#restaurar").hidden = true;
      legal.textContent = "";
      return;
    }
    planes.innerHTML = `<p class="premium-activo">✅ Ya tienes Premium. ¡Gracias por apoyar el juego!</p>
      <button type="button" class="btn btn-secondary btn-block" id="administrar">Ver o cancelar la suscripción</button>`;
    planes.querySelector("#administrar").onclick = () => abrirEnlace(ADMINISTRAR_SUSCRIPCION);
    legal.textContent = "";
  };

  body.querySelector("#restaurar").onclick = async () => {
    const activo = await revisarCompras();
    showToast(activo ? "✅ Premium activo" : "No se encontró una suscripción activa en esta cuenta de Google");
    if (activo) yaPremium();
  };

  if (premiumActivo()) { yaPremium(); return; }
  if (!comprasDisponibles()) {
    planes.innerHTML = `<p class="premium-nota">📱 Por ahora, Premium se compra desde la app de Android (Google Play).</p>`;
    body.querySelector("#restaurar").hidden = true;
    return;
  }

  planes.innerHTML = `<div class="loader-bar"><div class="loader-bar-fill"></div></div>`;
  planesPremium().then((lista) => {
    if (!lista.length) throw new Error("sin-planes");
    planes.innerHTML = lista.map((p, i) => `
      <button type="button" class="premium-plan pressable" data-plan="${i}">
        <span class="premium-precio">${escapeHtml(p.precio)} <small>${textoPeriodo(p.periodo)}</small></span>
        ${p.prueba ? `<span class="premium-prueba">${textoPrueba(p.prueba)}</span>` : ""}
      </button>`).join("");
    legal.textContent = "La suscripción se renueva sola hasta que la canceles. Puedes cancelarla cuando quieras en Google Play → Suscripciones.";
    planes.querySelectorAll("[data-plan]").forEach((b) => (b.onclick = async () => {
      b.disabled = true;
      try {
        if (await comprarPremium(lista[Number(b.dataset.plan)])) {
          showToast("⭐ ¡Bienvenido a Premium!");
          cerrar();
        }
      } catch (e) {
        if (e?.message !== "cancelada") showToast(e?.message === "ya-comprado" ? "Ya tienes Premium: toca «Restaurar compras»" : "No se pudo completar la compra");
      } finally {
        b.disabled = false;
      }
    }));
  }).catch(() => {
    planes.innerHTML = `<p class="premium-nota">No se pudieron cargar los planes. Revisa tu conexión a internet y que el juego esté instalado desde Google Play.</p>`;
  });
}

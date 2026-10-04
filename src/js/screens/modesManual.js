/**
 * Manual de "Modos de juego" de la pantalla de inicio (rediseño, 01-10-2026).
 * Cada modo se explica "a prueba de todo": datos rápidos con íconos, una
 * historieta de viñetas animadas que se encienden una tras otra, "Ver más"
 * con el detalle y el botón para elegirlo.
 * Las reglas salen de CONTEXTO-MUSICAL-SHOWDOWN.md, sección 3; si cambian,
 * actualizar estos textos.
 */
import { modeName, modesFor } from "./config/modes.js";

const MODE_GUIDES = {
  clasico: {
    facts: ["🙅 Sin reloj", "☝️ 1 intento cada uno", "🏆 100 por acierto"],
    story: [
      { art: `<span class="fx-word">AMOR</span>`, text: "Sale una palabra" },
      { art: `<span class="fx-pop">🙋</span><span class="fx-mic">🎤</span>`, text: "Uno canta una canción que la tenga" },
      { art: `<span class="fx-pop">🙋</span><span class="fx-x">❌</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">🙋‍♂️</span>`, text: "Si falla, ya no puede: le toca al rival" },
      { art: `<span class="fx-pop">✅</span><span class="fx-points fx-late">+100</span>`, text: "Si acierta, gana 100 puntos" },
    ],
    more: [
      "Si los dos fallan, la ronda termina con 0 para ambos.",
      "Los duelos se sortean. Si alguien se queda muy atrás en puntos, tiene más probabilidad de enfrentarse a los que van adelante, para emparejar la partida.",
      "Todos juegan casi la misma cantidad de duelos.",
      "Gana quien llega primero al puntaje objetivo.",
    ],
  },
  alternativo1: {
    facts: ["⏱️ Con reloj", "♾️ Intentos sin límite", "➕➖ Se suma y se resta"],
    story: [
      { art: `<span class="fx-ring"><i>😄</i><i>😎</i><i>🤩</i><i>🙂</i></span>`, text: "Todos contra todos, por turnos" },
      { art: `<span class="fx-clock"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle class="fx-clock-bar" cx="20" cy="20" r="16"/></svg><b>30</b></span>`, text: "Contra el reloj, con intentos sin límite" },
      { art: `<span class="fx-pair"><span>✅<b class="fx-plus">+100</b></span><span>😢<b class="fx-minus">−100</b></span></span>`, text: "El que acierta suma y el rival resta" },
      { art: `<span class="fx-pair"><span>⌛</span><span><b class="fx-minus">−50</b><b class="fx-minus">−50</b></span></span>`, text: "Si nadie acierta, los dos pierden la mitad" },
    ],
    more: [
      "El tiempo por ronda es de 30 segundos si no se cambia.",
      "Los multiplicadores siempre están activos: en cada ronda puede salir ×2 a ×5 y la ronda vale 100 × multiplicador.",
      "Los puntos pueden quedar en negativo.",
      "En Grupal, cada equipo tiene 3 relevos para la partida (1 por ronda): pasarle el turno a un compañero antes de responder.",
      "Usar un relevo de más se permite, pero en ese momento el equipo resta la mitad del valor de la ronda y el rival suma esa mitad.",
      "Gana quien llega primero al puntaje objetivo.",
    ],
  },
  alternativo2: {
    facts: ["👥 Solo en Grupal", "⚙️ Tú eliges las reglas", "📞 Relevo comodín"],
    story: [
      { art: `<span class="fx-mix"><b>Clásico</b><i>＋</i><b>Alt. 1</b></span>`, text: "Una mezcla de los dos modos" },
      { art: `<span class="fx-pop">⚙️</span>`, text: "Tú eliges: reloj, intentos, multiplicadores y si se resta" },
      { art: `<span class="fx-pop">🙋</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">📞</span>`, text: "Comodín: un compañero responde por ti" },
      { art: `<span class="fx-pop">🎯</span><b class="fx-points fx-late">5</b>`, text: "Cada jugador tiene sus intentos (5 si no se cambia)" },
    ],
    more: [
      "Los equipos se enfrentan al azar (con ventaja para el que va atrás) y los jugadores de cada equipo salen en orden.",
      "Se elige: tiempo o sin tiempo, multiplicadores, intentos (1 a 10), si el perdedor resta y si los dos restan la mitad cuando nadie acierta.",
      "Relevo comodín: el compañero responde y gasta un intento; si falla, el turno vuelve al jugador. Se elige cuántos hay en total y por ronda.",
      "Usar un relevo de más se permite, pero en ese momento el equipo resta la mitad del valor de la ronda y el rival suma esa mitad.",
      "Gana quien llega primero al puntaje objetivo.",
    ],
  },
};

/** Orden en que se muestran: todos los modos que existen (los de Grupal incluyen a todos). */
const ALL_MODES = modesFor("grupal").map((m) => m.id);

/** ¿Se puede elegir el modo con este tipo de batalla? (Alternativo 2 solo en Grupal) */
export function modeAllowed(modeId, battleType) {
  return modesFor(battleType).some((m) => m.id === modeId);
}

/** Enciende las viñetas una por una, en bucle, mientras el manual esté abierto. */
function animateStory(story) {
  const frames = [...story.querySelectorAll(".frame")];
  let i = 0;
  const paint = () => {
    frames.forEach((f, n) => f.classList.toggle("is-on", n === i));
    i = (i + 1) % frames.length;
  };
  // El intervalo se detiene solo cuando el manual se cierra (ya no está en la página)
  const timer = setInterval(() => (story.isConnected ? paint() : clearInterval(timer)), 2200);
  paint();
}

/**
 * @param {{battleType: string, current: string, onChoose: (modeId: string) => void}} props
 */
export function buildModesManual({ battleType, current, onChoose }) {
  const list = document.createElement("div");
  list.className = "manual";
  for (const id of ALL_MODES) {
    const guide = MODE_GUIDES[id];
    const name = modeName(id);
    const allowed = modeAllowed(id, battleType);
    const chosen = id === current;
    const item = document.createElement("article");
    // Se elige tocando la tarjeta completa o el botón (usuario, 04-10-2026). Un
    // modo que no existe en el tipo de batalla actual (Alternativo 2 en
    // Individual) también se puede elegir: quien llama cambia a Grupal.
    item.className = `manual-item${chosen ? " is-chosen" : " is-selectable"}`;
    item.innerHTML = `
      <div class="manual-top">
        <h3 class="manual-name">${name}</h3>
        ${chosen ? `<span class="home-tag home-tag-chosen">✓ Elegido</span>` : ""}
      </div>
      <div class="manual-facts">${guide.facts.map((f) => `<span class="manual-fact">${f}</span>`).join("")}</div>
      <ol class="story story-${guide.story.length}">${guide.story.map((s, n) => `
        <li class="frame"><span class="frame-num">${n + 1}</span>
          <span class="frame-art">${s.art}</span><span class="frame-text">${s.text}</span></li>`).join("")}
      </ol>
      <ul class="manual-more" hidden>${guide.more.map((t) => `<li>${t}</li>`).join("")}</ul>
      <div class="manual-actions">
        <button type="button" class="manual-toggle pressable" aria-expanded="false">Ver más</button>
        <button type="button" class="manual-choose pressable" ${chosen ? "disabled" : ""}>
          ${chosen ? "✓ Modo elegido" : allowed ? `Elegir ${name}` : `Elegir ${name} (pasa a Grupal)`}</button>
      </div>`;
    const more = item.querySelector(".manual-more");
    const toggle = item.querySelector(".manual-toggle");
    toggle.onclick = () => {
      more.hidden = !more.hidden;
      toggle.textContent = more.hidden ? "Ver más" : "Ver menos";
      toggle.setAttribute("aria-expanded", String(!more.hidden));
    };
    if (!chosen) {
      item.onclick = (e) => {
        if (e.target.closest(".manual-toggle")) return; // "Ver más" no elige el modo
        onChoose(id);
      };
    }
    list.append(item);
    animateStory(item.querySelector(".story"));
  }
  return list;
}

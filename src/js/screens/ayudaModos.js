/**
 * Ayuda de cada modo (usuario 11 y 12-10-2026; confirmado el 12-10-2026):
 * la ❓ dentro de un modo (Configurar partida, Organizar equipos, la ronda y la
 * pausa) explica ese modo en general, una por combinación de modo y tipo de
 * batalla. Mismo estilo visual que "Cómo se juega" del inicio: una frase grande,
 * fichas, historietas animadas y tarjetas de puntos con imagen. Cada una explica
 * solo su modo, sin nombrar a los otros. La ❓ del inicio sigue explicando todo
 * el juego (openHelp de modals.js).
 */
import { el } from "../utils.js";
import { openSheet } from "./sheet.js";
import { animateStory } from "./modesManual.js";
import { modeName } from "./config/modes.js";

const VS = (a, b) => `<span class="fx-pop">${a}</span><b class="fx-points">VS</b><span class="fx-pop fx-late">${b}</span>`;
const RELOJ = `<span class="fx-clock"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle class="fx-clock-bar" cx="20" cy="20" r="16"/></svg><b>30</b></span>`;

// Viñetas de "Una ronda" (mismos efectos que el manual de modos). La primera
// dice cómo se arma el duelo (usuario, 11-10-2026).
const F = {
  sorteo: { art: VS("🙋", "🙋‍♂️"), text: "Se sortean dos jugadores: con el tiempo, todos se enfrentan con todos" },
  sorteoEquipos: { art: VS("👥", "👥"), text: "Se sortean dos equipos; de cada uno canta un jugador al azar, entre los que menos cantaron" },
  turnos: { art: `<span class="fx-ring"><i>😄</i><i>😎</i><i>🤩</i><i>🙂</i></span>`, text: "Todos contra todos, por turnos" },
  turnosEquipos: { art: VS("👥", "👥"), text: "Equipos contra equipos, por turnos; los jugadores salen en orden" },
  sorteoEquiposOrden: { art: VS("👥", "👥"), text: "Se sortean dos equipos; sus jugadores salen en orden" },
  palabra: { art: `<span class="fx-word">AMOR</span>`, text: "Sale una palabra: hay que cantar una canción que la tenga" },
  palabraReloj: { art: RELOJ, text: "Sale una palabra y corre el reloj: se puede intentar las veces que quieran" },
  palabraIntentos: { art: `<span class="fx-pop">🎯</span><b class="fx-points fx-late">5</b>`, text: "Sale una palabra; cada jugador tiene sus intentos para cantar" },
  falla: { art: `<span class="fx-pop">🙋</span><span class="fx-x">❌</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">🙋‍♂️</span>`, text: "Si uno falla, ya no puede volver a intentarlo: le toca al rival" },
  fallaEquipo: { art: `<span class="fx-pop">👥</span><span class="fx-x">❌</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">👥</span>`, text: "Si uno falla, ya no puede volver a intentarlo: le toca al otro equipo" },
  acierta: { art: `<span class="fx-pop">✅</span><span class="fx-points fx-late">+100</span>`, text: "El primero que acierta gana 100 puntos" },
  aciertaEquipo: { art: `<span class="fx-pop">✅</span><span class="fx-points fx-late">+100</span>`, text: "El primero que acierta le da 100 puntos a su equipo" },
  aciertaValor: { art: `<span class="fx-pop">✅</span><span class="fx-points fx-late">+300</span>`, text: "Si acierta, su equipo gana el valor de la ronda" },
  sumaResta: { art: `<span class="fx-pair"><span>✅<b class="fx-plus">+300</b></span><span>😢<b class="fx-minus">−300</b></span></span>`, text: "El que acierta suma el valor de la ronda y el rival lo resta" },
  nadie: { art: `<span class="fx-pair"><span>⌛</span><span><b class="fx-minus">−150</b><b class="fx-minus">−150</b></span></span>`, text: "Si se acaba el tiempo y nadie acertó, los dos pierden la mitad" },
  comodin: { art: `<span class="fx-pop">🙋</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">📞</span>`, text: "Comodín: un compañero puede responder por el jugador" },
};

// Historieta de los relevos de Alternativo 1 Grupal (usuario, 12-10-2026: que
// se entienda mejor y con imágenes)
const RELEVO_A1 = [
  { art: `<span class="fx-pop">🙋</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">🔁</span>`, text: "Antes de responder, el jugador toca “Relevo” (el reloj se detiene)" },
  { art: `<span class="fx-pop">👥</span><span class="fx-arrow">➜</span><span class="fx-pop fx-late">👆</span>`, text: "Elige a un compañero de su equipo y confirma" },
  { art: `<span class="fx-pop">🙋‍♂️</span><span class="fx-mic">🎤</span>`, text: "El compañero canta en su lugar hasta que se acabe el tiempo" },
  { art: `<span class="fx-pop">🔁</span><span class="fx-pop fx-late">🔁</span><span class="fx-pop fx-late">🔁</span>`, text: "Cada equipo tiene 3 en la partida y puede usar 1 por ronda" },
];

// Tarjetas de puntos: imagen + explicación corta
const P = {
  correcta100: { art: `<span>✅</span><b class="tip-num mas">+100</b>`, text: "Canción correcta: gana 100 puntos" },
  correcta100Equipo: { art: `<span>✅</span><b class="tip-num mas">+100</b>`, text: "Canción correcta: 100 puntos para el equipo" },
  fallanDos: { art: `<span>❌</span><span>❌</span><b class="tip-num">0</b>`, text: "Si fallan los dos, nadie suma" },
  finalizar: { art: `<span>⏹️</span><b class="tip-num">0</b>`, text: "Finalizar ronda: nadie gana ni pierde puntos" },
  nuncaPierde: { art: `<span>🛡️</span>`, text: "Nunca se pierden puntos" },
  valor: { art: `<span class="tip-pill">×3</span><span>=</span><b class="tip-num mas">300</b>`, text: "La ronda vale 100 × el multiplicador (×2 a ×5); sin multiplicador, 100" },
  sumaResta: { art: `<b class="tip-num mas">+300</b><b class="tip-num menos">−300</b>`, text: "El que acierta gana el valor y el rival pierde lo mismo" },
  nadieMitad: { art: `<span>⌛</span><b class="tip-num menos">−150</b><b class="tip-num menos">−150</b>`, text: "Si nadie acierta, los dos pierden la mitad" },
  negativo: { art: `<b class="tip-num menos">−200</b>`, text: "Los puntos negativos se muestran en color rojo" },
  valorAlt2: { art: `<b class="tip-num">100</b><span>o</span><span class="tip-pill">×3</span>`, text: "La ronda vale 100, o 100 × el multiplicador si están activados" },
  correctaEquipo: { art: `<span>✅</span><b class="tip-num mas">+300</b>`, text: "Canción correcta: el equipo gana el valor de la ronda" },
  perdedorAlt2: { art: `<span>😢</span><b class="tip-num menos">−300</b>`, text: "Si la opción <span class=\"ayuda-opcion\">“El perdedor resta”</span> está activada, el perdedor de la ronda pierde los puntos que se jugaban en la ronda" },
  nadieAlt2: { art: `<span>⌛</span><b class="tip-num menos">−150</b><b class="tip-num menos">−150</b>`, text: "Si la opción <span class=\"ayuda-opcion\">“Si nadie acierta, ambos restan”</span> está activada, los dos equipos restan la mitad de los puntos de la ronda cuando la ronda termina o se acaba el tiempo" },
  relevoDeMas: { art: `<span>⚠️</span><b class="tip-num menos">−150</b><b class="tip-num mas">+150</b>`, text: "Se puede hacer un relevo aunque ya no queden (o si es el segundo en la misma ronda), pero se aplica una sanción, que se explica al confirmarlo" },
};

/** Contenido por "modo-batalla". */
const AYUDAS_MODO = {
  "clasico-individual": {
    resumen: "🎤 Un duelo por ronda: el primero que canta bien una canción con la palabra gana 100 puntos.",
    fichas: ["👤 Cada uno por su cuenta", "🙅 Sin reloj", "☝️ 1 intento cada uno", "🏆 100 por acierto"],
    ronda: [F.sorteo, F.palabra, F.falla, F.acierta],
    puntos: [P.correcta100, P.fallanDos, P.finalizar, P.nuncaPierde],
  },
  "clasico-grupal": {
    resumen: "🎤 Equipo contra equipo: canta un jugador de cada uno, y el primero que acierta le da 100 puntos a su equipo.",
    fichas: ["👥 Por equipos", "🙅 Sin reloj", "☝️ 1 intento por equipo", "🏆 100 por acierto"],
    ronda: [F.sorteoEquipos, F.palabra, F.fallaEquipo, F.aciertaEquipo],
    puntos: [P.correcta100Equipo, P.fallanDos, P.finalizar, P.nuncaPierde],
  },
  "alternativo1-individual": {
    resumen: "⏱️ Contra el reloj: se puede intentar muchas veces. El que acierta suma y su rival resta.",
    fichas: ["👤 Cada uno por su cuenta", "⏱️ Con reloj", "♾️ Intentos sin límite", "✖️ ×2 a ×5", "➕➖ Se suma y se resta"],
    ronda: [F.turnos, F.palabraReloj, F.sumaResta, F.nadie],
    puntos: [P.valor, P.sumaResta, P.nadieMitad, P.negativo],
  },
  "alternativo1-grupal": {
    resumen: "⏱️ Equipos contra el reloj: se puede intentar muchas veces y pedir ayuda a un compañero con el relevo.",
    fichas: ["👥 Por equipos", "⏱️ Con reloj", "♾️ Intentos sin límite", "✖️ ×2 a ×5", "🔁 3 relevos"],
    ronda: [F.turnosEquipos, F.palabraReloj, F.sumaResta, F.nadie],
    puntos: [P.valor, P.sumaResta, P.nadieMitad, P.negativo],
    relevos: { historieta: RELEVO_A1, extra: P.relevoDeMas },
  },
  "alternativo2-grupal": {
    resumen: "⚙️ Ustedes eligen las reglas en Configurar partida: reloj, intentos, multiplicadores y si se resta.",
    fichas: ["👥 Por equipos", "⚙️ Reglas a elección", "📞 Relevo comodín"],
    ronda: [F.sorteoEquiposOrden, F.palabraIntentos, F.comodin, F.aciertaValor],
    puntos: [P.valorAlt2, P.correctaEquipo, P.perdedorAlt2, P.nadieAlt2],
  },
};

/** ¿Hay ayuda para esta combinación? (Alternativo 2 solo existe en Grupal) */
export function hayAyudaModo(mode, battleType) {
  return Boolean(AYUDAS_MODO[`${mode}-${battleType}`]);
}

const historieta = (vinetas) => `<ol class="story story-${vinetas.length}">${vinetas.map((s, n) => `
  <li class="frame"><span class="frame-num">${n + 1}</span>
    <span class="frame-art">${s.art}</span><span class="frame-text">${s.text}</span></li>`).join("")}
</ol>`;

const tarjeta = (p) => `<div class="ayuda-tarjeta"><span class="ayuda-tarjeta-art">${p.art}</span><span class="ayuda-tarjeta-texto">${p.text}</span></div>`;

/** Abre la ayuda del modo y tipo de batalla. `alCerrar` se llama al cerrarla (reanuda el reloj). */
export function abrirAyudaModo(mode, battleType, alCerrar) {
  const a = AYUDAS_MODO[`${mode}-${battleType}`];
  const body = el(`<div class="manual ayuda">
    <article class="manual-item">
      <p class="ayuda-linea">${a.resumen}</p>
      <div class="manual-facts">${a.fichas.map((f) => `<span class="manual-fact">${f}</span>`).join("")}</div>
    </article>
    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Una ronda</h3></div>
      ${historieta(a.ronda)}
    </article>
    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Puntos</h3></div>
      <div class="ayuda-tarjetas">${a.puntos.map(tarjeta).join("")}</div>
    </article>
    ${a.relevos ? `<article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Relevos</h3></div>
      ${historieta(a.relevos.historieta)}
      <div class="ayuda-tarjetas ayuda-tarjetas-una">${tarjeta(a.relevos.extra)}</div>
    </article>` : ""}
    <article class="manual-item">
      <div class="manual-top"><h3 class="manual-name">Cómo se gana</h3></div>
      <p class="ayuda-linea">🏆 Gana el primero que llega al puntaje objetivo.</p>
    </article>
  </div>`);
  openSheet({ title: `${modeName(mode)} · ${battleType === "grupal" ? "Grupal" : "Individual"}`, body, alCerrar });
  body.querySelectorAll(".story").forEach(animateStory);
}

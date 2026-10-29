/**
 * Botoncitos de ayuda (?) junto a cada sección o botón (usuario
 * 11 y 12-10-2026; confirmado el 12-10-2026). Van al costado derecho de la sección
 * o ventana donde aparecen. Al tocarlos se abre una ventanita con el título, el
 * modo que se está jugando, una frase corta y tarjetas con imagen y pocas
 * palabras (usuario, 12-10-2026: "explícalo con imágenes de manera muy breve").
 * Cada una explica solo el modo que se está jugando, sin nombrar a los otros, y
 * responde "¿qué hace?" / "¿qué pasa si elijo esto?".
 */
import { state } from "../state.js";
import { efecto, efectoSuave } from "../sound.js";
import { modeName } from "./config/modes.js";
import { GROUP_TERMS } from "../groups.js";
import { pausarRondaMientras } from "./modals.js";

// ---------- Dibujitos para las tarjetas ----------
const PUNTOS = (n, gastados) => `<span class="tip-puntos">${Array.from({ length: n }, (_, i) => `<span class="tip-punto${i < gastados ? " gastado" : ""}"></span>`).join("")}</span>`;
const LISTA = (valor) => `<span class="tip-lista">${valor} ▾</span>`;
const RUEDA = (antes, valor, despues) => `<span class="tip-rueda"><i>${antes}</i><b>${valor}</b><i>${despues}</i></span>`;
const PILL = (t) => `<span class="tip-pill">${t}</span>`;
const NUM = (t, clase = "") => `<b class="tip-num ${clase}">${t}</b>`;
const BOTON = (t) => `<span class="tip-boton">${t}</span>`;

// Texto del relevo de más (usuario, 12-10-2026), igual en todos los (?) que lo explican
const RELEVO_DE_MAS = "El relevo de más sanciona al equipo: resta la mitad de los puntos en juego y suma esa misma mitad al equipo contrario";

/**
 * Contenido de cada (?): `frase` (una línea) y `tarjetas` ([imagen, texto
 * corto]). Cada uno puede ser fijo, un objeto por modo o una función de la
 * configuración. `batalla: true` muestra Individual / Grupal en vez del modo.
 */
const AYUDAS = {
  jugadores: {
    titulo: "Jugadores",
    batalla: true,
    frase: (c) => c.battleType === "grupal" ? "Los que van a jugar. Mínimo 4." : "Los que van a jugar. Mínimo 2.",
    tarjetas: [
      [PILL("Ana"), "Toca un espacio y escribe el nombre"],
      [BOTON("+ Añadir"), "Agrega otro jugador"],
      [`<span class="tip-x">✕</span>`, "Lo borra"],
      [`${PILL("Ana")}${PILL("Ana")}<span>🚫</span>`, "No se pueden repetir"],
    ],
  },
  generos: {
    titulo: "Géneros musicales",
    frase: "De qué géneros salen las palabras.",
    tarjetas: (c) => [
      [`${BOTON("Todos")}<span>➜</span>${PILL("Pop")}${PILL("Rock")}${PILL("…")}`, "Eliges todos los géneros"],
      c.mode === "alternativo2"
        ? [`${BOTON("Más")}<span>➜</span>${PILL("Pop")}${PILL("Salsa")}`, "Eliges uno o varios géneros"]
        : [`${BOTON("Más")}<span>➜</span>${PILL("Rock")}`, "Eliges solo un género"],
    ],
  },
  puntaje: {
    titulo: "Puntaje objetivo",
    frase: (c) => c.mode === "clasico" ? "El primero que llega gana. Cada acierto suma 100." : "El primero que llega gana.",
    tarjetas: [
      [LISTA("2000 pts"), "Elige el puntaje objetivo con los valores predeterminados, de 500 hasta 5000"],
      [RUEDA("1900", "2000", "2100"), "Personalizado: elige el puntaje objetivo con más flexibilidad, de 100 hasta 9900 puntos"],
    ],
  },
  tiempo: {
    titulo: "Tiempo por ronda",
    frase: "Los segundos para responder en cada ronda.",
    tarjetas: (c) => [
      [LISTA("30 seg"), "Elige el tiempo por ronda con los valores predeterminados, de 5 segundos hasta 1 minuto"],
      [RUEDA("0:44", "0:45", "0:46"), "Personalizado: elige el tiempo por ronda con más flexibilidad, de 5 segundos hasta 2 minutos como máximo"],
      ...(c.mode === "alternativo2" ? [[`<span>🚫</span><span>⏱️</span>`, "Al elegir “Sin tiempo”, las rondas se terminan en cualquier momento con el botón “Finalizar ronda”"]] : []),
    ],
  },
  multiplicadores: {
    titulo: "Multiplicadores",
    frase: "Hacen que algunas rondas valgan más.",
    tarjetas: [
      [`${BOTON("Sí")}<span>➜</span>${PILL("×3")}<span>=</span>${NUM("300", "mas")}`, "Los puntos se multiplican al azar durante todo el juego, desde ×2 hasta ×5"],
      [`${BOTON("No")}<span>➜</span>${NUM("100")}`, "Todas las rondas valen 100"],
    ],
  },
  intentos: {
    titulo: "Intentos",
    frase: "Cuántas veces puede responder cada equipo en una ronda (1 a 10).",
    tarjetas: [
      [PUNTOS(5, 0), "Al empezar la ronda"],
      [`<span>❌</span><span>➜</span>${PUNTOS(5, 1)}`, "Cada error gasta uno"],
      [`<span>🔁</span><span>➜</span>${PUNTOS(5, 2)}`, "Cada relevo también"],
      [`${PUNTOS(5, 5)}<span>🚫</span>`, "Sin intentos: no responde más en esa ronda"],
    ],
  },
  perdedor: {
    titulo: "El perdedor resta",
    frase: "¿El que no acierta pierde puntos?",
    tarjetas: [
      [`${BOTON("Sí")}<span>➜</span>${NUM("+300", "mas")}${NUM("−300", "menos")}`, "Pierde lo mismo que gana el otro"],
      [`${BOTON("No")}<span>➜</span>${NUM("+300", "mas")}${NUM("0")}`, "No pierde nada"],
    ],
  },
  nadie: {
    titulo: "Si nadie acierta, ambos restan",
    frase: "¿Hay castigo si la ronda termina sin aciertos?",
    tarjetas: [
      [`${BOTON("Sí")}<span>➜</span>${NUM("−150", "menos")}${NUM("−150", "menos")}`, "Los dos pierden la mitad"],
      [`${BOTON("No")}<span>➜</span>${NUM("0")}${NUM("0")}`, "Nadie pierde"],
    ],
  },
  relevosConfig: {
    titulo: "Relevos por equipo",
    frase: "Un compañero responde en lugar del jugador.",
    tarjetas: [
      [`<span>🙋</span><span>➜</span><span>🙋‍♂️</span><span>🎤</span>`, "Se hace un relevo entre jugadores del mismo equipo para cantar la canción, con un solo intento. Si falla, el turno vuelve al jugador inicial de la ronda"],
      [`<span>⚠️</span>${NUM("−150", "menos")}${NUM("+150", "mas")}`, RELEVO_DE_MAS],
    ],
  },
  ronda: {
    titulo: "La ronda",
    frase: "Lo que se ve en el centro de la pantalla.",
    tarjetas: (c) => [
      [PILL("AMOR"), "La canción tiene que tener esta palabra"],
      ...(c.mode !== "clasico" ? [[`<span>🕐</span>${NUM("18s")}`, "Segundos que quedan (rojo en los últimos 5)"]] : []),
      ...(c.mode !== "clasico" ? [[`${PILL("×3")}<span>=</span>${NUM("300", "mas")}`, "Si sale, la ronda vale 100 × ese número"]] : []),
      [BOTON("Ana"), "El que quiere cantar toca su nombre: el primero gana el turno"],
      ...(c.mode !== "alternativo1" ? [[BOTON("⏹️ Finalizar ronda"), c.mode === "clasico" ? "Termina la ronda: nadie gana ni pierde puntos" : "Solo sin tiempo: termina como si nadie acertara"]] : []),
    ],
  },
  relevoRonda: {
    titulo: "Relevo",
    frase: "Pasarle el turno a un compañero del equipo.",
    tarjetas: {
      alternativo1: [
        [`${BOTON("Relevo")}<span>➜</span><span>⏸️</span>`, "Antes de responder: el reloj se detiene"],
        [`<span>👥</span><span>➜</span><span>🙋‍♂️</span><span>🎤</span>`, "Eliges al compañero; él sigue hasta que se acabe el tiempo"],
        [`<span>🔁</span><span>🔁</span><span>🔁</span>`, "3 en la partida, 1 por ronda. ± agrega o quita"],
        [`<span>⚠️</span>${NUM("−150", "menos")}${NUM("+150", "mas")}`, RELEVO_DE_MAS],
      ],
      alternativo2: [
        [`${BOTON("Relevo")}<span>➜</span><span>⏸️</span>`, "El reloj se detiene mientras eliges"],
        [`<span>🙋‍♂️</span><span>🎤</span><span>➜</span>${PUNTOS(3, 1)}`, "El compañero responde y gasta un intento"],
        [`<span>❌</span><span>➜</span><span>🙋</span>`, "Si falla, el turno vuelve al jugador"],
        [`<span>⚠️</span>${NUM("−150", "menos")}${NUM("+150", "mas")}`, RELEVO_DE_MAS],
      ],
    },
  },
  buscar: {
    titulo: "Buscar canción",
    frase: "Para comprobar la canción si hay dudas.",
    tarjetas: [
      [`<span class="tip-lista">Col▏</span>`, "Escribe 3 letras o más: aparecen las canciones con la palabra de la ronda"],
      [`<span class="tip-lista">des<span class="tip-gris">pacito</span></span>`, "Toca la canción (o Tab ↹ en PC) para completar el nombre"],
      [`${PILL("Color Esperanza")}${BOTON("▶")}`, "▶ la abre en YouTube para escucharla"],
      [`<span class="tip-lista">Enter ↵</span><span>➜</span><span>▶</span>`, "Enter busca el nombre en YouTube"],
    ],
  },
  decision: {
    titulo: "Correcta o Incorrecta",
    frase: "El moderador escucha y decide. Si hay dudas, “🔎 Buscar canción”; “← Volver” si se tocó sin querer.",
    tarjetas: {
      clasico: [
        [`<span>✅</span>${NUM("+100", "mas")}`, "Gana 100 y la ronda termina"],
        [`<span>❌</span><span>➜</span><span>🙋‍♂️</span>`, "Ya no puede intentarlo: le toca al rival"],
      ],
      alternativo1: [
        [`<span>✅</span>${NUM("+300", "mas")}${NUM("−300", "menos")}`, "Gana el valor, el rival lo pierde y la ronda termina"],
        [`<span>❌</span><span>➜</span><span>🔁</span>`, "Puede intentarlo otra vez mientras quede tiempo"],
      ],
      alternativo2: [
        [`<span>✅</span>${NUM("+300", "mas")}`, "El equipo gana el valor y la ronda termina"],
        [`<span>❌</span><span>➜</span>${PUNTOS(3, 1)}`, "Gasta un intento; si le quedan, sigue"],
      ],
    },
  },
  equipos: {
    titulo: "Organizar equipos",
    batalla: true,
    frase: (c) => `Cómo armar los ${(GROUP_TERMS[c.groupTerm] || GROUP_TERMS.equipo).plural.toLowerCase()}.`,
    tarjetas: [
      [`${PILL("Bruno")}<span>⇄</span>${PILL("Carlos")}`, "Toca dos jugadores de distinto equipo: cambian de lugar"],
      [`${PILL("Bruno")}<span>➜</span><span>👥</span>`, "Toca un jugador y otro equipo: se mueve (mínimo 2 por equipo)"],
      [`<span>✏️</span>`, "Cambia el nombre del equipo"],
      [BOTON("🎲"), "Reparte otra vez al azar"],
    ],
  },
};

/** HTML del botoncito (?). Con `esquina`, va en la esquina de arriba a la derecha de su contenedor. */
export function botonAyuda(clave, esquina = false) {
  return `<button type="button" class="ayuda-btn${esquina ? " esquina" : ""}" data-ayuda="${clave}" aria-label="Ayuda: ${AYUDAS[clave].titulo}">❓</button>`;
}

/** Conecta los (?) que haya dentro de `root`. */
export function conectarAyudas(root) {
  root.querySelectorAll("[data-ayuda]").forEach((b) => (b.onclick = (e) => {
    e.stopPropagation(); // no activa lo que está detrás (por ejemplo, la tarjeta de un equipo)
    abrirAyuda(b.dataset.ayuda, { boton: b });
  }));
}

/**
 * Pone la ventanita como un globo junto a su botón, con una flechita que le
 * apunta: debajo si cabe, si no arriba; si no cabe en ninguno, queda centrada
 * (usuario, 28-10-2026). Encima del fondo borroso pone una copia del botón
 * encendida, para que se vea cuál se tocó.
 */
function pegarAlBoton(overlay, boton) {
  const tip = overlay.querySelector(".ayuda-tip");
  overlay.classList.add("con-globo");
  const b = boton.getBoundingClientRect(), t = tip.getBoundingClientRect(), m = 12;
  const abajo = b.bottom + m + t.height <= window.innerHeight - m;
  if (!abajo && b.top - m - t.height < m) { overlay.classList.remove("con-globo"); return; }
  const centro = b.left + b.width / 2;
  const left = Math.min(Math.max(m, centro - 40), window.innerWidth - t.width - m);
  tip.style.left = left + "px";
  tip.style.top = (abajo ? b.bottom + m : b.top - m - t.height) + "px";
  tip.style.setProperty("--flecha-x", centro - left + "px");
  tip.classList.add(abajo ? "abajo" : "arriba");
  const copia = boton.cloneNode(true);
  copia.removeAttribute("data-ayuda");
  copia.classList.add("ayuda-btn-tocado");
  copia.tabIndex = -1;
  Object.assign(copia.style, { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px" });
  overlay.prepend(copia);
}

const porModo = (valor, c) => (typeof valor === "function" ? valor(c) : valor && !Array.isArray(valor) && typeof valor === "object" ? valor[c.mode] : valor);

/**
 * Abre la ventanita de un (?). También la abre el ❓ de la ronda (clave "ronda").
 * Con lCerrar avisa al cerrarla (el celular vinculado lo usa para que el reloj
 * de la PC siga; ver control.js). Con `boton`, sale como un globo junto a él.
 */
export function abrirAyuda(clave, { alCerrar, boton } = {}) {
  const c = state.config;
  const a = AYUDAS[clave];
  const tarjetas = porModo(a.tarjetas, c);
  if (!tarjetas) return;
  const etiqueta = a.batalla ? (c.battleType === "grupal" ? "Grupal" : "Individual") : modeName(c.mode);
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<div class="modal ayuda-tip">
    <div class="tip-cab"><h3></h3><span class="tip-modo"></span></div>
    <p class="tip-frase"></p>
    <div class="ayuda-tarjetas tip-tarjetas">${tarjetas.map(([art, texto]) => `
      <div class="ayuda-tarjeta"><span class="ayuda-tarjeta-art">${art}</span><span class="ayuda-tarjeta-texto">${texto}</span></div>`).join("")}
    </div>
  </div>`;
  overlay.querySelector("h3").textContent = a.titulo;
  overlay.querySelector(".tip-modo").textContent = etiqueta;
  overlay.querySelector(".tip-frase").textContent = porModo(a.frase, c);
  const reanudar = pausarRondaMientras(); // el reloj no corre mientras se lee la ayuda
  const cerrar = () => { efectoSuave("cerrar"); overlay.remove(); reanudar(); alCerrar?.(); };
  // X para cerrar (ventana informativa) y también tocando afuera
  const x = document.createElement("button");
  x.type = "button";
  x.className = "modal-close";
  x.setAttribute("aria-label", "Cerrar");
  x.textContent = "✕";
  x.onclick = cerrar;
  overlay.querySelector(".modal").prepend(x);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrar(); });
  document.getElementById("app").appendChild(overlay);
  if (boton?.isConnected) pegarAlBoton(overlay, boton);
  efecto("abrir");
}

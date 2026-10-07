import { state } from "./state.js";
import { onScreen } from "./sound.js";
import { screenMenu } from "./screens/menu.js";
import { screenConfig } from "./screens/config/index.js";
import { screenTeamOrg } from "./screens/teamOrg.js";
import { screenRound } from "./screens/round.js";
import { screenVerify } from "./screens/verify.js";
import { screenRoundResult, screenRoundResultIncorrect } from "./screens/roundResult.js";
import { screenResults } from "./screens/results.js";

const SCREENS = {
  "menu": screenMenu,
  "config": screenConfig,
  "team-org": screenTeamOrg,
  "round": screenRound,
  "round-intro": screenRound,
  "verify": screenVerify,
  "round-result": screenRoundResult,
  "round-result-incorrect": screenRoundResultIncorrect,
  "results": screenResults,
};

let pantallaAnterior = null;

/**
 * Dibuja la pantalla actual. Si es la misma que ya estaba (por ejemplo, al tocar
 * un Sí / No o un + / −), no repite la animación de entrada ni mueve la página:
 * eso hacía parpadear la pantalla (usuario, 06-10-2026).
 */
export function render() {
  const app = document.getElementById("app");
  const misma = state.screen === pantallaAnterior;
  const scroll = window.scrollY;
  pantallaAnterior = state.screen;
  app.innerHTML = "";
  const build = SCREENS[state.screen];
  if (!build) {
    console.error("Pantalla desconocida:", state.screen);
    return;
  }
  const nodo = build();
  if (misma) nodo.classList.add("sin-entrada");
  app.appendChild(nodo);
  if (misma) window.scrollTo(0, scroll);
  onScreen(state.screen);
}

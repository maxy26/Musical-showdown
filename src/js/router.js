import { state } from "./state.js";
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

export function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const build = SCREENS[state.screen];
  if (!build) {
    console.error("Pantalla desconocida:", state.screen);
    return;
  }
  app.appendChild(build());
}

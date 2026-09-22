import { state } from "../state.js";
import { el } from "../utils.js";
import { render } from "../router.js";
import { openHelp } from "./modals.js";

export function screenMenu() {
  const root = el(`<div class="screen">
    <div class="hero">
      <h1>Musical Showdown</h1>
      <p>El juego que reta a tu familia a cantar por una sola palabra.</p>
    </div>
    <div class="card">
      <div class="btn-row" style="flex-direction:column;">
        <button class="btn btn-primary btn-block" id="btn-config">🎤 Nueva partida</button>
        <button class="btn btn-ghost btn-block" id="btn-help">❓ Cómo se juega</button>
      </div>
    </div>
    <p class="small-note">La búsqueda de canciones usa una base local de ejemplo, no una API real todavía.</p>
  </div>`);

  root.querySelector("#btn-config").onclick = () => {
    state.screen = "config";
    render();
  };
  root.querySelector("#btn-help").onclick = () => openHelp();

  return root;
}

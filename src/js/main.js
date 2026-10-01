import { render } from "./router.js";
import { initSound } from "./sound.js";
import { applySettings } from "./settings.js";

applySettings(); // antes del primer render: animaciones Sí/No guardadas en el dispositivo
render();
initSound();

function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("loader-hide");
  setTimeout(() => loader.remove(), 500);
}

const minTime = new Promise((resolve) => setTimeout(resolve, 900));
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
Promise.all([minTime, fontsReady]).then(hideLoader);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => console.error("SW error:", err));
  });
}

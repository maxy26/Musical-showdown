/**
 * Hoja emergente del rediseño: sube desde abajo en el celular y es una
 * ventana centrada en PC. Se cierra con la X de arriba a la derecha (regla de
 * las ventanas informativas), tocando afuera o con Escape.
 * Se agrega dentro de #app, así que render() la quita al cambiar de pantalla.
 *
 * @param {{title: string, body: HTMLElement}} props
 * @returns {() => void} función para cerrarla desde afuera
 */
export function openSheet({ title, body }) {
  const back = document.createElement("div");
  back.className = "sheet-back";
  back.innerHTML = `
    <section class="sheet" role="dialog" aria-modal="true">
      <header class="sheet-head"><h2 class="sheet-title"></h2>
        <button type="button" class="home-round-btn pressable sheet-close" aria-label="Cerrar">✕</button></header>
      <div class="sheet-body"></div>
    </section>`;
  back.querySelector(".sheet-title").textContent = title;
  back.querySelector(".sheet").setAttribute("aria-label", title);
  back.querySelector(".sheet-body").append(body);

  const onKey = (e) => { if (e.key === "Escape") close(); };
  function close() {
    document.removeEventListener("keydown", onKey);
    back.classList.add("is-closing");
    setTimeout(() => back.remove(), 180);
  }
  back.addEventListener("click", (e) => { if (e.target === back) close(); });
  back.querySelector(".sheet-close").onclick = close;
  document.addEventListener("keydown", onKey);
  document.getElementById("app").appendChild(back);
  return close;
}

// Pantallas sueltas: lista de jugadores, ajustes y textos que ya no deben aparecer.
import { test, expect } from "@playwright/test";
import { abrirJuego, configurarPartida, palabraDeLaRonda } from "./ayuda.mjs";

test.beforeEach(async ({ page }) => abrirJuego(page));

test("Inicio: sin textos de más", async ({ page }) => {
  await expect(page.getByText("¿Cómo quieres jugar?")).toHaveCount(0);
  await expect(page.getByText("Duelos 1 vs 1")).toHaveCount(0);
  await expect(page.locator("#btn-play")).toBeVisible();
});

test("Ajustes: opciones sin descripciones", async ({ page }) => {
  await page.locator("#btn-settings").click();
  await expect(page.getByRole("heading", { name: "Animaciones" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Música de fondo" })).toBeVisible();
  await expect(page.getByText("Luces que se mueven")).toHaveCount(0);
});

test("Lista de jugadores: con muchos jugadores se desplaza por dentro", async ({ page }) => {
  await page.locator("#btn-play").click();
  const lista = page.locator("#players-list");
  const altoInicial = (await lista.boundingBox()).height;
  for (let i = 0; i < 10; i++) await page.locator("#add-player").click();
  await expect(page.locator("#players-list .player-row")).toHaveCount(12);

  // La caja tiene siempre el mismo alto (no cambia al añadir) y se desplaza por dentro
  const alto = (await lista.boundingBox()).height;
  expect(alto).toBeCloseTo(altoInicial, 0);
  expect(alto).toBeLessThanOrEqual(266);
  expect(await lista.evaluate((l) => l.scrollHeight > l.clientHeight)).toBe(true);

  // El espacio nuevo queda a la vista y listo para escribir
  const ultimo = page.locator("#players-list input").last();
  await expect(ultimo).toBeFocused();
  await expect(ultimo).toBeInViewport();
  await ultimo.fill("Luis");
  await expect(page.locator("#players-count")).toHaveText("1");

  // La ✕ es roja y borra la fila
  const equis = page.locator("#players-list .remove-btn").last();
  expect(await equis.evaluate((b) => getComputedStyle(b).color)).toBe("rgb(255, 107, 107)");
  await equis.click();
  await expect(page.locator("#players-list .player-row")).toHaveCount(11);
  await expect(page.locator("#players-count")).toHaveText("0");
});

test("Nombres repetidos: no deja confirmar", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Ana"] });
  await expect(page.getByText(/Hay dos jugadores llamados "Ana"/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Configurar partida" })).toBeVisible();
});

test("Grupal con menos de 4: avisa solo al confirmar", async ({ page }) => {
  await page.locator('[data-battle="grupal"]').click();
  await page.locator("#btn-play").click();
  await expect(page.getByText(/se necesitan al menos 4/)).toHaveCount(0);
  await page.locator("#players-list input").nth(0).fill("Ana");
  await page.locator("#players-list input").nth(1).fill("Bruno");
  await page.locator("#confirm-config").click();
  await expect(page.getByText("Escribe al menos 4 nombres de jugador para jugar en Grupal (llevas 2).")).toBeVisible();
});

test("Géneros en Clásico: 'Todos' por defecto y 'Más' elige uno solo", async ({ page }) => {
  await page.locator("#btn-play").click();
  await expect(page.locator("#genres-all")).toHaveClass(/active/);
  await page.locator("#genres-more").click();
  await expect(page.getByRole("heading", { name: "Elige un género" })).toBeVisible();
  await expect(page.locator('.genre-item[data-genre="salsa"]')).toContainText("Marc Anthony");
  await expect(page.locator(".genre-item.is-chosen")).toHaveCount(0); // con "Todos" no hay uno elegido
  await expect(page.locator('.genre-item[data-genre="pop"] .home-tag')).toBeHidden();
  await page.locator('.genre-item[data-genre="rock"]').click();
  await expect(page.locator("#genres-more")).toHaveText("Más: Rock en español");
  await expect(page.locator("#genres-all")).not.toHaveClass(/active/);
  await page.locator("#genres-all").click();
  await expect(page.locator("#genres-all")).toHaveClass(/active/);
  await expect(page.locator("#genres-more")).toHaveText("Más");
});

test("Géneros en Alternativo 2: 'Más' elige varios", async ({ page }) => {
  await page.locator("#btn-modes").click();
  await page.getByRole("button", { name: /Elegir Alternativo 2/ }).click();
  await page.locator("#btn-play").click();
  await page.locator("#genres-more").click();
  await expect(page.getByRole("heading", { name: "Elige uno o varios géneros" })).toBeVisible();
  await expect(page.locator("#genres-done")).toBeDisabled();
  await page.locator('.genre-item[data-genre="pop"]').click();
  await page.locator('.genre-item[data-genre="salsa"]').click();
  await expect(page.locator(".genre-item.is-chosen")).toHaveCount(2);
  await expect(page.locator('.genre-item[data-genre="salsa"] .home-tag')).toBeVisible();
  await expect(page.locator("#genres-done")).toHaveText("Listo (2)");
  await page.locator("#genres-done").click();
  await expect(page.locator("#genres-more")).toHaveText("Más: Pop, Salsa");
});

test("Ronda: sin el texto del modo arriba", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await expect(page.getByText(/MODO (INDIVIDUAL|GRUPAL)/)).toHaveCount(0);
});

test("Aviso que llega en una notificación: aparece en la campana sin esperar a GitHub", async ({ page }) => {
  await expect(page.locator(".aviso-globito")).toBeHidden();
  // Lo mismo que hace main.js al recibir una notificación (alRecibir)
  await page.evaluate(async () => {
    const { agregarAvisoRecibido, idsSinLeer } = await import("/js/avisos.js");
    const { avisosLlegaron } = await import("/js/screens/menu.js");
    const aviso = agregarAvisoRecibido(JSON.stringify({ id: "prueba-e2e", tipo: "promo", fecha: "2026-10-11",
      titulo: "Aviso por notificación", texto: "Llegó sin esperar a GitHub" }), "1.0");
    avisosLlegaron(idsSinLeer([aviso]));
  });
  await expect(page.locator(".aviso-globito")).toHaveText("1");
  await page.locator("#btn-notifications").click();
  await expect(page.getByRole("heading", { name: "Aviso por notificación" })).toBeVisible();
});

test("Ayuda 'Cómo se juega': resumen general y manual de modos solo para leer", async ({ page }) => {
  await page.locator("#btn-help").click();
  await expect(page.getByRole("heading", { name: "Cómo se juega" })).toBeVisible();
  await expect(page.getByText("Sale una palabra: canta una canción que la tenga.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Una ronda" })).toBeVisible();
  await expect(page.getByText("Gana el primero que llega al puntaje objetivo.")).toBeVisible();
  // Textos de la ayuda vieja que ya no van
  await expect(page.getByText("No hay empates ni desempates")).toHaveCount(0);
  await page.getByRole("button", { name: "Ver modos de juego" }).click();
  await expect(page.getByRole("heading", { name: "Modos de juego", level: 2 })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Elegir/ })).toHaveCount(0); // desde la ayuda no se cambia el modo
  await expect(page.getByText("Una mezcla de los dos modos")).toHaveCount(0);
});

test("❓ dentro de un modo: explica ese modo (Clásico · Individual)", async ({ page }) => {
  await page.locator("#btn-play").click();
  await page.locator("#help").click();
  await expect(page.getByRole("heading", { name: "Clásico · Individual" })).toBeVisible();
  await expect(page.getByText("Si fallan los dos, nadie suma")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Duelos" })).toHaveCount(0); // sin sección "Duelos" (usuario, 11-10-2026)
});

test("(?) de una opción: explica solo el modo que se juega", async ({ page }) => {
  await page.locator("#btn-play").click();
  await page.locator('[data-ayuda="puntaje"]').click();
  await expect(page.getByRole("heading", { name: "Puntaje objetivo" })).toBeVisible();
  await expect(page.locator(".tip-modo")).toHaveText("Clásico");
  await expect(page.getByText("El primero que llega gana. Cada acierto suma 100.")).toBeVisible();
  await expect(page.getByText("Personalizado: elige el puntaje objetivo con más flexibilidad, de 100 hasta 9900 puntos")).toBeVisible();
  await expect(page.locator(".lista-teclado")).toHaveCount(0); // no abre la lista de puntajes
  await page.locator(".ayuda-tip .modal-close").click();
  await expect(page.locator(".ayuda-tip")).toHaveCount(0);
});

test("Ronda con reloj: la ❓ explica la ronda y el tiempo se detiene mientras está abierta", async ({ page }) => {
  await page.locator("#btn-modes").click();
  await page.getByRole("button", { name: /Elegir Alternativo 1/ }).click();
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await expect(page.locator('[data-ayuda="ronda"]')).toHaveCount(0); // el (?) del centro pasó a la ❓ (usuario, 12-10-2026)
  const reloj = page.locator(".clock span");
  await page.locator("#help").click();
  await expect(page.getByRole("heading", { name: "La ronda" })).toBeVisible();
  const alAbrir = await reloj.textContent();
  await page.waitForTimeout(2500);
  await expect(reloj).toHaveText(alAbrir); // no se movió
  await page.locator(".ayuda-tip .modal-close").click();
  await page.waitForTimeout(2500);
  await expect(reloj).not.toHaveText(alAbrir); // vuelve a correr
});

test("Inicio: muestra la versión abajo a la derecha", async ({ page }) => {
  const etiqueta = page.locator(".home-version-tag");
  await expect(etiqueta).toHaveText(/^v\d+\.\d+$/);
  await expect(etiqueta).toHaveCSS("opacity", "1"); // ya terminó la entrada de la pantalla
  const caja = await etiqueta.boundingBox();
  const vista = page.viewportSize();
  expect(caja.x + caja.width).toBeGreaterThan(vista.width - 40);
  expect(caja.y + caja.height).toBeGreaterThan(vista.height - 40);
});

test("Íconos: la ayuda muestra íconos de Material Design, no emojis", async ({ page }) => {
  await page.locator("#btn-help").click();
  await expect(page.getByRole("heading", { name: "Cómo se juega" })).toBeVisible();
  await expect(page.locator(".frame-art svg.mi").first()).toBeVisible();
  const conEmoji = await page.evaluate(() => /\p{Extended_Pictographic}/u.test(document.querySelector(".sheet, [role='dialog'], body").innerText));
  expect(conEmoji).toBe(false);
});

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

  // La caja no crece sin fin: tiene alto fijo y se desplaza por dentro
  const alto = (await lista.boundingBox()).height;
  expect(alto).toBeGreaterThan(altoInicial);
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

test("Ronda: sin el texto del modo arriba", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await expect(page.getByText(/MODO (INDIVIDUAL|GRUPAL)/)).toHaveCount(0);
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

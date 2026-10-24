// La demo de la Microsoft Store (edicion.js). src/ se sirve sin compilar, con la
// edición vacía: aquí se cambia a "demo" al vuelo, como lo hace build/stamp.js.
import { test, expect } from "@playwright/test";
import { abrirJuego } from "./ayuda.mjs";

/** `yaVioAyuda`: que "Cómo se juega" no se abra sola y tape los botones. */
async function abrirDemo(page, { yaVioAyuda = true } = {}) {
  await page.route("**/js/version.js", async (route) => {
    const respuesta = await route.fetch();
    const cuerpo = (await respuesta.text()).replace('EDICION = ""', 'EDICION = "demo"');
    await route.fulfill({ response: respuesta, body: cuerpo });
  });
  // Como el .exe de PC: existe el puente de vinculación (sin la demo saldría "Vincular")
  await page.addInitScript(() => { window.vinculoPC = {}; });
  if (yaVioAyuda) await page.addInitScript(() => localStorage.setItem("musical-showdown:vio-ayuda", "1"));
  await abrirJuego(page);
}

test("Demo: sin 'Vincular' en el inicio", async ({ page }) => {
  await abrirDemo(page);
  await expect(page.locator(".home-version-demo")).toBeVisible(); // de verdad es la demo
  await expect(page.locator("#btn-vincular")).toHaveCount(0);
});

test("Demo: 'Cómo se juega' se abre sola solo la primera vez", async ({ page }) => {
  await abrirDemo(page, { yaVioAyuda: false });
  await expect(page.getByRole("heading", { name: "Cómo se juega" })).toBeVisible({ timeout: 4000 });
  await page.reload();
  await expect(page.locator("#btn-play")).toBeVisible();
  await page.waitForTimeout(1500); // más que la espera de menu.js (900 ms)
  await expect(page.getByRole("heading", { name: "Cómo se juega" })).toHaveCount(0);
});

test("Demo: la campana no pide las versiones de GitHub", async ({ page }) => {
  const pedidos = [];
  page.on("request", (r) => pedidos.push(r.url()));
  await abrirDemo(page);
  await page.waitForTimeout(800);
  expect(pedidos.some((u) => u.includes("avisos.json"))).toBe(true); // las novedades sí
  expect(pedidos.some((u) => u.includes("/releases"))).toBe(false);
});

test("Demo: Ajustes muestra qué trae la versión completa, sin prometer Premium ni descargas", async ({ page }) => {
  await abrirDemo(page);
  await page.locator("#btn-settings").click();
  await page.locator("#btn-completa").click();
  const ventana = page.locator(".version-completa");
  await expect(ventana).toContainText("Alternativo 1");
  await expect(ventana).toContainText("Muy pronto en la Microsoft Store");
  await expect(ventana).not.toContainText("Premium"); // en PC todavía no se puede comprar
  await expect(ventana.locator("a, button")).toHaveCount(0); // ningún enlace de descarga
});

// Pasos que comparten las pruebas de pantallas.
import { expect } from "@playwright/test";

/** Abre el juego sin cuenta antes de la ronda y sin pedir avisos a GitHub. */
export async function abrirJuego(page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem("musical-showdown:ajustes")) {
      localStorage.setItem("musical-showdown:ajustes", JSON.stringify({ countdown: 0 }));
    }
  });
  // Los avisos se piden a GitHub: en las pruebas se cortan (como sin internet).
  await page.route(/github(usercontent)?\.com/, (route) => route.abort());
  await page.goto("/index.html");
  await expect(page.locator("#btn-play")).toBeVisible();
}

/** Desde el inicio: elige el tipo de batalla, escribe los jugadores y confirma. */
export async function configurarPartida(page, { tipo = "individual", jugadores }) {
  if (tipo === "grupal") await page.locator('[data-battle="grupal"]').click();
  await page.locator("#btn-play").click();
  await expect(page.getByRole("heading", { name: "Configurar partida" })).toBeVisible();
  const campos = page.locator("#players-list input");
  while ((await campos.count()) < jugadores.length) await page.locator("#add-player").click();
  for (const [i, nombre] of jugadores.entries()) await campos.nth(i).fill(nombre);
  await page.locator("#confirm-config").click();
}

/** Espera a que aparezca la palabra de la ronda y la devuelve. */
export async function palabraDeLaRonda(page) {
  const palabra = page.locator(".word");
  await expect(palabra).toBeVisible({ timeout: 10_000 });
  return (await palabra.textContent()).trim();
}

/** Nombre de una canción de los géneros elegidos que lleva la palabra de la ronda. */
export function cancionConLaPalabra(page) {
  return page.evaluate(async () => {
    const { state } = await import("/js/state.js");
    const { SONG_DB } = await import("/js/data/songs.js");
    const { searchSongs } = await import("/js/screens/verify.js");
    return SONG_DB.find((s) => searchSongs(s.title, state.round.word).length > 0)?.title;
  });
}

/** El jugador de arriba toca su nombre: queda en la pantalla "¡… canta!" con ❌ / ✅. */
export async function responder(page) {
  await page.locator("#btn-a").click();
  await expect(page.locator(".canta-nombre")).toContainText("canta!");
  await expect(page.locator("#yes")).toBeVisible();
}

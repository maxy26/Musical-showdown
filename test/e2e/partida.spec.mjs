// Recorridos completos de una partida, como los haría un jugador.
import { test, expect } from "@playwright/test";
import { abrirJuego, configurarPartida, palabraDeLaRonda, responder, cancionConLaPalabra } from "./ayuda.mjs";

test.beforeEach(async ({ page }) => abrirJuego(page));

test("Individual: se canta una canción correcta y suma 100 puntos", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await responder(page);
  await page.locator("#yes").click();
  await expect(page.getByText("¡Correcto!")).toBeVisible();
  await expect(page.getByText("+100").first()).toBeVisible();
  await page.getByRole("button", { name: "Siguiente enfrentamiento" }).click();
  await palabraDeLaRonda(page);
});

test("Individual: una respuesta incorrecta le pasa el turno al rival", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await responder(page);
  await page.locator("#no").click();
  await expect(page.getByText("Respuesta incorrecta")).toBeVisible();
  await expect(page.getByText(/^Turno de (Ana|Bruno)$/)).toBeVisible();
  await page.locator("#continue").click();
  await palabraDeLaRonda(page);
});

test("¡… canta!: “← Volver” deshace el toque y la ronda sigue", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await responder(page);
  await page.locator("#back").click();
  await expect(page.locator(".canta-capa")).toHaveCount(0);
  await expect(page.locator("#btn-a")).toBeEnabled(); // no gastó su intento
});

test("Buscar canción: solo se abre con el botón y ▶ / Enter llevan a YouTube", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  const titulo = await cancionConLaPalabra(page);
  // YouTube se responde sin salir a internet: solo importa a qué dirección se va
  await page.context().route(/youtube\.com/, (route) => route.fulfill({ body: "YouTube (prueba)" }));
  await responder(page);
  await expect(page.locator("#q")).toHaveCount(0); // la búsqueda no se abre sola
  await page.locator("#buscar").click();
  await page.locator("#q").fill(titulo);
  const [ventana] = await Promise.all([page.waitForEvent("popup"), page.locator(".btn-youtube").first().click()]);
  await ventana.waitForLoadState();
  expect(ventana.url()).toContain("youtube.com/results?search_query=");
  await ventana.close();
  // Escribir el comienzo y completar con Tab: Enter busca el nombre completo (+ artista)
  await page.locator("#q").fill(titulo.slice(0, 4));
  await expect(page.locator(".busqueda-fantasma .resto")).toHaveText(titulo.slice(4));
  await page.locator("#q").press("Tab");
  await expect(page.locator("#q")).toHaveValue(titulo);
  const [otra] = await Promise.all([page.waitForEvent("popup"), page.locator("#q").press("Enter")]);
  await otra.waitForLoadState();
  expect(decodeURIComponent(otra.url())).toContain(titulo);
  await otra.close();
  // Tocar una canción también completa su nombre
  await page.locator("#q").fill(titulo.slice(0, 4));
  await page.locator(".result-item .r-title").first().click();
  await expect(page.locator("#q")).toHaveValue(titulo);
  await page.locator("#close").click();
  await expect(page.locator("#yes")).toBeVisible(); // vuelve a "¡… canta!"
});

test("Grupal: con 4 jugadores se arman 2 equipos y empieza la ronda", async ({ page }) => {
  await configurarPartida(page, { tipo: "grupal", jugadores: ["Ana", "Bruno", "Carla", "Diego"] });
  await expect(page.getByRole("heading", { name: /Organizar/ })).toBeVisible();
  await expect(page.getByText("Toca dos jugadores para intercambiarlos.")).toBeVisible();
  await page.locator("#confirm-teams").click();
  await page.getByRole("button", { name: "Sí, confirmar" }).click();
  await palabraDeLaRonda(page);
});

test("Pausa: salir de la partida vuelve a Configurar partida", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await page.locator("#pause").click();
  await page.locator("#exit").click();
  await expect(page.getByText("Se pierde el progreso de esta partida.")).toBeVisible();
  await page.getByRole("button", { name: /Sí, salir/ }).click();
  await expect(page.getByRole("heading", { name: "Configurar partida" })).toBeVisible();
  await expect(page.locator("#players-list input").first()).toHaveValue("Ana");
});

test("Recordar jugadores: tras recargar vuelven los nombres y 'Borrar nombres' los quita", async ({ page }) => {
  await configurarPartida(page, { jugadores: ["Ana", "Bruno"] });
  await palabraDeLaRonda(page);
  await page.reload();
  await page.locator("#btn-play").click();
  await expect(page.locator("#players-list input").first()).toHaveValue("Ana");
  await page.locator("#clear-players").click();
  await expect(page.locator("#players-list input").first()).toHaveValue("");
});

test("Podio: compartir muestra la imagen sin repetir el texto", async ({ page }) => {
  await page.evaluate(async () => {
    const { state } = await import("/js/state.js");
    const { render } = await import("/js/router.js");
    state.config.players = ["Ana", "Bruno", "Carla"];
    state.scores = { Ana: 2100, Bruno: 1500, Carla: 800 };
    state.winner = "Ana";
    state.screen = "results";
    render();
  });
  await expect(page.locator("#compartir")).toBeVisible();
  await page.locator("#compartir").click();
  await expect(page.locator(".compartir-img")).toBeVisible();
  await expect(page.locator("#compartir-ya")).toBeVisible();
  await expect(page.locator(".compartir-texto, .compartir-nota")).toHaveCount(0);
});

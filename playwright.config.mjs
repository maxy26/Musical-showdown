// Pruebas de pantallas (Playwright): abren el juego en un navegador sin ventana
// y lo recorren como un jugador. Se corren con `npm run test:e2e`.
// En esta PC se usa el Edge instalado; en GitHub Actions, el Chromium de Playwright.
import { defineConfig, devices } from "@playwright/test";

const PUERTO = 4173;

export default defineConfig({
  testDir: "test/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never", outputFolder: "test-results/informe" }]],
  outputDir: "test-results/archivos",
  use: {
    baseURL: `http://127.0.0.1:${PUERTO}`,
    serviceWorkers: "block", // el service worker podría servir copias viejas
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "msedge" } },
    { name: "pc", use: { ...devices["Desktop Edge"], channel: process.env.CI ? undefined : "msedge" } },
  ],
  webServer: {
    command: `node test/e2e/servidor.mjs ${PUERTO}`,
    url: `http://127.0.0.1:${PUERTO}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
});

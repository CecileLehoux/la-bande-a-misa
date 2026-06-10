import { defineConfig } from "@playwright/test"
import path from "path"

const PORT = 3105
const DB_PATH = path.join(__dirname, "test.db")

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  // Les tests partagent la même base : exécution séquentielle
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "fr-FR",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      // Base locale dédiée aux tests — jamais Turso
      TURSO_DATABASE_URL: `file:${DB_PATH}`,
      TURSO_AUTH_TOKEN: "",
      // Clés vides → mode mock Stripe (déjà géré dans /api/checkout) et emails silencieux
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      RESEND_API_KEY: "",
      // URLs locales pour éviter toute redirection vers la prod
      NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      AUTH_SECRET: "secret-de-test-e2e-uniquement",
      NEXTAUTH_SECRET: "secret-de-test-e2e-uniquement",
      AUTH_TRUST_HOST: "true",
      BLOB_READ_WRITE_TOKEN: "",
    },
  },
})

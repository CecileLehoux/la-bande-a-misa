import { test, expect, type Page } from "@playwright/test"
import { createClient } from "@libsql/client"
import path from "path"

/**
 * Vérifie que le passage d'une commande au statut "Livrée" crée bien une
 * demande d'avis (token unique) — c'est exactement la même branche de code
 * qui déclenche l'envoi de l'email de demande d'avis.
 */

const ADMIN_EMAIL = "admin-test@labandeamisa.fr"
const ADMIN_PASSWORD = "TestAdmin123!"

function testDb() {
  return createClient({ url: `file:${path.join(process.cwd(), "test.db")}` })
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL("/")
}

test.describe("Flux de demande d'avis", () => {
  test("passer une commande à 'Livrée' crée une demande d'avis avec un token", async ({ page }) => {
    // ── Commander la trousse en tant que client invité ────────
    await page.goto("/products/trousse-test")
    await page.getByRole("button", { name: "Ajouter au panier" }).click()
    await page.getByRole("link", { name: "Passer la commande" }).click()
    await page.getByRole("button", { name: /Retrait à l'atelier/ }).click()
    await page.locator('input[name="email"]').fill("avis-client@exemple.fr")
    await page.locator('input[name="firstName"]').fill("Claire")
    await page.locator('input[name="lastName"]').fill("Martin")
    await page.getByRole("button", { name: /Payer/ }).click()
    await page.waitForURL(/checkout\/success/)

    // Récupère le numéro de commande depuis l'URL de succès (mode mock)
    const orderNumber = new URL(page.url()).searchParams.get("orderNumber")
    expect(orderNumber).toBeTruthy()

    // ── En tant qu'admin, passer la commande à "Livrée" ───────
    await loginAsAdmin(page)
    await page.goto("/admin/orders")
    await page.getByRole("link", { name: orderNumber! }).click()
    await page.waitForURL(/\/admin\/orders\//)

    await page.locator("select").selectOption("DELIVERED")
    await page.getByRole("button", { name: "Mettre à jour" }).click()

    // ── Vérifie qu'une demande d'avis a été créée en base ─────
    await expect(async () => {
      const db = testDb()
      const res = await db.execute({
        sql: "SELECT token, email, submittedAt FROM shop_reviews WHERE orderNumber = ?",
        args: [orderNumber!],
      })
      expect(res.rows.length).toBe(1)
      // Un token non vide = le lien /avis/[token] de l'email
      expect(String(res.rows[0].token).length).toBeGreaterThan(10)
      expect(res.rows[0].email).toBe("avis-client@exemple.fr")
      // Pas encore soumis (le client n'a pas répondu)
      expect(res.rows[0].submittedAt).toBeNull()
    }).toPass({ timeout: 10_000 })
  })
})

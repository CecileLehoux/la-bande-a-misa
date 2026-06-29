import { test, expect, type Page } from "@playwright/test"

/**
 * Parcours admin : connexion → création produit → vérification côté boutique →
 * modification (avec invalidation du cache) → suppression
 */

const ADMIN_EMAIL = "admin-test@labandeamisa.fr"
const ADMIN_PASSWORD = "TestAdmin123!"

async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL("/")
}

test.describe("Parcours admin", () => {
  test("l'admin est inaccessible sans connexion", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await page.waitForURL(/\/login/)
  })

  test("un client connecté ne peut pas accéder à l'admin", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("client-test@exemple.fr")
    await page.locator('input[name="password"]').fill("TestClient123!")
    await page.getByRole("button", { name: "Se connecter" }).click()
    await page.waitForURL("/")

    await page.goto("/admin/dashboard")
    await page.waitForURL(/\/login/)
  })

  test("cycle de vie complet d'un produit : créer, vérifier, modifier, supprimer", async ({ page }) => {
    await loginAsAdmin(page)

    // ── Création ──────────────────────────────────────────────
    await page.goto("/admin/products")
    await page.getByRole("link", { name: "Nouveau produit" }).click()
    await page.waitForURL(/\/admin\/products\/new/)

    await page.locator('input[name="name"]').fill("Bandana E2E")
    // Le slug est auto-généré depuis le nom : bandana-e2e
    await expect(page.locator('input[name="slug"]')).toHaveValue("bandana-e2e")
    await page.locator('input[name="price"]').fill("25")
    await page.locator('input[name="stock"]').fill("3")
    await page.getByRole("button", { name: "Créer le produit" }).click()

    await page.waitForURL(/\/admin\/products$/)
    await expect(page.getByText("Bandana E2E")).toBeVisible()

    // ── Visible côté boutique au bon prix ─────────────────────
    await page.goto("/products/bandana-e2e")
    await expect(page.getByRole("heading", { name: "Bandana E2E" })).toBeVisible()
    await expect(page.getByText(/25,00/).first()).toBeVisible()

    // ── Modification du prix ──────────────────────────────────
    await page.goto("/admin/products")
    await page
      .locator("tr", { hasText: "Bandana E2E" })
      .getByRole("link", { name: "Modifier" })
      .click()
    await expect(page.getByRole("heading", { name: /Modifier : Bandana E2E/ })).toBeVisible()

    await page.locator('input[name="price"]').fill("29")
    await page.getByRole("button", { name: "Sauvegarder" }).click()
    await page.waitForURL(/\/admin\/products$/)

    // Le nouveau prix doit apparaître côté boutique (test anti-régression cache)
    await page.goto("/products/bandana-e2e")
    await expect(page.getByText(/29,00/).first()).toBeVisible()

    // ── Suppression ───────────────────────────────────────────
    await page.goto("/admin/products")
    await page
      .locator("tr", { hasText: "Bandana E2E" })
      .getByRole("link", { name: "Modifier" })
      .click()

    page.on("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: "Supprimer le produit" }).click()
    await page.waitForURL(/\/admin\/products$/)
    await expect(page.locator("tr", { hasText: "Bandana E2E" })).toHaveCount(0)

    // La fiche produit n'existe plus côté boutique
    const response = await page.goto("/products/bandana-e2e")
    expect(response?.status()).toBe(404)
  })

  test("un produit déjà commandé peut être supprimé (historique préservé)", async ({ page }) => {
    // ── Créer un produit en tant qu'admin ─────────────────────
    await loginAsAdmin(page)
    await page.goto("/admin/products/new")
    await page.locator('input[name="name"]').fill("Produit Commandé E2E")
    await page.locator('input[name="price"]').fill("30")
    await page.locator('input[name="stock"]').fill("5")
    await page.getByRole("button", { name: "Créer le produit" }).click()
    await page.waitForURL(/\/admin\/products$/)

    // ── Passer une commande sur ce produit (crée un order_item) ─
    await page.goto("/products/produit-commande-e2e")
    await page.getByRole("button", { name: "Ajouter au panier" }).click()
    await page.getByRole("link", { name: "Passer la commande" }).click()
    await page.getByRole("button", { name: /Retrait à l'atelier/ }).click()
    await page.locator('input[name="email"]').fill("client-test@exemple.fr")
    await page.locator('input[name="firstName"]').fill("Claire")
    await page.locator('input[name="lastName"]').fill("Martin")
    await page.getByRole("button", { name: /Payer/ }).click()
    await page.waitForURL(/checkout\/success/)

    // ── Supprimer le produit : doit réussir malgré la commande ─
    await page.goto("/admin/products")
    await page
      .locator("tr", { hasText: "Produit Commandé E2E" })
      .getByRole("link", { name: "Modifier" })
      .click()
    page.on("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: "Supprimer le produit" }).click()
    await page.waitForURL(/\/admin\/products$/)
    await expect(page.locator("tr", { hasText: "Produit Commandé E2E" })).toHaveCount(0)
  })

  test("le produit créé avec un partenaire affiche le lien de collaboration", async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto("/admin/products/new")
    await page.locator('input[name="name"]').fill("Produit Collab E2E")
    await page.locator('input[name="price"]').fill("40")
    await page.locator('input[name="stock"]').fill("2")
    await page.locator('input[name="partnerName"]').fill("Marque Amie")
    await page.locator('input[name="partnerUrl"]').fill("https://www.exemple.fr")
    await page.getByRole("button", { name: "Créer le produit" }).click()
    await page.waitForURL(/\/admin\/products$/)

    // Côté boutique : la mention collaboration est visible et cliquable
    await page.goto("/products/produit-collab-e2e")
    await expect(page.getByText(/En collaboration avec/)).toBeVisible()
    const partnerLink = page.getByRole("link", { name: "Marque Amie" })
    await expect(partnerLink).toHaveAttribute("href", "https://www.exemple.fr")

    // Nettoyage
    await page.goto("/admin/products")
    await page
      .locator("tr", { hasText: "Produit Collab E2E" })
      .getByRole("link", { name: "Modifier" })
      .click()
    page.on("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: "Supprimer le produit" }).click()
    await page.waitForURL(/\/admin\/products$/)
  })
})

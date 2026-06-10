import { test, expect } from "@playwright/test"

/**
 * Parcours client : accueil → fiche produit → taille → panier → checkout → paiement (mode mock)
 */

test.describe("Parcours client", () => {
  test("la page d'accueil affiche les produits", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Nouveautés")).toBeVisible()
    await expect(page.getByText("Cabas Test")).toBeVisible()
    await expect(page.getByText("Trousse Test")).toBeVisible()
  })

  test("le prix change selon la taille sélectionnée", async ({ page }) => {
    await page.goto("/products/cabas-test")
    await expect(page.getByRole("heading", { name: "Cabas Test" })).toBeVisible()

    // Prix de base : 35 €
    await expect(page.getByText(/35,00/).first()).toBeVisible()

    // Taille S : reste au prix de base
    await page.getByRole("button", { name: "S", exact: true }).click()
    await expect(page.getByText(/35,00/).first()).toBeVisible()

    // Taille M : prix spécifique 45 €
    await page.getByRole("button", { name: "M", exact: true }).click()
    await expect(page.getByText(/45,00/).first()).toBeVisible()
  })

  test("achat complet en retrait à l'atelier (gratuit)", async ({ page }) => {
    // Fiche produit : taille M (45 €) → panier
    await page.goto("/products/cabas-test")
    await page.getByRole("button", { name: "M", exact: true }).click()
    await page.getByRole("button", { name: "Ajouter au panier" }).click()

    // Drawer panier ouvert → checkout
    await expect(page.getByRole("heading", { name: /Panier/ })).toBeVisible()
    await page.getByRole("link", { name: "Passer la commande" }).click()
    await expect(page.getByRole("heading", { name: "Finaliser ma commande" })).toBeVisible()

    // Mode retrait atelier : pas de frais de port, pas de champs d'adresse
    await page.getByRole("button", { name: /Retrait à l'atelier/ }).click()
    await expect(page.getByText("Retrait à l'atelier de Misa")).toBeVisible()
    await expect(page.locator('input[name="address1"]')).toHaveCount(0)
    await expect(page.getByText("Gratuit").first()).toBeVisible()

    // Total = 45 € tout rond (pas de 4,99 €)
    await expect(page.getByRole("button", { name: /Payer/ })).toContainText("45,00")

    // Coordonnées
    await page.locator('input[name="email"]').fill("client-test@exemple.fr")
    await page.locator('input[name="firstName"]').fill("Claire")
    await page.locator('input[name="lastName"]').fill("Martin")

    // Paiement (mode mock : la commande est créée et marquée payée sans Stripe)
    await page.getByRole("button", { name: /Payer/ }).click()
    await page.waitForURL(/checkout\/success/)
  })

  test("la livraison ajoute 4,99 € au total", async ({ page }) => {
    await page.goto("/products/trousse-test")
    await page.getByRole("button", { name: "Ajouter au panier" }).click()
    await page.getByRole("link", { name: "Passer la commande" }).click()

    // Mode livraison par défaut : 18 + 4,99 = 22,99 €
    await expect(page.getByRole("button", { name: /Payer/ })).toContainText("22,99")

    // Les champs d'adresse sont bien visibles en mode livraison
    await expect(page.locator('input[name="address1"]')).toBeVisible()

    // Adresse incomplète → blocage avec message d'erreur
    await page.locator('input[name="email"]').fill("client-test@exemple.fr")
    await page.locator('input[name="firstName"]').fill("Claire")
    await page.locator('input[name="lastName"]').fill("Martin")
    await page.getByRole("button", { name: /Payer/ }).click()
    await expect(page.getByText(/champs d'adresse/)).toBeVisible()

    // Adresse complète → succès
    await page.locator('input[name="address1"]').fill("12 rue des Tests")
    await page.locator('input[name="postalCode"]').fill("75001")
    await page.locator('input[name="city"]').fill("Paris")
    await page.getByRole("button", { name: /Payer/ }).click()
    await page.waitForURL(/checkout\/success/)
  })
})

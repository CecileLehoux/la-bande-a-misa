/**
 * Migration : rend order_items.productId optionnel avec ON DELETE SET NULL.
 * Permet de supprimer un produit déjà commandé tout en conservant l'historique
 * de commande (nom, image, taille, prix sont déjà copiés dans order_items).
 *
 * Cible : la base définie par TURSO_DATABASE_URL (prod) OU le 1er argument CLI.
 * Usage : npx tsx scripts/migrate-orderitem-setnull.ts [file:./test.db]
 */
import { createClient } from "@libsql/client"
import "dotenv/config"

const target = process.argv[2]
const url = target ?? process.env.TURSO_DATABASE_URL
const authToken = target ? undefined : process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error("Aucune URL de base de données.")
  process.exit(1)
}

const db = createClient({ url, authToken })

async function main() {
  // Déjà migré ?
  const ddl = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='order_items'")
  const currentSql = (ddl.rows[0]?.sql as string) ?? ""
  if (currentSql.includes("ON DELETE SET NULL")) {
    console.log("✓ Déjà migré (ON DELETE SET NULL présent). Rien à faire.")
    return
  }

  const before = await db.execute("SELECT COUNT(*) as n FROM order_items")
  const beforeCount = Number(before.rows[0].n)
  console.log(`Lignes avant migration : ${beforeCount}`)

  await db.execute("PRAGMA foreign_keys=OFF")

  await db.execute(`
    CREATE TABLE "order_items_new" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "productId" TEXT,
      "name" TEXT NOT NULL,
      "image" TEXT,
      "price" REAL NOT NULL,
      "quantity" INTEGER NOT NULL,
      "total" REAL NOT NULL,
      "size" TEXT,
      CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `)

  await db.execute(`
    INSERT INTO "order_items_new" (id, orderId, productId, name, image, price, quantity, total, size)
    SELECT id, orderId, productId, name, image, price, quantity, total, size FROM "order_items"
  `)

  await db.execute(`DROP TABLE "order_items"`)
  await db.execute(`ALTER TABLE "order_items_new" RENAME TO "order_items"`)

  await db.execute("PRAGMA foreign_keys=ON")

  const after = await db.execute("SELECT COUNT(*) as n FROM order_items")
  const afterCount = Number(after.rows[0].n)
  console.log(`Lignes après migration : ${afterCount}`)

  if (afterCount !== beforeCount) {
    throw new Error(`⚠️ Perte de données ! ${beforeCount} → ${afterCount}`)
  }

  console.log("✓ Migration réussie : order_items.productId est maintenant ON DELETE SET NULL.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"
import "dotenv/config"

const url = process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`
const authToken = process.env.TURSO_AUTH_TOKEN

async function main() {
  // Use raw libSQL client for SQL migrations
  const client = createClient({ url, authToken })

  console.log("🔧 Création de la table product_categories...")
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "product_categories" (
      "productId"  TEXT NOT NULL,
      "categoryId" TEXT NOT NULL,
      PRIMARY KEY ("productId", "categoryId"),
      FOREIGN KEY ("productId")  REFERENCES "products"("id")   ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  console.log("  ✓ Table créée")

  console.log("📦 Migration des relations existantes...")
  await client.execute(`
    INSERT OR IGNORE INTO "product_categories" ("productId", "categoryId")
    SELECT "id", "categoryId" FROM "products" WHERE "categoryId" IS NOT NULL
  `)

  const { rows } = await client.execute(
    `SELECT COUNT(*) as n FROM "product_categories"`
  )
  console.log(`  ✓ ${rows[0].n} relation(s) migrée(s)`)

  console.log("🗑️  Suppression de la colonne categoryId (legacy)...")
  try {
    await client.execute(`ALTER TABLE "products" DROP COLUMN "categoryId"`)
    console.log("  ✓ Colonne supprimée")
  } catch {
    console.log("  ⚠️  Colonne déjà absente ou non supprimable — ignoré")
  }

  console.log("🎉 Migration terminée !")
  client.close()
}

main().catch((e) => { console.error(e); process.exit(1) })

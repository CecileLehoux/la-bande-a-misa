import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  console.log("Adding sort_order column to products...")
  try {
    await client.execute(`ALTER TABLE "products" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0`)
    console.log("✓ sortOrder column added")
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("duplicate column")) {
      console.log("⚠ sortOrder already exists, skipping")
    } else {
      throw e
    }
  }

  // Initialize sortOrder based on createdAt DESC (newest = 0)
  console.log("Initializing sortOrder values...")
  const res = await client.execute(
    `SELECT id FROM products ORDER BY "createdAt" DESC`
  )
  for (let i = 0; i < res.rows.length; i++) {
    await client.execute({
      sql: `UPDATE products SET "sortOrder" = ? WHERE id = ?`,
      args: [i, res.rows[i].id as string],
    })
  }
  console.log(`✓ Initialized sortOrder for ${res.rows.length} products`)
  console.log("Done!")
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })

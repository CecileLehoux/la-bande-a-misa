import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  console.log("Adding sizes column to products table...")
  try {
    await client.execute(`ALTER TABLE "products" ADD COLUMN "sizes" TEXT`)
    console.log("✓ sizes column added to products")
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("duplicate column")) {
      console.log("⚠ sizes column already exists, skipping")
    } else {
      throw e
    }
  }

  console.log("Adding size column to order_items table...")
  try {
    await client.execute(`ALTER TABLE "order_items" ADD COLUMN "size" TEXT`)
    console.log("✓ size column added to order_items")
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("duplicate column")) {
      console.log("⚠ size column already exists, skipping")
    } else {
      throw e
    }
  }

  console.log("Migration complete!")
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

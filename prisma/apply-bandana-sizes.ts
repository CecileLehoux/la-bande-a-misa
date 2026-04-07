import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const SIZES = JSON.stringify(["XS 18cm", "S 23cm", "M 31cm", "L 41cm"])

async function main() {
  // Trouver tous les bandanas chien
  const res = await client.execute(
    `SELECT id, name, sizes FROM products WHERE lower(name) LIKE '%bandana%'`
  )
  console.log("Bandanas trouvés :", res.rows.map((r) => `${r.name} (sizes: ${r.sizes})`))

  for (const row of res.rows) {
    await client.execute({
      sql: `UPDATE products SET sizes = ? WHERE id = ?`,
      args: [SIZES, row.id as string],
    })
    console.log(`✓ Tailles appliquées sur : ${row.name}`)
  }

  console.log("Done!")
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })

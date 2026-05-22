/**
 * Raw SQL helpers for fields not yet in the cached Prisma client on Vercel
 * (partnerName, partnerUrl added via ALTER TABLE after initial deploy)
 */
import { createClient } from "@libsql/client"

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}

export async function getPartnerFields(productId: string): Promise<{ partnerName: string | null; partnerUrl: string | null }> {
  try {
    const db = getDb()
    const result = await db.execute({
      sql: `SELECT partnerName, partnerUrl FROM products WHERE id = ?`,
      args: [productId],
    })
    const row = result.rows[0]
    if (!row) return { partnerName: null, partnerUrl: null }
    return {
      partnerName: (row.partnerName as string | null) ?? null,
      partnerUrl: (row.partnerUrl as string | null) ?? null,
    }
  } catch {
    return { partnerName: null, partnerUrl: null }
  }
}

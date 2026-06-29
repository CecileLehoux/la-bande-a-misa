/**
 * Raw SQL helpers — used for fields/tables added after the initial deploy
 * to work around the stale Prisma client cache on Vercel.
 */
import { createClient } from "@libsql/client"

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}

// ─── Partner fields (products) ───────────────────────────────────────────────

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

// ─── Shop reviews ─────────────────────────────────────────────────────────────

export type ShopReview = {
  id: string
  token: string
  orderId: string
  orderNumber: string
  email: string
  name: string | null
  rating: number | null
  comment: string | null
  isApproved: number
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

function rowToReview(row: Record<string, unknown>): ShopReview {
  return {
    id: row.id as string,
    token: row.token as string,
    orderId: row.orderId as string,
    orderNumber: row.orderNumber as string,
    email: row.email as string,
    name: (row.name as string | null) ?? null,
    rating: (row.rating as number | null) ?? null,
    comment: (row.comment as string | null) ?? null,
    isApproved: row.isApproved as number,
    submittedAt: (row.submittedAt as string | null) ?? null,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  }
}

export async function createShopReview(data: {
  id: string
  token: string
  orderId: string
  orderNumber: string
  email: string
}) {
  const db = getDb()
  await db.execute({
    sql: `INSERT OR IGNORE INTO shop_reviews (id, token, orderId, orderNumber, email, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [data.id, data.token, data.orderId, data.orderNumber, data.email],
  })
}

export async function getShopReviewByToken(token: string): Promise<ShopReview | null> {
  try {
    const db = getDb()
    const result = await db.execute({
      sql: `SELECT * FROM shop_reviews WHERE token = ?`,
      args: [token],
    })
    if (!result.rows[0]) return null
    return rowToReview(result.rows[0] as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function submitShopReview(token: string, data: { name: string; rating: number; comment: string }) {
  const db = getDb()
  await db.execute({
    sql: `UPDATE shop_reviews SET name = ?, rating = ?, comment = ?, submittedAt = datetime('now'), updatedAt = datetime('now') WHERE token = ? AND submittedAt IS NULL`,
    args: [data.name, data.rating, data.comment, token],
  })
}

/**
 * Avis "spontané" déposé via le lien public /avis (sans commande associée).
 * On génère des valeurs synthétiques pour les colonnes NOT NULL/UNIQUE afin
 * de réutiliser la même table et le même flux de modération.
 */
export async function createPublicShopReview(data: {
  id: string
  token: string
  name: string
  rating: number
  comment: string
  email?: string
}) {
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO shop_reviews (id, token, orderId, orderNumber, email, name, rating, comment, isApproved, submittedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, 'Avis spontané', ?, ?, ?, ?, 0, datetime('now'), datetime('now'), datetime('now'))`,
    args: [data.id, data.token, `public-${data.id}`, data.email ?? "", data.name, data.rating, data.comment],
  })
}

export async function getApprovedShopReviews(limit = 3): Promise<ShopReview[]> {
  try {
    const db = getDb()
    const result = await db.execute({
      sql: `SELECT * FROM shop_reviews WHERE isApproved = 1 AND submittedAt IS NOT NULL ORDER BY submittedAt DESC LIMIT ?`,
      args: [limit],
    })
    return result.rows.map((r) => rowToReview(r as Record<string, unknown>))
  } catch {
    return []
  }
}

export async function getAllSubmittedShopReviews(): Promise<ShopReview[]> {
  try {
    const db = getDb()
    const result = await db.execute({
      sql: `SELECT * FROM shop_reviews WHERE submittedAt IS NOT NULL ORDER BY submittedAt DESC`,
      args: [],
    })
    return result.rows.map((r) => rowToReview(r as Record<string, unknown>))
  } catch {
    return []
  }
}

export async function setShopReviewApproval(id: string, approved: boolean) {
  const db = getDb()
  await db.execute({
    sql: `UPDATE shop_reviews SET isApproved = ?, updatedAt = datetime('now') WHERE id = ?`,
    args: [approved ? 1 : 0, id],
  })
}

export async function deleteShopReview(id: string) {
  const db = getDb()
  await db.execute({
    sql: `DELETE FROM shop_reviews WHERE id = ?`,
    args: [id],
  })
}

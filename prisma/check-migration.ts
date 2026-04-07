import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"
const adapter = new PrismaLibSql({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
const prisma = new PrismaClient({ adapter } as any)
async function main() {
  const cols = await prisma.$queryRaw`PRAGMA table_info(products)` as any[]
  console.log("Colonnes products:", cols.map(x => x.name).join(', '))
  const n = await prisma.$queryRaw`SELECT COUNT(*) as n FROM product_categories` as any[]
  console.log("Lignes product_categories:", n[0].n)
}
main().catch(console.error).finally(() => prisma.$disconnect())

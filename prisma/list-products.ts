import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const adapter = new PrismaLibSql({ url: process.env.TURSO_DATABASE_URL ?? "", authToken: process.env.TURSO_AUTH_TOKEN })
const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  const products = await prisma.product.findMany({ select: { id: true, name: true, categoryId: true }, orderBy: { name: "asc" } })
  console.log("\nCATÉGORIES:")
  categories.forEach(c => console.log(`  [${c.id}] ${c.name} (${c.slug})`))
  console.log("\nPRODUITS:")
  products.forEach(p => console.log(`  [${p.id}] ${p.name} → categoryId: ${p.categoryId ?? "null"}`))
}

main().catch(console.error).finally(() => prisma.$disconnect())

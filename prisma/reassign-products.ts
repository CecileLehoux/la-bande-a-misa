import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const adapter = new PrismaLibSql({ url: process.env.TURSO_DATABASE_URL ?? "", authToken: process.env.TURSO_AUTH_TOKEN })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cats = await prisma.category.findMany()
  const bySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  const products = await prisma.product.findMany({ select: { id: true }, orderBy: { name: "asc" } })
  const slugs = ["cabas", "trousses", "bandanas-canins", "creations-crochet"]

  for (let i = 0; i < products.length; i++) {
    const slug = slugs[i % slugs.length]
    await prisma.product.update({ where: { id: products[i].id }, data: { categoryId: bySlug[slug] } })
  }

  console.log(`✓ ${products.length} produits réassignés (répartis sur les 4 catégories)`)
}

main().catch(console.error).finally(() => prisma.$disconnect())

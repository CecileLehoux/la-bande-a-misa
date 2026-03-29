import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const url = process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`
const authToken = process.env.TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🗑️  Suppression des anciennes catégories...")

  // Détacher les produits existants de leurs catégories
  await prisma.product.updateMany({ data: { categoryId: null } })

  // Supprimer toutes les catégories existantes
  await prisma.category.deleteMany({})

  console.log("✅ Anciennes catégories supprimées")
  console.log("🌱 Création des nouvelles catégories...")

  const categories = [
    { name: "Les cabas",              slug: "cabas",              sortOrder: 1 },
    { name: "Les trousses",           slug: "trousses",           sortOrder: 2 },
    { name: "Les bandanas canins",    slug: "bandanas-canins",    sortOrder: 3 },
    { name: "Les créations au crochet", slug: "creations-crochet", sortOrder: 4 },
  ]

  for (const cat of categories) {
    await prisma.category.create({ data: cat })
    console.log(`  ✓ ${cat.name}`)
  }

  console.log("🎉 Catégories mises à jour avec succès !")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

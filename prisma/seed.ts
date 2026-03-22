import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const dbPath = path.resolve(process.cwd(), "dev.db")
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding La Bande à Misa database...")

  // Admin user
  const adminPassword = await bcrypt.hash("admin123456", 12)
  await prisma.user.upsert({
    where: { email: "admin@mina.fr" },
    update: {},
    create: {
      email: "admin@mina.fr",
      name: "Mina",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  // Demo customer
  const customerPassword = await bcrypt.hash("client123456", 12)
  await prisma.user.upsert({
    where: { email: "client@mina.fr" },
    update: {},
    create: {
      email: "client@mina.fr",
      name: "Sophie Martin",
      password: customerPassword,
      role: "CUSTOMER",
    },
  })

  // Catégories La Bande à Misa
  const affiches = await prisma.category.upsert({ where: { slug: "affiches" }, update: {}, create: { name: "Affiches", slug: "affiches", sortOrder: 1 } })
  const badges = await prisma.category.upsert({ where: { slug: "badges" }, update: {}, create: { name: "Badges", slug: "badges", sortOrder: 2 } })
  const bandeaux = await prisma.category.upsert({ where: { slug: "bandeaux-cheveux" }, update: {}, create: { name: "Bandeaux pour cheveux", slug: "bandeaux-cheveux", sortOrder: 3 } })
  const cartesCadeaux = await prisma.category.upsert({ where: { slug: "cartes-cadeaux" }, update: {}, create: { name: "Cartes cadeaux", slug: "cartes-cadeaux", sortOrder: 4 } })
  const cartesPostales = await prisma.category.upsert({ where: { slug: "cartes-postales" }, update: {}, create: { name: "Cartes postales", slug: "cartes-postales", sortOrder: 5 } })
  const casquettes = await prisma.category.upsert({ where: { slug: "casquettes" }, update: {}, create: { name: "Casquettes", slug: "casquettes", sortOrder: 6 } })
  const chaussettes = await prisma.category.upsert({ where: { slug: "chaussettes" }, update: {}, create: { name: "Chaussettes", slug: "chaussettes", sortOrder: 7 } })
  const livres = await prisma.category.upsert({ where: { slug: "livres" }, update: {}, create: { name: "Livres", slug: "livres", sortOrder: 8 } })
  const porteCles = await prisma.category.upsert({ where: { slug: "porte-cles" }, update: {}, create: { name: "Porte-clés", slug: "porte-cles", sortOrder: 9 } })
  const puzzle = await prisma.category.upsert({ where: { slug: "puzzle" }, update: {}, create: { name: "Puzzle", slug: "puzzle", sortOrder: 10 } })

  // Products
  const productsData = [
    { name: "Affiche chien aquarelle", slug: "affiche-chien-aquarelle", description: "Affiche illustrée chien, impression risographie, format A4.", price: 12.0, comparePrice: null, sku: "AFF-001", stock: 20, isFeatured: true, categoryId: affiches.id, images: ["/produit1.png"] },
    { name: "Affiche chat bohème", slug: "affiche-chat-boheme", description: "Affiche chat illustrée, impression risographie, format A4.", price: 12.0, comparePrice: null, sku: "AFF-002", stock: 15, isFeatured: false, categoryId: affiches.id, images: ["/produit2.png"] },
    { name: "Badge chien brodé", slug: "badge-chien-brode", description: "Badge brodé à la main motif chien. Épingle dorée. Diamètre 6 cm.", price: 8.0, comparePrice: null, sku: "BAD-001", stock: 30, isFeatured: true, categoryId: badges.id, images: ["/produit3.png"] },
    { name: "Badge lot de 3", slug: "badge-lot-3", description: "Lot de 3 badges brodés assortis. Motifs animaux. Épingles dorées.", price: 18.0, comparePrice: 24.0, sku: "BAD-002", stock: 12, isFeatured: false, categoryId: badges.id, images: ["/produit4.png"] },
    { name: "Bandeau velours chien", slug: "bandeau-velours-chien", description: "Bandeau pour cheveux en velours doux, motif chien brodé. Taille unique.", price: 14.0, comparePrice: null, sku: "BAN-001", stock: 18, isFeatured: true, categoryId: bandeaux.id, images: ["/produit1.png"] },
    { name: "Carte cadeau 20€", slug: "carte-cadeau-20", description: "Carte cadeau numérique valable sur toute la boutique. Envoi par email.", price: 20.0, comparePrice: null, sku: "CC-001", stock: 999, isFeatured: false, categoryId: cartesCadeaux.id, images: ["/produit2.png"] },
    { name: "Carte postale chien", slug: "carte-postale-chien", description: "Carte postale illustrée motif chien, impression risographie. 10×15 cm.", price: 4.9, comparePrice: null, sku: "CP-001", stock: 50, isFeatured: true, categoryId: cartesPostales.id, images: ["/produit3.png"] },
    { name: "Casquette brodée", slug: "casquette-brodee", description: "Casquette 5 panneaux avec broderie chien. Ajustable. Coton non traité.", price: 32.0, comparePrice: 38.0, sku: "CAS-001", stock: 8, lowStockAt: 3, isFeatured: true, categoryId: casquettes.id, images: ["/produit4.png"] },
    { name: "Chaussettes chien roses", slug: "chaussettes-chien-roses", description: "Chaussettes douces motif chien fond rose. 80% coton. Taille 36-41.", price: 12.0, comparePrice: null, sku: "CHA-001", stock: 25, isFeatured: true, categoryId: chaussettes.id, images: ["/produit1.png"] },
    { name: "Livre illustré La Bande", slug: "livre-illustre-la-bande", description: "Livre illustré avec les personnages de La Bande à Misa. 32 pages, couverture rigide.", price: 18.0, comparePrice: null, sku: "LIV-001", stock: 10, lowStockAt: 3, isFeatured: false, categoryId: livres.id, images: ["/produit2.png"] },
    { name: "Porte-clés chien matelassé", slug: "porte-cles-chien-matelasse", description: "Porte-clés matelassé motif chien, anneau doré. 8 cm.", price: 10.0, comparePrice: null, sku: "PC-001", stock: 22, isFeatured: true, categoryId: porteCles.id, images: ["/produit3.png"] },
    { name: "Puzzle 500 pièces chien", slug: "puzzle-500-pieces-chien", description: "Puzzle 500 pièces illustré par La Bande à Misa. Format 50×35 cm.", price: 28.0, comparePrice: 35.0, sku: "PUZ-001", stock: 6, lowStockAt: 2, isFeatured: true, categoryId: puzzle.id, images: ["/produit4.png"] },
  ]

  for (const { images, comparePrice, ...productData } of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } })
    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          ...(comparePrice !== null ? { comparePrice } : {}),
          images: {
            create: images.map((url, i) => ({ url, sortOrder: i })),
          },
        },
      })
    }
  }

  console.log("✅ Seed La Bande à Misa terminé !")
  console.log(`👤 Admin  : admin@mina.fr / admin123456`)
  console.log(`👤 Client : client@mina.fr / client123456`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

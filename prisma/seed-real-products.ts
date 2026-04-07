import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const url = process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`
const authToken = process.env.TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🗑️  Suppression des anciennes données...")
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.productImage.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})
  console.log("✅ Données supprimées")

  console.log("🌱 Création des catégories...")
  const humains = await prisma.category.create({
    data: { name: "Accessoires humains", slug: "accessoires-humains", sortOrder: 1 },
  })
  const animaux = await prisma.category.create({
    data: { name: "Accessoires chiens et chats", slug: "accessoires-chiens-chats", sortOrder: 2 },
  })
  console.log("  ✓ Accessoires humains")
  console.log("  ✓ Accessoires chiens et chats")

  const products = [
    // ── Accessoires humains ──────────────────────────────────────────────
    {
      name: "Cabas Cam",
      slug: "cabas-cam",
      description: "Cabas en toile vichy noir et crème, doublé avec 1 poche pratique. Se porte à la main ou à l'épaule. Une trousse assortie disponible sur demande à 25€.",
      price: 45,
      sku: "CAB-001",
      stock: 5,
      isFeatured: true,
      categoryId: humains.id,
      images: ["/produit1.png"],
    },
    {
      name: "Trousse de toilette Rosine",
      slug: "trousse-rosine",
      description: "Douce, pratique et adorable. Protège maquillage et articles de toilette. 23 x 12 x 10 cm.",
      price: 25,
      sku: "TRO-001",
      stock: 5,
      isFeatured: true,
      categoryId: humains.id,
      images: [
        "/products/trousse-rosine/IMG_8342.JPG",
        "/products/trousse-rosine/IMG_8365.JPG",
        "/products/trousse-rosine/IMG_8379.JPG",
        "/products/trousse-rosine/IMG_8383.JPG",
        "/products/trousse-rosine/IMG_8384.JPG",
        "/products/trousse-rosine/IMG_8387.JPG",
      ],
    },
    {
      name: "Trousse de toilette Barnabé",
      slug: "trousse-barnabe",
      description: "Matelassée, pratique et délicieuse, protège maquillage et articles de toilette. 23 x 12 x 10 cm.",
      price: 25,
      sku: "TRO-002",
      stock: 5,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/trousse-barnabe/IMG_8312.JPG",
        "/products/trousse-barnabe/IMG_8320.JPG",
        "/products/trousse-barnabe/IMG_8359.JPG",
        "/products/trousse-barnabe/IMG_8373.JPG",
      ],
    },
    {
      name: "Trousse de toilette Georgette",
      slug: "trousse-georgette",
      description: "Matelassée, pratique et chic, protège maquillage et articles de toilette. 23 x 12 x 10 cm.",
      price: 25,
      sku: "TRO-003",
      stock: 5,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/trousse-georgette/IMG_8333.JPG",
        "/products/trousse-georgette/IMG_8400.JPG",
        "/products/trousse-georgette/IMG_8402.JPG",
        "/products/trousse-georgette/IMG_8403.JPG",
      ],
    },
    {
      name: "Trousse de toilette Edgar",
      slug: "trousse-edgar",
      description: "Pratique, chic et matelassée, protège articles de toilette et maquillage. 23 x 12 x 10 cm.",
      price: 25,
      sku: "TRO-004",
      stock: 5,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/trousse-edgar/IMG_8335.JPG",
        "/products/trousse-edgar/IMG_8338.JPG",
        "/products/trousse-edgar/IMG_8343.JPG",
        "/products/trousse-edgar/IMG_8346.JPG",
        "/products/trousse-edgar/IMG_8347.JPG",
      ],
    },
    {
      name: "Mini trousse Fleur",
      slug: "mini-trousse-fleur",
      description: "Pratique, chic et matelassée. 15 x 12 x 10 cm.",
      price: 20,
      sku: "TRO-005",
      stock: 5,
      isFeatured: false,
      categoryId: humains.id,
      images: ["/produit1.png"],
    },
    {
      name: "Pochon Rosine",
      slug: "pochon-rosine",
      description: "Coordonné avec les trousses, organise cosmétiques et accessoires. 12 x 12 cm.",
      price: 12,
      sku: "POC-001",
      stock: 8,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/pochon-rosine/IMG_8389.JPG",
        "/products/pochon-rosine/IMG_8390.JPG",
        "/products/pochon-rosine/IMG_8391.JPG",
        "/products/pochon-rosine/IMG_8413.JPG",
      ],
    },
    {
      name: "Pochon Barnabé",
      slug: "pochon-barnabe",
      description: "Coordonné avec les trousses, organise cosmétiques et accessoires. 12 x 12 cm.",
      price: 12,
      sku: "POC-002",
      stock: 8,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/pochon-barnabe/IMG_8362.JPG",
        "/products/pochon-barnabe/IMG_8369.JPG",
        "/products/pochon-barnabe/IMG_8419.JPG",
        "/products/pochon-barnabe/IMG_8421.JPG",
      ],
    },
    {
      name: "Pochon Georgette",
      slug: "pochon-georgette",
      description: "Coordonné avec les trousses, organise cosmétiques et accessoires. 12 x 12 cm.",
      price: 12,
      sku: "POC-003",
      stock: 8,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/pochon-georgette/IMG_8407.JPG",
        "/products/pochon-georgette/IMG_8409.JPG",
        "/products/pochon-georgette/IMG_8410.JPG",
        "/products/pochon-georgette/IMG_8412.JPG",
      ],
    },
    {
      name: "Chouchou Matchy Roméo",
      slug: "chouchou-romeo",
      description: "Taille enfant/adulte, coordonné avec les bandanas chien. Le duo parfait pour sortir assorti avec votre animal.",
      price: 5,
      sku: "CHO-001",
      stock: 10,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/chouchou-romeo/IMG_8425.JPG",
        "/products/chouchou-romeo/IMG_8427.JPG",
        "/products/chouchou-romeo/IMG_8430.JPG",
      ],
    },
    {
      name: "Chouchou Matchy Darling",
      slug: "chouchou-darling",
      description: "Taille enfant/adulte, coordonné avec les bandanas chien. Le duo parfait pour sortir assorti avec votre animal.",
      price: 5,
      sku: "CHO-002",
      stock: 10,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/chouchou-darling/IMG_8422.JPG",
        "/products/chouchou-darling/IMG_8423.JPG",
        "/products/chouchou-darling/IMG_8431.JPG",
        "/products/chouchou-darling/IMG_8442.JPG",
      ],
    },
    {
      name: "Chouchou Matchy Amore",
      slug: "chouchou-amore",
      description: "Taille enfant/adulte, coordonné avec les bandanas chien. Le duo parfait pour sortir assorti avec votre animal.",
      price: 5,
      sku: "CHO-003",
      stock: 10,
      isFeatured: false,
      categoryId: humains.id,
      images: [
        "/products/chouchou-amore/IMG_8424.JPG",
        "/products/chouchou-amore/IMG_8432.JPG",
      ],
    },
    // ── Accessoires chiens et chats ──────────────────────────────────────
    {
      name: "Bandana Roméo",
      slug: "bandana-romeo",
      description: "Bandana confortable qui s'attache facilement et reste en place sans noeuds encombrants. Tailles : XS 18cm | S 23cm | M 31cm | L 41cm. Astuce : mesurez le tour de cou de votre animal pour un ajustement parfait.",
      price: 15,
      sku: "BAN-001",
      stock: 10,
      isFeatured: true,
      categoryId: animaux.id,
      images: [
        "/products/bandana-romeo/IMG_8204.JPG",
        "/products/bandana-romeo/IMG_8250.JPG",
        "/products/bandana-romeo/IMG_8251.JPG",
        "/products/bandana-romeo/IMG_8273.JPG",
        "/products/bandana-romeo/IMG_8286.JPG",
        "/products/bandana-romeo/IMG_8287.JPG",
        "/products/bandana-romeo/IMG_8288.JPG",
        "/products/bandana-romeo/IMG_8290.JPG",
        "/products/bandana-romeo/IMG_8293.JPG",
      ],
    },
    {
      name: "Bandana Darling",
      slug: "bandana-darling",
      description: "Bandana rose à motif cœurs rose foncé. Confortable et facile à attacher. Tailles : XS 18cm | S 23cm | M 31cm | L 41cm. Chouchou assorti disponible pour le duo parfait.",
      price: 15,
      sku: "BAN-002",
      stock: 10,
      isFeatured: true,
      categoryId: animaux.id,
      images: [
        "/products/bandana-darling/IMG_8143.JPG",
        "/products/bandana-darling/IMG_8162.JPG",
        "/products/bandana-darling/IMG_8165.JPG",
        "/products/bandana-darling/IMG_8226.JPG",
        "/products/bandana-darling/IMG_8243.JPG",
        "/products/bandana-darling/IMG_8302.JPG",
        "/products/bandana-darling/IMG_8305.JPG",
        "/products/bandana-darling/IMG_8307.JPG",
        "/products/bandana-darling/IMG_8308.JPG",
      ],
    },
    {
      name: "Bandana Amore",
      slug: "bandana-amore",
      description: "Design tendre et moderne avec motif graphique rose foncé et rose clair. Confortable et facile à attacher. Tailles : XS 18cm | S 23cm | M 31cm | L 41cm. Chouchou assorti disponible.",
      price: 15,
      sku: "BAN-003",
      stock: 10,
      isFeatured: true,
      categoryId: animaux.id,
      images: [
        "/products/bandana-amore/IMG_8168.JPG",
        "/products/bandana-amore/IMG_8171.JPG",
        "/products/bandana-amore/IMG_8172.JPG",
        "/products/bandana-amore/IMG_8177.JPG",
        "/products/bandana-amore/IMG_8295.JPG",
        "/products/bandana-amore/IMG_8298.JPG",
        "/products/bandana-amore/IMG_8299.JPG",
        "/products/bandana-amore/IMG_8300.JPG",
      ],
    },
  ]

  console.log("🌱 Création des produits...")
  for (const { images, ...data } of products) {
    await prisma.product.create({
      data: {
        ...data,
        isActive: true,
        images: {
          create: images.map((url, i) => ({ url, alt: data.name, sortOrder: i })),
        },
      },
    })
    console.log(`  ✓ ${data.name}`)
  }

  console.log(`\n🎉 ${products.length} produits créés avec succès !`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

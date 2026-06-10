import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log("🔍 Récupération des commandes de test...")

  const orderItems = await prisma.orderItem.findMany({
    include: { product: true },
  })

  console.log(`📦 ${orderItems.length} articles commandés trouvés`)

  // Remettre le stock à jour
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
    console.log(`✅ Stock remis à jour : ${item.product.name} +${item.quantity}`)
  }

  // Supprimer les commandes (order_items supprimés en cascade)
  const deleted = await prisma.order.deleteMany()
  console.log(`🗑️  ${deleted.count} commande(s) supprimée(s)`)

  console.log("✨ Base de données remise à zéro !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

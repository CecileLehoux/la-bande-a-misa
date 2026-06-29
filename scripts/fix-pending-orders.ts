import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter } as any)

// Commandes à passer en PAID/CONFIRMED manuellement
// (récupérées depuis les événements Stripe)
const orders = [
  {
    orderId: "cmomoi24c000104l5w50qiht3",
    paymentIntentId: "pi_3TSCslBrcczuhKiA2YBornOT",
    orderNumber: "CMD-260501-8532",
  },
  {
    orderId: "cmomodnso000204ksvj883bum",
    paymentIntentId: "pi_3TSCpiBrcczuhKiA0a3Q6Dsn",
    orderNumber: "CMD-260501-5221",
  },
]

async function main() {
  for (const { orderId, paymentIntentId, orderNumber } of orders) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentIntentId,
        status: "CONFIRMED",
      },
      include: { items: true },
    })

    // Décrémenter le stock
    for (const item of order.items) {
      if (!item.productId) continue
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    console.log(`✅ Commande ${orderNumber} passée en CONFIRMED`)
  }

  console.log("✨ Done !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

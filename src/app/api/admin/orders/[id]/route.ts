import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  sendOrderShippedEmail,
  sendOrderCancelledEmail,
  sendOrderDeliveredEmail,
} from "@/lib/email"
import { createShopReview } from "@/lib/db-raw"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { status, trackingNumber } = body

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(trackingNumber && { trackingNumber }),
      ...(status === "SHIPPED" && { shippedAt: new Date() }),
      ...(status === "DELIVERED" && { deliveredAt: new Date() }),
      ...(status === "CANCELLED" && { cancelledAt: new Date() }),
    },
  })

  // Effets de bord email/avis — awaités pour ne pas être coupés par la fin
  // de la fonction serverless sur Vercel, mais isolés pour ne jamais bloquer
  // la mise à jour du statut.
  try {
    if (status === "SHIPPED") {
      await sendOrderShippedEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        trackingNumber: trackingNumber ?? order.trackingNumber,
      })
    } else if (status === "CANCELLED") {
      await sendOrderCancelledEmail({
        to: order.email,
        orderNumber: order.orderNumber,
      })
    } else if (status === "DELIVERED") {
      // Crée un token d'avis unique et enregistre la demande d'avis
      const token = crypto.randomUUID()
      const reviewId = crypto.randomUUID()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://labandeamisa.fr"
      const reviewUrl = `${appUrl}/avis/${token}`

      await createShopReview({
        id: reviewId,
        token,
        orderId: order.id,
        orderNumber: order.orderNumber,
        email: order.email,
      })

      await sendOrderDeliveredEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        reviewUrl,
      })
    }
  } catch (err) {
    console.error(`Erreur effet de bord (statut ${status}):`, err)
  }

  return NextResponse.json(order)
}

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

  if (status === "SHIPPED") {
    sendOrderShippedEmail({
      to: order.email,
      orderNumber: order.orderNumber,
      trackingNumber: trackingNumber ?? order.trackingNumber,
    }).catch((err) => console.error("Erreur email expédition:", err))
  } else if (status === "CANCELLED") {
    sendOrderCancelledEmail({
      to: order.email,
      orderNumber: order.orderNumber,
    }).catch((err) => console.error("Erreur email annulation:", err))
  } else if (status === "DELIVERED") {
    // Create a unique review token and save the review request
    const token = crypto.randomUUID()
    const reviewId = crypto.randomUUID()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://labandeamisa.fr"
    const reviewUrl = `${appUrl}/avis/${token}`

    createShopReview({
      id: reviewId,
      token,
      orderId: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
    }).catch((err) => console.error("Erreur création review:", err))

    sendOrderDeliveredEmail({
      to: order.email,
      orderNumber: order.orderNumber,
      reviewUrl,
    }).catch((err) => console.error("Erreur email livraison:", err))
  }

  return NextResponse.json(order)
}

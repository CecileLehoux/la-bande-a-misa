import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getStripe } from "@/lib/stripe"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id } })

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
  }

  if (!order.paymentIntentId) {
    return NextResponse.json({ error: "Aucun paiement Stripe associé à cette commande" }, { status: 400 })
  }

  if (order.paymentStatus === "REFUNDED") {
    return NextResponse.json({ error: "Commande déjà remboursée" }, { status: 400 })
  }

  // Trigger refund via Stripe
  await getStripe().refunds.create({ payment_intent: order.paymentIntentId })

  // Update order status immediately (le webhook charge.refunded le fera aussi, mais on anticipe)
  await prisma.order.update({
    where: { id },
    data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
  })

  return NextResponse.json({ success: true })
}

import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "@/lib/email"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: "Signature webhook invalide" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (!orderId) break

      const order = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            paymentIntentId: session.payment_intent as string,
            status: "CONFIRMED",
          },
          include: { items: true, shippingAddress: true },
        })

        // Decrease stock
        for (const item of updated.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }

        return updated
      })

      // Send confirmation email to customer + notification to shop owner (non-blocking)
      Promise.allSettled([
        sendOrderConfirmationEmail({
          to: order.email,
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          shippingAddress: order.shippingAddress,
        }),
        sendOrderNotificationEmail({
          orderNumber: order.orderNumber,
          customerEmail: order.email,
          items: order.items,
          total: order.total,
          shippingAddress: order.shippingAddress,
        }),
      ]).then((results) => {
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(`Erreur envoi email [${i === 0 ? "confirmation client" : "notification admin"}]:`, r.reason)
          }
        })
      })

      break
    }

    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (!orderId) break

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      })

      break
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await prisma.order.updateMany({
          where: { paymentIntentId: charge.payment_intent as string },
          data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

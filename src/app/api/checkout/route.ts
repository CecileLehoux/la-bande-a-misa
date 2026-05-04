import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateOrderNumber } from "@/lib/utils"
import type { CartItem } from "@/types"

export async function POST(req: Request) {
  const session = await auth()
  const origin = req.headers.get("origin") ?? req.headers.get("referer")?.split("/").slice(0, 3).join("/") ?? ""
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || origin
  const body = await req.json()
  const { items, shippingAddress, email, firstName, lastName, shippingMethod } = body as {
    items: CartItem[]
    shippingAddress: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      postalCode: string
      country: string
      phone?: string
    } | null
    email: string
    firstName: string
    lastName: string
    shippingMethod: "delivery" | "pickup"
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 })
  }

  // Verify stock and prices from DB
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { images: { take: 1 } },
  })

  const lineItems = []
  let subtotal = 0

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) {
      return NextResponse.json({ error: `Produit introuvable: ${item.name}` }, { status: 400 })
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuffisant pour: ${product.name}` }, { status: 400 })
    }

    subtotal += product.price * item.quantity
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: product.name,
          images: product.images[0]?.url?.startsWith("https://") ? [product.images[0].url] : [],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    })
  }

  const shippingCost = shippingMethod === "pickup" ? 0 : 4.99
  const total = subtotal + shippingCost
  const orderNumber = generateOrderNumber()

  // Verify session user actually exists in DB (guards against stale sessions after reseed)
  let validUserId: string | undefined
  if (session?.user?.id) {
    const userExists = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } })
    if (userExists) validUserId = session.user.id
  }

  // Create address if user is logged in and delivery mode
  let addressId: string | undefined
  if (validUserId && shippingAddress && shippingMethod === "delivery") {
    try {
      const address = await prisma.address.create({
        data: {
          userId: validUserId,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country ?? "FR",
          phone: shippingAddress.phone,
        },
      })
      addressId = address.id
    } catch {
      // ignore
    }
  }

  // Create pending order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      email,
      userId: validUserId,
      subtotal,
      shipping: shippingCost,
      total,
      shippingAddressId: addressId,
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!
          return {
            productId: item.productId,
            name: product.name,
            image: item.image,
            size: item.size ?? null,
            price: product.price,
            quantity: item.quantity,
            total: product.price * item.quantity,
          }
        }),
      },
    },
  })

  // Add shipping line item if applicable
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: "Livraison standard" },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    })
  }
  // Store shipping method in order notes
  await prisma.order.update({
    where: { id: order.id },
    data: { notes: shippingMethod === "pickup" ? "Retrait à l'atelier" : null },
  })

  // Mock mode: skip Stripe when keys are not configured
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ""
  if (!stripeKey || stripeKey.startsWith("sk_test_VOTRE") || stripeKey === "") {
    // Simulate payment: mark order as PAID directly
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    })
    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }
    return NextResponse.json({
      mockOrder: true,
      sessionUrl: `${appUrl}/checkout/success?orderId=${order.id}&orderNumber=${orderNumber}`,
    })
  }

  const stripeSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: email,
    metadata: {
      orderId: order.id,
      orderNumber,
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    billing_address_collection: "auto",
  })

  return NextResponse.json({ sessionId: stripeSession.id, sessionUrl: stripeSession.url })
}

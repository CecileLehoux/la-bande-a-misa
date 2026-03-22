import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ShoppingBag } from "lucide-react"

const statusLabel: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

const paymentLabel: Record<string, string> = {
  UNPAID: "Non payée",
  PAID: "Payée",
  PARTIALLY_REFUNDED: "Partiellement remboursée",
  REFUNDED: "Remboursée",
  FAILED: "Échouée",
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
    },
  })

  if (!order || order.userId !== session.user.id) notFound()

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-xs text-[var(--gray)] hover:text-[var(--terracotta)] transition-colors mb-10"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Mes commandes
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--dark)]">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-xs text-[var(--gray)]">
              Passée le{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-medium ${
              order.paymentStatus === "PAID"
                ? "bg-green-50 text-green-700"
                : "bg-[var(--beige)] text-[var(--gray)]"
            }`}>
              {paymentLabel[order.paymentStatus] ?? order.paymentStatus}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[var(--gray)]">
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
        </div>

        {/* Articles */}
        <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-6 mb-5">
          <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)] mb-5">Articles</h2>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--beige)]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-[var(--beige-dark)]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--dark)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--gray)]">Qté : {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-[var(--dark)]">{formatPrice(item.total)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-[var(--beige)] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray)]">Sous-total</span>
              <span className="text-[var(--dark)]">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray)]">Livraison</span>
              <span className="text-[var(--dark)]">{order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[var(--dark)] pt-2 border-t border-[var(--beige)]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Adresse de livraison */}
        {order.shippingAddress && (
          <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-6">
            <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)] mb-4">Adresse de livraison</h2>
            <address className="not-italic text-sm text-[var(--gray)] space-y-0.5">
              <p className="text-[var(--dark)] font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </div>
        )}
      </div>
    </div>
  )
}

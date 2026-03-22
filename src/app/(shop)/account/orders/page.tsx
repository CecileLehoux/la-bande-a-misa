import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Package } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Mes commandes" }

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

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)] mb-10">
          Mes commandes
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto h-12 w-12 text-[var(--beige-dark)] mb-4" />
            <p className="text-sm text-[var(--gray)] mb-6">Vous n&apos;avez pas encore passé de commande.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[var(--dark)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--beige-dark)] bg-white px-6 py-5 hover:border-[var(--terracotta)] transition-colors group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--dark)]">{order.orderNumber}</span>
                      <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full font-medium ${
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
                    <p className="text-xs text-[var(--gray)]">
                      {order.items.length} article{order.items.length > 1 ? "s" : ""} —{" "}
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--dark)]">{formatPrice(order.total)}</span>
                    <ChevronRight className="h-4 w-4 text-[var(--gray-light)] group-hover:text-[var(--terracotta)] transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

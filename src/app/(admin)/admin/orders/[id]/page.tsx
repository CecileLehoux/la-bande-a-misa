import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types"
import type { OrderStatus } from "@/types"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Détail commande - Admin" }

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { include: { images: { take: 1 } } } },
      },
      user: true,
      shippingAddress: true,
    },
  })

  if (!order) notFound()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commande {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
          {ORDER_STATUS_LABELS[order.status as OrderStatus]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-4">Articles commandés</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.total)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraison</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Adresse */}
          {order.shippingAddress && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold mb-3">Adresse de livraison</h2>
              <address className="not-italic text-sm text-gray-600 space-y-1">
                <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
              </address>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-3">Client</h2>
            <p className="text-sm font-medium">{order.user?.name ?? "Invité"}</p>
            <p className="text-sm text-gray-500">{order.email}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-3">Paiement</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
              {order.paymentStatus === "PAID" ? "Payé" : "En attente"}
            </span>
            {order.paymentIntentId && (
              <p className="text-xs text-gray-400 mt-2 break-all">
                Stripe: {order.paymentIntentId}
              </p>
            )}
          </div>

          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
            paymentStatus={order.paymentStatus}
            paymentIntentId={order.paymentIntentId}
          />
        </div>
      </div>
    </div>
  )
}

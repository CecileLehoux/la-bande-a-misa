import { prisma } from "@/lib/prisma"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types"
import type { OrderStatus } from "@/types"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Commandes - Admin" }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = 20
  const skip = (page - 1) * limit

  const where = params.status ? { status: params.status as OrderStatus } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const statuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-sm text-gray-500">{total} commande(s)</p>
      </div>

      {/* Filtres statut */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!params.status ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Toutes
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${params.status === s ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">N° Commande</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Articles</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Paiement</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium">{order.user?.name ?? "Client invité"}</p>
                    <p className="text-xs text-gray-400">{order.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.items.reduce((a, i) => a + i.quantity, 0)} article(s)
                </td>
                <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.total)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {order.paymentStatus === "PAID" ? "Payé" : order.paymentStatus === "FAILED" ? "Échoué" : "En attente"}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">{formatDateTime(order.createdAt)}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-sm text-blue-600 hover:underline">
                    Détail →
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                  Aucune commande
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium ${p === page ? "bg-black text-white border-black" : "border-gray-300 hover:bg-gray-50"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

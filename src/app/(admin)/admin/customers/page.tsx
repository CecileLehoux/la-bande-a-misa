import { prisma } from "@/lib/prisma"
import { formatDateTime } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Clients - Admin" }

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      _count: { select: { orders: true } },
      orders: {
        select: { total: true, paymentStatus: true },
        where: { paymentStatus: "PAID" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500">{customers.length} client(s) inscrit(s)</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commandes</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total dépensé</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce((a, o) => a + o.total, 0)
              return (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {customer.name?.[0] ?? customer.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{customer.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer._count.orders}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{formatDateTime(customer.createdAt)}</td>
                </tr>
              )
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  Aucun client pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { ShoppingBag, Users, Package, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types"
import type { OrderStatus } from "@/types"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    totalCustomers,
    customersThisMonth,
    totalProducts,
    activeProducts,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: { select: { name: true, email: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: prisma.product.fields.lowStockAt } },
      include: { images: { take: 1 } },
      take: 5,
      orderBy: { stock: "asc" },
    }),
  ])

  const revenueTotal = totalRevenue._sum.total ?? 0
  const revenueMonth = revenueThisMonth._sum.total ?? 0
  const revenueLast = revenueLastMonth._sum.total ?? 0
  const revenueGrowth = revenueLast > 0 ? ((revenueMonth - revenueLast) / revenueLast) * 100 : 0
  const ordersGrowth = ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0

  const stats = [
    {
      label: "Revenus ce mois",
      value: formatPrice(revenueMonth),
      subValue: `Total : ${formatPrice(revenueTotal)}`,
      growth: revenueGrowth,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Commandes ce mois",
      value: ordersThisMonth.toString(),
      subValue: `Total : ${totalOrders}`,
      growth: ordersGrowth,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Clients",
      value: totalCustomers.toString(),
      subValue: `+${customersThisMonth} ce mois`,
      growth: null,
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Produits actifs",
      value: activeProducts.toString(),
      subValue: `${totalProducts} au total`,
      growth: null,
      icon: Package,
      color: "text-orange-600 bg-orange-100",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue dans votre administration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            <div className="mt-1 flex items-center gap-2">
              {stat.growth !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stat.growth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(stat.growth).toFixed(1)}%
                </span>
              )}
              <span className="text-xs text-gray-400">{stat.subValue}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Dernières commandes</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {order.user?.name ?? order.email}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                        {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{formatPrice(order.total)}</td>
                    <td className="px-6 py-3 text-xs text-gray-400">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                      Aucune commande pour le moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stock faible</h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
              Gérer
            </Link>
          </div>
          <div className="p-6 space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Tous les stocks sont suffisants</p>
            ) : (
              lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className={`text-xs ${product.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                      {product.stock === 0 ? "Rupture de stock" : `${product.stock} restant(s)`}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

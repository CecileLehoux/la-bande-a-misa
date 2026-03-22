import { prisma } from "@/lib/prisma"
import { formatPrice, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Plus, Edit, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = { title: "Produits - Admin" }

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: true,
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500">{products.length} produit(s) au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ventes</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Créé le</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {product.category?.name ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                  {product.comparePrice && (
                    <p className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-600" : product.stock <= product.lowStockAt ? "text-yellow-600" : "text-gray-900"}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={product.isActive ? "success" : "default"}>
                    {product.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="info" className="ml-1">Coup de cœur</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {product._count.orderItems} vente(s)
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {formatDateTime(product.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                  <Package className="mx-auto h-12 w-12 mb-3" />
                  <p>Aucun produit pour le moment</p>
                  <Button className="mt-4" asChild size="sm">
                    <Link href="/admin/products/new">Créer le premier produit</Link>
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

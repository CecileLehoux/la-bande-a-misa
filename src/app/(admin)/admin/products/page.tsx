import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsSortableList } from "@/components/admin/products-sortable-list"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Produits - Admin" }

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500">{products.length} produit(s) — glisse pour réordonner</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      <ProductsSortableList initialProducts={products} />
    </div>
  )
}

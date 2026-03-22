import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/admin/product-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Nouveau produit - Admin" }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  )
}

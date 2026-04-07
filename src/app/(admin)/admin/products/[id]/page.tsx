import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Modifier produit - Admin" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        categories: true,
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  if (!product) notFound()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier : {product.name}</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  )
}

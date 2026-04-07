"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Package, GripVertical, Save, Loader2 } from "lucide-react"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Category, Product, ProductImage, ProductCategory } from "@prisma/client"

type ProductRow = Product & {
  images: ProductImage[]
  categories: (ProductCategory & { category: Category })[]
  _count: { orderItems: number }
}

interface Props {
  initialProducts: ProductRow[]
}

export function ProductsSortableList({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    dragIndex.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    const from = dragIndex.current
    if (from === null || from === index) return
    const updated = [...products]
    const [moved] = updated.splice(from, 1)
    updated.splice(index, 0, moved)
    setProducts(updated)
    setIsDirty(true)
    dragIndex.current = null
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setDragOverIndex(null)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/admin/products/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: products.map((p, i) => ({ id: p.id, sortOrder: i })),
      }),
    })
    setSaving(false)
    setSaved(true)
    setIsDirty(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      {/* Barre de sauvegarde */}
      {isDirty && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">Ordre modifié — n'oublie pas de sauvegarder</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Sauvegarde…" : "Sauvegarder l'ordre"}
          </button>
        </div>
      )}

      {saved && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">✓ Ordre sauvegardé — le site est mis à jour</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-3 py-3 w-8" />
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
            {products.map((product, index) => (
              <tr
                key={product.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing ${
                  dragOverIndex === index ? "bg-blue-50 border-t-2 border-blue-400" : ""
                }`}
              >
                <td className="px-3 py-4">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                </td>
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
                  {product.categories.length > 0
                    ? product.categories.map(pc => pc.category.name).join(", ")
                    : "—"}
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
                <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                  <Package className="mx-auto h-12 w-12 mb-3" />
                  <p>Aucun produit pour le moment</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-400 text-center">
        Glisse les lignes pour réordonner — l'ordre est reflété sur le site après sauvegarde
      </p>
    </div>
  )
}

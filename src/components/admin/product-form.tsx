"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { slugify } from "@/lib/utils"
import type { Category, Product, ProductImage, ProductCategory } from "@prisma/client"
import { Trash2, Upload, Loader2, GripVertical } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  slug: z.string().min(2, "Slug requis"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Prix requis"),
  comparePrice: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

type ProductFormData = z.output<typeof productSchema>

interface ProductFormProps {
  product?: Product & { images: ProductImage[]; categories: ProductCategory[] }
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<{ url: string; alt: string }[]>(
    product?.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({ url: i.url, alt: i.alt ?? "" })) ?? []
  )
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories.map((pc) => pc.categoryId) ?? []
  )
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes ? JSON.parse(product.sizes) : []
  )
  const [newSize, setNewSize] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      comparePrice: product?.comparePrice ?? undefined,
      cost: product?.cost ?? undefined,
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      stock: product?.stock ?? 0,
      lowStockAt: product?.lowStockAt ?? 5,
      weight: product?.weight ?? undefined,
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
  })

  const name = watch("name")

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true)
    setError("")

    const payload = { ...data, images, categoryIds: selectedCategoryIds, sizes: JSON.stringify(sizes) }

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products"
    const method = product ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (!res.ok) {
      const err = await res.json()
      setError(err.error ?? "Erreur lors de la sauvegarde")
      return
    }

    router.push("/admin/products")
    router.refresh()
  }

  const handleDelete = async () => {
    if (!product) return
    if (!confirm("Supprimer ce produit définitivement ?")) return

    setDeleting(true)
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" })
    setDeleting(false)

    if (res.ok) {
      router.push("/admin/products")
      router.refresh()
    }
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, { url: imageUrl.trim(), alt: "" }])
      setImageUrl("")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      // PROD : upload direct navigateur → Vercel Blob (contourne la limite 4.5MB)
      const { upload } = await import("@vercel/blob/client")
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `${window.location.origin}/api/upload`,
      })
      setImages((prev) => [...prev, { url: blob.url, alt: "" }])
    } catch {
      // DEV LOCAL : fallback FormData → public/uploads/
      try {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        const data = await res.json()
        if (res.ok) {
          setImages((prev) => [...prev, { url: data.url, alt: "" }])
        } else {
          setError(data.error ?? "Erreur lors de l'upload")
        }
      } catch {
        setError("Erreur lors de l'upload")
      }
    }
    setUploading(false)
    e.target.value = ""
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Informations générales</h2>
            <Input
              label="Nom du produit *"
              error={errors.name?.message}
              {...register("name", {
                onChange: (e) => {
                  if (!product) setValue("slug", slugify(e.target.value))
                },
              })}
            />
            <Input
              label="Slug (URL)"
              error={errors.slug?.message}
              {...register("slug")}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                rows={5}
                {...register("description")}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Prix</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Prix de vente *" type="number" step="0.01" error={errors.price?.message} {...register("price")} />
              <Input label="Prix barré" type="number" step="0.01" {...register("comparePrice")} />
              <Input label="Coût d'achat" type="number" step="0.01" {...register("cost")} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Stock & référence</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="SKU" {...register("sku")} />
              <Input label="Code-barres" {...register("barcode")} />
              <Input label="Stock" type="number" {...register("stock")} />
              <Input label="Alerte stock faible" type="number" {...register("lowStockAt")} />
              <Input label="Poids (kg)" type="number" step="0.01" {...register("weight")} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Images</h2>

            {/* Upload fichier */}
            <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">{uploading ? "Upload en cours…" : "Cliquez pour ajouter une image"}</span>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 10 Mo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>

            {/* Ou par URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                placeholder="Ou coller une URL d'image…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button type="button" onClick={addImage} className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                Ajouter
              </button>
            </div>

            {/* Aperçu — drag & drop pour réordonner */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div
                    key={img.url + i}
                    draggable
                    onDragStart={() => { dragIndex.current = i }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i) }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const from = dragIndex.current
                      if (from === null || from === i) { setDragOverIndex(null); return }
                      const next = [...images]
                      const [moved] = next.splice(from, 1)
                      next.splice(i, 0, moved)
                      setImages(next)
                      dragIndex.current = null
                      setDragOverIndex(null)
                    }}
                    onDragEnd={() => { dragIndex.current = null; setDragOverIndex(null) }}
                    className={`relative group cursor-grab active:cursor-grabbing rounded-lg transition-all ${
                      dragOverIndex === i ? "ring-2 ring-blue-400 scale-105" : ""
                    }`}
                  >
                    {/* Badge "1ère photo" */}
                    {i === 0 && (
                      <span className="absolute top-1 left-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white font-medium">
                        Principale
                      </span>
                    )}
                    <img src={img.url} alt={img.alt} className="aspect-square w-full rounded-lg object-cover bg-gray-100" />
                    {/* Poignée drag */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/40 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <GripVertical className="h-3 w-3 text-white" />
                    </div>
                    {/* Supprimer */}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length > 1 && (
              <p className="text-xs text-gray-400 text-center">Glissez les photos pour les réordonner — la première sera la photo principale</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Publication</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded" {...register("isActive")} />
              <span className="text-sm">Produit actif (visible sur le site)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded" {...register("isFeatured")} />
              <span className="text-sm">Coup de cœur (page d'accueil)</span>
            </label>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Catégories</h2>
            <p className="text-xs text-gray-400">Un produit peut appartenir à plusieurs catégories</p>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    setSelectedCategoryIds(e.target.checked
                      ? [...selectedCategoryIds, cat.id]
                      : selectedCategoryIds.filter((id) => id !== cat.id)
                    )
                  }}
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 italic">Aucune catégorie disponible</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Tailles disponibles</h2>
            <p className="text-xs text-gray-400">Laissez vide si le produit n'a pas de tailles</p>
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span key={size} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    {size}
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((s) => s !== size))}
                      className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const v = newSize.trim()
                    if (v && !sizes.includes(v)) { setSizes([...sizes, v]); setNewSize("") }
                  }
                }}
                placeholder="ex: XS 18cm, Adulte…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => {
                  const v = newSize.trim()
                  if (v && !sizes.includes(v)) { setSizes([...sizes, v]); setNewSize("") }
                }}
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={saving}>
              {product ? "Sauvegarder" : "Créer le produit"}
            </Button>
            {product && (
              <Button
                type="button"
                variant="danger"
                className="w-full"
                onClick={handleDelete}
                loading={deleting}
              >
                Supprimer le produit
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

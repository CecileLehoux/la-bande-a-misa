"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ShoppingBag, ChevronLeft } from "lucide-react"
import { formatPrice, calculateDiscount } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import Link from "next/link"
import type { ProductWithDetails } from "@/types"

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCartStore()

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 animate-pulse">
          <div className="aspect-[3/4] bg-[var(--beige)] rounded-2xl" />
          <div className="space-y-5 pt-4">
            <div className="h-3 bg-[var(--beige-dark)] rounded w-1/4" />
            <div className="h-7 bg-[var(--beige-dark)] rounded w-3/4" />
            <div className="h-5 bg-[var(--beige-dark)] rounded w-1/5" />
            <div className="h-24 bg-[var(--beige-dark)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-[var(--gray)]">Produit introuvable.</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-[var(--terracotta)] hover:underline">
          Retour à la boutique
        </Link>
      </div>
    )
  }

  const discount = calculateDiscount(product.price, product.comparePrice ?? 0)
  const mainImage = product.images[selectedImage]?.url

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url ?? null,
      quantity,
      stock: product.stock,
    })
    openCart()
  }

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Retour */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs text-[var(--gray)] hover:text-[var(--terracotta)] transition-colors mb-10"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Retour à la boutique
        </Link>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--beige)]">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-[var(--beige-dark)]" />
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-opacity ${
                      selectedImage === i ? "opacity-100 ring-1 ring-[var(--terracotta)]" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Catégorie + titre */}
            <div>
              {product.category && (
                <p className="mb-2 text-[11px] tracking-widest text-[var(--terracotta)] uppercase">
                  {product.category.name}
                </p>
              )}
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Prix */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-medium text-[var(--dark)]">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-base text-[var(--gray)] line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="text-sm text-[var(--terracotta)]">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[var(--gray)] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Séparateur */}
            <div className="border-t border-[var(--beige-dark)]" />

            {/* Stock */}
            <p className="text-xs text-[var(--gray)]">
              {product.stock === 0
                ? "Actuellement épuisé"
                : product.stock <= product.lowStockAt
                ? `Plus que ${product.stock} disponible${product.stock > 1 ? "s" : ""}`
                : "En stock — expédition sous 3-5 jours"}
            </p>

            {/* Quantité + CTA */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--gray)]">Quantité</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-7 w-7 rounded-full border border-[var(--beige-dark)] text-[var(--gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-[var(--dark)]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="h-7 w-7 rounded-full border border-[var(--beige-dark)] text-[var(--gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-full bg-[var(--dark)] py-3.5 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors duration-200"
                >
                  Ajouter au panier
                </button>
              </div>
            )}

            {product.stock === 0 && (
              <button
                disabled
                className="w-full rounded-full border border-[var(--beige-dark)] py-3.5 text-sm text-[var(--gray)] cursor-not-allowed"
              >
                Indisponible
              </button>
            )}

            {/* Note artisanale */}
            <p className="text-[11px] text-[var(--gray)] italic">
              Chaque pièce est cousue à la main — de légères variations peuvent exister, elles font partie de son unicité.
            </p>
          </div>
        </div>

        {/* Avis */}
        {product.reviews.length > 0 && (
          <section className="mt-20 border-t border-[var(--beige-dark)] pt-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[var(--dark)] mb-8">
              Avis ({product.reviews.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.reviews.map((review) => (
                <div key={review.id} className="rounded-xl bg-[var(--beige)] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--dark)]">
                      {review.user.name ?? "Anonyme"}
                    </span>
                    <span className="text-xs text-[var(--terracotta)]">{"★".repeat(review.rating)}</span>
                  </div>
                  {review.title && (
                    <p className="text-sm font-medium text-[var(--dark)] mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-[var(--gray)]">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

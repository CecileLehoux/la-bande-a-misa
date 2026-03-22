"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import type { ProductWithImages } from "@/types"

interface ProductCardProps {
  product: ProductWithImages
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const mainImage = product.images[0]?.url
  const outOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock) return
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: mainImage ?? null,
      quantity: 1,
      stock: product.stock,
    })
    openCart()
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--beige)] aspect-square">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-[var(--beige-dark)]" />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-[var(--cream)]/60 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-[var(--gray)]">Épuisé</span>
          </div>
        )}

        {/* Bouton ajout panier au survol */}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 inset-x-0 bg-[var(--dark)] text-white text-xs tracking-widest uppercase py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            Ajouter au panier
          </button>
        )}
      </div>

      {/* Texte — nom — prix */}
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <h3 className="text-sm text-[var(--dark)] leading-snug flex-1 min-w-0 truncate">
          {product.name}
        </h3>
        <span className="text-xs text-[var(--gray)] shrink-0">—</span>
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-sm text-[var(--dark)]">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-[var(--gray-light)] line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

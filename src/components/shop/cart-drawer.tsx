"use client"

import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { X, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-[var(--cream)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--beige-dark)] px-6 py-4">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[var(--dark)]">
            Panier{items.length > 0 ? ` (${items.length})` : ""}
          </h2>
          <button onClick={closeCart} className="p-1 text-[var(--gray)] hover:text-[var(--dark)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="h-12 w-12 text-[var(--beige-dark)]" />
              <p className="text-sm text-[var(--gray)]">Votre panier est vide</p>
              <button
                onClick={closeCart}
                className="text-xs tracking-widest uppercase text-[var(--terracotta)] hover:underline"
              >
                Continuer les achats
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--beige)]">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-7 w-7 text-[var(--beige-dark)]" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm text-[var(--dark)] line-clamp-2 leading-snug">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-[var(--gray-light)] hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-sm font-medium text-[var(--dark)]">{formatPrice(item.price)}</p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 rounded-full border border-[var(--beige-dark)] text-[var(--gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors text-sm flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-[var(--dark)]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-6 w-6 rounded-full border border-[var(--beige-dark)] text-[var(--gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors text-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--beige-dark)] px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray)]">Sous-total</span>
              <span className="font-medium text-[var(--dark)]">{formatPrice(subtotal())}</span>
            </div>
            <p className="text-[11px] text-[var(--gray)] italic">Livraison calculée à la caisse</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center rounded-full bg-[var(--dark)] py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors duration-200"
            >
              Passer la commande
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-xs tracking-widest uppercase text-[var(--gray)] hover:text-[var(--dark)] transition-colors"
            >
              Continuer les achats
            </button>
          </div>
        )}
      </div>
    </>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "@/store/cart"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SuccessContent() {
  const { clearCart } = useCartStore()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  const cleared = useRef(false)

  useEffect(() => {
    // Attendre que Zustand ait fini de s'hydrater depuis localStorage
    // avant de vider le panier, sinon clearCart() s'exécute sur un store vide
    // et les articles reviennent au moment de l'hydration
    if (useCartStore.persist.hasHydrated()) {
      if (!cleared.current) {
        cleared.current = true
        clearCart()
      }
    } else {
      const unsub = useCartStore.persist.onFinishHydration(() => {
        if (!cleared.current) {
          cleared.current = true
          clearCart()
        }
      })
      return unsub
    }
  }, [clearCart])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="mx-auto h-20 w-20 text-[var(--terracotta)] mb-6" />
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">
          Commande confirmée !
        </h1>
        {orderNumber && (
          <p className="mt-3 text-sm font-medium text-[var(--dark)]">
            N° de commande : <span className="text-[var(--terracotta)]">{orderNumber}</span>
          </p>
        )}
        <p className="mt-3 text-sm text-[var(--gray)]">
          Merci pour votre commande. Vous allez recevoir un email de confirmation dans quelques minutes.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-full bg-[var(--dark)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors"
          >
            Voir mes commandes
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full border border-[var(--beige-dark)] px-6 py-3 text-sm font-medium text-[var(--gray)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors"
          >
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}

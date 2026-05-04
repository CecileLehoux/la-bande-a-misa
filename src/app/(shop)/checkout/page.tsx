"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { ShoppingBag, Lock, ChevronLeft, User, Truck, MapPin } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

type ShippingMethod = "delivery" | "pickup"

const checkoutSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  phone: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs tracking-wider uppercase text-[var(--gray)] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, subtotal } = useCartStore()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("delivery")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "FR" },
  })

  useEffect(() => {
    if (session?.user?.email) {
      setValue("email", session.user.email)
    }
  }, [session, setValue])

  const shippingCost = shippingMethod === "delivery" ? 4.99 : 0
  const total = subtotal() + shippingCost

  const inputClass =
    "w-full rounded-lg border border-[var(--beige-dark)] bg-white px-3.5 py-2.5 text-sm text-[var(--dark)] placeholder-[var(--gray-light)] focus:outline-none focus:border-[var(--dark)] transition-colors"

  const onSubmit = async (data: CheckoutForm) => {
    // Validation adresse si livraison
    if (shippingMethod === "delivery") {
      if (!data.address1 || !data.city || !data.postalCode) {
        setError("Veuillez remplir tous les champs d'adresse pour la livraison.")
        return
      }
      if (!/^\d{5}$/.test(data.postalCode ?? "")) {
        setError("Code postal invalide (5 chiffres requis).")
        return
      }
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: shippingMethod === "delivery" ? data : null,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          shippingMethod,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erreur lors du paiement")
      }

      const { sessionUrl } = await res.json()
      if (sessionUrl) window.location.href = sessionUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du paiement")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-[var(--beige-dark)] mb-4" />
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--dark)]">
          Votre panier est vide
        </h1>
        <p className="mt-2 text-sm text-[var(--gray)]">Ajoutez des produits avant de passer commande</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--dark)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs text-[var(--gray)] hover:text-[var(--terracotta)] transition-colors mb-10"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Continuer les achats
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)] mb-10">
          Finaliser ma commande
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Encart connexion */}
            {status !== "loading" && !session && (
              <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-5">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-[var(--terracotta)] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--dark)] mb-1">Vous avez déjà un compte ?</p>
                    <p className="text-xs text-[var(--gray)] mb-3">Connectez-vous pour suivre vos commandes et pré-remplir vos informations.</p>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--dark)] px-4 py-1.5 text-xs font-medium text-[var(--dark)] hover:bg-[var(--dark)] hover:text-white transition-colors"
                      >
                        Se connecter
                      </Link>
                      <span className="text-xs text-[var(--gray-light)]">ou continuer en tant qu&apos;invité ↓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {session && (
              <div className="rounded-2xl border border-[var(--beige-dark)] bg-white px-5 py-3 flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--terracotta)] flex-shrink-0" />
                <p className="text-xs text-[var(--gray)]">
                  Connecté en tant que <span className="text-[var(--dark)] font-medium">{session.user?.email}</span>
                </p>
              </div>
            )}

            {/* Choix du mode de livraison */}
            <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-6">
              <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)] mb-4">
                Mode de livraison
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Livraison */}
                <button
                  type="button"
                  onClick={() => setShippingMethod("delivery")}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    shippingMethod === "delivery"
                      ? "border-[var(--dark)] bg-[var(--beige)]"
                      : "border-[var(--beige-dark)] hover:border-[var(--gray-light)]"
                  }`}
                >
                  <Truck className="h-5 w-5 text-[var(--dark)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--dark)]">Livraison</p>
                    <p className="text-xs text-[var(--gray)]">4,99 €</p>
                  </div>
                </button>

                {/* Retrait atelier */}
                <button
                  type="button"
                  onClick={() => setShippingMethod("pickup")}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    shippingMethod === "pickup"
                      ? "border-[var(--dark)] bg-[var(--beige)]"
                      : "border-[var(--beige-dark)] hover:border-[var(--gray-light)]"
                  }`}
                >
                  <MapPin className="h-5 w-5 text-[var(--dark)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--dark)]">Retrait à l&apos;atelier</p>
                    <p className="text-xs text-[var(--terracotta)] font-medium">Gratuit</p>
                  </div>
                </button>
              </div>

              {shippingMethod === "pickup" && (
                <div className="mt-4 rounded-xl bg-[var(--beige)] p-4">
                  <p className="text-xs text-[var(--gray)] leading-relaxed">
                    📍 <span className="font-medium text-[var(--dark)]">Retrait à l&apos;atelier de Misa</span><br />
                    Nous vous contacterons pour convenir d&apos;un créneau de retrait.
                  </p>
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-6">
              <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)] mb-5">
                {shippingMethod === "delivery" ? "Informations de livraison" : "Vos informations"}
              </h2>
              <div className="space-y-4">
                <Field label="Email *" error={errors.email?.message}>
                  <input
                    type="email"
                    placeholder="vous@exemple.fr"
                    className={inputClass}
                    {...register("email")}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom *" error={errors.firstName?.message}>
                    <input placeholder="Jean" className={inputClass} {...register("firstName")} />
                  </Field>
                  <Field label="Nom *" error={errors.lastName?.message}>
                    <input placeholder="Dupont" className={inputClass} {...register("lastName")} />
                  </Field>
                </div>

                {shippingMethod === "delivery" && (
                  <>
                    <Field label="Adresse *" error={errors.address1?.message}>
                      <input placeholder="12 rue de la Paix" className={inputClass} {...register("address1")} />
                    </Field>

                    <Field label="Complément d'adresse" error={errors.address2?.message}>
                      <input placeholder="Appartement, étage..." className={inputClass} {...register("address2")} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Code postal *" error={errors.postalCode?.message}>
                        <input placeholder="75001" className={inputClass} {...register("postalCode")} />
                      </Field>
                      <Field label="Ville *" error={errors.city?.message}>
                        <input placeholder="Paris" className={inputClass} {...register("city")} />
                      </Field>
                    </div>
                  </>
                )}

                <Field label="Téléphone" error={errors.phone?.message}>
                  <input type="tel" placeholder="+33 6 00 00 00 00" className={inputClass} {...register("phone")} />
                </Field>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--dark)] py-3.5 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Lock className="h-3.5 w-3.5" />
              {loading ? "Traitement en cours..." : `Payer ${formatPrice(total)}`}
            </button>

            <p className="text-[11px] text-center text-[var(--gray)] italic">
              Paiement 100% sécurisé. Vos données bancaires ne transitent pas par nos serveurs.
            </p>
          </form>

          {/* Récap commande */}
          <div>
            <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-6">
              <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)] mb-5">
                Récapitulatif
              </h2>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--beige)]">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-[var(--beige-dark)]" />
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dark)] text-[9px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--dark)] truncate">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-[var(--gray)] bg-[var(--beige)] px-2 py-0.5 rounded-full w-fit mt-0.5">
                          {item.size}
                        </p>
                      )}
                      <p className="text-xs text-[var(--gray)]">{formatPrice(item.price)} / unité</p>
                    </div>
                    <p className="text-sm font-medium text-[var(--dark)]">{formatPrice(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-[var(--beige)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--gray)]">Sous-total</span>
                  <span className="text-[var(--dark)]">{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--gray)]">
                    {shippingMethod === "pickup" ? "Retrait à l'atelier" : "Livraison"}
                  </span>
                  <span className={shippingMethod === "pickup" ? "text-[var(--terracotta)] font-medium" : "text-[var(--dark)]"}>
                    {shippingMethod === "pickup" ? "Gratuit" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[var(--dark)] pt-2 border-t border-[var(--beige)]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

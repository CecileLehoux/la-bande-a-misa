import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_VOTRE")) {
    throw new Error("STRIPE_SECRET_KEY non configurée")
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover" as const,
      typescript: true,
    })
  }
  return _stripe
}

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}

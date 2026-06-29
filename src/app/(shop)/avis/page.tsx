import { PublicReviewForm } from "./public-review-form"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Laisser un avis — La Bande à Misa",
  description: "Partagez votre expérience avec les créations cousues main de La Bande à Misa.",
}

export default function PublicReviewPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Image src="/logo.png" alt="La Bande à Misa" width={160} height={64} className="h-auto mx-auto mb-6" />
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--dark)] mb-2">
            Votre avis compte beaucoup
          </h1>
          <p className="text-sm text-[var(--gray)]">
            Vous avez une création La Bande à Misa ? Partagez votre expérience !
          </p>
        </div>
        <PublicReviewForm />
      </div>
    </div>
  )
}

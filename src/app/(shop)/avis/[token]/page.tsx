import { getShopReviewByToken } from "@/lib/db-raw"
import { notFound } from "next/navigation"
import { ReviewForm } from "./review-form"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Laisser un avis — La Bande à Misa",
  robots: { index: false, follow: false },
}

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const review = await getShopReviewByToken(token)

  if (!review) notFound()

  // Already submitted
  if (review.submittedAt) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <Image src="/logo.png" alt="La Bande à Misa" width={160} height={64} className="h-auto mx-auto" />
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-3xl mb-4">✨</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--dark)] mb-3">
              Merci pour votre avis !
            </h1>
            <p className="text-sm text-[var(--gray)] leading-relaxed">
              Votre témoignage a bien été reçu. Il nous aide beaucoup à faire connaître nos créations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Image src="/logo.png" alt="La Bande à Misa" width={160} height={64} className="h-auto mx-auto mb-6" />
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--dark)] mb-2">
            Votre avis compte beaucoup
          </h1>
          <p className="text-sm text-[var(--gray)]">
            Commande n° <strong>{review.orderNumber}</strong>
          </p>
        </div>
        <ReviewForm token={token} />
      </div>
    </div>
  )
}

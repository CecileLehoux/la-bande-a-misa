import { getAllSubmittedShopReviews } from "@/lib/db-raw"
import { ReviewActions } from "./review-actions"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Avis clients - Admin" }

export default async function ReviewsPage() {
  const reviews = await getAllSubmittedShopReviews()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
        <p className="text-sm text-gray-500 mt-1">
          {reviews.length} avis reçu{reviews.length > 1 ? "s" : ""} — les avis approuvés apparaissent sur la page d&apos;accueil.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400 text-sm">Aucun avis reçu pour l&apos;instant.</p>
          <p className="text-gray-400 text-xs mt-1">Les avis arrivent automatiquement quand une commande passe en &quot;Livrée&quot;.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                    <span className="text-[var(--terracotta)]">
                      {"★".repeat(review.rating ?? 0)}{"☆".repeat(5 - (review.rating ?? 0))}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {review.isApproved ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {review.email} · Commande {review.orderNumber} ·{" "}
                    {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString("fr-FR") : ""}
                  </p>
                </div>
                <ReviewActions id={review.id} isApproved={!!review.isApproved} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

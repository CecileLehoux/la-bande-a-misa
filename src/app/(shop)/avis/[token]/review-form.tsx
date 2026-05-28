"use client"

import { useState } from "react"

export function ReviewForm({ token }: { token: string }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError("Merci de choisir une note."); return }
    if (!name.trim()) { setError("Merci d'indiquer votre prénom."); return }

    setLoading(true)
    setError("")

    const res = await fetch(`/api/avis/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim() }),
    })

    setLoading(false)

    if (res.ok) {
      setSubmitted(true)
    } else {
      setError("Une erreur est survenue, veuillez réessayer.")
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
        <p className="text-4xl">🌸</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--dark)]">
          Merci {name} !
        </h2>
        <p className="text-sm text-[var(--gray)] leading-relaxed">
          Votre avis a bien été reçu. Il nous aide beaucoup à faire connaître nos créations cousues main.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
      {/* Étoiles */}
      <div className="space-y-2">
        <label className="block text-xs tracking-widest uppercase text-[var(--gray)]">
          Votre note
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
            >
              <span className={star <= (hovered || rating) ? "text-[var(--terracotta)]" : "text-gray-200"}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prénom */}
      <div className="space-y-2">
        <label className="block text-xs tracking-widest uppercase text-[var(--gray)]">
          Votre prénom
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anna"
          className="w-full rounded-lg border border-[var(--beige-dark)] px-4 py-3 text-sm text-[var(--dark)] focus:border-[var(--dark)] focus:outline-none focus:ring-1 focus:ring-[var(--dark)]"
        />
      </div>

      {/* Commentaire */}
      <div className="space-y-2">
        <label className="block text-xs tracking-widest uppercase text-[var(--gray)]">
          Votre commentaire <span className="normal-case text-[var(--gray)] opacity-60">(optionnel)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          rows={4}
          className="w-full rounded-lg border border-[var(--beige-dark)] px-4 py-3 text-sm text-[var(--dark)] focus:border-[var(--dark)] focus:outline-none focus:ring-1 focus:ring-[var(--dark)] resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--terracotta)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--dark)] py-3.5 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors duration-200 disabled:opacity-50"
      >
        {loading ? "Envoi en cours…" : "Envoyer mon avis"}
      </button>
    </form>
  )
}

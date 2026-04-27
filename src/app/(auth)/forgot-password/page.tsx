"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error ?? "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">La Bande à Misa</span>
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-[var(--dark)]">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-[var(--gray)]">
            {sent ? "Vérifiez votre boîte mail" : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <p className="text-sm text-gray-600">
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien valable <strong>1 heure</strong>.
              </p>
              <Link href="/login" className="block text-sm font-medium text-[var(--terracotta)] hover:underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-full bg-[var(--dark)] py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi…" : "Envoyer le lien"}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-[var(--gray)] hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue")
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    }
    setLoading(false)
  }

  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-600">Lien invalide.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-[var(--terracotta)] hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return success ? (
    <div className="text-center space-y-4">
      <div className="text-4xl">✅</div>
      <p className="text-sm text-gray-600">Mot de passe mis à jour ! Vous allez être redirigé vers la connexion…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8 caractères minimum"
          required
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
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
        disabled={loading || !password || !confirm}
        className="w-full rounded-full bg-[var(--dark)] py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors disabled:opacity-50"
      >
        {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">La Bande à Misa</span>
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-[var(--dark)]">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-[var(--gray)]">Choisissez votre nouveau mot de passe</p>
        </div>
        <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-8">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Suspense } from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setError("")
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)]">La Bande à Misa</span>
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-[var(--dark)]">Connexion</h1>
          <p className="mt-1 text-sm text-[var(--gray)]">Accédez à votre compte</p>
        </div>

        <div className="rounded-2xl border border-[var(--beige-dark)] bg-white p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.fr"
              error={errors.email?.message}
              {...register("email")}
            />
            <div>
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <div className="mt-1 text-right">
                <Link href="/forgot-password" className="text-xs text-[var(--gray)] hover:text-[var(--terracotta)] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--dark)] py-3 text-sm font-medium text-white hover:bg-[var(--terracotta)] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--gray)]">Pas encore de compte ? </span>
            <Link href="/register" className="font-medium text-[var(--terracotta)] hover:underline">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

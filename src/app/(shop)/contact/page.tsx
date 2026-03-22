"use client"

import { useState } from "react"
import { Mail, Instagram, Clock, MapPin } from "lucide-react"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Simulation envoi (à connecter à un service email type Resend)
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
    setSending(false)
  }

  return (
    <main className="bg-[var(--cream)] min-h-screen">
      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6">
        <p className="text-xs tracking-widest uppercase text-[var(--gray)] mb-4">On vous répond vite !</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--dark)] leading-tight mb-4">
          Contactez-nous
        </h1>
        <p className="text-[var(--gray)] max-w-md mx-auto">
          Une question sur une commande, un produit, ou juste envie de dire bonjour ? On est là.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Infos */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white border border-[var(--beige-dark)] p-6 space-y-5">
              <h2 className="font-serif text-lg text-[var(--dark)]">Informations</h2>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[var(--blue-heart)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--gray)] mb-0.5">Email</p>
                  <a href="mailto:contact@labandaamisa.fr" className="text-sm text-[var(--dark)] hover:text-[var(--blue-heart)] transition-colors">
                    contact@labandaamisa.fr
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[var(--blue-heart)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--gray)] mb-0.5">Délai de réponse</p>
                  <p className="text-sm text-[var(--dark)]">Sous 48h en semaine</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[var(--blue-heart)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--gray)] mb-0.5">Atelier</p>
                  <p className="text-sm text-[var(--dark)]">Lyon, France</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Instagram className="h-4 w-4 text-[var(--blue-heart)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--gray)] mb-0.5">Instagram</p>
                  <a
                    href="https://instagram.com/labandaamisa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--dark)] hover:text-[var(--blue-heart)] transition-colors"
                  >
                    @labandaamisa
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--beige)] p-6">
              <p className="text-sm text-[var(--gray)] leading-relaxed">
                Pour toute question sur une <strong className="text-[var(--dark)]">commande en cours</strong>, pensez à indiquer votre numéro de commande dans le message pour un traitement plus rapide.
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="rounded-2xl bg-white border border-[var(--beige-dark)] p-10 text-center space-y-4">
                <div className="text-4xl">💌</div>
                <h2 className="font-serif text-xl text-[var(--dark)]">Message envoyé !</h2>
                <p className="text-[var(--gray)] text-sm">
                  Merci pour votre message. Nous vous répondrons dans les 48h.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }) }}
                  className="text-sm text-[var(--blue-heart)] hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-[var(--beige-dark)] p-8 space-y-5">
                <h2 className="font-serif text-lg text-[var(--dark)]">Envoyez-nous un message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-[var(--gray)] mb-1.5">Nom *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Marie Dupont"
                      className="w-full rounded-xl border border-[var(--beige-dark)] bg-[var(--cream)] px-4 py-2.5 text-sm text-[var(--dark)] placeholder:text-[var(--gray-light)] focus:border-[var(--dark)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-[var(--gray)] mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="marie@exemple.fr"
                      className="w-full rounded-xl border border-[var(--beige-dark)] bg-[var(--cream)] px-4 py-2.5 text-sm text-[var(--dark)] placeholder:text-[var(--gray-light)] focus:border-[var(--dark)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-wider uppercase text-[var(--gray)] mb-1.5">Sujet *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-[var(--beige-dark)] bg-[var(--cream)] px-4 py-2.5 text-sm text-[var(--dark)] focus:border-[var(--dark)] focus:outline-none transition-colors"
                  >
                    <option value="">Choisissez un sujet…</option>
                    <option value="commande">Question sur une commande</option>
                    <option value="produit">Question sur un produit</option>
                    <option value="retour">Retour / échange</option>
                    <option value="commande-perso">Commande personnalisée</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs tracking-wider uppercase text-[var(--gray)] mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Votre message…"
                    className="w-full rounded-xl border border-[var(--beige-dark)] bg-[var(--cream)] px-4 py-2.5 text-sm text-[var(--dark)] placeholder:text-[var(--gray-light)] focus:border-[var(--dark)] focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-full bg-[var(--dark)] py-3 text-sm font-medium text-white hover:bg-[var(--gray)] disabled:opacity-60 transition-colors"
                >
                  {sending ? "Envoi en cours…" : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </main>
  )
}

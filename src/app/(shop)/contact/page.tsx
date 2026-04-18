import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez La Bande à Misa pour toute question sur vos commandes ou nos créations cousues main.",
}

export default function ContactPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-8">Contact</h1>
        <h2 className="text-3xl font-bold text-[var(--dark)] mb-8">Nous contacter</h2>
        <div className="space-y-5 text-sm text-[var(--gray)] leading-relaxed">
          <p>Pour toute question concernant une commande, une création sur mesure ou simplement pour dire bonjour, écrivez-nous :</p>
          <p className="font-medium text-[var(--dark)]">contact@labandamisa.fr</p>
          <p>Nous répondons sous 48h (hors week-end et jours fériés).</p>
        </div>
      </div>
    </div>
  )
}

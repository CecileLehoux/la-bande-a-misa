import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de La Bande à Misa.",
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-8">Légal</h1>
        <h2 className="text-3xl font-bold text-[var(--dark)] mb-8">Mentions légales</h2>
        <div className="space-y-6 text-sm text-[var(--gray)] leading-relaxed">
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Éditeur du site</h3>
            <p>La Bande à Misa<br />contact@labandamisa.fr</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Hébergement</h3>
            <p>Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Propriété intellectuelle</h3>
            <p>L'ensemble des contenus (textes, images, créations) présents sur ce site sont protégés par le droit d'auteur et restent la propriété de La Bande à Misa.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

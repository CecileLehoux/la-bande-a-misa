import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et gestion des données personnelles de La Bande à Misa.",
  robots: { index: false },
}

export default function ConfidentialitePage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-8">Légal</h1>
        <h2 className="text-3xl font-bold text-[var(--dark)] mb-8">Politique de confidentialité</h2>
        <div className="space-y-6 text-sm text-[var(--gray)] leading-relaxed">
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Données collectées</h3>
            <p>Nous collectons vos nom, adresse email et adresse de livraison uniquement dans le cadre du traitement de vos commandes.</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Utilisation des données</h3>
            <p>Vos données sont utilisées exclusivement pour le traitement de vos commandes et la communication relative à celles-ci. Elles ne sont jamais revendues à des tiers.</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Vos droits</h3>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à contact@labandamisa.fr.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

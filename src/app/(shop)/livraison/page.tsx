export default function LivraisonRetoursPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-4">Informations pratiques</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)] mb-12">
          Livraison &amp; retours
        </h1>

        {/* Livraison */}
        <section className="mb-12">
          <h2 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-6 pb-2 border-b border-[var(--beige-dark)]">
            Livraison
          </h2>
          <div className="space-y-6 text-sm text-[var(--gray)] leading-relaxed">
            <div>
              <h3 className="font-medium text-[var(--dark)] mb-2">Délais de préparation</h3>
              <p>Chaque commande est préparée avec soin sous 3 à 5 jours ouvrés. Pour les créations sur mesure, comptez 1 à 2 semaines.</p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--dark)] mb-2">Livraison en France</h3>
              <p>Expédition en Colissimo sous 48h après préparation. Offerte à partir de 60€ d'achat.</p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--dark)] mb-2">Livraison internationale</h3>
              <p>Livraison possible en Europe et dans le monde. Contactez-nous pour un devis.</p>
            </div>
          </div>
        </section>

        {/* Retours */}
        <section>
          <h2 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-6 pb-2 border-b border-[var(--beige-dark)]">
            Retours &amp; échanges
          </h2>
          <div className="space-y-6 text-sm text-[var(--gray)] leading-relaxed">
            <div>
              <h3 className="font-medium text-[var(--dark)] mb-2">Délai de retour</h3>
              <p>Vous disposez de 14 jours à compter de la réception pour nous retourner un article, dans son état d'origine.</p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--dark)] mb-2">Conditions</h3>
              <p>Les articles doivent être non portés, non lavés et dans leur emballage d'origine. Les créations personnalisées ne sont pas éligibles au retour.</p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--dark)] mb-2">Remboursement</h3>
              <p>Le remboursement est effectué sous 5 à 10 jours ouvrés après réception du retour, sur le moyen de paiement utilisé.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

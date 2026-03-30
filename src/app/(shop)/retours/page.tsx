export default function RetoursPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-8">Retours</h1>
        <h2 className="text-3xl font-bold text-[var(--dark)] mb-8">Retours & échanges</h2>
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
      </div>
    </div>
  )
}

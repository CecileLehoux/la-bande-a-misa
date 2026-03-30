export default function CGVPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-8">Légal</h1>
        <h2 className="text-3xl font-bold text-[var(--dark)] mb-8">Conditions Générales de Vente</h2>
        <div className="space-y-6 text-sm text-[var(--gray)] leading-relaxed">
          <p>Les présentes CGV régissent les ventes effectuées sur la boutique en ligne La Bande à Misa.</p>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Commandes</h3>
            <p>Toute commande vaut acceptation des présentes CGV. La validation de votre commande entraîne une obligation de paiement.</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Prix</h3>
            <p>Les prix sont indiqués en euros TTC. La Bande à Misa se réserve le droit de modifier ses prix à tout moment.</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Paiement</h3>
            <p>Le paiement s'effectue par carte bancaire via Stripe. Les transactions sont sécurisées.</p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--dark)] mb-2">Propriété intellectuelle</h3>
            <p>L'ensemble des créations, photos et contenus du site sont la propriété exclusive de La Bande à Misa.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

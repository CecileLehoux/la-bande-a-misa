export default function LivraisonPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-8">Livraison</h1>
        <h2 className="text-3xl font-bold text-[var(--dark)] mb-8">Livraison & délais</h2>
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
      </div>
    </div>
  )
}

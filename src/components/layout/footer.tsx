import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[var(--beige-dark)] bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Logo centré */}
        <div className="mb-12 text-center">
          <Image
            src="/logo.png"
            alt="La Bande à Misa"
            width={180}
            height={40}
            className="h-8 w-auto mx-auto"
          />
          <p className="mt-3 text-xs tracking-widest uppercase text-[var(--gray)]">
            Créations cousues main
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
          <div>
            <h3 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-5">La boutique</h3>
            <ul className="space-y-3">
              <li><Link href="/products?category=linge-de-maison" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Linge de maison</Link></li>
              <li><Link href="/products?category=bebe-enfant" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Bébé & Enfant</Link></li>
              <li><Link href="/products?category=accessoires" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Accessoires</Link></li>
              <li><Link href="/products" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Toute la collection</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-5">Mon compte</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Connexion</Link></li>
              <li><Link href="/register" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Créer un compte</Link></li>
              <li><Link href="/account/orders" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Mes commandes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-5">Informations</h3>
            <ul className="space-y-3">
              <li><Link href="/a-propos" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Contact</Link></li>
              <li><Link href="/livraison" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Livraison & délais</Link></li>
              <li><Link href="/retours" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Retours & échanges</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-5">Légal</h3>
            <ul className="space-y-3">
              <li><Link href="/cgv" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">CGV</Link></li>
              <li><Link href="/confidentialite" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Confidentialité</Link></li>
              <li><Link href="/mentions-legales" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Mentions légales</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--beige-dark)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[var(--gray-light)]">
            © {new Date().getFullYear()} La Bande à Misa — Tous droits réservés
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--gray-light)]">
            <span>Paiement sécurisé</span>
            <span className="font-medium text-[var(--gray)]">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

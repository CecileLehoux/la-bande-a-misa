import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function Footer() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  })

  return (
    <footer className="border-t border-[var(--beige-dark)] bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
          <div>
            <h3 className="text-xs tracking-widest uppercase text-[var(--dark)] mb-5">La boutique</h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link href="/latelier" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">L'atelier</Link></li>
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
              <li><Link href="/latelier" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">L'atelier</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Contact</Link></li>
              <li><Link href="/livraison" className="text-sm text-[var(--gray)] hover:text-[var(--dark)] transition-colors">Livraison &amp; retours</Link></li>
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

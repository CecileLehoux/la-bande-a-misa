import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/shop/product-card"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default async function HomePage() {
  const [featuredProducts, newProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div>
      {/* Hero — banner pleine largeur, aucun texte par-dessus */}
      <section className="w-full overflow-hidden bg-[var(--beige)]">
        <Image
          src="/banner.png"
          alt="La Bande à Misa"
          width={1600}
          height={600}
          className="w-full h-auto object-cover"
          priority
        />
      </section>

      {/* Bandeau défilant */}
      <div className="border-y border-[var(--beige-dark)] bg-[var(--cream)] py-2.5 overflow-hidden">
        <div className="flex items-center gap-12 whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="text-[11px] tracking-widest uppercase text-[var(--gray)]">
              ✦ Tout cousu main &nbsp;&nbsp; ✦ Matières naturelles &nbsp;&nbsp; ✦ Livraison soignée &nbsp;&nbsp; ✦ Personnalisation possible
            </span>
          ))}
        </div>
      </div>

      {/* Coups de cœur */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-[var(--cream)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 border-b border-[var(--beige-dark)] pb-4">
              <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)]">
                Coups de cœur
              </h2>
              <Link href="/products?featured=true" className="flex items-center gap-1 text-[11px] tracking-widest uppercase text-[var(--dark)] hover:opacity-50 transition-opacity">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Séparateur visuel */}
      <div className="bg-[var(--beige)] py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Image
            src="/logo.png"
            alt="La Bande à Misa"
            width={260}
            height={52}
            className="h-10 w-auto mx-auto mb-6 opacity-80"
          />
          <p className="text-sm text-[var(--gray)] leading-relaxed max-w-md mx-auto">
            Chaque création est cousue à la main, avec des matières soigneusement choisies
            pour leur douceur et leur qualité.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-[var(--dark)] border-b border-[var(--dark)] pb-0.5 hover:opacity-50 transition-opacity"
          >
            Toute la collection <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Nouveautés */}
      {newProducts.length > 0 && (
        <section className="py-14 bg-[var(--cream)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 border-b border-[var(--beige-dark)] pb-4">
              <h2 className="text-[11px] tracking-widest uppercase text-[var(--dark)]">Nouveautés</h2>
              <Link href="/products" className="flex items-center gap-1 text-[11px] tracking-widest uppercase text-[var(--dark)] hover:opacity-50 transition-opacity">
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

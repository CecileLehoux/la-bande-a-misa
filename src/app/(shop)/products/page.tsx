import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/shop/product-card"
import type { Metadata } from "next"
import { Plus, Minus } from "lucide-react"

export const metadata: Metadata = { title: "Boutique" }

interface SearchParams {
  category?: string
  sort?: string
  page?: string
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = 12
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (params.category) where.categories = { some: { category: { slug: params.category } } }

  const orderBy: Record<string, string> =
    params.sort === "price_asc" ? { price: "asc" }
    : params.sort === "price_desc" ? { price: "desc" }
    : { sortOrder: "asc" }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } }, categories: { include: { category: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: "asc" } }),
  ])

  const totalPages = Math.ceil(total / limit)

  const sortOptions = [
    { value: "", label: "Nouveautés" },
    { value: "price_asc", label: "Prix croissant" },
    { value: "price_desc", label: "Prix décroissant" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">

        {/* Sidebar filtres — style maquette */}
        <aside className="hidden lg:block w-48 flex-shrink-0">

          {/* Type de produit */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] tracking-widest uppercase text-[var(--dark)]">Type de produit</h3>
              <Minus className="h-3 w-3 text-[var(--gray)]" />
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  className={`flex items-center gap-2 text-sm ${!params.category ? "text-[var(--dark)]" : "text-[var(--gray)]"} hover:text-[var(--dark)] transition-colors`}
                >
                  <span className={`inline-flex h-3.5 w-3.5 border ${!params.category ? "border-[var(--dark)] bg-[var(--dark)]" : "border-[var(--gray-light)]"} flex-shrink-0`}>
                    {!params.category && <span className="m-auto block h-1.5 w-1.5 bg-white" />}
                  </span>
                  Toutes les créations
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}`}
                    className={`flex items-center gap-2 text-sm ${params.category === cat.slug ? "text-[var(--dark)]" : "text-[var(--gray)]"} hover:text-[var(--dark)] transition-colors`}
                  >
                    <span className={`inline-flex h-3.5 w-3.5 border ${params.category === cat.slug ? "border-[var(--dark)] bg-[var(--dark)]" : "border-[var(--gray-light)]"} flex-shrink-0`}>
                      {params.category === cat.slug && <span className="m-auto block h-1.5 w-1.5 bg-white" />}
                    </span>
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trier */}
          <div className="border-t border-[var(--beige-dark)] pt-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] tracking-widest uppercase text-[var(--dark)]">Trier par</h3>
              <Minus className="h-3 w-3 text-[var(--gray)]" />
            </div>
            <ul className="space-y-2">
              {sortOptions.map((opt) => (
                <li key={opt.value}>
                  <a
                    href={`/products?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), ...(opt.value ? { sort: opt.value } : {}) }).toString()}`}
                    className={`flex items-center gap-2 text-sm ${(params.sort ?? "") === opt.value ? "text-[var(--dark)]" : "text-[var(--gray)]"} hover:text-[var(--dark)] transition-colors`}
                  >
                    <span className={`inline-flex h-3.5 w-3.5 border ${(params.sort ?? "") === opt.value ? "border-[var(--dark)] bg-[var(--dark)]" : "border-[var(--gray-light)]"} flex-shrink-0`}>
                      {(params.sort ?? "") === opt.value && <span className="m-auto block h-1.5 w-1.5 bg-white" />}
                    </span>
                    {opt.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </aside>

        {/* Grille produits */}
        <div className="flex-1 min-w-0">
          {/* Compteur */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-[var(--gray)]">
              {total} création{total > 1 ? "s" : ""}
            </p>
            {/* Sort mobile */}
            <div className="lg:hidden flex gap-2">
              {sortOptions.map((opt) => (
                <a
                  key={opt.value}
                  href={`/products?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), ...(opt.value ? { sort: opt.value } : {}) }).toString()}`}
                  className={`text-[10px] tracking-widest uppercase px-2 py-1 border ${(params.sort ?? "") === opt.value ? "border-[var(--dark)] text-[var(--dark)]" : "border-[var(--beige-dark)] text-[var(--gray)]"}`}
                >
                  {opt.label}
                </a>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-[var(--gray)]">Aucune création trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/products?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                  className={`flex h-8 w-8 items-center justify-center text-xs transition-colors ${
                    p === page
                      ? "bg-[var(--dark)] text-white"
                      : "text-[var(--gray)] hover:text-[var(--dark)]"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

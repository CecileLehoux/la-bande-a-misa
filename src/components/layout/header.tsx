"use client"

import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/store/cart"
import { Search, ShoppingBag, User, X, Menu } from "lucide-react"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const { totalItems, toggleCart } = useCartStore()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: "/products?category=cabas",            label: "Les cabas" },
    { href: "/products?category=trousses",         label: "Les trousses" },
    { href: "/products?category=bandanas-canins",  label: "Les bandanas canins" },
    { href: "/products?category=creations-crochet",label: "Les créations au crochet" },
    { href: "/products",                            label: "Toute la boutique" },
  ]

  return (
    <>
      {/* Barre unique — fidèle à la maquette */}
      <header className="sticky top-0 z-50 bg-[var(--cream)] border-b border-[var(--beige-dark)]">
        <div className="relative h-20">

          {/* Lignes organiques SVG — fidèles à la maquette */}
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ligne principale : part du bas-gauche, monte, fait un ovale, repart à droite */}
            <path d="M-10 70 C85 54 195 20 278 36 C305 43 318 66 310 58 C302 50 320 26 338 36 C435 50 730 20 1450 34" stroke="#2a2a18" strokeWidth="1.2" strokeOpacity="0.26" fill="none"/>
            {/* Ligne secondaire : courbe douce sans boucle */}
            <path d="M-10 50 C150 32 340 58 520 40 C700 22 920 46 1150 30 C1280 22 1390 33 1450 28" stroke="#2a2a18" strokeWidth="0.7" strokeOpacity="0.14" fill="none"/>
          </svg>

          <div className="relative mx-auto max-w-7xl px-4 h-full flex items-center justify-between">

            {/* Gauche : hamburger + mascotte */}
            <div className="flex items-end gap-2 w-36">
              <button
                className="md:hidden p-1 text-[var(--dark)] hover:opacity-60 transition-opacity"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              {/* Mascotte — desktop uniquement */}
              <div className="relative h-[84px] w-16 self-end hidden md:block">
                <Image
                  src="/chien.png"
                  alt=""
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>

            {/* Centre : logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image
                src="/logo.png"
                alt="La Bande à Misa"
                width={220}
                height={44}
                className="h-auto w-auto max-w-[140px] md:max-w-none md:h-9"
                priority
              />
            </Link>

            {/* Droite : badge fait main + icônes */}
            <div className="flex items-center gap-1 w-36 justify-end">
              {/* Badge fait main — desktop uniquement */}
              <div className="relative h-20 w-28 mr-2 hidden md:block">
                <Image
                  src="/fait-main.png"
                  alt="Fait main"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <Link href="/products" className="hidden md:block p-2 text-[var(--dark)] hover:opacity-60 transition-opacity" aria-label="Rechercher">
                <Search className="h-5 w-5" />
              </Link>

              {session ? (
                <div className="relative">
                  <button
                    className="p-2 text-[var(--dark)] hover:opacity-60 transition-opacity"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Mon compte"
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--cream)] border border-[var(--beige-dark)] shadow-sm z-50">
                      <div className="px-4 py-3 border-b border-[var(--beige)]">
                        <p className="text-xs text-[var(--gray)]">Bonjour,</p>
                        <p className="text-sm text-[var(--dark)] truncate">{session.user?.email}</p>
                      </div>
                      <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-[var(--gray)] hover:bg-[var(--beige)] hover:text-[var(--dark)] transition-colors">
                        Mes commandes
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[var(--terracotta)] hover:bg-[var(--beige)] transition-colors">
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }) }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-[var(--gray)] hover:bg-[var(--beige)] transition-colors border-t border-[var(--beige)]"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="p-2 text-[var(--dark)] hover:opacity-60 transition-opacity" aria-label="Connexion">
                  <User className="h-5 w-5" />
                </Link>
              )}

              <button
                onClick={toggleCart}
                className="relative p-2 text-[var(--dark)] hover:opacity-60 transition-opacity"
                aria-label="Panier"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dark)] text-[10px] font-bold text-white">
                    {totalItems() > 9 ? "9+" : totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Nav catégories — sous la barre principale */}
        <div className="hidden md:block border-t border-[var(--beige)]">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex justify-center gap-10 h-9 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] tracking-widest uppercase text-[var(--dark)] hover:opacity-50 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-0 z-40 bg-[var(--cream)] border-b border-[var(--beige-dark)] pt-16">
          <nav className="px-6 py-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-sm tracking-widest uppercase text-[var(--dark)] border-b border-[var(--beige)] last:border-0 hover:opacity-50 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

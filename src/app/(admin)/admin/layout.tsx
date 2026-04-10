import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, ChevronRight, Tag, Scissors } from "lucide-react"
import { signOut } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/dashboard")
  }

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Produits" },
    { href: "/admin/categories", icon: Tag, label: "Catégories" },
    { href: "/admin/atelier", icon: Scissors, label: "L'atelier" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Commandes" },
    { href: "/admin/customers", icon: Users, label: "Clients" },
    { href: "/admin/settings", icon: Settings, label: "Paramètres" },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">La Bande à Misa</Link>
          <p className="text-xs text-gray-400 mt-0.5">Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold">
              {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user?.name ?? "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

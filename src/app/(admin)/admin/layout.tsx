import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#8ecaa0" }}>
        <div className="p-6 border-b" style={{ borderColor: "#f5f0e1" }}>
          <Link href="/">
            <Image src="/logo.png" alt="La Bande à Misa" width={160} height={64} className="h-auto" priority />
          </Link>
          <p className="text-xs mt-2 font-medium" style={{ color: "#f5f0e1" }}>Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group hover:bg-white/20"
              style={{ color: "#f5f0e1" }}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#f5f0e1" }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: "#f5f0e1", color: "#8ecaa0" }}>
              {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#f5f0e1" }}>{session.user?.name ?? "Admin"}</p>
              <p className="text-xs truncate" style={{ color: "#f5f0e1", opacity: 0.75 }}>{session.user?.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm hover:bg-white/20"
              style={{ color: "#f5f0e1" }}
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

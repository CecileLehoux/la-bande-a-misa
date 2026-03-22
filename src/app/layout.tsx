import type { Metadata } from "next"
import { Playfair_Display, Jost } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { CartDrawer } from "@/components/shop/cart-drawer"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "La Bande à Misa — Créations cousues main",
    template: "%s | La Bande à Misa",
  },
  description: "Créations cousues main avec amour — linge de maison, accessoires bébé et sacs artisanaux.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${jost.variable} font-[family-name:var(--font-jost)] antialiased`}>
        <SessionProvider>
          {children}
          <CartDrawer />
        </SessionProvider>
      </body>
    </html>
  )
}

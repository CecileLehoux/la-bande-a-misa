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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://labandea-misa.fr"

export const metadata: Metadata = {
  title: {
    default: "La Bande à Misa — Créations cousues main",
    template: "%s | La Bande à Misa",
  },
  description: "Accessoires cousus main pour chiens, chats et humains. Bandanas, chouchous et créations artisanales fabriquées avec amour.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    siteName: "La Bande à Misa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
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

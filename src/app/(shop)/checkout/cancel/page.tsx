import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle className="mx-auto h-20 w-20 text-red-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900">Paiement annulé</h1>
        <p className="mt-3 text-gray-600">
          Votre commande n'a pas été finalisée. Votre panier est toujours disponible.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/checkout">Réessayer</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continuer les achats</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

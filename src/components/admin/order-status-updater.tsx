"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS_LABELS } from "@/types"
import type { OrderStatus } from "@/types"
import { RotateCcw } from "lucide-react"

interface Props {
  orderId: string
  currentStatus: OrderStatus
  paymentStatus: string
  paymentIntentId?: string | null
}

export function OrderStatusUpdater({ orderId, currentStatus, paymentStatus, paymentIntentId }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [refundError, setRefundError] = useState("")
  const [refundDone, setRefundDone] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setSaving(false)
    router.refresh()
  }

  const handleRefund = async () => {
    if (!confirm(`Rembourser intégralement cette commande ? Cette action est irréversible.`)) return
    setRefunding(true)
    setRefundError("")
    const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) {
      setRefundError(data.error ?? "Erreur lors du remboursement")
    } else {
      setRefundDone(true)
      router.refresh()
    }
    setRefunding(false)
  }

  const canRefund =
    paymentIntentId &&
    paymentStatus === "PAID" &&
    !refundDone

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
      {/* Changement de statut */}
      <div>
        <h2 className="font-semibold mb-3">Changer le statut</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <Button className="w-full" onClick={handleSave} loading={saving} disabled={status === currentStatus}>
          Mettre à jour
        </Button>
      </div>

      {/* Remboursement */}
      {canRefund && (
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-1">Remboursement</h2>
          <p className="text-xs text-gray-500 mb-3">Rembourse intégralement le client via Stripe.</p>
          {refundError && (
            <p className="text-xs text-red-600 mb-2">{refundError}</p>
          )}
          <button
            onClick={handleRefund}
            disabled={refunding}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            {refunding ? "Remboursement…" : "Rembourser le client"}
          </button>
        </div>
      )}

      {(paymentStatus === "REFUNDED" || refundDone) && (
        <div className="border-t pt-4">
          <p className="text-sm text-green-700 font-medium">✓ Commande remboursée</p>
        </div>
      )}
    </div>
  )
}

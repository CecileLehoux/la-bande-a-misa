"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS_LABELS } from "@/types"
import type { OrderStatus } from "@/types"

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
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
  )
}

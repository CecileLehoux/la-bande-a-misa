"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2, ThumbsUp, ThumbsDown } from "lucide-react"

export function ReviewActions({ id, isApproved }: { id: string; isApproved: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !isApproved }),
    })
    router.refresh()
    setLoading(false)
  }

  const remove = async () => {
    if (!confirm("Supprimer cet avis définitivement ?")) return
    setLoading(true)
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={toggle}
        disabled={loading}
        title={isApproved ? "Désapprouver" : "Approuver"}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
          isApproved
            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isApproved ? <ThumbsDown className="h-3.5 w-3.5" /> : <ThumbsUp className="h-3.5 w-3.5" />}
        {isApproved ? "Désapprouver" : "Approuver"}
      </button>
      <button
        onClick={remove}
        disabled={loading}
        title="Supprimer"
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Copy, Check, Link2 } from "lucide-react"

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-4 w-4 text-gray-500" />
        <h2 className="font-semibold text-gray-900 text-sm">Lien public à partager</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Partagez ce lien quand vous voulez (Instagram, newsletter…) pour recueillir des avis spontanés.
        Chaque avis reçu apparaîtra ici pour validation avant publication.
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none"
        />
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  )
}

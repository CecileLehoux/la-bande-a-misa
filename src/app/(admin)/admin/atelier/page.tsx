"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, Upload } from "lucide-react"
import Image from "next/image"

type AtelierSettings = {
  atelier_overline: string
  atelier_title: string
  atelier_body: string
  atelier_image1: string
  atelier_image2: string
  atelier_footer: string
}

const defaultSettings: AtelierSettings = {
  atelier_overline: "",
  atelier_title: "",
  atelier_body: "",
  atelier_image1: "",
  atelier_image2: "",
  atelier_footer: "",
}

export default function AtelierAdminPage() {
  const [settings, setSettings] = useState<AtelierSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading1, setUploading1] = useState(false)
  const [uploading2, setUploading2] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings/atelier")
      .then((r) => r.json())
      .then((data) => { setSettings({ ...defaultSettings, ...data }); setLoading(false) })
  }, [])

  const set = (key: keyof AtelierSettings, value: string) =>
    setSettings((s) => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/admin/settings/atelier", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "atelier_image1" | "atelier_image2",
    setUploading: (v: boolean) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { upload } = await import("@vercel/blob/client")
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `${window.location.origin}/api/upload`,
      })
      set(key, blob.url)
    } finally {
      setUploading(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
  const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"

  if (loading) {
    return <div className="p-8 flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page L'atelier</h1>
          <p className="text-sm text-gray-500 mt-1">Modifie le contenu affiché sur la page /latelier</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
      </div>

      {saved && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Modifications sauvegardées — la page est mise à jour
        </div>
      )}

      <div className="space-y-6">
        {/* Textes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Textes</h2>

          <div>
            <label className={labelClass}>Sous-titre (au dessus du titre)</label>
            <input type="text" value={settings.atelier_overline} onChange={(e) => set("atelier_overline", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Titre principal</label>
            <input type="text" value={settings.atelier_title} onChange={(e) => set("atelier_title", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Corps de texte <span className="text-gray-400 font-normal">(sépare les paragraphes par une ligne vide)</span></label>
            <textarea
              value={settings.atelier_body}
              onChange={(e) => set("atelier_body", e.target.value)}
              rows={7}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Note en bas de page</label>
            <input type="text" value={settings.atelier_footer} onChange={(e) => set("atelier_footer", e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Photos</h2>

          {/* Image 1 */}
          <div>
            <label className={labelClass}>Photo principale (à côté du texte)</label>
            <div className="flex gap-3 items-start">
              <input type="text" value={settings.atelier_image1} onChange={(e) => set("atelier_image1", e.target.value)} className={`${inputClass} flex-1`} placeholder="URL ou uploade une photo" />
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                {uploading1 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading1 ? "Upload…" : "Uploader"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "atelier_image1", setUploading1)} />
              </label>
            </div>
            {settings.atelier_image1 && (
              <div className="mt-3 relative aspect-[4/3] w-48 overflow-hidden rounded-xl bg-gray-100">
                <Image src={settings.atelier_image1} alt="Photo 1" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>

          {/* Image 2 */}
          <div>
            <label className={labelClass}>Deuxième photo (en bas, pleine largeur)</label>
            <div className="flex gap-3 items-start">
              <input type="text" value={settings.atelier_image2} onChange={(e) => set("atelier_image2", e.target.value)} className={`${inputClass} flex-1`} placeholder="URL ou uploade une photo" />
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                {uploading2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading2 ? "Upload…" : "Uploader"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "atelier_image2", setUploading2)} />
              </label>
            </div>
            {settings.atelier_image2 && (
              <div className="mt-3 relative aspect-video w-64 overflow-hidden rounded-xl bg-gray-100">
                <Image src={settings.atelier_image2} alt="Photo 2" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

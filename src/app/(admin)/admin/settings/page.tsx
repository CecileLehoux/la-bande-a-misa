"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, Upload } from "lucide-react"
import Image from "next/image"

type HomepageSettings = {
  banner_image: string
}

type ThemeSettings = {
  header_stripe_color: string
}

const defaultSettings: HomepageSettings = {
  banner_image: "",
}

const defaultTheme: ThemeSettings = {
  header_stripe_color: "#8ecaa0",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings/homepage").then((r) => r.json()),
      fetch("/api/admin/settings/theme").then((r) => r.json()),
    ]).then(([homepageData, themeData]) => {
      setSettings({ ...defaultSettings, ...homepageData })
      setTheme({ ...defaultTheme, ...themeData })
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await Promise.all([
      fetch("/api/admin/settings/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }),
      fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const { upload } = await import("@vercel/blob/client")
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `${window.location.origin}/api/upload`,
      })
      setSettings((s) => ({ ...s, banner_image: blob.url }))
    } finally {
      setUploadingBanner(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-1">Personnalise les éléments visuels de la boutique</p>
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
          ✓ Modifications sauvegardées — la page d'accueil est mise à jour
        </div>
      )}

      {/* Thème */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900">Thème du header</h2>
        <div>
          <label className={labelClass}>Couleur des bandes</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.header_stripe_color}
              onChange={(e) => setTheme((t) => ({ ...t, header_stripe_color: e.target.value }))}
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 p-1"
            />
            <input
              type="text"
              value={theme.header_stripe_color}
              onChange={(e) => setTheme((t) => ({ ...t, header_stripe_color: e.target.value }))}
              className={`${inputClass} w-36 font-mono`}
              placeholder="#8ecaa0"
              maxLength={7}
            />
            <div
              className="h-10 flex-1 rounded-lg border border-gray-200"
              style={{
                background: `repeating-linear-gradient(90deg, ${theme.header_stripe_color} 0px, ${theme.header_stripe_color} 30px, #f5f0e1 30px, #f5f0e1 60px)`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">Aperçu des bandes en temps réel. Cliquez sur "Sauvegarder" pour appliquer sur le site.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Page d'accueil</h2>

        <div>
          <label className={labelClass}>Image bannière</label>
          <div className="flex gap-3 items-start">
            <input
              type="text"
              value={settings.banner_image}
              onChange={(e) => setSettings((s) => ({ ...s, banner_image: e.target.value }))}
              className={`${inputClass} flex-1`}
              placeholder="URL ou uploade une image"
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
              {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadingBanner ? "Upload…" : "Uploader"}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
          </div>
          {settings.banner_image && (
            <div className="mt-3 relative aspect-[16/7] w-full overflow-hidden rounded-xl bg-gray-100">
              <Image src={settings.banner_image} alt="Bannière" fill className="object-cover object-bottom" unoptimized />
            </div>
          )}
          {!settings.banner_image && (
            <p className="mt-2 text-xs text-gray-400">Sans image définie, la bannière par défaut <code>/banner.png</code> est utilisée.</p>
          )}
        </div>
      </div>
    </div>
  )
}

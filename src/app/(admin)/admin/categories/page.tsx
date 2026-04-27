"use client"

import { useState, useEffect, useRef } from "react"
import { Pencil, Trash2, Plus, X, Check, Tag, GripVertical, Save, Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  _count: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Formulaire ajout
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")

  // Édition inline
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [saving, setSaving] = useState(false)

  // Drag & drop
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [savedOrder, setSavedOrder] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/categories")
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setAddError("")
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddError(data.error)
    } else {
      setNewName("")
      setNewDesc("")
      load()
    }
    setAdding(false)
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditDesc(cat.description ?? "")
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    })
    if (res.ok) {
      setEditId(null)
      load()
    }
    setSaving(false)
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Supprimer la catégorie "${cat.name}" ?`)) return
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setTimeout(() => setError(""), 4000)
    } else {
      load()
    }
  }

  // Drag & drop handlers
  const handleDragStart = (index: number) => {
    dragIndex.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    const from = dragIndex.current
    if (from === null || from === index) return
    const updated = [...categories]
    const [moved] = updated.splice(from, 1)
    updated.splice(index, 0, moved)
    setCategories(updated)
    setIsDirty(true)
    dragIndex.current = null
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setDragOverIndex(null)
  }

  const handleSaveOrder = async () => {
    setSavingOrder(true)
    await fetch("/api/admin/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories: categories.map((c, i) => ({ id: c.id, sortOrder: i })),
      }),
    })
    setSavingOrder(false)
    setSavedOrder(true)
    setIsDirty(false)
    setTimeout(() => setSavedOrder(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
        <p className="text-sm text-gray-500 mt-1">{categories.length} catégorie(s)</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Formulaire ajout */}
      <form onSubmit={handleAdd} className="mb-8 rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la catégorie *"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optionnel)"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        {addError && <p className="text-xs text-red-600">{addError}</p>}
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {adding ? "Ajout…" : "Ajouter"}
        </button>
      </form>

      {/* Barre de sauvegarde ordre */}
      {isDirty && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">Ordre modifié — n'oublie pas de sauvegarder</p>
          <button
            onClick={handleSaveOrder}
            disabled={savingOrder}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors"
          >
            {savingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingOrder ? "Sauvegarde…" : "Sauvegarder l'ordre"}
          </button>
        </div>
      )}

      {savedOrder && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">✓ Ordre sauvegardé — le header du site est mis à jour</p>
        </div>
      )}

      {/* Liste */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Chargement…</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">Aucune catégorie</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-3 py-3 w-8" />
                <th className="px-5 py-3 text-left font-medium text-gray-500">Nom</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Produits</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  draggable={editId !== cat.id}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`hover:bg-gray-50 transition-colors ${editId !== cat.id ? "cursor-grab active:cursor-grabbing" : ""} ${dragOverIndex === index ? "bg-blue-50 border-t-2 border-blue-400" : ""}`}
                >
                  <td className="px-3 py-3">
                    <GripVertical className="h-4 w-4 text-gray-300" />
                  </td>
                  {editId === cat.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                          autoFocus
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2 text-center text-gray-400">—</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSave(cat.id)}
                            disabled={saving}
                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-gray-400" />
                          {cat.name}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{cat.description ?? <span className="italic text-gray-300">—</span>}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cat._count.products > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                          {cat._count.products}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className={`rounded-lg p-1.5 transition-colors ${cat._count.products > 0 ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                            disabled={cat._count.products > 0}
                            title={cat._count.products > 0 ? "Catégorie utilisée par des produits" : "Supprimer"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400 text-center">
        Glisse les lignes pour réordonner — l'ordre est reflété dans le header du site après sauvegarde
      </p>
    </div>
  )
}

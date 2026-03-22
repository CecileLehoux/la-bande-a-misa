export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté (jpg, png, webp, gif)" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const filename = `produits/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Production (Vercel) : utilise Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob")
      const blob = await put(filename, file.stream(), {
        access: "public",
        contentType: file.type,
      })
      return NextResponse.json({ url: blob.url })
    }

    // Développement local : sauvegarde dans public/uploads/
    const { writeFile, mkdir } = await import("fs/promises")
    const path = await import("path")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename.replace("produits/", "")), buffer)
    return NextResponse.json({ url: `/uploads/${filename.replace("produits/", "")}` })

  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}

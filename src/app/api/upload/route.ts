export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") ?? ""

    // Requête JSON = token exchange pour upload direct Vercel Blob
    if (contentType.includes("application/json") && process.env.BLOB_READ_WRITE_TOKEN) {
      const { handleUpload } = await import("@vercel/blob/client")
      const body = await req.json()
      const response = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 10 * 1024 * 1024,
        }),
        onUploadCompleted: async () => {},
      })
      return NextResponse.json(response)
    }

    // FormData = upload fichier direct (dev local ou fallback)
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté" }, { status: 400 })
    }

    // Production avec Blob : put direct depuis le serveur (fichiers < 4.5MB)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob")
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const filename = `produits/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const blob = await put(filename, await file.arrayBuffer(), {
        access: "public",
        contentType: file.type,
      })
      return NextResponse.json({ url: blob.url })
    }

    // Dev local : sauvegarde dans public/uploads/
    const { writeFile, mkdir } = await import("fs/promises")
    const path = await import("path")
    const bytes = await file.arrayBuffer()
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))
    return NextResponse.json({ url: `/uploads/${filename}` })

  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

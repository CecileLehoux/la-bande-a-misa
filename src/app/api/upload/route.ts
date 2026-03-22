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

    // ── PRODUCTION : échange de token pour upload direct navigateur → Vercel Blob ──
    // Le fichier ne passe jamais par cette fonction (pas de 413)
    if (contentType.includes("application/json")) {
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

    // ── DEV LOCAL : upload FormData → sauvegarde dans public/uploads/ ──
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté (jpg, png, webp, gif)" }, { status: 400 })
    }

    const { writeFile, mkdir } = await import("fs/promises")
    const path = await import("path")
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ url: `/uploads/${filename}` })

  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

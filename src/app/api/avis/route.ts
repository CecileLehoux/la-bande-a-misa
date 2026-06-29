import { NextResponse } from "next/server"
import { createPublicShopReview } from "@/lib/db-raw"

export async function POST(req: Request) {
  try {
    const { name, rating, comment, email } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Prénom requis" }, { status: 400 })
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note invalide" }, { status: 400 })
    }

    await createPublicShopReview({
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      name: name.trim(),
      rating,
      comment: typeof comment === "string" ? comment.trim() : "",
      email: typeof email === "string" ? email.trim() : "",
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[POST /api/avis]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getShopReviewByToken, submitShopReview } from "@/lib/db-raw"

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const review = await getShopReviewByToken(token)

    if (!review) return NextResponse.json({ error: "Lien invalide" }, { status: 404 })
    if (review.submittedAt) return NextResponse.json({ error: "Avis déjà soumis" }, { status: 400 })

    const { name, rating, comment } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Prénom requis" }, { status: 400 })
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note invalide" }, { status: 400 })
    }

    await submitShopReview(token, {
      name: name.trim(),
      rating,
      comment: typeof comment === "string" ? comment.trim() : "",
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[POST /api/avis/[token]]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

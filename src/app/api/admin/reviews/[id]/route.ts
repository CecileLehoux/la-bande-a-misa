import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { setShopReviewApproval, deleteShopReview } from "@/lib/db-raw"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  const { id } = await params
  const { isApproved } = await req.json()
  await setShopReviewApproval(id, Boolean(isApproved))
  // Les avis approuvés s'affichent sur la page d'accueil (statique)
  revalidatePath("/")
  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  const { id } = await params
  await deleteShopReview(id)
  revalidatePath("/")
  return NextResponse.json({ success: true })
}

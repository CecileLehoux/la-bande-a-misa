import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { categories } = await req.json() as { categories: { id: string; sortOrder: number }[] }

  if (!Array.isArray(categories)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 })
  }

  await Promise.all(
    categories.map(({ id, sortOrder }) =>
      prisma.category.update({ where: { id }, data: { sortOrder } })
    )
  )

  revalidatePath("/", "layout")

  return NextResponse.json({ success: true })
}

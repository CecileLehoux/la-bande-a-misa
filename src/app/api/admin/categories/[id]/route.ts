import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { slugify } from "@/lib/utils"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const { name, description } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: name.trim(), slug: slugify(name.trim()), description: description?.trim() ?? null },
  })

  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params

  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${count} produit(s) utilisent cette catégorie` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}

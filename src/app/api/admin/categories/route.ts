import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { slugify } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  })

  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { name, description } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 })
  }

  const slug = slugify(name.trim())

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: "Une catégorie avec ce nom existe déjà" }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), slug, description: description?.trim() ?? null },
  })

  return NextResponse.json(category, { status: 201 })
}

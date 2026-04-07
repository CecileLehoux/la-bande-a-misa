import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { products } = await req.json() as { products: { id: string; sortOrder: number }[] }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 })
  }

  // Update each product's sortOrder individually (libSQL doesn't support batch UPDATE)
  await Promise.all(
    products.map(({ id, sortOrder }) =>
      prisma.product.update({ where: { id }, data: { sortOrder } })
    )
  )

  revalidatePath("/")
  revalidatePath("/products")

  return NextResponse.json({ success: true })
}

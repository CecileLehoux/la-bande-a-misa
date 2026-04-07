import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { images, categoryIds, categoryId: _legacy, ...data } = body

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      comparePrice: data.comparePrice || null,
      cost: data.cost || null,
      weight: data.weight || null,
      images: images !== undefined
        ? {
            deleteMany: {},
            create: images.map((img: { url: string; alt: string }, i: number) => ({
              url: img.url,
              alt: img.alt,
              sortOrder: i,
            })),
          }
        : undefined,
      categories: categoryIds !== undefined
        ? {
            deleteMany: {},
            create: (categoryIds as string[]).map((cid) => ({ categoryId: cid })),
          }
        : undefined,
    },
  })

  revalidatePath("/")
  revalidatePath("/products")
  return NextResponse.json(product)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  const { id } = await params
  await prisma.product.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/products")
  return NextResponse.json({ success: true })
}

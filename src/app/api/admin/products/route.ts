import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { slugify } from "@/lib/utils"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  const body = await req.json()
  const { images, ...data } = body

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: data.slug || slugify(data.name),
      categoryId: data.categoryId || null,
      comparePrice: data.comparePrice || null,
      cost: data.cost || null,
      weight: data.weight || null,
      images: {
        create: images?.map((img: { url: string; alt: string }, i: number) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: i,
        })) ?? [],
      },
    },
  })

  revalidatePath("/")
  revalidatePath("/products")
  return NextResponse.json(product, { status: 201 })
}

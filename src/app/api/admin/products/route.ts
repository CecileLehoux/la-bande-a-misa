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
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

    const body = await req.json()
    const { images, categoryIds, categoryId: _legacy, partnerName, partnerUrl, ...data } = body

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: data.slug || slugify(data.name),
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
        categories: {
          create: (categoryIds as string[] ?? []).map((id) => ({ categoryId: id })),
        },
      },
    })

    // Update partner fields via raw SQL to bypass potential stale Prisma client
    if (partnerName || partnerUrl) {
      const { createClient } = await import("@libsql/client")
      const db = createClient({
        url: process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
      await db.execute({
        sql: `UPDATE products SET partnerName = ?, partnerUrl = ? WHERE id = ?`,
        args: [partnerName || null, partnerUrl || null, product.id],
      })
    }

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath(`/products/${product.slug}`)
    return NextResponse.json(
      { ...product, partnerName: partnerName || null, partnerUrl: partnerUrl || null },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[POST products]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

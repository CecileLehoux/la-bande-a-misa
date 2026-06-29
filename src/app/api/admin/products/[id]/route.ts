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
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

    const { id } = await params
    const body = await req.json()
    const { images, categoryIds, categoryId: _legacy, partnerName, partnerUrl, ...data } = body

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

    // Update partner fields via raw SQL to bypass potential stale Prisma client
    if (partnerName !== undefined || partnerUrl !== undefined) {
      const { createClient } = await import("@libsql/client")
      const db = createClient({
        url: process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/dev.db`,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
      await db.execute({
        sql: `UPDATE products SET partnerName = ?, partnerUrl = ? WHERE id = ?`,
        args: [partnerName || null, partnerUrl || null, id],
      })
    }

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath(`/products/${product.slug}`)
    return NextResponse.json({ ...product, partnerName: partnerName || null, partnerUrl: partnerUrl || null })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[PATCH products/[id]]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } })
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })

    await prisma.product.delete({ where: { id } })

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath(`/products/${product.slug}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[DELETE products/[id]]", message)
    return NextResponse.json({ error: "Impossible de supprimer ce produit." }, { status: 500 })
  }
}

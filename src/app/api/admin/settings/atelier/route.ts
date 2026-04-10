import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const KEYS = ["atelier_overline", "atelier_title", "atelier_body", "atelier_image1", "atelier_image2", "atelier_footer"]

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const rows = await prisma.setting.findMany({ where: { key: { in: KEYS } } })
  const result = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return NextResponse.json(result)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await req.json()

  await Promise.all(
    KEYS.map((key) =>
      body[key] !== undefined
        ? prisma.setting.upsert({
            where: { key },
            update: { value: body[key] },
            create: { key, value: body[key] },
          })
        : Promise.resolve()
    )
  )

  revalidatePath("/latelier")

  return NextResponse.json({ success: true })
}

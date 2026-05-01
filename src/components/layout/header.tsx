import { prisma } from "@/lib/prisma"
import { HeaderClient } from "./header-client"

export async function Header() {
  const [categories, colorSetting] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.setting.findUnique({ where: { key: "header_stripe_color" } }),
  ])

  const stripeColor = colorSetting?.value ?? "#8ecaa0"

  return <HeaderClient categories={categories} stripeColor={stripeColor} />
}

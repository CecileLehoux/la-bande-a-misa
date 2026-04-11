import { prisma } from "@/lib/prisma"
import { HeaderClient } from "./header-client"

export async function Header() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  })
  return <HeaderClient categories={categories} />
}

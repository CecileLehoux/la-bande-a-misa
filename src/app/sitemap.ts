import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://labandeamisa.fr"

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1, changeFrequency: "weekly" },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/latelier`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${baseUrl}/livraison`, priority: 0.4, changeFrequency: "yearly" },
    { url: `${baseUrl}/cgv`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${baseUrl}/confidentialite`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${baseUrl}/mentions-legales`, priority: 0.3, changeFrequency: "yearly" },
  ]

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.8,
    changeFrequency: "weekly",
  }))

  return [...staticPages, ...productPages]
}

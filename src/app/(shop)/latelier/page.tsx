import Image from "next/image"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "L'atelier — La Bande à Misa",
  description:
    "Découvrez l'atelier de La Bande à Misa, ses créations cousues main et l'inspiratrice en chef : Lizzy la petite Cavalier King Charles.",
}

export default async function AtelierPage() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["atelier_overline", "atelier_title", "atelier_body", "atelier_image1", "atelier_image2", "atelier_footer"] } },
  })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  const overline = s.atelier_overline ?? "Dans les coulisses"
  const title    = s.atelier_title    ?? "L'atelier"
  const body     = s.atelier_body     ?? ""
  const image1   = s.atelier_image1   ?? "/latelier/IMG_8566.JPG"
  const image2   = s.atelier_image2   ?? "/latelier/IMG_8548.JPG"
  const footer   = s.atelier_footer   ?? "Chaque pièce est unique — cousue à la main avec soin"

  const paragraphs = body.split(/\n\n+/).filter(Boolean)

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* En-tête */}
        <p className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-4">
          {overline}
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)] mb-10 leading-tight">
          {title}
        </h1>

        {/* Photo + texte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--beige)]">
            <Image
              src={image1}
              alt={title}
              fill
              className="object-cover object-[50%_35%]"
              priority
            />
          </div>
          <div className="space-y-5 text-sm text-[var(--gray)] leading-relaxed">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        {/* Deuxième photo */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-[var(--beige)]">
          <Image
            src={image2}
            alt="Créations cousues main"
            fill
            className="object-cover"
          />
        </div>

        {/* Note bas de page */}
        <p className="mt-10 text-center text-[11px] tracking-widest uppercase text-[var(--gray)]">
          {footer}
        </p>
      </div>
    </div>
  )
}

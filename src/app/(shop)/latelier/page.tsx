import Image from "next/image"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "L'atelier — La Bande à Misa",
  description:
    "Découvrez l'atelier de La Bande à Misa, ses créations cousues main et l'inspiratrice en chef : Lizzy la petite Cavalier King Charles.",
}

export default async function AtelierPage() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["atelier_overline", "atelier_title", "atelier_body", "atelier_image1", "atelier_image2", "atelier_footer", "atelier_capsule_title", "atelier_capsule_text", "atelier_capsule_image"] } },
  })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  const overline = s.atelier_overline ?? "Dans les coulisses"
  const title    = s.atelier_title    ?? "L'atelier"
  const body     = s.atelier_body     ?? ""
  const image1   = s.atelier_image1   ?? "/latelier/IMG_8566.JPG"
  const image2   = s.atelier_image2   ?? "/latelier/IMG_8548.JPG"
  const footer   = s.atelier_footer   ?? "Chaque pièce est unique — cousue à la main avec soin"

  const capsuleTitle = s.atelier_capsule_title ?? "Capsule"
  const capsuleText  = s.atelier_capsule_text  ?? "Une nouvelle collection pensée avec soin, autour de matières douces et de couleurs intemporelles.\n\nChaque pièce est cousue à la main dans l'atelier, en série très limitée. Une façon de prendre le temps, de choisir ce qui dure."
  const capsuleImage = s.atelier_capsule_image ?? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"

  const paragraphs = body.split(/\n\n+/).filter(Boolean)
  const capsuleParagraphs = capsuleText.split(/\n\n+/).filter(Boolean)

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

        {/* Section Capsule */}
        <div className="mt-20 pt-16 border-t border-[var(--beige)]">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--dark)] mb-10 leading-tight">
            {capsuleTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Image capsule */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--beige)]">
              {capsuleImage ? (
                <Image
                  src={capsuleImage}
                  alt={capsuleTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--gray)] text-sm">
                  Photo à venir
                </div>
              )}
            </div>

            {/* Texte capsule */}
            <div className="space-y-5 text-sm text-[var(--gray)] leading-relaxed">
              {capsuleParagraphs.length > 0 ? (
                capsuleParagraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p className="italic opacity-50">Texte à venir…</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

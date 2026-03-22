import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "À propos — La Bande à Misa",
  description: "Découvrez l'histoire de La Bande à Misa, créations cousues main avec amour.",
}

export default function AProposPage() {
  return (
    <main className="bg-[var(--cream)]">

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-12 text-center sm:px-6">
        <p className="text-xs tracking-widest uppercase text-[var(--gray)] mb-4">Notre histoire</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--dark)] leading-tight mb-6">
          La Bande à Misa
        </h1>
        <p className="text-lg text-[var(--gray)] max-w-xl mx-auto leading-relaxed">
          Des créations cousues main, pensées avec soin et fabriquées avec amour, pour les petits et les grands.
        </p>
      </section>

      {/* Photo + texte */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden bg-[var(--beige)] aspect-square flex items-center justify-center">
            <Image
              src="/chien.png"
              alt="Mascotte La Bande à Misa"
              width={320}
              height={320}
              className="object-contain p-8"
            />
          </div>
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-[var(--dark)]">Une passion devenue boutique</h2>
            <p className="text-[var(--gray)] leading-relaxed">
              Tout a commencé avec une machine à coudre, beaucoup d'enthousiasme et une envie irrésistible de créer des objets du quotidien qui sortent de l'ordinaire.
            </p>
            <p className="text-[var(--gray)] leading-relaxed">
              La Bande à Misa, c'est une petite boutique artisanale où chaque pièce est fabriquée à la main, dans un atelier chaleureux. Chaussettes illustrées, cartes postales, badges, bandeaux... autant de créations imaginées pour apporter une touche de douceur et de fantaisie à votre quotidien.
            </p>
            <p className="text-[var(--gray)] leading-relaxed">
              Chaque commande est préparée avec le plus grand soin, emballée joliment et expédiée avec amour. Parce qu'un beau colis, ça fait partie du cadeau.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-[var(--beige)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl text-[var(--dark)] text-center mb-10">Ce qui nous tient à cœur</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: "✂️",
                title: "Fait main",
                desc: "Chaque pièce est cousue et assemblée à la main dans notre atelier. Pas de série, pas de chaîne — juste du soin.",
              },
              {
                emoji: "♻️",
                title: "Matières choisies",
                desc: "Nous sélectionnons des tissus de qualité, souvent recyclés ou sourcés localement, pour créer des objets durables.",
              },
              {
                emoji: "💌",
                title: "Emballage soigné",
                desc: "Chaque commande est emballée avec attention pour que l'ouverture du colis soit un moment de plaisir.",
              },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 text-center space-y-3">
                <span className="text-3xl">{v.emoji}</span>
                <h3 className="font-serif text-lg text-[var(--dark)]">{v.title}</h3>
                <p className="text-sm text-[var(--gray)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
        <h2 className="font-serif text-2xl text-[var(--dark)] mb-4">Envie de découvrir la collection ?</h2>
        <p className="text-[var(--gray)] mb-8">Des petites douceurs créées avec amour, pour vous ou pour offrir.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-[var(--dark)] px-8 py-3 text-sm font-medium text-white hover:bg-[var(--gray)] transition-colors"
          >
            Voir la boutique
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-[var(--dark)] px-8 py-3 text-sm font-medium text-[var(--dark)] hover:bg-[var(--beige)] transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </section>

    </main>
  )
}

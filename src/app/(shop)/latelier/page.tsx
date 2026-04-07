import Image from "next/image";

export const metadata = {
  title: "L'atelier — La Bande à Misa",
  description:
    "Découvrez l'atelier de La Bande à Misa, ses créations cousues main et l'inspiratrice en chef : Lizzy la petite Cavalier King Charles.",
};

export default function AtelierPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* En-tête */}
        <p className="text-[11px] tracking-widest uppercase text-[var(--gray)] mb-4">
          Dans les coulisses
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--dark)] mb-10 leading-tight">
          L'atelier
        </h1>

        {/* Photo + texte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--beige)]">
            <Image
              src="/latelier/IMG_8566.JPG"
              alt="L'atelier La Bande à Misa"
              fill
              className="object-cover object-[50%_35%]"
              priority
            />
          </div>
          <div className="space-y-5 text-sm text-[var(--gray)] leading-relaxed">
            <p>
              La Bande à Misa est un petit atelier où les tissus dansent et les
              idées fleurissent, inspirés par la vie, les saisons et les petites
              choses qui réchauffent le cœur.
            </p>
            <p>
              Dans un coin de l'atelier, Lizzy, une petite Cavalier King
              Charles, observe, regarde et inspire quelques idées... ou quelques
              sourires.
            </p>
            <p>
              Un travail fait main offrant des prix justes et accessibles. Des
              créations uniques... et tout simplement irrésistibles !
            </p>
          </div>
        </div>

        {/* Deuxième photo */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-[var(--beige)]">
          <Image
            src="/latelier/IMG_8548.JPG"
            alt="Créations cousues main"
            fill
            className="object-cover"
          />
        </div>

        {/* Note bas de page */}
        <p className="mt-10 text-center text-[11px] tracking-widest uppercase text-[var(--gray)]">
          Chaque pièce est unique — cousue à la main avec soin
        </p>
      </div>
    </div>
  );
}

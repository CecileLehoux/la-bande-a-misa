import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { email, token, password } = await req.json()

  if (!email || !token || !password) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
  }

  // Vérifier le token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier: email, token },
  })

  if (!verificationToken) {
    return NextResponse.json({ error: "Lien invalide ou déjà utilisé" }, { status: 400 })
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })
    return NextResponse.json({ error: "Ce lien a expiré, veuillez en demander un nouveau" }, { status: 400 })
  }

  // Mettre à jour le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  // Supprimer le token utilisé
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

  return NextResponse.json({ success: true })
}

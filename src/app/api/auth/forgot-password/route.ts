import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // On répond toujours OK pour ne pas révéler si l'email existe
  if (!user) {
    return NextResponse.json({ success: true })
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  // Générer un token sécurisé
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  await sendPasswordResetEmail({ to: email, resetUrl }).catch((err) =>
    console.error("Erreur email reset:", err)
  )

  return NextResponse.json({ success: true })
}

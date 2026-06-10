import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { Resend } from "resend"

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter } as any)
const resend = new Resend(process.env.RESEND_API_KEY)

const orderIds = [
  "cmomoi24c000104l5w50qiht3",
  "cmomodnso000204ksvj883bum",
]

async function main() {
  for (const orderId of orderIds) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, shippingAddress: true },
    })

    if (!order) {
      console.log(`❌ Commande ${orderId} introuvable`)
      continue
    }

    const itemsHtml = order.items.map((item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;">
          <strong>${item.name}</strong>${item.size ? `<br><span style="color:#888;font-size:13px;">Taille : ${item.size}</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;text-align:center;color:#666;">× ${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;text-align:right;font-weight:600;">${item.total.toFixed(2)} €</td>
      </tr>`).join("")

    const html = `
      <div style="max-width:600px;margin:40px auto;font-family:Georgia,serif;color:#2c2c2c;">
        <div style="background:#c4826a;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;font-weight:400;">LA BANDE À MISA</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Créations cousues main</p>
        </div>
        <div style="padding:40px;background:#fff;">
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;">Merci pour votre commande !</h2>
          <p style="margin:0 0 24px;color:#666;font-size:14px;">Commande n° <strong>${order.orderNumber}</strong></p>
          <p style="line-height:1.7;color:#444;">Bonjour,<br><br>Nous avons bien reçu votre commande et elle est en cours de préparation.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:24px;"><tbody>${itemsHtml}</tbody></table>
          <div style="margin-top:16px;">
            <table style="width:100%;">
              <tr><td style="color:#666;padding:4px 0;">Sous-total</td><td style="text-align:right;">${order.subtotal.toFixed(2)} €</td></tr>
              <tr><td style="color:#666;padding:4px 0;">Livraison</td><td style="text-align:right;">${order.shipping.toFixed(2)} €</td></tr>
              <tr><td style="font-weight:700;padding:12px 0 4px;">Total</td><td style="text-align:right;font-weight:700;">${order.total.toFixed(2)} €</td></tr>
            </table>
          </div>
          <p style="margin:32px 0 0;color:#666;font-size:14px;line-height:1.7;">
            Merci de votre confiance !<br><em>L'équipe La Bande à Misa</em>
          </p>
        </div>
        <div style="background:#faf8f5;padding:20px 40px;text-align:center;border-top:1px solid #f0ebe3;">
          <p style="margin:0;color:#aaa;font-size:12px;">La Bande à Misa — Créations cousues main</p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: "La Bande à Misa <commandes@labandeamisa.fr>",
      to: order.email,
      subject: `Confirmation de commande n° ${order.orderNumber}`,
      html,
    })

    console.log(`✅ Email envoyé à ${order.email} pour ${order.orderNumber}`)
  }

  console.log("✨ Emails envoyés !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

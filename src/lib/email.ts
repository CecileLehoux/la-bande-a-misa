import { Resend } from "resend"

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

type OrderItem = {
  name: string
  size?: string | null
  quantity: number
  price: number
  total: number
}

type SendOrderConfirmationParams = {
  to: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress?: {
    firstName: string
    lastName: string
    address1: string
    address2?: string | null
    postalCode: string
    city: string
  } | null
}

export async function sendOrderConfirmationEmail(params: SendOrderConfirmationParams) {
  const { to, orderNumber, items, subtotal, shipping, total, shippingAddress } = params

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0ebe3;">
          <span style="font-weight: 600;">${item.name}</span>
          ${item.size ? `<br><span style="color: #888; font-size: 13px;">Taille : ${item.size}</span>` : ""}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0ebe3; text-align: center; color: #666;">
          × ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0ebe3; text-align: right; font-weight: 600;">
          ${item.total.toFixed(2)} €
        </td>
      </tr>`
    )
    .join("")

  const addressHtml = shippingAddress
    ? `
      <p style="margin: 0; line-height: 1.6;">
        ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
        ${shippingAddress.address1}<br>
        ${shippingAddress.address2 ? shippingAddress.address2 + "<br>" : ""}
        ${shippingAddress.postalCode} ${shippingAddress.city}
      </p>`
    : ""

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: Georgia, serif; color: #2c2c2c;">
      <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 4px; overflow: hidden;">

        <!-- Header -->
        <div style="background-color: #c4826a; padding: 32px 40px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 24px; letter-spacing: 2px; font-weight: 400;">
            LA BANDE À MISA
          </h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; letter-spacing: 1px;">
            Créations cousues main
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 400;">Merci pour votre commande !</h2>
          <p style="margin: 0 0 24px; color: #666; font-size: 14px;">
            Commande n° <strong>${orderNumber}</strong>
          </p>

          <p style="margin: 0 0 24px; line-height: 1.7; color: #444;">
            Bonjour,<br><br>
            Nous avons bien reçu votre commande et elle est en cours de préparation.
            Vous recevrez un email dès qu'elle sera expédiée.
          </p>

          <!-- Articles -->
          <h3 style="margin: 0 0 16px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; color: #888; font-weight: 400;">
            Votre commande
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totaux -->
          <div style="margin-top: 20px; padding-top: 16px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #666; padding: 4px 0;">Sous-total</td>
                <td style="text-align: right; padding: 4px 0;">${subtotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 4px 0;">Frais de port</td>
                <td style="text-align: right; padding: 4px 0;">${shipping.toFixed(2)} €</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 4px; font-weight: 700; font-size: 16px;">Total</td>
                <td style="text-align: right; padding: 12px 0 4px; font-weight: 700; font-size: 16px;">${total.toFixed(2)} €</td>
              </tr>
            </table>
          </div>

          ${
            shippingAddress
              ? `
          <!-- Adresse -->
          <div style="margin-top: 32px; padding: 20px; background: #faf8f5; border-radius: 4px;">
            <h3 style="margin: 0 0 12px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #888; font-weight: 400;">
              Adresse de livraison
            </h3>
            ${addressHtml}
          </div>`
              : ""
          }

          <p style="margin: 32px 0 0; line-height: 1.7; color: #666; font-size: 14px;">
            Des questions ? Répondez à cet email ou contactez-nous sur notre site.<br>
            Merci de votre confiance !<br><br>
            <em>L'équipe La Bande à Misa</em>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #faf8f5; padding: 20px 40px; text-align: center; border-top: 1px solid #f0ebe3;">
          <p style="margin: 0; color: #aaa; font-size: 12px;">
            La Bande à Misa — Créations cousues main
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  const { data, error } = await getResend().emails.send({
    from: "La Bande à Misa <commandes@labandeamisa.fr>",
    to,
    subject: `Confirmation de commande n° ${orderNumber}`,
    html,
  })

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }

  console.log("Resend email sent:", data)
}

type SendOrderNotificationParams = {
  orderNumber: string
  customerEmail: string
  items: OrderItem[]
  total: number
  shippingAddress?: {
    firstName: string
    lastName: string
    address1: string
    city: string
    postalCode: string
  } | null
}

export async function sendOrderNotificationEmail(params: SendOrderNotificationParams) {
  const { orderNumber, customerEmail, items, total, shippingAddress } = params

  const itemsText = items
    .map((item) => `- ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} — ${item.total.toFixed(2)} €`)
    .join("\n")

  const addressText = shippingAddress
    ? `${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.address1}, ${shippingAddress.postalCode} ${shippingAddress.city}`
    : "Non renseignée"

  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #2c2c2c;">
      <h2 style="margin: 0 0 16px; color: #c4826a;">🛍️ Nouvelle commande n° ${orderNumber}</h2>
      <p style="margin: 0 0 8px;"><strong>Client :</strong> ${customerEmail}</p>
      <p style="margin: 0 0 8px;"><strong>Livraison :</strong> ${addressText}</p>
      <p style="margin: 0 0 16px;"><strong>Total :</strong> ${total.toFixed(2)} €</p>
      <pre style="background: #faf8f5; padding: 16px; border-radius: 4px; font-size: 13px; line-height: 1.6;">${itemsText}</pre>
      <p style="margin: 16px 0 0; font-size: 12px; color: #888;">
        Retrouve la commande dans ton <a href="https://la-bande-a-misa.vercel.app/admin/orders" style="color: #c4826a;">espace admin</a>.
      </p>
    </div>
  `

  await getResend().emails.send({
    from: "La Bande à Misa <commandes@labandeamisa.fr>",
    to: "isamandra@icloud.com",
    subject: `🛍️ Nouvelle commande n° ${orderNumber} — ${total.toFixed(2)} €`,
    html,
  })
}

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#faf8f5;font-family:Georgia,serif;color:#2c2c2c;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:4px;overflow:hidden;">
    <div style="background-color:#c4826a;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;font-weight:400;">LA BANDE À MISA</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;">Créations cousues main</p>
    </div>
    <div style="padding:40px;">${content}</div>
    <div style="background:#faf8f5;padding:20px 40px;text-align:center;border-top:1px solid #f0ebe3;">
      <p style="margin:0;color:#aaa;font-size:12px;">La Bande à Misa — Créations cousues main</p>
    </div>
  </div>
</body>
</html>`

async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await getResend().emails.send({
    from: "La Bande à Misa <commandes@labandeamisa.fr>",
    to,
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
  console.log("Resend email sent:", data)
}

export async function sendOrderShippedEmail({
  to,
  orderNumber,
  trackingNumber,
}: {
  to: string
  orderNumber: string
  trackingNumber?: string | null
}) {
  const trackingHtml = trackingNumber
    ? `<div style="margin-top:24px;padding:16px 20px;background:#faf8f5;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Numéro de suivi</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:#2c2c2c;">${trackingNumber}</p>
      </div>`
    : ""

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;">Votre commande est en route !</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Commande n° <strong>${orderNumber}</strong></p>
    <p style="line-height:1.7;color:#444;">
      Bonjour,<br><br>
      Bonne nouvelle — votre commande vient d'être expédiée ! Vous la recevrez dans les prochains jours.
    </p>
    ${trackingHtml}
    <p style="margin-top:32px;line-height:1.7;color:#666;font-size:14px;">
      Des questions ? Répondez à cet email ou contactez-nous sur notre site.<br><br>
      <em>L'équipe La Bande à Misa</em>
    </p>
  `)

  await sendEmail(to, `Votre commande n° ${orderNumber} a été expédiée`, html)
}

export async function sendOrderCancelledEmail({
  to,
  orderNumber,
}: {
  to: string
  orderNumber: string
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;">Votre commande a été annulée</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Commande n° <strong>${orderNumber}</strong></p>
    <p style="line-height:1.7;color:#444;">
      Bonjour,<br><br>
      Votre commande a bien été annulée. Si vous avez été débité(e), le remboursement sera effectué sous 5 à 10 jours ouvrés selon votre banque.
    </p>
    <p style="margin-top:32px;line-height:1.7;color:#666;font-size:14px;">
      Pour toute question, répondez à cet email ou contactez-nous sur notre site.<br><br>
      <em>L'équipe La Bande à Misa</em>
    </p>
  `)

  await sendEmail(to, `Votre commande n° ${orderNumber} a été annulée`, html)
}

export async function sendOrderDeliveredEmail({
  to,
  orderNumber,
}: {
  to: string
  orderNumber: string
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;">Votre commande est arrivée !</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Commande n° <strong>${orderNumber}</strong></p>
    <p style="line-height:1.7;color:#444;">
      Bonjour,<br><br>
      Nous espérons que votre commande vous plaît ! Si vous avez un moment, votre avis nous aiderait beaucoup à faire connaître nos créations.
    </p>
    <p style="margin-top:32px;line-height:1.7;color:#666;font-size:14px;">
      Merci pour votre confiance et à bientôt !<br><br>
      <em>L'équipe La Bande à Misa</em>
    </p>
  `)

  await sendEmail(to, `Votre commande n° ${orderNumber} a été livrée — donnez votre avis !`, html)
}

export async function sendOrderRefundedEmail({
  to,
  orderNumber,
  total,
}: {
  to: string
  orderNumber: string
  total: number
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;">Votre remboursement est en cours</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Commande n° <strong>${orderNumber}</strong></p>
    <p style="line-height:1.7;color:#444;">
      Bonjour,<br><br>
      Nous avons procédé au remboursement intégral de votre commande d'un montant de <strong>${total.toFixed(2)} €</strong>.<br><br>
      Le remboursement sera crédité sur votre moyen de paiement initial sous <strong>5 à 10 jours ouvrés</strong> selon votre banque.
    </p>
    <p style="margin-top:32px;line-height:1.7;color:#666;font-size:14px;">
      Nous nous excusons pour la gêne occasionnée et espérons vous retrouver bientôt.<br><br>
      <em>L'équipe La Bande à Misa</em>
    </p>
  `)

  await sendEmail(to, `Remboursement de votre commande n° ${orderNumber}`, html)
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;">Réinitialisation de votre mot de passe</h2>
    <p style="line-height:1.7;color:#444;margin:0 0 24px;">
      Bonjour,<br><br>
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#c4826a;color:#fff;padding:14px 32px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="line-height:1.7;color:#666;font-size:13px;margin:0 0 8px;">
      Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
    </p>
    <p style="margin-top:32px;line-height:1.7;color:#666;font-size:14px;">
      <em>L'équipe La Bande à Misa</em>
    </p>
  `)

  await sendEmail(to, "Réinitialisation de votre mot de passe — La Bande à Misa", html)
}

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
            Accessoires cousus main pour chiens
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
            La Bande à Misa — Accessoires cousus main pour chiens
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  await getResend().emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `Confirmation de commande n° ${orderNumber}`,
    html,
  })
}

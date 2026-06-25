import { Resend } from "resend"

type ContactData = {
  name: string
  email: string
  message: string
  ownerEmail: string
  ownerName: string | null
}

export async function sendContactNotification(data: ContactData) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return

  const resend = new Resend(resendApiKey)

  try {
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: data.ownerEmail,
      subject: `Nuovo messaggio da ${data.name}`,
      html: `
        <h2>Nuovo messaggio dal portfolio</h2>
        <p><strong>Da:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <hr />
        <p>${data.message.replace(/\n/g, "<br>")}</p>
        <hr />
        <p style="color:#888;font-size:12px;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages">Vedi tutti i messaggi</a></p>
      `,
    })
  } catch {
    // Silently fail — the message is already saved in the DB
  }
}

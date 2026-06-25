"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contactSchema, type ContactState } from "@/lib/contact"
import { sendContactNotification } from "@/lib/email/notify-contact"

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    token: formData.get("cf-turnstile-response"),
  }

  const parsed = contactSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { name, email, message } = parsed.data

  try {
    const user = await prisma.user.findFirst()
    if (!user) {
      return { message: "Errore interno. Riprova più tardi.", success: false }
    }

    await prisma.contactMessage.create({
      data: {
        userId: user.id,
        name,
        email,
        message,
      },
    })

    await sendContactNotification({
      name,
      email,
      message,
      ownerEmail: user.email ?? "",
      ownerName: user.name,
    })

    revalidatePath("/dashboard/messages")
    return { message: "Messaggio inviato con successo! Ti risponderò al più presto.", success: true }
  } catch {
    return { message: "Errore durante l'invio. Riprova più tardi.", success: false }
  }
}

export async function markAsRead(id: string, read: boolean) {
  const { auth } = await import("@/auth")
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.contactMessage.updateMany({
    where: { id, userId: session.user.id },
    data: { read },
  })
}

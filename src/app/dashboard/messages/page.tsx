import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MessagesList } from "./messages-list"

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const messages = await prisma.contactMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      read: true,
      createdAt: true,
    },
  })

  const items = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messaggi</h1>
        <p className="text-muted-foreground">
          Storico dei messaggi ricevuti dal form contatti.
        </p>
      </div>
      <MessagesList items={items} />
    </div>
  )
}

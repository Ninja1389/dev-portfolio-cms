import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return <p className="text-muted-foreground">Devi effettuare l&apos;accesso.</p>
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Informazioni account</h2>
        <p className="text-sm text-muted-foreground">
          Email e dettagli del tuo account.
        </p>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Email</span>
          <span className="text-sm text-muted-foreground">{user?.email ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Membro dal</span>
          <span className="text-sm text-muted-foreground">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("it-IT")
              : "—"}
          </span>
        </div>
      </div>
    </div>
  )
}

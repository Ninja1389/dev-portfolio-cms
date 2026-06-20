import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOutAction } from "@/lib/actions/auth"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }}
      signOutAction={signOutAction}
    >
      {children}
    </DashboardShell>
  )
}

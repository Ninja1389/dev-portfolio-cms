import type { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { signOutAction } from "@/lib/actions/auth"
import { DashboardShell } from "./dashboard-shell"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { title: "Dashboard" }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { brandName: true, name: true },
    })
    const name = user?.brandName || user?.name
    return { title: name ? `${name} — Dashboard` : "Dashboard" }
  } catch {
    return { title: "Dashboard" }
  }
}

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

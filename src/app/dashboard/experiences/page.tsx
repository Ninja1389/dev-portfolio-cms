import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExperiencesList } from "./experiences-list"

export default async function ExperiencesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const experiences = await prisma.experience.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      role: true,
      company: true,
      startDate: true,
      endDate: true,
      current: true,
      order: true,
    },
  })

  const items = experiences.map((e) => ({
    id: e.id,
    role: e.role,
    company: e.company,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
    current: e.current,
    order: e.order,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Esperienze</h1>
          <p className="text-muted-foreground">
            Gestisci le tue esperienze lavorative.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/experiences/new">
            <Plus className="mr-1 h-4 w-4" />
            Nuova esperienza
          </Link>
        </Button>
      </div>

      <ExperiencesList items={items} />
    </div>
  )
}

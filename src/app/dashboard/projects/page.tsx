import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectsList } from "./projects-list"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      featured: true,
      published: true,
      order: true,
      createdAt: true,
    },
  })

  const items = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    featured: p.featured,
    published: p.published,
    order: p.order,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progetti</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi progetti pubblici.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-1 h-4 w-4" />
            Nuovo progetto
          </Link>
        </Button>
      </div>

      <ProjectsList items={items} />
    </div>
  )
}

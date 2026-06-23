import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SkillCategory } from "@/generated/prisma/client"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SkillsList } from "./skills-list"

export default async function SkillsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const skills = await prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      level: true,
      order: true,
    },
  })

  const items = skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    level: s.level,
    order: s.order,
  }))

  const categories = Object.values(SkillCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">
            Gestisci le tue competenze tecniche.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/skills/new">
            <Plus className="mr-1 h-4 w-4" />
            Nuova skill
          </Link>
        </Button>
      </div>

      <SkillsList items={items} categories={categories} />
    </div>
  )
}

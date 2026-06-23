import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { updateSkill } from "@/lib/actions/skills"
import { SkillForm } from "../../skill-form"

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const skill = await prisma.skill.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!skill) notFound()

  const formData = {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifica skill</h1>
        <p className="text-muted-foreground">Modifica "{skill.name}".</p>
      </div>

      <SkillForm skill={formData} action={updateSkill} />
    </div>
  )
}

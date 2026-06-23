import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { updateExperience } from "@/lib/actions/experiences"
import { ExperienceForm } from "../../experience-form"

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const experience = await prisma.experience.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!experience) notFound()

  const formData = {
    id: experience.id,
    role: experience.role,
    company: experience.company,
    startDate: experience.startDate.toISOString().split("T")[0],
    endDate: experience.endDate
      ? experience.endDate.toISOString().split("T")[0]
      : "",
    current: experience.current,
    description: experience.description ?? "",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifica esperienza
        </h1>
        <p className="text-muted-foreground">
          Modifica "{experience.role}" presso {experience.company}.
        </p>
      </div>

      <ExperienceForm experience={formData} action={updateExperience} />
    </div>
  )
}

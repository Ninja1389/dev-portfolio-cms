import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { updateProject } from "@/lib/actions/projects"
import { ProjectForm } from "../../project-form"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!project) notFound()

  const formData = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description ?? "",
    repoUrl: project.repoUrl ?? "",
    demoUrl: project.demoUrl ?? "",
    imageUrl: project.imageUrl ?? "",
    imageKey: project.imageKey ?? "",
    featured: project.featured,
    published: project.published,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifica progetto
        </h1>
        <p className="text-muted-foreground">
          Modifica "{project.title}".
        </p>
      </div>

      <ProjectForm
        project={formData}
        action={updateProject}
        actionName="update"
      />
    </div>
  )
}

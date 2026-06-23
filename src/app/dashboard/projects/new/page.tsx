import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createProject } from "@/lib/actions/projects"
import { ProjectForm } from "../project-form"

export default async function NewProjectPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuovo progetto</h1>
        <p className="text-muted-foreground">
          Crea un nuovo progetto per il tuo portfolio.
        </p>
      </div>

      <ProjectForm action={createProject} actionName="create" />
    </div>
  )
}

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createExperience } from "@/lib/actions/experiences"
import { ExperienceForm } from "../experience-form"

export default async function NewExperiencePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuova esperienza</h1>
        <p className="text-muted-foreground">
          Aggiungi una nuova esperienza lavorativa.
        </p>
      </div>

      <ExperienceForm action={createExperience} />
    </div>
  )
}

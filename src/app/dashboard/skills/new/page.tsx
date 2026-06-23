import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createSkill } from "@/lib/actions/skills"
import { SkillForm } from "../skill-form"

export default async function NewSkillPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuova skill</h1>
        <p className="text-muted-foreground">
          Aggiungi una nuova competenza tecnica.
        </p>
      </div>

      <SkillForm action={createSkill} />
    </div>
  )
}

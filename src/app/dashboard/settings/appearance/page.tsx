import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AppearanceForm } from "./appearance-form"

const defaultSections = [
  { id: "hero", label: "Hero", visible: true, order: 0 },
  { id: "projects", label: "Progetti in evidenza", visible: true, order: 1 },
  { id: "experiences", label: "Esperienze recenti", visible: true, order: 2 },
  { id: "skills", label: "Competenze", visible: true, order: 3 },
]

export type SectionItem = { id: string; label: string; visible: boolean; order: number }

export default async function AppearancePage() {
  const session = await auth()
  if (!session?.user?.id) {
    return <p className="text-muted-foreground">Devi effettuare l&apos;accesso.</p>
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { themeMode: true, accentColor: true, sectionsConfig: true, brandName: true },
  })

  const sections: SectionItem[] = Array.isArray(user?.sectionsConfig)
    ? (user.sectionsConfig as SectionItem[])
    : [...defaultSections]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aspetto</h1>
        <p className="text-muted-foreground">
          Personalizza l&apos;aspetto del tuo portfolio pubblico.
        </p>
      </div>

      <AppearanceForm
        themeMode={user?.themeMode ?? "system"}
        accentColor={user?.accentColor ?? ""}
        brandName={user?.brandName ?? ""}
        sections={sections}
      />
    </div>
  )
}

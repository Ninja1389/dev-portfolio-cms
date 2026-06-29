"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type SectionConfig = {
  id: string
  label: string
  visible: boolean
  order: number
}

export type AppearanceState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export async function updateAppearance(
  _prev: AppearanceState,
  formData: FormData,
): Promise<AppearanceState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const themeMode = formData.get("themeMode") as string
  const accentColor = formData.get("accentColor") as string
  const brandName = formData.get("brandName") as string

  const sectionsRaw = formData.get("sectionsConfig") as string
  let sectionsConfig: SectionConfig[] | undefined
  try {
    sectionsConfig = sectionsRaw ? JSON.parse(sectionsRaw) : undefined
  } catch {
    return { message: "Configurazione sezioni non valida", success: false }
  }

  if (!["light", "dark", "system"].includes(themeMode)) {
    return { message: "Tema non valido", success: false }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      themeMode,
      accentColor: accentColor || null,
      brandName: brandName || null,
      sectionsConfig: sectionsConfig ?? undefined,
    },
  })

  revalidatePath("/dashboard/settings/appearance")
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/projects")
  revalidatePath("/contact")
  return { message: "Impostazioni salvate", success: true }
}

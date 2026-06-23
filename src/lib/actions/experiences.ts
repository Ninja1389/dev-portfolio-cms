"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { experienceSchema, type ExperienceState } from "@/lib/experiences"

export async function createExperience(
  _prev: ExperienceState,
  formData: FormData,
): Promise<ExperienceState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const rawData = {
    role: formData.get("role"),
    company: formData.get("company"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    current: formData.get("current") === "true",
    description: formData.get("description"),
  }

  const parsed = experienceSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { role, company, startDate, endDate, current, description } = parsed.data

  const maxOrder = await prisma.experience.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  })

  await prisma.experience.create({
    data: {
      userId: session.user.id,
      role,
      company,
      startDate: new Date(startDate),
      endDate: current ? null : endDate ? new Date(endDate) : null,
      current,
      description: description || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  revalidatePath("/dashboard/experiences")
  return { message: "Esperienza creata con successo", success: true }
}

export async function updateExperience(
  _prev: ExperienceState,
  formData: FormData,
): Promise<ExperienceState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { message: "ID esperienza mancante", success: false }
  }

  const rawData = {
    role: formData.get("role"),
    company: formData.get("company"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    current: formData.get("current") === "true",
    description: formData.get("description"),
  }

  const parsed = experienceSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { role, company, startDate, endDate, current, description } = parsed.data

  const existing = await prisma.experience.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return { message: "Esperienza non trovata", success: false }
  }

  await prisma.experience.update({
    where: { id },
    data: {
      role,
      company,
      startDate: new Date(startDate),
      endDate: current ? null : endDate ? new Date(endDate) : null,
      current,
      description: description || null,
    },
  })

  revalidatePath("/dashboard/experiences")
  return { message: "Esperienza aggiornata con successo", success: true }
}

export async function deleteExperience(id: string): Promise<ExperienceState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const experience = await prisma.experience.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!experience) {
    return { message: "Esperienza non trovata", success: false }
  }

  await prisma.experience.delete({ where: { id } })

  revalidatePath("/dashboard/experiences")
  return { message: "Esperienza eliminata con successo", success: true }
}

export async function reorderExperiences(
  items: { id: string; order: number }[],
): Promise<ExperienceState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const userId = session.user.id

  await Promise.all(
    items.map((item) =>
      prisma.experience.updateMany({
        where: { id: item.id, userId },
        data: { order: item.order },
      }),
    ),
  )

  revalidatePath("/dashboard/experiences")
  return { message: "Ordine aggiornato", success: true }
}

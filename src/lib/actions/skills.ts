"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { skillSchema, type SkillState } from "@/lib/skills"

export async function createSkill(
  _prev: SkillState,
  formData: FormData,
): Promise<SkillState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const rawData = {
    name: formData.get("name"),
    category: formData.get("category"),
    level: formData.get("level"),
  }

  const parsed = skillSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { name, category, level } = parsed.data

  const maxOrder = await prisma.skill.aggregate({
    where: { userId: session.user.id, category },
    _max: { order: true },
  })

  await prisma.skill.create({
    data: {
      userId: session.user.id,
      name,
      category,
      level,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  revalidatePath("/dashboard/skills")
  return { message: "Skill creata con successo", success: true }
}

export async function updateSkill(
  _prev: SkillState,
  formData: FormData,
): Promise<SkillState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { message: "ID skill mancante", success: false }
  }

  const rawData = {
    name: formData.get("name"),
    category: formData.get("category"),
    level: formData.get("level"),
  }

  const parsed = skillSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { name, category, level } = parsed.data

  const existing = await prisma.skill.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return { message: "Skill non trovata", success: false }
  }

  await prisma.skill.update({
    where: { id },
    data: { name, category, level },
  })

  revalidatePath("/dashboard/skills")
  return { message: "Skill aggiornata con successo", success: true }
}

export async function deleteSkill(id: string): Promise<SkillState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const skill = await prisma.skill.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!skill) {
    return { message: "Skill non trovata", success: false }
  }

  await prisma.skill.delete({ where: { id } })

  revalidatePath("/dashboard/skills")
  return { message: "Skill eliminata con successo", success: true }
}

export async function reorderSkills(
  items: { id: string; order: number }[],
): Promise<SkillState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const userId = session.user.id

  await Promise.all(
    items.map((item) =>
      prisma.skill.updateMany({
        where: { id: item.id, userId },
        data: { order: item.order },
      }),
    ),
  )

  revalidatePath("/dashboard/skills")
  return { message: "Ordine aggiornato", success: true }
}

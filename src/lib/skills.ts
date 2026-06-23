import { z } from "zod"

export const skillCategoryEnum = z.enum([
  "FRONTEND",
  "BACKEND",
  "DEVOPS",
  "DESIGN",
  "OTHER",
])

export const skillSchema = z.object({
  name: z.string().min(1, "Nome skill richiesto"),
  category: skillCategoryEnum,
  level: z.coerce.number().int().min(1).max(5),
})

export type SkillState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export type SkillFormData = {
  id: string
  name: string
  category: string
  level: number
}

export const CATEGORY_LABELS: Record<string, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DEVOPS: "DevOps",
  DESIGN: "Design",
  OTHER: "Altro",
}

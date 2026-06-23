import { z } from "zod"

export const experienceSchema = z.object({
  role: z.string().min(2, "Ruolo richiesto (almeno 2 caratteri)"),
  company: z.string().min(2, "Azienda richiesta (almeno 2 caratteri)"),
  startDate: z.string().min(1, "Data inizio richiesta"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean(),
  description: z.string().optional().or(z.literal("")),
})

export type ExperienceState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export type ExperienceFormData = {
  id: string
  role: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

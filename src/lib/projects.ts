import { z } from "zod"

export const projectSchema = z.object({
  title: z.string().min(2, "Titolo richiesto (almeno 2 caratteri)"),
  slug: z
    .string()
    .min(2, "Slug richiesto")
    .regex(/^[a-z0-9-]+$/, "Solo lettere minuscole, numeri e trattini"),
  description: z.string().optional().or(z.literal("")),
  repoUrl: z.string().url("Inserisci un URL valido").optional().or(z.literal("")),
  demoUrl: z.string().url("Inserisci un URL valido").optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  imageKey: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
})

export type ProjectState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export type ProjectFormData = {
  id: string
  title: string
  slug: string
  description: string
  repoUrl: string
  demoUrl: string
  imageUrl: string
  imageKey: string
  featured: boolean
  published: boolean
}

import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(2, "Titolo richiesto (almeno 2 caratteri)"),
  slug: z
    .string()
    .min(2, "Slug richiesto")
    .regex(/^[a-z0-9-]+$/, "Solo lettere minuscole, numeri e trattini"),
  excerpt: z.string().optional().or(z.literal("")),
  content: z.string().min(1, "Contenuto richiesto"),
  imageUrl: z.string().optional().or(z.literal("")),
  imageKey: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "scheduled"]),
  publishedAt: z.string().optional().or(z.literal("")),
})

export type PostState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export type PostFormData = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string
  imageKey: string
  status: "draft" | "published" | "scheduled"
  publishedAt: string
}

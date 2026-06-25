import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Nome richiesto (almeno 2 caratteri)"),
  email: z.string().email("Email non valida"),
  message: z.string().min(10, "Messaggio troppo breve (almeno 10 caratteri)").max(5000, "Messaggio troppo lungo (massimo 5000 caratteri)"),
  token: z.string().nullish(),
})

export type ContactState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

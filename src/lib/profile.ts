import { z } from "zod"

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Inserisci la piattaforma"),
  url: z.string().url("Inserisci un URL valido"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Nome richiesto (almeno 2 caratteri)"),
  title: z.string().optional().or(z.literal("")),
  email: z.string().email("Inserisci un'email valida"),
  location: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  heroHeadline: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  avatarKey: z.string().optional().or(z.literal("")),
  socialLinks: z.array(socialLinkSchema).optional(),
})

export type ProfileState = {
  errors?: {
    name?: string[]
    title?: string[]
    email?: string[]
    location?: string[]
    bio?: string[]
    heroHeadline?: string[]
    avatarUrl?: string[]
    avatarKey?: string[]
    socialLinks?: string[]
  }
  message?: string
  success?: boolean
} | undefined

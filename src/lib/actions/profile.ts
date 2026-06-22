"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

const socialLinkSchema = z.object({
  platform: z.string().min(1, "Inserisci la piattaforma"),
  url: z.string().url("Inserisci un URL valido"),
})

const profileSchema = z.object({
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

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const rawSocialLinks = formData.get("socialLinks")
  let socialLinks: { platform: string; url: string }[] | undefined

  if (rawSocialLinks && typeof rawSocialLinks === "string") {
    try {
      socialLinks = JSON.parse(rawSocialLinks)
    } catch {
      return { errors: { socialLinks: ["Formato social links non valido"] } }
    }
  }

  const data = {
    name: formData.get("name"),
    title: formData.get("title"),
    email: formData.get("email"),
    location: formData.get("location"),
    bio: formData.get("bio"),
    heroHeadline: formData.get("heroHeadline"),
    avatarUrl: formData.get("avatarUrl"),
    avatarKey: formData.get("avatarKey"),
    socialLinks,
  }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { socialLinks: parsedSocialLinks, ...fields } = parsed.data

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...fields,
      title: fields.title || null,
      location: fields.location || null,
      bio: fields.bio || null,
      heroHeadline: fields.heroHeadline || null,
      avatarUrl: fields.avatarUrl || null,
      avatarKey: fields.avatarKey || null,
      socialLinks: parsedSocialLinks && parsedSocialLinks.length > 0
        ? parsedSocialLinks
        : Prisma.NullableJsonNullValueInput.DbNull,
    },
  })

  revalidatePath("/dashboard/profile")
  return { message: "Profilo aggiornato con successo", success: true }
}

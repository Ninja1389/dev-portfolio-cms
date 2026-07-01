"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"

const registerSchema = z.object({
  name: z.string().min(2, "Nome richiesto (almeno 2 caratteri)"),
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(8, "Password: almeno 8 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
})

export type RegisterState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
  message?: string
} | undefined

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { message: "Email già registrata" }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  })

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" })
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Errore durante l'accesso automatico" }
    }
    throw error
  }
  return undefined
}

const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "Inserisci la password"),
})

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string
} | undefined

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}

export async function signInWithGithub() {
  await signIn("github", { redirectTo: "/dashboard" })
}

export async function connectGithub() {
  await signIn("github", { redirectTo: "/dashboard/integrations/github" })
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { email, password } = parsed.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Credenziali non valide" }
    }
    throw error
  }
  return undefined
}

const resetRequestSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
})

export type ResetRequestState = {
  message?: string
} | undefined

export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = resetRequestSchema.safeParse({
    email: formData.get("email"),
  })
  if (!parsed.success) {
    return { message: "Inserisci un'email valida" }
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { message: "Se l'email è registrata, riceverai un link per il reset." }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  })

  const { Resend } = await import("resend")
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    const resend = new Resend(resendApiKey)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`
    try {
      await resend.emails.send({
        from: "Portfolio <onboarding@resend.dev>",
        to: email,
        subject: "Reset della password",
        html: `
          <h2>Reset della password</h2>
          <p>Clicca il link per reimpostare la password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Link valido 1 ora.</p>
          <p>Se non hai richiesto tu il reset, ignora questa email.</p>
        `,
      })
    } catch {
      // Email fallito silenziosamente
    }
  }

  return { message: "Se l'email è registrata, riceverai un link per il reset." }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password: almeno 8 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
})

export type ResetPasswordState = {
  errors?: {
    password?: string[]
    confirmPassword?: string[]
  }
  message?: string
} | undefined

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { token, password } = parsed.data

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { message: "Token non valido o scaduto" }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { hashedPassword },
  })

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  })

  return { message: "Password aggiornata con successo. Ora puoi accedere." }
}

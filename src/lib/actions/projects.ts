"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { projectSchema, type ProjectState } from "@/lib/projects"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function createProject(
  _prev: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    repoUrl: formData.get("repoUrl"),
    demoUrl: formData.get("demoUrl"),
    imageUrl: formData.get("imageUrl"),
    imageKey: formData.get("imageKey"),
    featured: formData.get("featured") === "true",
    published: formData.get("published") === "true",
  }

  const parsed = projectSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { title, slug, description, repoUrl, demoUrl, imageUrl, imageKey, featured, published } = parsed.data

  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    return {
      errors: { slug: ["Questo slug è già utilizzato"] },
      success: false,
    }
  }

  const maxOrder = await prisma.project.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  })

  await prisma.project.create({
    data: {
      userId: session.user.id,
      title,
      slug,
      description: description || null,
      repoUrl: repoUrl || null,
      demoUrl: demoUrl || null,
      imageUrl: imageUrl || null,
      imageKey: imageKey || null,
      featured,
      published,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  revalidatePath("/dashboard/projects")
  return { message: "Progetto creato con successo", success: true }
}

export async function updateProject(
  _prev: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { message: "ID progetto mancante", success: false }
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    repoUrl: formData.get("repoUrl"),
    demoUrl: formData.get("demoUrl"),
    imageUrl: formData.get("imageUrl"),
    imageKey: formData.get("imageKey"),
    featured: formData.get("featured") === "true",
    published: formData.get("published") === "true",
  }

  const parsed = projectSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { title, slug, description, repoUrl, demoUrl, imageUrl, imageKey, featured, published } = parsed.data

  const existing = await prisma.project.findFirst({
    where: { slug, id: { not: id } },
  })
  if (existing) {
    return {
      errors: { slug: ["Questo slug è già utilizzato"] },
      success: false,
    }
  }

  await prisma.project.update({
    where: { id },
    data: {
      title,
      slug,
      description: description || null,
      repoUrl: repoUrl || null,
      demoUrl: demoUrl || null,
      imageUrl: imageUrl || null,
      imageKey: imageKey || null,
      featured,
      published,
    },
  })

  revalidatePath("/dashboard/projects")
  return { message: "Progetto aggiornato con successo", success: true }
}

export async function deleteProject(id: string): Promise<ProjectState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!project) {
    return { message: "Progetto non trovato", success: false }
  }

  await prisma.project.delete({ where: { id } })

  revalidatePath("/dashboard/projects")
  return { message: "Progetto eliminato con successo", success: true }
}

export async function toggleProjectFeatured(id: string): Promise<ProjectState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!project) {
    return { message: "Progetto non trovato", success: false }
  }

  await prisma.project.update({
    where: { id },
    data: { featured: !project.featured },
  })

  revalidatePath("/dashboard/projects")
  return { message: "Progetto aggiornato", success: true }
}

export async function toggleProjectPublished(id: string): Promise<ProjectState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!project) {
    return { message: "Progetto non trovato", success: false }
  }

  await prisma.project.update({
    where: { id },
    data: { published: !project.published },
  })

  revalidatePath("/dashboard/projects")
  return { message: "Progetto aggiornato", success: true }
}

export async function reorderProjects(
  items: { id: string; order: number }[],
): Promise<ProjectState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const userId = session.user.id

  await Promise.all(
    items.map((item) =>
      prisma.project.updateMany({
        where: { id: item.id, userId },
        data: { order: item.order },
      }),
    ),
  )

  revalidatePath("/dashboard/projects")
  return { message: "Ordine aggiornato", success: true }
}

export async function generateSlug(title: string): Promise<string> {
  let slug = slugify(title)
  if (!slug) slug = "progetto"

  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    const suffix = Math.random().toString(36).substring(2, 6)
    slug = `${slug}-${suffix}`
  }

  return slug
}



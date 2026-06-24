"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { postSchema, type PostState } from "@/lib/posts"

export async function createPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl"),
    imageKey: formData.get("imageKey"),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt"),
  }

  const parsed = postSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { title, slug, excerpt, content, imageUrl, imageKey, status, publishedAt } = parsed.data

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    return {
      errors: { slug: ["Questo slug è già utilizzato"] },
      success: false,
    }
  }

  const now = new Date()
  const isPublished = status === "published"
  const isScheduled = status === "scheduled"
  const publishDate = isScheduled && publishedAt ? new Date(publishedAt) : isPublished ? now : null

  await prisma.post.create({
    data: {
      userId: session.user.id,
      title,
      slug,
      excerpt: excerpt || null,
      content,
      imageUrl: imageUrl || null,
      imageKey: imageKey || null,
      published: isPublished,
      publishedAt: publishDate,
    },
  })

  revalidatePath("/dashboard/blog")
  return { message: "Articolo creato con successo", success: true }
}

export async function updatePost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { message: "ID articolo mancante", success: false }
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl"),
    imageKey: formData.get("imageKey"),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt"),
  }

  const parsed = postSchema.safeParse(rawData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, success: false }
  }

  const { title, slug, excerpt, content, imageUrl, imageKey, status, publishedAt } = parsed.data

  const existing = await prisma.post.findFirst({
    where: { slug, id: { not: id } },
  })
  if (existing) {
    return {
      errors: { slug: ["Questo slug è già utilizzato"] },
      success: false,
    }
  }

  const post = await prisma.post.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!post) {
    return { message: "Articolo non trovato", success: false }
  }

  const now = new Date()
  const isPublished = status === "published"
  const isScheduled = status === "scheduled"
  let publishDate = post.publishedAt

  if (isPublished && !post.published) {
    publishDate = now
  } else if (isScheduled && publishedAt) {
    publishDate = new Date(publishedAt)
  } else if (status === "draft") {
    publishDate = null
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      imageUrl: imageUrl || null,
      imageKey: imageKey || null,
      published: isPublished,
      publishedAt: publishDate,
    },
  })

  revalidatePath("/dashboard/blog")
  return { message: "Articolo aggiornato con successo", success: true }
}

export async function deletePost(id: string): Promise<PostState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const post = await prisma.post.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!post) {
    return { message: "Articolo non trovato", success: false }
  }

  await prisma.post.delete({ where: { id } })

  revalidatePath("/dashboard/blog")
  return { message: "Articolo eliminato con successo", success: true }
}

export async function generatePostSlug(title: string): Promise<string> {
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
  if (!slug) slug = "articolo"

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    const suffix = Math.random().toString(36).substring(2, 6)
    slug = `${slug}-${suffix}`
  }

  return slug
}

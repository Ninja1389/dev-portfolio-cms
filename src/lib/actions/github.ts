"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { fetchUserRepos } from "@/lib/github/client"

type GithubActionState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export async function importRepo(
  _prev: GithubActionState,
  formData: FormData,
): Promise<GithubActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const repoId = formData.get("repoId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const repoUrl = formData.get("repoUrl") as string
  const language = formData.get("language") as string
  const stars = Number(formData.get("stars"))
  const topicsRaw = formData.get("topics") as string
  const topics: string[] = topicsRaw ? JSON.parse(topicsRaw) : []

  const existing = await prisma.project.findFirst({
    where: { githubRepoId: repoId, userId: session.user.id },
  })
  if (existing) {
    return { message: "Repository già importato", success: false }
  }

  let slug = slugify(title)
  if (!slug) slug = "progetto"

  const slugCheck = await prisma.project.findUnique({ where: { slug } })
  if (slugCheck) {
    slug = `${slug}-${repoId}`
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
      repoUrl,
      published: true,
      order: (maxOrder._max.order ?? -1) + 1,
      githubRepoId: repoId,
      githubMeta: { stars, language, topics, lastSyncedAt: new Date().toISOString() },
    },
  })

  revalidatePath("/dashboard/projects")
  revalidatePath("/dashboard/integrations/github")
  return { message: "Repository importato con successo", success: true }
}

export async function syncGitHubProjects(): Promise<GithubActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Non autenticato", success: false }
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id, githubRepoId: { not: null } },
    select: { id: true, githubRepoId: true },
  })

  if (projects.length === 0) {
    return { message: "Nessun progetto GitHub da sincronizzare", success: true }
  }

  try {
    const repos = await fetchUserRepos()
    const repoMap = new Map(repos.map((r) => [String(r.id), r]))

    let updated = 0
    for (const project of projects) {
      const repo = repoMap.get(project.githubRepoId!)
      if (!repo) continue

      const meta = {
        stars: repo.stars,
        language: repo.language,
        topics: repo.topics,
        lastSyncedAt: new Date().toISOString(),
      }

      await prisma.project.update({
        where: { id: project.id },
        data: {
          description: repo.description || undefined,
          githubMeta: meta,
        },
      })
      updated++
    }

    revalidatePath("/dashboard/projects")
    revalidatePath("/dashboard/integrations/github")
    return { message: `${updated} progetti sincronizzati`, success: true }
  } catch {
    return { message: "Errore durante la sincronizzazione con GitHub", success: false }
  }
}

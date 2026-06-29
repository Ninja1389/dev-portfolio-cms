import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { GitFork, ExternalLink, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import { ProjectViewRecorder, ExternalLinkTracker } from "@/components/tracking/project-tracking"

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await props.params
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { title: true, description: true, imageUrl: true },
    })
    if (!project) return {}
  const title = `${project.title} — Progetti`
  const description = project.description ?? ""
  const ogTitle = encodeURIComponent(project.title)
  const images = project.imageUrl
    ? [{ url: project.imageUrl, width: 1200, height: 630 }]
    : [{ url: `/api/og?title=${ogTitle}`, width: 1200, height: 630 }]
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.imageUrl ? [project.imageUrl] : [`/api/og?title=${ogTitle}`],
    },
  }
  } catch {
    return {}
  }
}

export default async function ProjectDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      repoUrl: true,
      demoUrl: true,
      imageUrl: true,
      createdAt: true,
    },
  })

  if (!project) notFound()

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <ProjectViewRecorder projectId={project.id} />

      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Torna ai progetti
      </Link>

      {project.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {project.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {project.repoUrl && (
          <ExternalLinkTracker
            projectId={project.id}
            type="repo"
            url={project.repoUrl}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:border-border transition-colors"
          >
            <GitFork className="h-4 w-4" />
            Codice sorgente
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </ExternalLinkTracker>
        )}
        {project.demoUrl && (
          <ExternalLinkTracker
            projectId={project.id}
            type="demo"
            url={project.demoUrl}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:border-border transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Demo live
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </ExternalLinkTracker>
        )}
      </div>

      {project.description && (
        <div className="mt-8 prose prose-sm max-w-none text-muted-foreground">
          {project.description.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        Creato il {project.createdAt.toLocaleDateString("it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  )
}

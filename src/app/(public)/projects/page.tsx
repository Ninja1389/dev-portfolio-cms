import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { GitFork, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Progetti",
  description: "Una selezione dei miei lavori e progetti.",
  openGraph: {
    title: "Progetti",
    description: "Una selezione dei miei lavori e progetti.",
    images: [{ url: "/api/og?title=Progetti", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Progetti",
    description: "Una selezione dei miei lavori e progetti.",
    images: ["/api/og?title=Progetti"],
  },
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const category = typeof params.category === "string" ? params.category : null

  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: { id: true, name: true, category: true },
  })

  const categories = [...new Set(skills.map((s) => s.category))]

  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      imageUrl: true,
      repoUrl: true,
      demoUrl: true,
    },
  })

  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      FRONTEND: "Frontend",
      BACKEND: "Backend",
      DEVOPS: "DevOps",
      DESIGN: "Design",
      OTHER: "Altro",
    }
    return labels[cat] ?? cat
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        Progetti
      </h1>
      <p className="mt-2 text-gray-500">
        Una selezione dei miei lavori.
      </p>

      {/* Filter chips */}
      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/projects"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tutti
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/projects?category=${cat}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {categoryLabel(cat)}
            </Link>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-gray-400">Nessun progetto pubblicato al momento.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {project.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.title}
              </h2>
              {project.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                {project.repoUrl && (
                  <span className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" /> Codice
                  </span>
                )}
                {project.demoUrl && (
                  <span className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Demo
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

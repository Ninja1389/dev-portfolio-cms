import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowRight, ChevronRight, GitFork, Globe, Mail, ExternalLink, Code2 } from "lucide-react"

export default async function HomePage() {
  const user = await prisma.user.findFirst()

  const [featuredProjects, latestExperiences, skills] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: { order: "asc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        repoUrl: true,
        demoUrl: true,
      },
    }),
    prisma.experience.findMany({
      where: { userId: user?.id ?? "" },
      orderBy: { order: "asc" },
      take: 3,
      select: {
        id: true,
        role: true,
        company: true,
        startDate: true,
        endDate: true,
        current: true,
        description: true,
      },
    }),
    prisma.skill.findMany({
      where: { userId: user?.id ?? "" },
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, name: true, category: true, level: true },
    }),
  ])

  const socialLinks: { platform: string; url: string }[] =
    typeof user?.socialLinks === "object" && Array.isArray(user.socialLinks)
      ? (user.socialLinks as { platform: string; url: string }[])
      : []

  const socialIcon = (platform: string) => {
    const p = platform.toLowerCase()
    if (p.includes("github")) return <GitFork className="h-5 w-5" />
    if (p.includes("linkedin")) return <Globe className="h-5 w-5" />
    if (p.includes("twitter") || p.includes("x")) return <Globe className="h-5 w-5" />
    return <Globe className="h-5 w-5" />
  }

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

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
    <>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {user?.heroHeadline ?? user?.name ?? "Ciao, sono il tuo nome"}
            </h1>
            {user?.title && (
              <p className="mt-4 text-lg text-gray-600 md:text-xl">{user.title}</p>
            )}
            {user?.bio && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500">{user.bio}</p>
            )}
            <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title={link.platform}
                >
                  {socialIcon(link.platform)}
                </a>
              ))}
              {user?.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="rounded-full p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          {user?.avatarUrl && (
            <div className="shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.name ?? ""}
                className="h-40 w-40 rounded-full object-cover ring-4 ring-gray-100 md:h-56 md:w-56"
              />
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Progetti in evidenza
              </h2>
              <Link
                href="/projects"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Vedi tutti <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
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
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
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
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Vedi tutti i progetti <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Experience */}
      {latestExperiences.length > 0 && (
        <section className="border-t border-gray-100">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl mb-10">
              Esperienze recenti
            </h2>
            <div className="space-y-8">
              {latestExperiences.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="hidden sm:flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                    <div className="mt-2 w-px flex-1 bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {exp.startDate.toLocaleDateString("it-IT", { month: "short", year: "numeric" })}
                      {" — "}
                      {exp.current
                        ? "Presente"
                        : exp.endDate
                          ? exp.endDate.toLocaleDateString("it-IT", { month: "short", year: "numeric" })
                          : ""}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Scopri di più <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl mb-10">
              Competenze
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    {categoryLabel(cat)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
                      >
                        <Code2 className="h-3.5 w-3.5 text-gray-400" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

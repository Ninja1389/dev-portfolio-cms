import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { GitFork, Globe, Mail } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const user = await prisma.user.findFirst()
    const brand = user?.brandName || user?.name
    const title = `About — ${brand ?? "Portfolio"}`
    const description = user?.bio ?? "Scopri di più su di me e le mie esperienze."
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: user?.avatarUrl
          ? [{ url: user.avatarUrl, width: 1200, height: 630 }]
          : [{ url: "/api/og?title=About", width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: user?.avatarUrl ? [user.avatarUrl] : ["/api/og?title=About"],
      },
    }
  } catch {
    return { title: "About" }
  }
}

export default async function AboutPage() {
  const user = await prisma.user.findFirst()

  const experiences = await prisma.experience.findMany({
    where: { userId: user?.id ?? "" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      role: true,
      company: true,
      startDate: true,
      endDate: true,
      current: true,
      description: true,
    },
  })

  const skills = await prisma.skill.findMany({
    where: { userId: user?.id ?? "" },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: { id: true, name: true, category: true, level: true },
  })

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
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      {/* Bio */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {user?.name ?? "Chi sono"}
        </h1>
        {user?.title && (
          <p className="mt-2 text-lg text-muted-foreground">{user.title}</p>
        )}
        {user?.location && (
          <p className="mt-1 text-sm text-muted-foreground">{user.location}</p>
        )}
        <div className="mt-4 flex items-center gap-3">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title={link.platform}
            >
              {socialIcon(link.platform)}
            </a>
          ))}
          {user?.email && (
            <a
              href={`mailto:${user.email}`}
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
        </div>
        {user?.bio && (
          <div className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground whitespace-pre-line">
            {user.bio}
          </div>
        )}
      </section>

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-10">
            Esperienze
          </h2>
          <div className="space-y-10">
            {experiences.map((exp) => (
              <div key={exp.id} className="flex gap-4">
                <div className="hidden sm:flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-[var(--accent-custom)] ring-4 ring-[var(--accent-custom)]/20" />
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{exp.role}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {exp.startDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                    {" — "}
                    {exp.current
                      ? "Presente"
                      : exp.endDate
                        ? exp.endDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })
                        : ""}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-10">
            Competenze
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {categoryLabel(cat)}
                </h3>
                <div className="space-y-2">
                  {catSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{skill.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${i < skill.level ? "bg-[var(--accent-custom)]" : "bg-border"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

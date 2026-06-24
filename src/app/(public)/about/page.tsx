import { prisma } from "@/lib/prisma"
import { GitFork, Globe, Mail } from "lucide-react"

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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          {user?.name ?? "Chi sono"}
        </h1>
        {user?.title && (
          <p className="mt-2 text-lg text-gray-600">{user.title}</p>
        )}
        {user?.location && (
          <p className="mt-1 text-sm text-gray-400">{user.location}</p>
        )}
        <div className="mt-4 flex items-center gap-3">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title={link.platform}
            >
              {socialIcon(link.platform)}
            </a>
          ))}
          {user?.email && (
            <a
              href={`mailto:${user.email}`}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
        </div>
        {user?.bio && (
          <div className="mt-8 max-w-2xl text-base leading-relaxed text-gray-600 whitespace-pre-line">
            {user.bio}
          </div>
        )}
      </section>

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-10">
            Esperienze
          </h2>
          <div className="space-y-10">
            {experiences.map((exp) => (
              <div key={exp.id} className="flex gap-4">
                <div className="hidden sm:flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                  <div className="mt-2 w-px flex-1 bg-gray-200" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {exp.startDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                    {" — "}
                    {exp.current
                      ? "Presente"
                      : exp.endDate
                        ? exp.endDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })
                        : ""}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 whitespace-pre-line">
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-10">
            Competenze
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  {categoryLabel(cat)}
                </h3>
                <div className="space-y-2">
                  {catSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{skill.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${i < skill.level ? "bg-blue-500" : "bg-gray-200"}`}
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

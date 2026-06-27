import { prisma } from "@/lib/prisma"

export type DailyViews = { date: string; views: number }[]
export type TopProject = {
  id: string
  title: string
  slug: string
  views: number
}
export type TrafficSource = { source: string; count: number }
export type OverviewStats = {
  totalProjects: number
  publishedProjects: number
  totalMessages: number
  unreadMessages: number
  totalPageViews30d: number
  totalProjectViews30d: number
  totalClickEvents: number
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalProjects,
    publishedProjects,
    totalMessages,
    unreadMessages,
    pageViews30d,
    projectViews30d,
    clickEvents,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.pageView.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
    prisma.projectView.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
    prisma.clickEvent.count(),
  ])

  return {
    totalProjects,
    publishedProjects,
    totalMessages,
    unreadMessages,
    totalPageViews30d: pageViews30d,
    totalProjectViews30d: projectViews30d,
    totalClickEvents: clickEvents,
  }
}

export async function getDailyPageViews(days = 30): Promise<DailyViews> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await prisma.pageView.findMany({
    where: { viewedAt: { gte: since } },
    select: { viewedAt: true },
    orderBy: { viewedAt: "asc" },
  })

  const map = new Map<string, number>()
  for (const row of rows) {
    const key = row.viewedAt.toISOString().slice(0, 10)
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  const result: DailyViews = []
  const cursor = new Date(since)
  cursor.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10)
    result.push({ date: key, views: map.get(key) ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

export async function getTopProjects(limit = 10): Promise<TopProject[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      _count: { select: { projectViews: true } },
    },
    orderBy: { projectViews: { _count: "desc" } },
    take: limit,
  })

  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    views: p._count.projectViews,
  }))
}

export async function getTrafficSources(): Promise<TrafficSource[]> {
  const views = await prisma.pageView.findMany({
    where: { referrer: { not: null } },
    select: { referrer: true },
  })

  const map = new Map<string, number>()
  for (const v of views) {
    let source: string
    try {
      const url = new URL(v.referrer!)
      source = url.hostname
    } catch {
      source = v.referrer!
    }
    if (!source) source = "direct"
    map.set(source, (map.get(source) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

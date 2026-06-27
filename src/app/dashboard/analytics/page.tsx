import { getDailyPageViews, getTopProjects, getTrafficSources, getOverviewStats } from "@/lib/analytics/queries"
import { AnalyticsCharts } from "./analytics-charts"

export default async function AnalyticsPage() {
  const [stats, dailyViews, topProjects, trafficSources] = await Promise.all([
    getOverviewStats(),
    getDailyPageViews(30),
    getTopProjects(10),
    getTrafficSources(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Statistiche di visite e interazioni del portfolio.
        </p>
      </div>

      <AnalyticsCharts
        stats={stats}
        dailyViews={dailyViews}
        topProjects={topProjects}
        trafficSources={trafficSources}
      />
    </div>
  )
}

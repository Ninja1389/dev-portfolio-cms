"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye, MousePointerClick, MessageSquare, FolderKanban } from "lucide-react"
import type { DailyViews, TopProject, TrafficSource, OverviewStats } from "@/lib/analytics/queries"

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" })
}

export function AnalyticsCharts({
  stats,
  dailyViews,
  topProjects,
  trafficSources,
}: {
  stats: OverviewStats
  dailyViews: DailyViews
  topProjects: TopProject[]
  trafficSources: TrafficSource[]
}) {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visite Portfolio (30gg)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews30d}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visite Progetti (30gg)</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjectViews30d}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Esterni</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClickEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalMessages}
              {stats.unreadMessages > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({stats.unreadMessages} non letti)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visite Portfolio (ultimi 30 giorni)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyViews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nessuna visita registrata.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    fontSize={12}
                    className="text-muted-foreground"
                    interval="preserveStartEnd"
                  />
                  <YAxis allowDecimals={false} fontSize={12} className="text-muted-foreground" />
                  <Tooltip
                    labelFormatter={(label: unknown) => formatDate(label as string)}
                    formatter={(value: unknown) => [value as number, "Visite"]}
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#000",
                    }}
                    cursor={{ fill: "#f3f4f6" }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top projects & traffic sources */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Progetti</CardTitle>
          </CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nessuna visualizzazione.</p>
            ) : (
              <div className="space-y-3">
                {topProjects.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-muted-foreground shrink-0 w-5">
                        {i + 1}.
                      </span>
                      <span className="text-sm truncate">{p.title}</span>
                    </div>
                    <span className="text-sm font-medium shrink-0 ml-4">{p.views}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provenienza Traffico</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficSources.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nessun referrer registrato.</p>
            ) : (
              <div className="space-y-3">
                {trafficSources.slice(0, 10).map((s) => (
                  <div key={s.source} className="flex items-center justify-between">
                    <span className="text-sm truncate">{s.source}</span>
                    <span className="text-sm font-medium shrink-0 ml-4">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

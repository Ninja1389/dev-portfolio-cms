import { getOverviewStats } from "@/lib/analytics/queries"
import { FolderKanban, MessageSquare, Eye, MousePointerClick } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function DashboardPage() {
  const stats = await getOverviewStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panoramica</h1>
        <p className="text-muted-foreground">
          Benvenuto nella dashboard del tuo portfolio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progetti</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedProjects} pubblicati, {stats.totalProjects - stats.publishedProjects} bozze
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadMessages} non letti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visite Portfolio (30gg)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews30d}</div>
            <p className="text-xs text-muted-foreground">
              + {stats.totalProjectViews30d} visite progetti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Esterni</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClickEvents}</div>
            <p className="text-xs text-muted-foreground">
              Su link repo e demo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

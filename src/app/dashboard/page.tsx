import { FolderKanban, Newspaper, MessageSquare, Eye } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const mockStats = [
  {
    title: "Progetti",
    value: "12",
    description: "8 pubblicati, 4 bozze",
    icon: FolderKanban,
  },
  {
    title: "Articoli Blog",
    value: "24",
    description: "18 pubblicati, 6 bozze",
    icon: Newspaper,
  },
  {
    title: "Messaggi",
    value: "5",
    description: "3 non letti",
    icon: MessageSquare,
  },
  {
    title: "Visite Totali",
    value: "1.234",
    description: "Negli ultimi 30 giorni",
    icon: Eye,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panoramica</h1>
        <p className="text-muted-foreground">
          Benvenuto nella dashboard del tuo portfolio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attività Recenti</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Nessuna attività recente. Inizia a creare contenuti per il tuo portfolio.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prossimi Passi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Completa il tuo profilo
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Aggiungi i tuoi progetti
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Pubblica il tuo primo articolo
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

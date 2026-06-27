import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { fetchUserRepos, GitHubError } from "@/lib/github/client"
import { GithubIntegrationClient } from "./github-integration-client"

export default async function GithubIntegrationPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return <p className="text-muted-foreground">Devi effettuare l&apos;accesso.</p>
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  })

  if (!account?.access_token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrazione GitHub</h1>
          <p className="mt-1 text-muted-foreground">
            Collega il tuo account GitHub per importare i tuoi repository come progetti.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Account GitHub non collegato. Vai nelle impostazioni per collegarlo tramite OAuth.
          </p>
        </div>
      </div>
    )
  }

  const importedProjectIds = new Set(
    (
      await prisma.project.findMany({
        where: { userId: session.user.id, githubRepoId: { not: null } },
        select: { githubRepoId: true },
      })
    ).map((p) => p.githubRepoId!),
  )

  let repos: Awaited<ReturnType<typeof fetchUserRepos>>
  let error: string | null = null

  try {
    repos = await fetchUserRepos()
  } catch (e) {
    if (e instanceof GitHubError) {
      error = e.message
    } else {
      error = "Errore imprevisto durante il caricamento dei repository."
    }
    repos = []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrazione GitHub</h1>
          <p className="mt-1 text-muted-foreground">
            Importa i tuoi repository come progetti del portfolio.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <GithubIntegrationClient
        repos={repos}
        importedProjectIds={importedProjectIds}
      />
    </div>
  )
}

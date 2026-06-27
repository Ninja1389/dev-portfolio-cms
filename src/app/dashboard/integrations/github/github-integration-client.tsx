"use client"

import { useActionState } from "react"
import { Star, GitFork, RefreshCw, ExternalLink, GitBranch, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { importRepo, syncGitHubProjects } from "@/lib/actions/github"
import type { GitHubRepo } from "@/lib/github/client"

type Props = {
  repos: GitHubRepo[]
  importedProjectIds: Set<string>
}

function RepoCard({
  repo,
  isImported,
}: {
  repo: GitHubRepo
  isImported: boolean
}) {
  const [state, formAction, pending] = useActionState(importRepo, undefined)

  const languages = repo.language

  return (
    <div className="rounded-lg border bg-card p-5 transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{repo.name}</h3>
            {isImported && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <Check className="h-3 w-3" /> Importato
              </span>
            )}
          </div>
          {repo.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
          )}
        </div>

        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
          title="Apri su GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {languages && (
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {languages}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5" /> {repo.stars}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" /> {repo.forks}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitBranch className="h-3.5 w-3.5" /> {repo.defaultBranch}
        </span>
        <span>Aggiornato: {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString("it-IT") : "—"}</span>
      </div>

      <div className="mt-4">
        {isImported ? (
          <Button variant="outline" size="sm" disabled>
            <Check className="mr-1.5 h-4 w-4" /> Già importato
          </Button>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="repoId" value={repo.id} />
            <input type="hidden" name="title" value={repo.name} />
            <input type="hidden" name="description" value={repo.description ?? ""} />
            <input type="hidden" name="repoUrl" value={repo.htmlUrl} />
            <input type="hidden" name="language" value={repo.language ?? ""} />
            <input type="hidden" name="stars" value={repo.stars} />
            <input type="hidden" name="topics" value={JSON.stringify(repo.topics)} />
            <Button type="submit" size="sm" disabled={pending}>
              <Download className="mr-1.5 h-4 w-4" />
              {pending ? "Importazione..." : "Importa come progetto"}
            </Button>
          </form>
        )}
        {state?.message && !state?.success && (
          <p className="mt-2 text-xs text-red-500">{state.message}</p>
        )}
      </div>
    </div>
  )
}

export function GithubIntegrationClient({ repos, importedProjectIds }: Props) {
  const [syncState, syncAction, syncPending] = useActionState(syncGitHubProjects, undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {repos.length} repository trovati
          {importedProjectIds.size > 0 && ` — ${importedProjectIds.size} già importati`}
        </p>

        <form action={syncAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={syncPending || importedProjectIds.size === 0}
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${syncPending ? "animate-spin" : ""}`} />
            {syncPending ? "Sincronizzazione..." : "Sincronizza"}
          </Button>
        </form>
      </div>

      {syncState?.message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            syncState.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {syncState.message}
        </div>
      )}

      {repos.length === 0 && !syncState && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Nessun repository trovato.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            isImported={importedProjectIds.has(String(repo.id))}
          />
        ))}
      </div>
    </div>
  )
}

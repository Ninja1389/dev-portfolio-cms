import { Octokit } from "octokit"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export class GitHubError extends Error {
  constructor(
    message: string,
    public code: "RATE_LIMITED" | "UNAUTHORIZED" | "NOT_FOUND" | "UNKNOWN",
  ) {
    super(message)
    this.name = "GitHubError"
  }
}

export type GitHubRepo = {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  language: string | null
  stars: number
  forks: number
  topics: string[]
  updatedAt: string | null
  pushedAt: string | null
  defaultBranch: string
  readme: string | null
}

async function getGitHubToken(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new GitHubError("Utente non autenticato", "UNAUTHORIZED")
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  })

  if (!account?.access_token) {
    throw new GitHubError(
      "GitHub non collegato. Collega il tuo account GitHub nelle impostazioni.",
      "UNAUTHORIZED",
    )
  }

  return account.access_token
}

function handleOctokitError(err: unknown): never {
  if (err instanceof GitHubError) throw err
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status: number }).status
    if (status === 403) {
      throw new GitHubError(
        "Limite di richieste GitHub superato (rate limit). Riprova tra qualche minuto.",
        "RATE_LIMITED",
      )
    }
    if (status === 401) {
      throw new GitHubError("Token GitHub non valido o scaduto. Ricollega l'account.", "UNAUTHORIZED")
    }
  }
  throw new GitHubError("Errore durante la comunicazione con GitHub", "UNKNOWN")
}

export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  try {
    const token = await getGitHubToken()
    const octokit = new Octokit({ auth: token })

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      type: "owner",
    })

    const reposWithReadme: GitHubRepo[] = []

    for (const repo of repos) {
      let readme: string | null = null
      try {
        const response = await octokit.rest.repos.getReadme({
          owner: repo.owner.login,
          repo: repo.name,
          mediaType: { format: "raw" },
        })
        readme = (response as unknown as { data: string }).data.slice(0, 2000)
      } catch {
        // no README available
      }

      reposWithReadme.push({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics ?? [],
        updatedAt: repo.updated_at ?? null,
        pushedAt: repo.pushed_at ?? null,
        defaultBranch: repo.default_branch ?? "main",
        readme,
      })
    }

    return reposWithReadme
  } catch (err) {
    return handleOctokitError(err)
  }
}

export async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const token = await getGitHubToken()
    const octokit = new Octokit({ auth: token })

    const { data } = await octokit.rest.repos.listLanguages({ owner, repo })
    return data
  } catch (err) {
    return handleOctokitError(err)
  }
}

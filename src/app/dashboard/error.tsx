"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Errore</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Riprova
      </button>
    </div>
  )
}

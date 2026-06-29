import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PageViewTracker } from "@/components/tracking/page-view-tracker"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const user = await prisma.user.findFirst()
    const brand = user?.brandName || user?.name
    const title = brand ? `${brand} — Portfolio` : "Portfolio"
    const description = user?.heroHeadline ?? user?.bio ?? ""
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: user?.avatarUrl
          ? [{ url: user.avatarUrl, width: 1200, height: 630 }]
          : [{ url: "/api/og?title=Portfolio", width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: user?.avatarUrl ? [user.avatarUrl] : ["/api/og?title=Portfolio"],
      },
    }
  } catch {
    return { title: "Portfolio" }
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await prisma.user.findFirst()
  const brand = user?.brandName || user?.name || "Portfolio"

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            {brand}
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-[var(--accent-custom)] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[var(--accent-custom)] transition-colors">About</Link>
            <Link href="/projects" className="hover:text-[var(--accent-custom)] transition-colors">Progetti</Link>
            <Link href="/contact" className="hover:text-[var(--accent-custom)] transition-colors">Contatti</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
      <PageViewTracker />

      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {brand}.</p>
        </div>
      </footer>
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const user = await prisma.user.findFirst()
  const title = user?.name ? `${user.name} — Portfolio` : "Portfolio"
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
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await prisma.user.findFirst()

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            {user?.name ?? "Portfolio"}
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
            <Link href="/projects" className="hover:text-gray-900 transition-colors">Progetti</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contatti</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {user?.name ?? "Portfolio"}.</p>
        </div>
      </footer>
    </div>
  )
}

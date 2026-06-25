import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const user = await prisma.user.findFirst()
  return {
    title: user?.name ? `${user.name} — Portfolio` : "Portfolio",
    description: user?.heroHeadline ?? user?.bio ?? "",
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

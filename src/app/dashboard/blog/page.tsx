import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogList } from "./blog-list"

export default async function BlogPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const now = new Date()

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  const items = posts.map((p) => {
    const displayDate = p.publishedAt ?? p.createdAt
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      published: p.published,
      scheduled: !p.published && p.publishedAt !== null && p.publishedAt > now,
      dateLabel: format(displayDate, p.publishedAt ? "d MMM yyyy, HH:mm" : "d MMM yyyy", { locale: it }),
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Gestisci gli articoli del blog.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <Plus className="mr-1 h-4 w-4" />
            Nuovo articolo
          </Link>
        </Button>
      </div>

      <BlogList items={items} />
    </div>
  )
}

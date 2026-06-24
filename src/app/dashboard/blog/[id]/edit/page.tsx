import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PostForm } from "../../post-form"
import { updatePost } from "@/lib/actions/posts"

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await props.params

  const post = await prisma.post.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifica articolo</h1>
        <p className="text-muted-foreground">
          Modifica &quot;{post.title}&quot;.
        </p>
      </div>
      <PostForm
        action={updatePost}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          imageUrl: post.imageUrl ?? "",
          imageKey: post.imageKey ?? "",
          status: post.published ? "published" : post.publishedAt && post.publishedAt > new Date() ? "scheduled" : "draft",
          publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 16) : "",
        }}
      />
    </div>
  )
}

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PostForm } from "../post-form"
import { createPost } from "@/lib/actions/posts"

export default async function NewPostPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuovo articolo</h1>
        <p className="text-muted-foreground">
          Crea un nuovo articolo per il blog.
        </p>
      </div>
      <PostForm action={createPost} />
    </div>
  )
}

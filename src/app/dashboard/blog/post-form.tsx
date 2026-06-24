"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Upload, Eye } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"
import { generatePostSlug } from "@/lib/actions/posts"
import { TiptapEditor } from "@/components/blog/tiptap-editor"
import type { PostState, PostFormData } from "@/lib/posts"

type Action = (
  prev: PostState,
  formData: FormData,
) => Promise<PostState>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvataggio..." : "Salva articolo"}
    </Button>
  )
}

export function PostForm({
  post,
  action,
}: {
  post?: PostFormData
  action: Action
}) {
  const router = useRouter()
  const [state, formAction] = useActionState<PostState, FormData>(
    action,
    undefined,
  )
  const prevSuccessRef = useRef(false)

  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [imagePreview, setImagePreview] = useState(post?.imageUrl ?? "")
  const [imageKey, setImageKey] = useState(post?.imageKey ?? "")
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    post?.status ?? "draft",
  )
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ?? "")

  const { startUpload, isUploading } = useUploadThing("blogImage")

  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true
      toast.success(state.message ?? "Operazione completata")
      router.push("/dashboard/blog")
    } else if (state?.message && !state?.success) {
      toast.error(state.message)
    }
    if (!state) {
      prevSuccessRef.current = false
    }
  }, [state, router])

  async function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManuallyEdited) {
      const newSlug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setSlug(newSlug)
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setSlug(value)
  }

  async function handleAutoSlug() {
    const newSlug = await generatePostSlug(title)
    setSlug(newSlug)
    setSlugManuallyEdited(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      toast.error("L'immagine non può superare i 4MB")
      return
    }

    try {
      const res = await startUpload([file])
      if (res?.[0]) {
        setImagePreview(res[0].ufsUrl ?? res[0].url)
        setImageKey(res[0].key ?? "")
        toast.success("Immagine caricata con successo")
      }
    } catch {
      toast.error("Errore durante il caricamento dell'immagine")
    }
  }

  function handlePreview() {
    const previewSlug = slug || "anteprima"
    window.open(`/blog/${previewSlug}?preview=true`, "_blank")
  }

  return (
    <form action={formAction} className="space-y-6">
      {post?.id && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="imageUrl" value={imagePreview} />
      <input type="hidden" name="imageKey" value={imageKey} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="publishedAt" value={status === "scheduled" ? publishedAt : ""} />

      <Card>
        <CardHeader>
          <CardTitle>Informazioni articolo</CardTitle>
          <CardDescription>
            Titolo, slug e riassunto dell&apos;articolo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
            {state?.errors?.title && (
              <p className="text-sm text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoSlug}
                className="shrink-0"
              >
                Genera
              </Button>
            </div>
            {state?.errors?.slug && (
              <p className="text-sm text-destructive">
                {state.errors.slug[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Riassunto</Label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Breve riassunto dell'articolo..."
              className="h-16 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenuto</CardTitle>
          <CardDescription>
            Scrivi il contenuto dell&apos;articolo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Inizia a scrivere..."
          />
          {state?.errors?.content && (
            <p className="mt-2 text-sm text-destructive">
              {state.errors.content[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Immagine di copertina</CardTitle>
          <CardDescription>
            Immagine principale dell&apos;articolo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Anteprima"
              className="max-h-48 rounded-lg object-cover"
            />
          )}
          <div className="space-y-2">
            <Label
              htmlFor="blog-image-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Caricamento..." : "Carica immagine"}
            </Label>
            <input
              id="blog-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG o WEBP. Max 4MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pubblicazione</CardTitle>
          <CardDescription>
            Scegli lo stato di pubblicazione dell&apos;articolo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer hover:bg-muted/50 has-checked:border-primary">
              <input
                type="radio"
                name="status_radio"
                value="draft"
                checked={status === "draft"}
                onChange={() => setStatus("draft")}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Bozza</p>
                <p className="text-xs text-muted-foreground">
                  L&apos;articolo non sarà visibile pubblicamente.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer hover:bg-muted/50 has-checked:border-primary">
              <input
                type="radio"
                name="status_radio"
                value="published"
                checked={status === "published"}
                onChange={() => setStatus("published")}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Pubblica ora</p>
                <p className="text-xs text-muted-foreground">
                  L&apos;articolo sarà visibile immediatamente.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer hover:bg-muted/50 has-checked:border-primary">
              <input
                type="radio"
                name="status_radio"
                value="scheduled"
                checked={status === "scheduled"}
                onChange={() => setStatus("scheduled")}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Programma</p>
                <p className="text-xs text-muted-foreground">
                  L&apos;articolo sarà pubblicato automaticamente alla data
                  scelta.
                </p>
              </div>
            </label>
          </div>

          {status === "scheduled" && (
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Data di pubblicazione</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                required={status === "scheduled"}
              />
              {state?.errors?.publishedAt && (
                <p className="text-sm text-destructive">
                  {state.errors.publishedAt[0]}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/blog")}
        >
          Annulla
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handlePreview}
          disabled={!slug && !title}
        >
          <Eye className="mr-1 h-4 w-4" />
          Anteprima
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}

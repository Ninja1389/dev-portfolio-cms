"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Upload } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"
import { generateSlug } from "@/lib/actions/projects"
import type { ProjectState, ProjectFormData } from "@/lib/projects"

type Action = (
  prev: ProjectState,
  formData: FormData,
) => Promise<ProjectState>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="ml-auto">
      {pending ? "Salvataggio..." : "Salva progetto"}
    </Button>
  )
}

export function ProjectForm({
  project,
  action,
  actionName,
}: {
  project?: ProjectFormData
  action: Action
  actionName: "create" | "update"
}) {
  const router = useRouter()
  const [state, formAction] = useActionState<ProjectState, FormData>(
    action,
    undefined,
  )
  const prevSuccessRef = useRef(false)

  const [title, setTitle] = useState(project?.title ?? "")
  const [slug, setSlug] = useState(project?.slug ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [description, setDescription] = useState(project?.description ?? "")
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? "")
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl ?? "")
  const [imagePreview, setImagePreview] = useState(project?.imageUrl ?? "")
  const [imageKey, setImageKey] = useState(project?.imageKey ?? "")
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [published, setPublished] = useState(project?.published ?? false)

  const { startUpload, isUploading } = useUploadThing("projectImage")

  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true
      toast.success(state.message ?? "Operazione completata")
      router.push("/dashboard/projects")
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

  async function handleAutoSlug() {
    const newSlug = await generateSlug(title)
    setSlug(newSlug)
    setSlugManuallyEdited(true)
  }

  return (
    <form action={formAction} className="space-y-6">
      {project?.id && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="imageUrl" value={imagePreview} />
      <input type="hidden" name="imageKey" value={imageKey} />
      <input type="hidden" name="featured" value={String(featured)} />
      <input type="hidden" name="published" value={String(published)} />

      <Card>
        <CardHeader>
          <CardTitle>Informazioni progetto</CardTitle>
          <CardDescription>
            Dati principali del progetto.
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
            <Label htmlFor="description">Descrizione</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi il progetto..."
              className="h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            />
            {state?.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link</CardTitle>
          <CardDescription>
            Link al repository e alla demo del progetto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoUrl">URL Repository</Label>
            <Input
              id="repoUrl"
              name="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
            {state?.errors?.repoUrl && (
              <p className="text-sm text-destructive">
                {state.errors.repoUrl[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoUrl">URL Demo</Label>
            <Input
              id="demoUrl"
              name="demoUrl"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
            />
            {state?.errors?.demoUrl && (
              <p className="text-sm text-destructive">
                {state.errors.demoUrl[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Immagine</CardTitle>
          <CardDescription>
            Immagine di copertina del progetto.
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
              htmlFor="project-image-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Caricamento..." : "Carica immagine"}
            </Label>
            <input
              id="project-image-upload"
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
          <CardTitle>Impostazioni</CardTitle>
          <CardDescription>
            Stato di pubblicazione e visibilità.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="featured">In evidenza</Label>
              <p className="text-xs text-muted-foreground">
                Mostra il progetto nella sezione in evidenza.
              </p>
            </div>
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="published">Pubblicato</Label>
              <p className="text-xs text-muted-foreground">
                Il progetto è visibile nel portfolio pubblico.
              </p>
            </div>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/projects")}
        >
          Annulla
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}

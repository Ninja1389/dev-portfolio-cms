"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Trash2, Upload } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"
import type { ProfileState } from "@/lib/actions/profile"

type SocialLink = { platform: string; url: string }

type ProfileData = {
  name: string
  title: string
  email: string
  location: string
  bio: string
  heroHeadline: string
  avatarUrl: string
  avatarKey: string
  socialLinks: SocialLink[]
}

type UpdateProfileAction = (
  prev: ProfileState,
  formData: FormData,
) => Promise<ProfileState>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="ml-auto">
      {pending ? "Salvataggio..." : "Salva modifiche"}
    </Button>
  )
}

export function ProfileForm({
  profile,
  updateProfileAction,
}: {
  profile: ProfileData
  updateProfileAction: UpdateProfileAction
}) {
  const [state, formAction] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    undefined,
  )
  const prevSuccessRef = useRef(false)

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    profile.socialLinks,
  )
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl)
  const [avatarKey, setAvatarKey] = useState(profile.avatarKey)

  const { startUpload, isUploading } = useUploadThing("avatar")

  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true
      toast.success(state.message ?? "Profilo aggiornato")
    } else if (state?.message && !state?.success) {
      toast.error(state.message)
    }
    if (!state) {
      prevSuccessRef.current = false
    }
  }, [state])

  function addSocialLink() {
    setSocialLinks([...socialLinks, { platform: "", url: "" }])
  }

  function removeSocialLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  function updateSocialLink(
    index: number,
    field: "platform" | "url",
    value: string,
  ) {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value }
    setSocialLinks(updated)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'immagine non può superare i 2MB")
      return
    }

    try {
      const res = await startUpload([file])
      if (res?.[0]) {
        setAvatarPreview(res[0].ufsUrl ?? res[0].url)
        setAvatarKey(res[0].key ?? "")
        toast.success("Immagine caricata con successo")
      }
    } catch {
      toast.error("Errore durante il caricamento dell'immagine")
    }
  }

  const initials = (profile.name || profile.email || "U")
    .slice(0, 2)
    .toUpperCase()

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="avatarUrl" value={avatarPreview} />
      <input type="hidden" name="avatarKey" value={avatarKey} />
      <input
        type="hidden"
        name="socialLinks"
        value={JSON.stringify(socialLinks)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            Carica o cambia la tua immagine profilo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar size="lg" className="size-20">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="Avatar" />
            ) : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <Label
              htmlFor="avatar-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Caricamento..." : "Carica immagine"}
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG o WEBP. Max 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Personali</CardTitle>
          <CardDescription>
            Questi dati saranno visibili sul tuo portfolio pubblico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                required
              />
              {state?.errors?.name && (
                <p className="text-sm text-destructive">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titolo professionale</Label>
              <Input
                id="title"
                name="title"
                placeholder="Full-Stack Developer"
                defaultValue={profile.title}
              />
              {state?.errors?.title && (
                <p className="text-sm text-destructive">
                  {state.errors.title[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profile.email}
                required
              />
              {state?.errors?.email && (
                <p className="text-sm text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Località</Label>
              <Input
                id="location"
                name="location"
                placeholder="Milano, Italia"
                defaultValue={profile.location}
              />
              {state?.errors?.location && (
                <p className="text-sm text-destructive">
                  {state.errors.location[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Parlaci di te..."
              defaultValue={profile.bio}
              className="h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            />
            {state?.errors?.bio && (
              <p className="text-sm text-destructive">
                {state.errors.bio[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroHeadline">Headline Hero</Label>
            <Input
              id="heroHeadline"
              name="heroHeadline"
              placeholder="Costruisco esperienze digitali..."
              defaultValue={profile.heroHeadline}
            />
            <p className="text-xs text-muted-foreground">
              Frase di presentazione nella sezione hero del tuo portfolio.
            </p>
            {state?.errors?.heroHeadline && (
              <p className="text-sm text-destructive">
                {state.errors.heroHeadline[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Aggiungi i link ai tuoi profili social.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`social-platform-${index}`}
                    className="text-xs"
                  >
                    Piattaforma
                  </Label>
                  <Input
                    id={`social-platform-${index}`}
                    placeholder="GitHub"
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, "platform", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`social-url-${index}`} className="text-xs">
                    URL
                  </Label>
                  <Input
                    id={`social-url-${index}`}
                    placeholder="https://github.com/..."
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, "url", e.target.value)
                    }
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-5 shrink-0"
                onClick={() => removeSocialLink(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialLink}
            className="mt-2"
          >
            <Plus className="mr-1 h-4 w-4" />
            Aggiungi social
          </Button>

          {state?.errors?.socialLinks && (
            <p className="text-sm text-destructive">
              {state.errors.socialLinks[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

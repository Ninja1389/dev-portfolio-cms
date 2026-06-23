"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"
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
import { cn } from "@/lib/utils"
import type { SkillState, SkillFormData } from "@/lib/skills"
import { CATEGORY_LABELS } from "@/lib/skills"

type Action = (
  prev: SkillState,
  formData: FormData,
) => Promise<SkillState>

const CATEGORIES = ["FRONTEND", "BACKEND", "DEVOPS", "DESIGN", "OTHER"] as const

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="ml-auto">
      {pending ? "Salvataggio..." : "Salva skill"}
    </Button>
  )
}

export function SkillForm({
  skill,
  action,
}: {
  skill?: SkillFormData
  action: Action
}) {
  const router = useRouter()
  const [state, formAction] = useActionState<SkillState, FormData>(
    action,
    undefined,
  )
  const prevSuccessRef = useRef(false)

  const [name, setName] = useState(skill?.name ?? "")
  const [category, setCategory] = useState(skill?.category ?? "FRONTEND")
  const [level, setLevel] = useState(skill?.level ?? 3)

  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true
      toast.success(state.message ?? "Operazione completata")
      router.push("/dashboard/skills")
    } else if (state?.message && !state?.success) {
      toast.error(state.message)
    }
    if (!state) {
      prevSuccessRef.current = false
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      {skill?.id && <input type="hidden" name="id" value={skill.id} />}
      <input type="hidden" name="level" value={level} />

      <Card>
        <CardHeader>
          <CardTitle>Informazioni skill</CardTitle>
          <CardDescription>
            Dati della competenza tecnica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="React, TypeScript, Docker..."
              required
            />
            {state?.errors?.name && (
              <p className="text-sm text-destructive">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            {state?.errors?.category && (
              <p className="text-sm text-destructive">
                {state.errors.category[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Livello</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setLevel(star)}
                  className="p-1 transition-colors hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= level
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>
            {state?.errors?.level && (
              <p className="text-sm text-destructive">
                {state.errors.level[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/skills")}
        >
          Annulla
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}

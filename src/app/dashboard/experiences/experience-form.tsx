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
import type { ExperienceState, ExperienceFormData } from "@/lib/experiences"

type Action = (
  prev: ExperienceState,
  formData: FormData,
) => Promise<ExperienceState>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="ml-auto">
      {pending ? "Salvataggio..." : "Salva esperienza"}
    </Button>
  )
}

export function ExperienceForm({
  experience,
  action,
}: {
  experience?: ExperienceFormData
  action: Action
}) {
  const router = useRouter()
  const [state, formAction] = useActionState<ExperienceState, FormData>(
    action,
    undefined,
  )
  const prevSuccessRef = useRef(false)

  const [role, setRole] = useState(experience?.role ?? "")
  const [company, setCompany] = useState(experience?.company ?? "")
  const [startDate, setStartDate] = useState(experience?.startDate ?? "")
  const [endDate, setEndDate] = useState(experience?.endDate ?? "")
  const [current, setCurrent] = useState(experience?.current ?? false)
  const [description, setDescription] = useState(experience?.description ?? "")

  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true
      toast.success(state.message ?? "Operazione completata")
      router.push("/dashboard/experiences")
    } else if (state?.message && !state?.success) {
      toast.error(state.message)
    }
    if (!state) {
      prevSuccessRef.current = false
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      {experience?.id && (
        <input type="hidden" name="id" value={experience.id} />
      )}
      <input type="hidden" name="current" value={String(current)} />

      <Card>
        <CardHeader>
          <CardTitle>Informazioni esperienza</CardTitle>
          <CardDescription>
            Dati principali dell'esperienza lavorativa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Ruolo *</Label>
              <Input
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Frontend Developer"
                required
              />
              {state?.errors?.role && (
                <p className="text-sm text-destructive">
                  {state.errors.role[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Azienda *</Label>
              <Input
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nome azienda"
                required
              />
              {state?.errors?.company && (
                <p className="text-sm text-destructive">
                  {state.errors.company[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data inizio *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              {state?.errors?.startDate && (
                <p className="text-sm text-destructive">
                  {state.errors.startDate[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data fine</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={current}
              />
              {state?.errors?.endDate && (
                <p className="text-sm text-destructive">
                  {state.errors.endDate[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="current">Esperienza attuale</Label>
              <p className="text-xs text-muted-foreground">
                Sto ancora lavorando qui.
              </p>
            </div>
            <Switch
              id="current"
              checked={current}
              onCheckedChange={(v) => {
                setCurrent(v)
                if (v) setEndDate("")
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi le tue responsabilità..."
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

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/experiences")}
        >
          Annulla
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}

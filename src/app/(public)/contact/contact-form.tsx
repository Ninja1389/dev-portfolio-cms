"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitContact } from "@/lib/actions/contact"
import type { ContactState } from "@/lib/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, CheckCircle2 } from "lucide-react"

export function ContactForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<ContactState>(undefined)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await submitContact(undefined, formData)
        setState(result)
        if (result?.success) {
          router.refresh()
        }
      } catch {
        setState({ message: "Errore durante l'invio. Riprova più tardi.", success: false })
      }
    })
  }

  if (state?.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-lg font-semibold text-green-800">
          Messaggio inviato!
        </h2>
        <p className="mt-2 text-sm text-green-600">
          {state.message ?? "Grazie per avermi contattato. Ti risponderò al più presto."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {state?.message && !state.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          placeholder="Il tuo nome"
          required
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="la tua@email.it"
          required
        />
        {state?.errors?.email && (
          <p className="text-xs text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Messaggio</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Scrivi qui il tuo messaggio..."
          rows={6}
          required
        />
        {state?.errors?.message && (
          <p className="text-xs text-red-500">{state.errors.message[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Invio in corso...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Invia messaggio
          </>
        )}
      </Button>
    </form>
  )
}

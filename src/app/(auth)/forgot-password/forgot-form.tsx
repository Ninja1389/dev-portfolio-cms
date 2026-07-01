"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { ResetRequestState } from "@/lib/actions/auth"

type Action = (
  prev: ResetRequestState,
  formData: FormData,
) => Promise<ResetRequestState>

export function ForgotForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(action, undefined)

  if (state?.message?.includes("riceverai")) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email inviata</CardTitle>
          <CardDescription>
            Se l&apos;email è registrata, riceverai un link per il reset.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Recupera password</CardTitle>
        <CardDescription>Inserisci la tua email per ricevere il link di reset</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="mario@example.com" required />
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Invio in corso..." : "Invia link di reset"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <a href="/login" className="underline underline-offset-4 hover:text-primary">
            Torna al login
          </a>
        </p>
      </CardContent>
    </Card>
  )
}

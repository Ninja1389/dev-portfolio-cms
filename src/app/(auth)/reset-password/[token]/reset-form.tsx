"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { ResetPasswordState } from "@/lib/actions/auth"

type Action = (
  prev: ResetPasswordState,
  formData: FormData,
) => Promise<ResetPasswordState>

export function ResetForm({ token, action }: { token: string; action: Action }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ResetPasswordState, FormData>(action, undefined)

  if (state?.message?.includes("aggiornata")) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Password aggiornata</CardTitle>
          <CardDescription>
            Ora puoi accedere con la tua nuova password.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push("/login")}>
            Vai al login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Nuova password</CardTitle>
        <CardDescription>Scegli una nuova password per il tuo account</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div className="space-y-2">
            <Label htmlFor="password">Nuova password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Aggiornamento..." : "Aggiorna password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

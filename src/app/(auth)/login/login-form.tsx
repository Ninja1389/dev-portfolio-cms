"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { LoginState } from "@/lib/actions/auth"

type LoginAction = (
  prev: LoginState,
  formData: FormData,
) => Promise<LoginState>

export function LoginForm({
  loginAction,
  githubAction,
}: {
  loginAction: LoginAction
  githubAction: () => Promise<void>
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Accedi</CardTitle>
        <CardDescription>Scegli il tuo metodo di accesso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="mario@example.com"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">oppure</span>
          </div>
        </div>

        <form action={githubAction}>
          <Button type="submit" variant="outline" className="w-full">
            Continua con GitHub
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Non hai un account?{" "}
          <a href="/register" className="underline underline-offset-4 hover:text-primary">
            Registrati
          </a>
        </p>
      </CardContent>
    </Card>
  )
}

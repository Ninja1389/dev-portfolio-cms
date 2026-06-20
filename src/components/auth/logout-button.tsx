"use client"

import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <form
      action={async () => {
        await signOut({ redirectTo: "/login" })
      }}
    >
      <Button type="submit" variant="outline">
        Esci
      </Button>
    </form>
  )
}

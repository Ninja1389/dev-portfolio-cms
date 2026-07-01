import { requestPasswordReset } from "@/lib/actions/auth"
import { ForgotForm } from "./forgot-form"

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <ForgotForm action={requestPasswordReset} />
    </main>
  )
}

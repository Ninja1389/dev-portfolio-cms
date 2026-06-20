import { register } from "@/lib/actions/auth"
import { RegisterForm } from "./register-form"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <RegisterForm registerAction={register} />
    </main>
  )
}

import { login, signInWithGithub } from "@/lib/actions/auth"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm loginAction={login} githubAction={signInWithGithub} />
    </main>
  )
}

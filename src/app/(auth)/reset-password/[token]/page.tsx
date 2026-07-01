import { resetPassword } from "@/lib/actions/auth"
import { ResetForm } from "./reset-form"

export default async function ResetPasswordPage(props: {
  params: Promise<{ token: string }>
}) {
  const { token } = await props.params
  return (
    <main className="flex min-h-screen items-center justify-center">
      <ResetForm token={token} action={resetPassword} />
    </main>
  )
}

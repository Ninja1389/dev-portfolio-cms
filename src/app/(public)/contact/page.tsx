import type { Metadata } from "next"
import { ContactForm } from "./contact-form"
import { Mail, MapPin } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contattami per collaborazioni, progetti o informazioni.",
}

export default async function ContactPage() {
  const user = await prisma.user.findFirst()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        Contattami
      </h1>
      <p className="mt-2 text-gray-500">
        Hai un progetto in mente o vuoi semplicemente salutare? Scrivimi!
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <ContactForm />
        </div>

        <aside className="md:col-span-2 space-y-6">
          {user?.email && (
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-gray-900">Email</p>
                <a
                  href={`mailto:${user.email}`}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {user.email}
                </a>
              </div>
            </div>
          )}

          {user?.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-gray-900">Luogo</p>
                <p className="text-sm text-gray-500">{user.location}</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

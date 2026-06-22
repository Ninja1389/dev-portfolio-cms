import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateProfile } from "@/lib/actions/profile"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      title: true,
      email: true,
      location: true,
      bio: true,
      heroHeadline: true,
      avatarUrl: true,
      avatarKey: true,
      socialLinks: true,
    },
  })

  if (!user) redirect("/login")

  const profileData = {
    name: user.name ?? "",
    title: user.title ?? "",
    email: user.email ?? "",
    location: user.location ?? "",
    bio: user.bio ?? "",
    heroHeadline: user.heroHeadline ?? "",
    avatarUrl: user.avatarUrl ?? "",
    avatarKey: user.avatarKey ?? "",
    socialLinks: (user.socialLinks as { platform: string; url: string }[] | null) ?? [],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profilo</h1>
        <p className="text-muted-foreground">
          Gestisci le informazioni del tuo profilo pubblico.
        </p>
      </div>

      <ProfileForm profile={profileData} updateProfileAction={updateProfile} />
    </div>
  )
}

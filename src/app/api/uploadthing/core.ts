import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"

const f = createUploadthing()

export const uploadRouter = {
  avatar: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new Error("Non autenticato")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, key: file.key }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

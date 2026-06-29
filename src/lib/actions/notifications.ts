"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@/generated/prisma/client"

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
) {
  await prisma.notification.create({
    data: { userId, type, title, body },
  })
  revalidatePath("/dashboard")
}

export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  })
  revalidatePath("/dashboard")
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })
  revalidatePath("/dashboard")
}

export async function getUnreadCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  })
}

export async function getRecentNotifications(limit = 10) {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      read: true,
      createdAt: true,
    },
  })
}

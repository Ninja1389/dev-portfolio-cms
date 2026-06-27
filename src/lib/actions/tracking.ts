"use server"

import { prisma } from "@/lib/prisma"

export async function recordPageView(path: string, referrer: string | null) {
  try {
    await prisma.pageView.create({
      data: { path, referrer },
    })
  } catch {
    // silently fail — tracking should never block rendering
  }
}

export async function recordProjectView(projectId: string, referrer: string | null) {
  try {
    await prisma.projectView.create({
      data: { projectId, referrer },
    })
  } catch {
    // silently fail
  }
}

export async function recordClickEvent(projectId: string, type: string, url: string) {
  try {
    await prisma.clickEvent.create({
      data: { projectId, type, url },
    })
  } catch {
    // silently fail
  }
}

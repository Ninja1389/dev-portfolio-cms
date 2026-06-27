"use client"

import { useEffect } from "react"
import { recordProjectView, recordClickEvent } from "@/lib/actions/tracking"

export function ProjectViewRecorder({
  projectId,
}: {
  projectId: string
}) {
  useEffect(() => {
    const referrer = document.referrer || null
    recordProjectView(projectId, referrer)
  }, [projectId])

  return null
}

export function ExternalLinkTracker({
  projectId,
  type,
  url,
  children,
  className,
}: {
  projectId: string
  type: string
  url: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => recordClickEvent(projectId, type, url)}
    >
      {children}
    </a>
  )
}

"use client"

import { useEffect } from "react"
import { recordPageView } from "@/lib/actions/tracking"

export function PageViewTracker() {
  useEffect(() => {
    const referrer = document.referrer || null
    const path = window.location.pathname + window.location.search
    recordPageView(path, referrer)
  }, [])

  return null
}

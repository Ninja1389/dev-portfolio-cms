"use client"

import { useState, useEffect } from "react"
import { markAsRead } from "@/lib/actions/contact"
import { Mail, MailOpen, ChevronDown, ChevronUp } from "lucide-react"

type Message = {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MessagesList({ items }: { items: Message[] }) {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState(items)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m)),
    )
    await markAsRead(id, !currentRead)
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Mail className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">
          Nessun messaggio ricevuto.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-lg border p-4 transition-colors ${
            !msg.read ? "border-blue-200 bg-blue-50/50" : "bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRead(msg.id, msg.read)}
                  className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  title={msg.read ? "Segna come non letto" : "Segna come letto"}
                >
                  {msg.read ? (
                    <MailOpen className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4 text-blue-500" />
                  )}
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {msg.name}
                </span>
                <span className="hidden sm:inline text-xs text-gray-400">
                  {msg.email}
                </span>
                <span className="ml-auto text-xs text-gray-400 shrink-0">
                  {mounted ? formatDate(msg.createdAt) : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                setExpandedId(expandedId === msg.id ? null : msg.id)
              }
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              {expandedId === msg.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          {expandedId === msg.id && (
            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-400 sm:hidden mb-2">
                {msg.email}
              </p>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {msg.message}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

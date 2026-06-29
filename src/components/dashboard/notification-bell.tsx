"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { markAsRead } from "@/lib/actions/notifications"
import type { NotificationType } from "@/generated/prisma/client"

type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  body: string | null
  read: boolean
  createdAt: Date
}

export function NotificationBell({
  initial,
}: {
  initial: { items: NotificationItem[]; unread: number }
}) {
  const router = useRouter()
  const [items, setItems] = useState(initial.items)
  const [unread, setUnread] = useState(initial.unread)

  async function handleClick(id: string) {
    if (!items.find((n) => n.id === id)?.read) {
      await markAsRead(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnread((prev) => Math.max(0, prev - 1))
    }
    router.push("/dashboard/messages")
  }

  const typeIcon = (type: NotificationType) => {
    switch (type) {
      case "NEW_MESSAGE":
        return "✉️"
      case "GITHUB_SYNC":
        return "📦"
      case "SYSTEM_ERROR":
        return "⚠️"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
          <span className="sr-only">Notifiche</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifiche</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => router.push("/dashboard/messages")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Vedi tutti i messaggi
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nessuna notifica
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                !item.read && "bg-muted/50",
              )}
              onClick={() => handleClick(item.id)}
            >
              <span className="mt-0.5 text-base">{typeIcon(item.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !item.read && "font-medium")}>{item.title}</p>
                {item.body && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {item.body}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!item.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm text-muted-foreground"
          onClick={() => router.push("/dashboard/messages")}
        >
          Vedi tutti i messaggi
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

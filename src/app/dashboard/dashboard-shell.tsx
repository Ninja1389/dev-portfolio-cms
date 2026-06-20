"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/auth/logout-button"

type UserData = {
  name: string | null
  email: string | null
}

export function DashboardShell({
  user,
  signOutAction,
  children,
}: {
  user: UserData
  signOutAction: () => Promise<void>
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          <Sidebar />
          <div className="mt-auto border-t p-4">
            <div className="mb-2 px-3 text-sm text-muted-foreground">
              {user.name ?? user.email}
            </div>
            <LogoutButton signOutAction={signOutAction} />
          </div>
        </div>
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <div className="flex h-full flex-col">
            <Sidebar onNavClick={() => setSidebarOpen(false)} />
            <div className="mt-auto border-t p-4">
              <div className="mb-2 px-3 text-sm text-muted-foreground">
                {user.name ?? user.email}
              </div>
              <LogoutButton signOutAction={signOutAction} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          signOutAction={signOutAction}
        />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

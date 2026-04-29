import type { ReactNode } from "react"

import { DesktopSidebar } from "@/components/dashboard/desktop-sidebar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center px-4 lg:hidden">
          <MobileSidebar />
        </div>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

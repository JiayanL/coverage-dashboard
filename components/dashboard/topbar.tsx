import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { UserNav } from "@/components/dashboard/user-nav"

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
      <MobileSidebar />
      <div className="relative hidden flex-1 max-w-md sm:block">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search repositories, reports, or rules..."
          className="h-9 pl-8"
          aria-label="Search"
        />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  )
}

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
      <MobileSidebar />
    </header>
  )
}

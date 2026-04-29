import { SidebarBrand } from "@/components/dashboard/sidebar-brand"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Separator } from "@/components/ui/separator"

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border px-4">
        <SidebarBrand />
      </div>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <div>
          <p className="px-3 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Platform
          </p>
          <SidebarNav group="primary" />
        </div>
        <div>
          <p className="px-3 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Control plane
          </p>
          <SidebarNav group="control-plane" />
        </div>
        <Separator />
        <SidebarNav group="secondary" />
      </div>
    </aside>
  )
}

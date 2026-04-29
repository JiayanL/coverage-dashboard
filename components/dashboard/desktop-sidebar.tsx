"use client"

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarBrand } from "@/components/dashboard/sidebar-brand"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { useSidebar } from "@/components/dashboard/sidebar-context"

export function DesktopSidebar() {
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <SidebarBrand collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <div>
          {!collapsed && (
            <p className="px-3 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Platform
            </p>
          )}
          <SidebarNav group="primary" collapsed={collapsed} />
        </div>
        <Separator />
        <SidebarNav group="secondary" collapsed={collapsed} />
      </div>
    </aside>
  )
}

"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarBrand } from "@/components/dashboard/sidebar-brand"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)
  const close = React.useCallback(() => setOpen(false), [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBrand />
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          <div>
            <p className="px-3 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Platform
            </p>
            <SidebarNav group="primary" onNavigate={close} />
          </div>
          <Separator />
          <SidebarNav group="secondary" onNavigate={close} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

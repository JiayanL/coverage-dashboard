"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { primaryNav, secondaryNav } from "@/lib/navigation"

interface SidebarNavProps {
  group: "primary" | "secondary"
  onNavigate?: () => void
}

export function SidebarNav({ group, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const items = group === "primary" ? primaryNav : secondaryNav

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

import Link from "next/link"
import { ShieldCheckIcon } from "lucide-react"

interface SidebarBrandProps {
  collapsed?: boolean
}

export function SidebarBrand({ collapsed }: SidebarBrandProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold tracking-tight"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheckIcon className="size-4" aria-hidden="true" />
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-tight">
          <span className="text-foreground">Coverage</span>
          <span className="text-xs font-normal text-muted-foreground">
            Control Plane
          </span>
        </span>
      )}
    </Link>
  )
}

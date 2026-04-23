import Link from "next/link"
import { ShieldCheckIcon } from "lucide-react"

export function SidebarBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheckIcon className="size-4" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-foreground">Coverage</span>
        <span className="text-xs font-normal text-muted-foreground">
          Insights dashboard
        </span>
      </span>
    </Link>
  )
}

import {
  LayoutDashboardIcon,
  ShieldCheckIcon,
  FolderGit2Icon,
  FileBarChart2Icon,
  BookOpenTextIcon,
  ClockIcon,
  PlayIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const primaryNav: NavItem[] = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboardIcon,
    description: "High-level coverage metrics",
  },
  {
    title: "Coverage",
    href: "/coverage",
    icon: ShieldCheckIcon,
    description: "Detailed coverage breakdown",
  },
  {
    title: "Repositories",
    href: "/repositories",
    icon: FolderGit2Icon,
    description: "Tracked repositories",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2Icon,
    description: "Scheduled and ad-hoc reports",
  },
]

export const controlPlaneNav: NavItem[] = [
  {
    title: "Playbooks",
    href: "/playbooks",
    icon: PlayIcon,
    description: "Reusable Devin prompts",
  },
  {
    title: "Schedules",
    href: "/schedules",
    icon: ClockIcon,
    description: "Recurring and one-time sessions",
  },
  {
    title: "Knowledge",
    href: "/knowledge",
    icon: BookOpenTextIcon,
    description: "Trigger-based notes",
  },
]

export const secondaryNav: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

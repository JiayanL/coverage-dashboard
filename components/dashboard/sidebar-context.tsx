"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"

type SidebarContextValue = {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((prev) => !prev), [])

  return (
    <SidebarContext value={{ collapsed, toggle }}>
      {children}
    </SidebarContext>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}

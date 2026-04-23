"use client"

import { LogOutIcon, UserIcon, SettingsIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="relative size-8 rounded-full p-0"
            aria-label="Open user menu"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-medium">JL</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Jake Luo</span>
          <span className="text-xs font-normal text-muted-foreground">
            jake@example.com
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

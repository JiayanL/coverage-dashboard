"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { deletePlaybookAction } from "@/app/(dashboard)/playbooks/actions"

export function PlaybookActions({ playbookId }: { playbookId: string }) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    if (
      !window.confirm(
        "Delete this playbook? This cannot be undone and will remove it for the whole team.",
      )
    ) {
      return
    }
    startTransition(async () => {
      const result = await deletePlaybookAction(playbookId)
      if (result?.status === "error") {
        toast.error("Could not delete playbook", {
          description: result.message,
        })
      }
    })
  }

  return (
    <Button
      variant="destructive"
      onClick={onDelete}
      disabled={isPending}
    >
      <Trash2Icon className="size-4" aria-hidden="true" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  )
}

"use client"

import * as React from "react"
import { PauseIcon, PlayIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  deleteScheduleAction,
  toggleScheduleAction,
} from "@/app/(dashboard)/schedules/actions"

export function ScheduleActions({
  scheduleId,
  enabled,
}: {
  scheduleId: string
  enabled: boolean
}) {
  const [isPending, startTransition] = React.useTransition()

  function onToggle() {
    startTransition(async () => {
      const result = await toggleScheduleAction(scheduleId, !enabled)
      if (result.status === "error") {
        toast.error("Could not update schedule", {
          description: result.message,
        })
        return
      }
      toast.success(enabled ? "Schedule paused" : "Schedule enabled")
    })
  }

  function onDelete() {
    if (
      !window.confirm(
        "Delete this schedule? This cannot be undone.",
      )
    ) {
      return
    }
    startTransition(async () => {
      const result = await deleteScheduleAction(scheduleId)
      if (result?.status === "error") {
        toast.error("Could not delete schedule", { description: result.message })
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onToggle} disabled={isPending}>
        {enabled ? (
          <>
            <PauseIcon className="size-4" aria-hidden="true" />
            Pause
          </>
        ) : (
          <>
            <PlayIcon className="size-4" aria-hidden="true" />
            Enable
          </>
        )}
      </Button>
      <Button variant="destructive" onClick={onDelete} disabled={isPending}>
        <Trash2Icon className="size-4" aria-hidden="true" />
        Delete
      </Button>
    </div>
  )
}

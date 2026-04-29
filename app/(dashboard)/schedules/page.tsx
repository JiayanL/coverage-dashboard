import Link from "next/link"
import { ClockIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiErrorState } from "@/components/control-plane/api-error"
import { ConfigRequired } from "@/components/control-plane/config-required"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  DevinApiError,
  DevinConfigError,
  isDevinConfigured,
  listSchedules,
} from "@/lib/devin/client"
import { formatRelativeFromString } from "@/lib/devin/format"

export const metadata = {
  title: "Schedules",
  description: "Manage recurring and one-time Devin sessions.",
}

export const dynamic = "force-dynamic"

export default async function SchedulesPage() {
  const config = isDevinConfigured()
  if (!config.schedules) {
    const missing = !config.base ? ["DEVIN_API_KEY"] : []
    if (config.base) missing.push("DEVIN_ORG_ID")
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Schedules"
          description="Recurring and one-time Devin sessions managed via the v3 API."
        />
        <ConfigRequired missing={missing} resource="schedules" />
      </div>
    )
  }

  let schedules: Awaited<ReturnType<typeof listSchedules>>
  try {
    schedules = await listSchedules()
  } catch (err) {
    if (err instanceof DevinConfigError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Schedules" />
          <ApiErrorState title="Devin API not configured" message={err.message} />
        </div>
      )
    }
    if (err instanceof DevinApiError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Schedules" />
          <ApiErrorState
            title={`Devin API error ${err.status}`}
            message={err.body.slice(0, 320) || "No body returned."}
          />
        </div>
      )
    }
    throw err
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Schedules"
        description="Recurring and one-time Devin sessions."
        actions={
          <Button render={<Link href="/schedules/new" />}>
            <PlusIcon className="size-4" aria-hidden="true" />
            New schedule
          </Button>
        }
      />

      {schedules.length === 0 ? (
        <EmptyState
          icon={ClockIcon}
          title="No schedules yet"
          description="Set up a recurring or one-time scheduled Devin session. Optionally attach a playbook to keep prompts consistent."
          action={
            <Button render={<Link href="/schedules/new" />}>
              <PlusIcon className="size-4" aria-hidden="true" />
              Create schedule
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Schedules ({schedules.length})</CardTitle>
            <CardDescription>
              Click a schedule to edit, enable/disable, or delete it.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-y border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium">Type</th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Frequency
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Playbook
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Last run
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.scheduled_session_id}
                      className="hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/schedules/${encodeURIComponent(schedule.scheduled_session_id)}`}
                          className="flex flex-col gap-0.5 hover:underline"
                        >
                          <span className="font-medium text-foreground">
                            {schedule.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {schedule.scheduled_session_id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {schedule.schedule_type === "recurring"
                          ? "Recurring"
                          : "One-time"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {schedule.schedule_type === "recurring"
                          ? (schedule.frequency ?? "—")
                          : (schedule.scheduled_at ?? "—")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {schedule.playbook ? (
                          <Link
                            href={`/playbooks/${encodeURIComponent(schedule.playbook.playbook_id)}`}
                            className="hover:underline"
                          >
                            {schedule.playbook.title ??
                              schedule.playbook.playbook_id}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={schedule.enabled ? "default" : "secondary"}
                        >
                          {schedule.enabled ? "Enabled" : "Paused"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatRelativeFromString(schedule.last_executed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

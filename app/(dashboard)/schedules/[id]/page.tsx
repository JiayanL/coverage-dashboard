import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

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
import { PageHeader } from "@/components/dashboard/page-header"
import { ScheduleActions } from "@/app/(dashboard)/schedules/[id]/schedule-actions"
import { ScheduleForm } from "@/app/(dashboard)/schedules/schedule-form"
import {
  DevinApiError,
  DevinConfigError,
  getSchedule,
  isDevinConfigured,
  listPlaybooks,
} from "@/lib/devin/client"
import { formatRelativeFromString } from "@/lib/devin/format"

export const dynamic = "force-dynamic"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `Schedule · ${id.slice(0, 8)}` }
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params
  const scheduleId = decodeURIComponent(id)
  const config = isDevinConfigured()
  if (!config.schedules) {
    const missing: string[] = []
    if (!config.v3Key) missing.push("DEVIN_API_KEY_V3")
    if (!config.org) missing.push("DEVIN_ORG_ID")
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Schedule" />
        <ConfigRequired missing={missing} resource="schedules" />
      </div>
    )
  }

  let schedule
  let playbooks: Awaited<ReturnType<typeof listPlaybooks>> = []
  try {
    ;[schedule, playbooks] = await Promise.all([
      getSchedule(scheduleId),
      listPlaybooks().catch(() => []),
    ])
  } catch (err) {
    if (err instanceof DevinApiError && err.status === 404) {
      notFound()
    }
    if (err instanceof DevinConfigError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Schedule" />
          <ApiErrorState title="Devin API not configured" message={err.message} />
        </div>
      )
    }
    if (err instanceof DevinApiError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Schedule" />
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
        title={schedule.name}
        description={`Schedule ${schedule.scheduled_session_id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/schedules" />}>
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              Back
            </Button>
            <ScheduleActions
              scheduleId={schedule.scheduled_session_id}
              enabled={schedule.enabled}
            />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                State
              </dt>
              <dd>
                <Badge variant={schedule.enabled ? "default" : "secondary"}>
                  {schedule.enabled ? "Enabled" : "Paused"}
                </Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Type
              </dt>
              <dd className="text-foreground">
                {schedule.schedule_type === "recurring"
                  ? "Recurring (cron, UTC)"
                  : "One-time"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {schedule.schedule_type === "recurring"
                  ? "Frequency"
                  : "Scheduled at"}
              </dt>
              <dd className="font-mono text-xs text-foreground">
                {schedule.schedule_type === "recurring"
                  ? (schedule.frequency ?? "—")
                  : (schedule.scheduled_at ?? "—")}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Last executed
              </dt>
              <dd className="text-foreground">
                {formatRelativeFromString(schedule.last_executed_at)}
              </dd>
            </div>
            {schedule.last_error_message ? (
              <div className="flex flex-col gap-0.5 sm:col-span-2">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Last error
                </dt>
                <dd className="text-destructive">
                  {schedule.last_error_message}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
          <CardDescription>
            Update the schedule. Changes are saved via the Devin v3 API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm
            mode="edit"
            scheduleId={schedule.scheduled_session_id}
            playbooks={playbooks}
            defaultValues={{
              name: schedule.name,
              prompt: schedule.prompt,
              schedule_type: schedule.schedule_type,
              frequency: schedule.frequency ?? "",
              scheduled_at: schedule.scheduled_at ?? "",
              playbook_id: schedule.playbook?.playbook_id ?? "",
              notify_on: schedule.notify_on,
              agent: schedule.agent,
              tags: (schedule.tags ?? []).join(", "),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

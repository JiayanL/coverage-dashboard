import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfigRequired } from "@/components/control-plane/config-required"
import { PageHeader } from "@/components/dashboard/page-header"
import { ScheduleForm } from "@/app/(dashboard)/schedules/schedule-form"
import { isDevinConfigured, listPlaybooks } from "@/lib/devin/client"

export const metadata = { title: "New schedule" }

export const dynamic = "force-dynamic"

export default async function NewSchedulePage() {
  const config = isDevinConfigured()
  if (!config.schedules) {
    const missing: string[] = []
    if (!config.v3Key) missing.push("DEVIN_API_KEY_V3")
    if (!config.org) missing.push("DEVIN_ORG_ID")
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="New schedule" />
        <ConfigRequired missing={missing} resource="schedules" />
      </div>
    )
  }

  // Schedules can still be created without a playbook; degrade gracefully if
  // the v1 key isn't configured (DevinConfigError) or the API rejects the
  // call (DevinApiError) so users with only a v3 key can still reach the form.
  const playbooks: Awaited<ReturnType<typeof listPlaybooks>> =
    await listPlaybooks().catch(() => [])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New schedule"
        description="Schedule a recurring or one-time Devin session."
      />
      <Card>
        <CardHeader>
          <CardTitle>Schedule details</CardTitle>
          <CardDescription>
            Recurring schedules use a UTC cron expression. One-time schedules
            run once at the specified ISO 8601 datetime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm mode="create" playbooks={playbooks} />
        </CardContent>
      </Card>
    </div>
  )
}

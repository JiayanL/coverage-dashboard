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
import { ScheduleForm } from "@/app/(dashboard)/schedules/schedule-form"
import {
  DevinApiError,
  isDevinConfigured,
  listPlaybooks,
} from "@/lib/devin/client"

export const metadata = { title: "New schedule" }

export const dynamic = "force-dynamic"

export default async function NewSchedulePage() {
  const config = isDevinConfigured()
  if (!config.schedules) {
    const missing = !config.base ? ["DEVIN_API_KEY"] : ["DEVIN_ORG_ID"]
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="New schedule" />
        <ConfigRequired missing={missing} resource="schedules" />
      </div>
    )
  }

  let playbooks: Awaited<ReturnType<typeof listPlaybooks>> = []
  try {
    playbooks = await listPlaybooks()
  } catch (err) {
    // Schedules can still be created without a playbook; surface a soft warning.
    if (err instanceof DevinApiError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="New schedule" />
          <ApiErrorState
            title={`Devin API error ${err.status}`}
            message={`Could not load playbooks: ${err.body.slice(0, 240)}`}
          />
        </div>
      )
    }
    throw err
  }

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

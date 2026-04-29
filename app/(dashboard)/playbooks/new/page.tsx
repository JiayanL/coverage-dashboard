import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfigRequired } from "@/components/control-plane/config-required"
import { PageHeader } from "@/components/dashboard/page-header"
import { PlaybookForm } from "@/app/(dashboard)/playbooks/playbook-form"
import { isDevinConfigured } from "@/lib/devin/client"

export const metadata = { title: "New playbook" }

export default function NewPlaybookPage() {
  const config = isDevinConfigured()
  if (!config.base) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="New playbook" />
        <ConfigRequired missing={["DEVIN_API_KEY"]} resource="playbooks" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New playbook"
        description="Create a reusable Devin prompt for the team."
      />
      <Card>
        <CardHeader>
          <CardTitle>Playbook details</CardTitle>
          <CardDescription>
            Title and body are required. The body is rendered as the prompt
            Devin sees when the playbook is attached.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaybookForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}

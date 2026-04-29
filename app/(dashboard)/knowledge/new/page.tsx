import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfigRequired } from "@/components/control-plane/config-required"
import { PageHeader } from "@/components/dashboard/page-header"
import { KnowledgeForm } from "@/app/(dashboard)/knowledge/knowledge-form"
import { isDevinConfigured } from "@/lib/devin/client"

export const metadata = { title: "New knowledge note" }

export default function NewKnowledgePage() {
  const config = isDevinConfigured()
  if (!config.base) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="New knowledge note" />
        <ConfigRequired missing={["DEVIN_API_KEY_V1"]} resource="knowledge" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New knowledge note"
        description="Capture context Devin should retrieve when working on a particular topic."
      />
      <Card>
        <CardHeader>
          <CardTitle>Note details</CardTitle>
          <CardDescription>
            Name, body, and trigger description are required. Devin uses the
            trigger to decide when to surface the note.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}

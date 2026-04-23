import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsForm } from "@/app/(dashboard)/settings/settings-form"

export const metadata = {
  title: "Settings",
  description: "Configure workspace defaults and notifications.",
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage workspace-wide defaults for coverage tracking."
      />
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            These settings apply across every repository unless overridden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            defaultValues={{
              workspaceName: "Coverage HQ",
              notificationEmail: "alerts@example.com",
              coverageThreshold: 80,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

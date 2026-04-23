import { FileBarChart2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"

export const metadata = {
  title: "Reports",
  description: "Scheduled and ad-hoc coverage reports.",
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Reports"
        description="Generate and schedule coverage reports for stakeholders."
        actions={<Button>New report</Button>}
      />
      <EmptyState
        icon={FileBarChart2Icon}
        title="No reports yet"
        description="Create your first report to share coverage insights across your team."
        action={<Button variant="outline">Read the docs</Button>}
      />
    </div>
  )
}

import {
  ActivityIcon,
  CircleCheckIcon,
  GitBranchIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"

export const metadata = {
  title: "Overview — Coverage Dashboard",
  description: "Track coverage across repositories at a glance.",
}

const activity = [
  {
    id: "run-1043",
    repo: "web-platform",
    message: "Coverage increased to 87.4%",
    author: "CI",
    timestamp: "2 minutes ago",
    status: "passed" as const,
  },
  {
    id: "run-1042",
    repo: "payments-service",
    message: "3 files dropped below 80% threshold",
    author: "CI",
    timestamp: "18 minutes ago",
    status: "warning" as const,
  },
  {
    id: "run-1041",
    repo: "mobile-ios",
    message: "Coverage report generated",
    author: "CI",
    timestamp: "1 hour ago",
    status: "passed" as const,
  },
  {
    id: "run-1040",
    repo: "data-pipelines",
    message: "Report failed — missing instrumentation",
    author: "CI",
    timestamp: "2 hours ago",
    status: "failed" as const,
  },
]

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
        description="A live pulse on coverage across your tracked repositories."
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button>New report</Button>
          </>
        }
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Average coverage"
          value="84.2%"
          icon={TrendingUpIcon}
          delta={{ value: "+1.8%", direction: "up" }}
          description="vs. last 7 days"
        />
        <StatCard
          title="Repositories tracked"
          value="38"
          icon={GitBranchIcon}
          delta={{ value: "+2", direction: "up" }}
          description="added this week"
        />
        <StatCard
          title="Files below threshold"
          value="126"
          icon={ShieldAlertIcon}
          delta={{ value: "-12", direction: "down" }}
          description="resolved this week"
        />
        <StatCard
          title="Passing runs"
          value="97.1%"
          icon={CircleCheckIcon}
          delta={{ value: "stable", direction: "neutral" }}
          description="last 24 hours"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Coverage trend</CardTitle>
            <CardDescription>
              Weighted average across tracked repositories over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ActivityIcon className="size-4" aria-hidden="true" />
                Chart placeholder — wire up data source
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest events from CI pipelines.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pb-2">
            {activity.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-3">
                {index > 0 ? <Separator /> : null}
                <div className="flex items-start gap-3 py-1">
                  <span
                    className={
                      item.status === "passed"
                        ? "mt-1 size-2 shrink-0 rounded-full bg-emerald-500"
                        : item.status === "warning"
                          ? "mt-1 size-2 shrink-0 rounded-full bg-amber-500"
                          : "mt-1 size-2 shrink-0 rounded-full bg-destructive"
                    }
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.repo}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {item.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <EmptyState
          icon={ActivityIcon}
          title="No coverage rules configured"
          description="Define thresholds and notifications to automatically flag regressions."
          action={<Button>Create your first rule</Button>}
        />
      </section>
    </div>
  )
}

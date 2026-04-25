import {
  AlertTriangleIcon,
  CircleCheckIcon,
  GitPullRequestIcon,
  PlayIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AutoRefresh } from "@/components/dashboard/auto-refresh"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { demoRecommendations } from "@/lib/demo/data"
import { getDemoFleetMetrics } from "@/lib/demo/metrics"
import { formatPct } from "@/lib/format"

export const metadata = {
  title: "Fleet",
  description: "Parallel Devin session triage for the coverage demo.",
}

const statusVariant = {
  approved: "secondary",
  rejected: "destructive",
} as const

const sessionStatusLabel = {
  queued: "Queued",
  running: "Running",
  blocked: "Blocked",
  "pr-opened": "PR opened",
  merged: "Merged",
} as const

export default function FleetPage() {
  const metrics = getDemoFleetMetrics()

  return (
    <div className="flex flex-col gap-8">
      <AutoRefresh intervalMs={7000} />
      <PageHeader
        title="Act 2 fleet triage"
        description="Ten highest-impact coverage targets, with explicit human approval before parallel Devin kickoff."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Candidates"
          value={metrics.recommendations.toLocaleString()}
          icon={PlayIcon}
          description="ranked by risk, coverage, ownership"
        />
        <StatCard
          title="Approved"
          value={metrics.approved.toLocaleString()}
          icon={CircleCheckIcon}
          description="safe for parallel sessions"
        />
        <StatCard
          title="Rejected"
          value={metrics.rejected.toLocaleString()}
          icon={AlertTriangleIcon}
          description="deferred by policy or ownership"
        />
        <StatCard
          title="PRs opened"
          value={metrics.openedPrs.toLocaleString()}
          icon={GitPullRequestIcon}
          description={`coverage +${(metrics.coverageDelta * 100).toFixed(1)}pp`}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recommended file queue</CardTitle>
          <CardDescription>
            Use this view for the live triage beat: approve seven, reject three
            with banking-specific reasons.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {demoRecommendations.map((item) => (
            <article
              key={`${item.rank}:${item.path}`}
              className="rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{item.rank}
                    </span>
                    <Badge variant={statusVariant[item.status]}>
                      {item.status}
                    </Badge>
                    <Badge variant="outline">
                      {sessionStatusLabel[item.sessionStatus]}
                    </Badge>
                  </div>
                  <h2 className="mt-2 truncate text-sm font-semibold text-foreground">
                    {item.path}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.service} · {item.owner}
                  </p>
                </div>
                <div className="text-right text-xs tabular-nums">
                  <div className="font-medium text-foreground">
                    {item.impact.toFixed(1)} impact
                  </div>
                  <div className="text-muted-foreground">
                    {formatPct(item.coverage, 0)} /{" "}
                    {formatPct(item.mutationScore, 0)}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-background p-2">
                  <div className="text-muted-foreground">Session</div>
                  <div className="font-medium text-foreground">
                    {item.sessionId}
                  </div>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <div className="text-muted-foreground">PR</div>
                  <div className="font-medium text-foreground">
                    {item.pr ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <div className="text-muted-foreground">Lift</div>
                  <div className="font-medium text-foreground">
                    +{(item.deltaCoverage * 100).toFixed(1)}pp
                  </div>
                </div>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

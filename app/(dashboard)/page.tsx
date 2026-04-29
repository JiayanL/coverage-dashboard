import {
  CircleCheckIcon,
  FileCheck2Icon,
  GitBranchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AutoRefresh } from "@/components/dashboard/auto-refresh"
import { CoverageTrendChart } from "@/components/dashboard/coverage-trend-chart"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  getCoverageTrend,
  getOverviewMetrics,
  getRecentActivity,
} from "@/lib/coverage/queries"
import { demoActOneEvidence } from "@/lib/demo/data"
import { getDemoFleetMetrics } from "@/lib/demo/metrics"
import { formatPct, formatRelativeTime, shortSha } from "@/lib/format"


export const metadata = {
  title: "Overview",
  description: "Track coverage across repositories at a glance.",
}

export const dynamic = "force-dynamic"

export default async function OverviewPage() {
  const [metrics, trend, activity] = await Promise.all([
    getOverviewMetrics(),
    getCoverageTrend(30),
    getRecentActivity(6),
  ])
  const fleet = getDemoFleetMetrics()

  return (
    <div className="flex flex-col gap-8">
      <AutoRefresh />
      <PageHeader
        title="Overview"
        description="A live pulse on coverage across your tracked repositories."
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Average coverage"
          value={formatPct(metrics.averagePct)}
          icon={TrendingUpIcon}
          description="weighted across tracked repos"
        />
        <StatCard
          title="Repositories tracked"
          value={String(metrics.reposTracked)}
          icon={GitBranchIcon}
          description={`${metrics.reposWithData} with ingested data`}
        />
        <StatCard
          title="Files below threshold"
          value={metrics.filesBelowThreshold.toLocaleString()}
          icon={ShieldAlertIcon}
          description={`< ${(metrics.threshold * 100).toFixed(0)}% line coverage`}
        />
        <StatCard
          title="Passing repositories"
          value={formatPct(metrics.passingPct, 0)}
          icon={CircleCheckIcon}
          description={`>= ${(metrics.threshold * 100).toFixed(0)}% threshold`}
        />
      </section>

      <section
        aria-label="Demo fleet pulse"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Mutation score"
          value={formatPct(metrics.mutationScore, 1)}
          icon={ShieldCheckIcon}
          description="weighted mutant kill rate"
        />
        <StatCard
          title="Recommended files"
          value={fleet.recommendations.toLocaleString()}
          description={`${fleet.approved} approved · ${fleet.rejected} rejected`}
        />
        <StatCard
          title="Fleet PRs"
          value={fleet.openedPrs.toLocaleString()}
          description="opened by approved parallel sessions"
        />
        <StatCard
          title="Projected lift"
          value={`+${(fleet.coverageDelta * 100).toFixed(1)}pp`}
          description={`pending PRs · mutation +${(fleet.mutationDelta * 100).toFixed(1)}pp`}
        />
      </section>

      <section
        aria-label="Act 1 evidence"
        className="rounded-xl border border-border bg-muted/20 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-background p-2 text-foreground">
            <FileCheck2Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Act 1 · single-file evidence</Badge>
              <Badge variant="outline">PII_HANDLING</Badge>
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {demoActOneEvidence.path}
            </h2>
            <p className="text-xs text-muted-foreground">
              {demoActOneEvidence.service} · {demoActOneEvidence.owner} (
              {demoActOneEvidence.ownerHandle}) · {demoActOneEvidence.testCount}{" "}
              tests added · PR {demoActOneEvidence.prNumber} merged{" "}
              {demoActOneEvidence.mergedRelative}
            </p>
          </div>
          <div className="ml-auto grid grid-cols-2 gap-3 text-right text-xs tabular-nums">
            <div>
              <div className="text-muted-foreground">Coverage</div>
              <div className="font-medium text-foreground">
                {formatPct(demoActOneEvidence.beforeCoverage, 0)} →{" "}
                {formatPct(demoActOneEvidence.afterCoverage, 0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Mutation</div>
              <div className="font-medium text-foreground">
                {formatPct(demoActOneEvidence.beforeMutation, 0)} →{" "}
                {formatPct(demoActOneEvidence.afterMutation, 0)}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          One engineer with Devin on one file — {demoActOneEvidence.durationMinutes}m,
          one PR. Same dashboard, zoomed in. Beats 1–4 widen this to fleet scale.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Coverage + mutation trend</CardTitle>
            <CardDescription>
              Two numbers moving together — coverage as the area, mutation as
              the dashed line. 30-day window across all tracked repositories.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-primary">
            <CoverageTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest ingested coverage runs.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pb-2">
            {activity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Coverage runs will appear here as soon as the first ingest lands."
              />
            ) : (
              activity.map((item, index) => (
                <div key={item.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3 py-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.repo}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.ref} · {shortSha(item.sha)} ·{" "}
                        {formatRelativeTime(item.runAt)}
                        {item.mutationScore !== null
                          ? ` · mutation ${formatPct(item.mutationScore, 0)}`
                          : ""}
                      </span>
                    </div>
                    <Badge
                      variant={
                        item.status === "passed"
                          ? "secondary"
                          : item.status === "warning"
                            ? "outline"
                            : "destructive"
                      }
                      className="shrink-0 tabular-nums"
                    >
                      {formatPct(item.pct)}
                    </Badge>
                  </div>
                  {index < activity.length - 1 ? <Separator /> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

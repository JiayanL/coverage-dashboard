import {
  AlertTriangleIcon,
  CircleCheckIcon,
  GitPullRequestIcon,
  PauseCircleIcon,
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
import { type DemoRecommendation, demoRecommendations } from "@/lib/demo/data"
import { getDemoFleetMetrics } from "@/lib/demo/metrics"
import { formatPct } from "@/lib/format"

export const metadata = {
  title: "Fleet",
  description: "Parallel Devin session triage for the coverage demo.",
}

const sessionStatusLabel: Record<DemoRecommendation["sessionStatus"], string> = {
  queued: "Queued",
  running: "Running",
  blocked: "Blocked",
  "pr-opened": "PR opened",
  merged: "Merged",
}

const sessionStatusVariant: Record<
  DemoRecommendation["sessionStatus"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  queued: "outline",
  running: "secondary",
  blocked: "destructive",
  "pr-opened": "secondary",
  merged: "secondary",
}

export default function FleetPage() {
  const metrics = getDemoFleetMetrics()
  const approved = demoRecommendations
    .filter((r) => r.status === "approved")
    .sort((a, b) => a.rank - b.rank)
  const rejected = demoRecommendations
    .filter((r) => r.status === "rejected")
    .sort((a, b) => a.rank - b.rank)

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
          description={`coverage +${(metrics.coverageDelta * 100).toFixed(1)}pp · mutation +${(metrics.mutationDelta * 100).toFixed(1)}pp`}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Approved
            <Badge variant="secondary" className="tabular-nums">
              {approved.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Parallel Devin sessions kicked off. Watch the blocked session
            (audit-logger / ForwardingSink) in the live narration &mdash; that&apos;s
            the human-judgment beat.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {approved.map((item) => (
            <RecommendationCard key={item.rank} item={item} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Rejected at triage
            <Badge variant="destructive" className="tabular-nums">
              {rejected.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Specific, owner-aware reasons. These are the rejections you call
            out live &mdash; they&apos;re what makes the triage beat believable
            to a banking audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {rejected.map((item) => (
            <RejectionCard key={item.rank} item={item} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RecommendationCard({ item }: { item: DemoRecommendation }) {
  const isBlocked = item.sessionStatus === "blocked"
  return (
    <article
      className={`rounded-xl border p-4 ${
        isBlocked
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-muted/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              #{item.rank}
            </span>
            <Badge variant={sessionStatusVariant[item.sessionStatus]}>
              {sessionStatusLabel[item.sessionStatus]}
            </Badge>
            {item.complianceCategory && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {item.complianceCategory}
              </Badge>
            )}
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold text-foreground">
            {item.path}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.service} · {item.owner}
            {item.ownerHandle ? ` (${item.ownerHandle})` : ""}
          </p>
        </div>
        <div className="text-right text-xs tabular-nums">
          <div className="font-medium text-foreground">
            {item.impact.toFixed(1)} impact
          </div>
          <div className="text-muted-foreground">
            cov {formatPct(item.coverage, 0)} · mut{" "}
            {formatPct(item.mutationScore, 0)}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>

      {isBlocked && item.blocker && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-background/60 p-3 text-xs">
          <PauseCircleIcon
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div>
            <div className="font-medium text-foreground">
              Stuck — needs human assist
            </div>
            <p className="mt-1 text-muted-foreground">{item.blocker}</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <DataCell label="Session" value={item.sessionId} mono />
        <DataCell label="PR" value={item.pr ?? "—"} />
        <DataCell
          label="Lift"
          value={`+${(item.deltaCoverage * 100).toFixed(1)}pp / +${(
            item.deltaMutation * 100
          ).toFixed(1)}pp`}
        />
      </div>
    </article>
  )
}

function RejectionCard({ item }: { item: DemoRecommendation }) {
  return (
    <article className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          #{item.rank}
        </span>
        <Badge variant="destructive">Rejected</Badge>
        {item.complianceCategory && (
          <Badge variant="outline" className="font-mono text-[10px]">
            {item.complianceCategory}
          </Badge>
        )}
      </div>
      <h3 className="mt-2 truncate text-sm font-semibold text-foreground">
        {item.path}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.service} · {item.owner}
        {item.ownerHandle ? ` (${item.ownerHandle})` : ""}
      </p>
      <p className="mt-3 text-sm text-foreground">{item.reason}</p>
    </article>
  )
}

function DataCell({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-lg bg-background p-2">
      <div className="text-muted-foreground">{label}</div>
      <div
        className={`font-medium text-foreground ${
          mono ? "font-mono text-[11px]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  )
}

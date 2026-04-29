import {
  BinaryIcon,
  CheckCircle2Icon,
  EyeIcon,
  GavelIcon,
  LayersIcon,
  MoonIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { getOverviewMetrics } from "@/lib/coverage/queries"
import { demoPolicyRings } from "@/lib/demo/data"
import { formatPct } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Governance",
  description: "Autonomy rings, quality gates, and policy for Devin coverage work.",
}

export const dynamic = "force-dynamic"

type RingTone = "slate" | "sky" | "amber" | "emerald"

type RingDisplay = {
  ring: string
  label: string
  autonomy: string
  scope: string
  approval: string
  icon: LucideIcon
  tone: RingTone
  permitted: string[]
}

const RING_TONE_STYLES: Record<
  RingTone,
  {
    accent: string
    bar: string
    iconBg: string
    iconFg: string
    badge: string
    ringText: string
  }
> = {
  slate: {
    accent: "border-slate-500/30 bg-slate-500/5",
    bar: "bg-slate-500",
    iconBg: "bg-slate-500/10",
    iconFg: "text-slate-500",
    badge:
      "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    ringText: "text-slate-500",
  },
  sky: {
    accent: "border-sky-500/30 bg-sky-500/5",
    bar: "bg-sky-500",
    iconBg: "bg-sky-500/10",
    iconFg: "text-sky-500",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    ringText: "text-sky-500",
  },
  amber: {
    accent: "border-amber-500/30 bg-amber-500/5",
    bar: "bg-amber-500",
    iconBg: "bg-amber-500/10",
    iconFg: "text-amber-600 dark:text-amber-400",
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ringText: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    accent: "border-emerald-500/30 bg-emerald-500/5",
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-500/10",
    iconFg: "text-emerald-600 dark:text-emerald-400",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    ringText: "text-emerald-600 dark:text-emerald-400",
  },
}

const RING_DISPLAY: Record<string, Omit<RingDisplay, "ring" | "autonomy" | "scope" | "approval">> = {
  ring0_readonly: {
    label: "Read-only",
    icon: EyeIcon,
    tone: "slate",
    permitted: [
      "Read coverage + mutation reports",
      "Produce ranked triage lists",
      "Pull DeepWiki context",
    ],
  },
  ring1_low_risk_tests: {
    label: "Low-risk tests",
    icon: SparklesIcon,
    tone: "sky",
    permitted: [
      "Write tests for pure functions & fixtures",
      "Open draft PRs for human review",
      "Never touch production logic",
    ],
  },
  ring2_compliance_paths: {
    label: "Compliance paths",
    icon: UsersIcon,
    tone: "amber",
    permitted: [
      "Parallel sessions on @ComplianceCritical surfaces",
      "Only within human-approved file list",
      "Ownership-aware boundaries enforced",
    ],
  },
  ring3_overnight: {
    label: "Overnight fleet",
    icon: MoonIcon,
    tone: "emerald",
    permitted: [
      "Scheduled long-horizon backlog",
      "Budget + blast-radius caps",
      "Agent self-rejects on policy conflict",
    ],
  },
}

const HARD_BLOCKS = [
  "Token signing and auth semantics",
  "Active owner migrations",
  "Production logic edits without explicit human review",
]

function ringDisplay(): RingDisplay[] {
  return demoPolicyRings.map((ring) => {
    const meta = RING_DISPLAY[ring.ring]
    return {
      ring: ring.ring,
      autonomy: ring.autonomy,
      scope: ring.scope,
      approval: ring.approval,
      label: meta?.label ?? ring.ring,
      icon: meta?.icon ?? LayersIcon,
      tone: meta?.tone ?? "slate",
      permitted: meta?.permitted ?? [],
    }
  })
}

export default async function GovernancePage() {
  const metrics = await getOverviewMetrics()
  const rings = ringDisplay()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Governance"
        description="Autonomy rings and quality gates that govern how Devin improves coverage."
      />

      {/* Headline gates */}
      <section
        aria-label="Quality gates"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Line coverage"
          value={formatPct(metrics.averagePct)}
          icon={ShieldCheckIcon}
          description="weighted across tracked repos"
        />
        <StatCard
          title="Mutation score"
          value={formatPct(metrics.mutationScore)}
          icon={BinaryIcon}
          description="tests that actually kill mutants"
        />
        <StatCard
          title="Quality gate"
          value="Δ ≥ 0"
          icon={TargetIcon}
          description="coverage & mutation must not regress"
        />
        <StatCard
          title="Autonomy rings"
          value={String(rings.length)}
          icon={LayersIcon}
          description="each ring widens Devin's leash"
        />
      </section>

      {/* Dual-metric explainer */}
      <Card>
        <CardHeader>
          <CardTitle>Why two numbers, not one</CardTitle>
          <CardDescription>
            Every PR opened under governance must keep both line coverage and
            mutation score moving in the right direction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricGateCard
              title="Line coverage"
              pct={metrics.averagePct}
              sublabel="% of lines executed by tests"
              tone="sky"
              icon={ShieldCheckIcon}
            />
            <MetricGateCard
              title="Mutation score"
              pct={metrics.mutationScore}
              sublabel="% of injected mutants detected by tests"
              tone="emerald"
              icon={BinaryIcon}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Coverage alone is gameable — you can execute code without asserting
            on it. Mutation testing injects small faults into the code and asks
            whether the test suite notices. A PR that raises coverage but drops
            mutation is adding weak tests, and is blocked at the quality gate.
          </p>
        </CardContent>
      </Card>

      {/* Ring ladder */}
      <section aria-label="Autonomy rings" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Autonomy rings
            </h2>
            <p className="text-sm text-muted-foreground">
              Four widening levels of trust. Each ring strictly supersets the
              previous one.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            coverage_autonomy_policy.yaml
          </Badge>
        </div>
        <div className="flex flex-col gap-4">
          {rings.map((ring, idx) => (
            <RingCard key={ring.ring} ring={ring} index={idx} />
          ))}
        </div>
      </section>

      {/* Hard blocks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GavelIcon className="size-4 text-destructive" />
            Hard blocks
          </CardTitle>
          <CardDescription>
            Surfaces Devin will never autonomously touch, regardless of ring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {HARD_BLOCKS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 size-2 shrink-0 rounded-full bg-destructive"
                />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function RingCard({ ring, index }: { ring: RingDisplay; index: number }) {
  const tone = RING_TONE_STYLES[ring.tone]
  const Icon = ring.icon
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 transition-shadow",
        tone.accent,
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", tone.bar)} />
      <div className="grid gap-5 md:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              tone.iconBg,
            )}
          >
            <Icon className={cn("size-5", tone.iconFg)} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <div
              className={cn(
                "text-xs font-medium uppercase tracking-wider",
                tone.ringText,
              )}
            >
              Ring {index}
            </div>
            <div className="truncate text-base font-semibold text-foreground">
              {ring.label}
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              {ring.ring}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Autonomy
          </div>
          <Badge
            variant="outline"
            className={cn("w-fit text-xs font-medium", tone.badge)}
          >
            {ring.autonomy}
          </Badge>
          <p className="mt-1 text-sm text-foreground">{ring.scope}</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Approval
          </div>
          <p className="text-sm text-foreground">{ring.approval}</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Permitted actions
          </div>
          <ul className="flex flex-col gap-1.5">
            {ring.permitted.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <CheckCircle2Icon
                  className={cn("mt-0.5 size-3.5 shrink-0", tone.iconFg)}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function MetricGateCard({
  title,
  pct,
  sublabel,
  tone,
  icon: Icon,
}: {
  title: string
  pct: number | null
  sublabel: string
  tone: "sky" | "emerald"
  icon: LucideIcon
}) {
  const styles = RING_TONE_STYLES[tone]
  const percentValue = pct !== null ? Math.max(0, Math.min(pct * 100, 100)) : 0
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4",
        styles.accent,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            styles.iconBg,
          )}
        >
          <Icon className={cn("size-4", styles.iconFg)} aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-foreground">
          {formatPct(pct)}
        </span>
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", styles.bar)}
          style={{ width: `${percentValue}%` }}
        />
      </div>
    </div>
  )
}

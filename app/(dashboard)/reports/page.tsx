import { DownloadIcon, ShieldCheckIcon, ShieldXIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { demoOvernightDigest, demoPolicyRings } from "@/lib/demo/data"

export const metadata = {
  title: "Reports",
  description: "Scheduled and ad-hoc coverage reports.",
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Act 3 governance artifacts"
        description="Static but credible artifacts for the autonomy teaser: policy envelope, overnight digest, downloadable YAML."
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Policy envelope</CardTitle>
              <CardDescription>
                Four rings that convert the Act 2 human triage workflow into a
                longer-leash scheduled system.
              </CardDescription>
            </div>
            <a
              href="/coverage_autonomy_policy.yaml"
              download
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              <DownloadIcon className="size-4" aria-hidden="true" />
              Download policy.yaml
            </a>
          </CardHeader>
          <CardContent className="grid gap-3">
            {demoPolicyRings.map((ring) => (
              <div
                key={ring.ring}
                className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[0.7fr_1fr_1fr_1fr]"
              >
                <div>
                  <div className="text-xs text-muted-foreground">Ring</div>
                  <div className="font-mono text-sm font-medium text-foreground">
                    {ring.ring}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Autonomy</div>
                  <div className="text-sm text-foreground">{ring.autonomy}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Scope</div>
                  <div className="text-sm text-foreground">{ring.scope}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Approval</div>
                  <div className="text-sm text-foreground">{ring.approval}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{demoOvernightDigest.title}</CardTitle>
            <CardDescription>{demoOvernightDigest.window}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <DigestMetric
                label="Sessions"
                value={demoOvernightDigest.sessions.toLocaleString()}
              />
              <DigestMetric
                label="Approved"
                value={demoOvernightDigest.approved.toLocaleString()}
              />
              <DigestMetric
                label="Self-rejected"
                value={demoOvernightDigest.selfRejected.toLocaleString()}
              />
              <DigestMetric
                label="Policy-blocked"
                value={demoOvernightDigest.policyBlocked.toLocaleString()}
              />
              <DigestMetric
                label="PRs opened"
                value={demoOvernightDigest.prsOpened.toLocaleString()}
              />
              <DigestMetric
                label="Merged"
                value={demoOvernightDigest.merged.toLocaleString()}
              />
              <DigestMetric
                label="Coverage lift"
                value={`+${(
                  demoOvernightDigest.projectedCoverageDelta * 100
                ).toFixed(1)}pp`}
              />
              <DigestMetric
                label="Mutation lift"
                value={`+${(
                  demoOvernightDigest.projectedMutationDelta * 100
                ).toFixed(1)}pp`}
              />
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-destructive" />
                <Badge variant="destructive">Policy blocked</Badge>
              </div>
              <div className="font-mono text-xs text-foreground">
                {demoOvernightDigest.blockedItem.sessionId}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {demoOvernightDigest.blockedItem.path}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {demoOvernightDigest.blockedItem.reason}
              </p>
            </div>

            {demoOvernightDigest.selfRejectedSamples.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldXIcon className="size-4 text-muted-foreground" />
                  <Badge variant="outline">Agent self-rejected</Badge>
                </div>
                <ul className="flex flex-col gap-3">
                  {demoOvernightDigest.selfRejectedSamples.map((s) => (
                    <li key={s.sessionId} className="flex flex-col gap-1">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {s.sessionId}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {s.path}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Same guardrails as Act 2, longer leash, scheduled cadence. Live
              demo skips this &mdash; it&apos;s the artifact you point at and
              walk away from.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>YAML preview</CardTitle>
          <CardDescription>
            Inline copy of the downloadable artifact. Show this in the 90-second
            Act 3 teaser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
            {`coverage_autonomy_policy:
  repo: JiayanL/consumer-banking-platform
  objective: raise OCC-critical coverage without reducing mutation score
  budget:
    max_sessions_per_night: 50
    max_parallel_sessions: 12
    max_files_per_session: 3
  quality_gates:
    require_tests_pass: true
    require_coverage_delta_nonnegative: true
    require_mutation_delta_nonnegative: true
  rings:
${demoPolicyRings
  .map(
    (ring) => `    ${ring.ring}:
      autonomy: ${ring.autonomy}
      scope: ${ring.scope}
      approval: ${ring.approval}`,
  )
  .join("\n")}
  hard_blocks:
    - token signing and auth semantics
    - active owner migrations
    - production logic edits without explicit human review`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

function DigestMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  )
}

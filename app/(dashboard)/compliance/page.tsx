import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  COMPLIANCE_CATEGORIES,
  OCC_GATE_PCT,
  SERVICE_CATEGORY_MAP,
  type ComplianceCategory,
} from "@/lib/compliance/config"
import { getCoverageRows } from "@/lib/coverage/queries"
import { formatPct } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Compliance",
  description: "OCC compliance category coverage.",
}

export const dynamic = "force-dynamic"

type ServiceRow = Awaited<ReturnType<typeof getCoverageRows>>[number]

type CategoryRollup = {
  category: ComplianceCategory
  label: string
  description: string
  covered: number
  total: number
  pct: number
  services: ServiceRow[]
}

function buildCategoryRollups(rows: ServiceRow[]): {
  rollups: CategoryRollup[]
  unmapped: ServiceRow[]
} {
  const mapped = new Set<string>()
  const buckets: Record<ComplianceCategory, { covered: number; total: number; services: ServiceRow[] }> = {
    TRANSACTION_INTEGRITY: { covered: 0, total: 0, services: [] },
    AUTHENTICATION: { covered: 0, total: 0, services: [] },
    PII_HANDLING: { covered: 0, total: 0, services: [] },
    AUDIT_TRAIL: { covered: 0, total: 0, services: [] },
  }

  for (const row of rows) {
    const categories = SERVICE_CATEGORY_MAP[row.name]
    if (!categories) continue
    mapped.add(row.name)
    for (const cat of categories) {
      buckets[cat].covered += row.covered
      buckets[cat].total += row.total
      buckets[cat].services.push(row)
    }
  }

  const rollups: CategoryRollup[] = (
    Object.entries(COMPLIANCE_CATEGORIES) as [ComplianceCategory, { label: string; description: string }][]
  ).map(([key, meta]) => {
    const b = buckets[key]
    return {
      category: key,
      label: meta.label,
      description: meta.description,
      covered: b.covered,
      total: b.total,
      pct: b.total > 0 ? b.covered / b.total : 0,
      services: b.services,
    }
  })

  const unmapped = rows.filter((r) => !mapped.has(r.name))

  return { rollups, unmapped }
}

export default async function CompliancePage() {
  const rows = await getCoverageRows()
  const { rollups, unmapped } = buildCategoryRollups(rows)

  const allCovered = rollups.reduce((s, r) => s + r.covered, 0)
  const allTotal = rollups.reduce((s, r) => s + r.total, 0)
  const overallPct = allTotal > 0 ? allCovered / allTotal : 0

  const meetingGate = rollups.filter((r) => r.pct >= OCC_GATE_PCT).length

  const highest = rollups.reduce((a, b) => (b.pct > a.pct ? b : a), rollups[0])
  const lowest = rollups.reduce((a, b) => (b.pct < a.pct ? b : a), rollups[0])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Compliance"
        description="OCC compliance category coverage against a 70% gate."
      />

      {rollups.every((r) => r.services.length === 0) ? (
        <EmptyState
          title="No compliance-tagged services found"
          description="Ingest coverage data for services listed in the compliance map."
        />
      ) : (
        <>
          {/* Summary stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Overall compliance coverage"
              value={formatPct(overallPct)}
              description="Weighted across all compliance-tagged services"
            />
            <StatCard
              title="Categories meeting OCC gate"
              value={`${meetingGate} / ${rollups.length}`}
              description={`>= ${formatPct(OCC_GATE_PCT, 0)} threshold`}
            />
            <StatCard
              title="Highest category"
              value={formatPct(highest.pct)}
              description={highest.label}
            />
            <StatCard
              title="Lowest category"
              value={formatPct(lowest.pct)}
              description={`${lowest.label} — triage priority`}
            />
          </div>

          {/* Per-category cards */}
          <div className="flex flex-col gap-6">
            {rollups.map((r) => (
              <Card key={r.category}>
                <CardHeader>
                  <CardTitle>{r.label}</CardTitle>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Coverage headline + progress bar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-semibold tabular-nums text-foreground">
                        {formatPct(r.pct)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        OCC gate: {formatPct(OCC_GATE_PCT, 0)}
                      </span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          r.pct >= OCC_GATE_PCT
                            ? "bg-emerald-500"
                            : "bg-destructive"
                        )}
                        style={{ width: `${Math.min(r.pct * 100, 100)}%` }}
                      />
                      {/* OCC gate marker */}
                      <div
                        className="absolute top-[-3px] h-[14px] w-px border-l-2 border-dashed border-foreground/40"
                        style={{ left: `${OCC_GATE_PCT * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Service table */}
                  {r.services.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-sm">
                        <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Service
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Lang
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Coverage
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Lines covered
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {r.services.map((s) => (
                            <tr key={s.name} className="hover:bg-muted/30">
                              <td className="px-4 py-3 font-medium text-foreground">
                                {s.name}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {s.lang}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                                {formatPct(s.pct)}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                {s.covered.toLocaleString()} /{" "}
                                {s.total.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Badge
                                  variant={
                                    s.passing ? "secondary" : "destructive"
                                  }
                                >
                                  {s.passing ? "Passing" : "Below threshold"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No coverage data for services in this category.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Other (unmapped) services */}
          {unmapped.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Other services</CardTitle>
                <CardDescription>
                  Services not mapped to an OCC compliance category.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium">
                          Service
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium">
                          Lang
                        </th>
                        <th className="px-4 py-2.5 text-right font-medium">
                          Coverage
                        </th>
                        <th className="px-4 py-2.5 text-right font-medium">
                          Lines covered
                        </th>
                        <th className="px-4 py-2.5 text-right font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {unmapped.map((s) => (
                        <tr key={s.name} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.lang}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">
                            {formatPct(s.pct)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            {s.covered.toLocaleString()} /{" "}
                            {s.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Badge
                              variant={s.passing ? "secondary" : "destructive"}
                            >
                              {s.passing ? "Passing" : "Below threshold"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

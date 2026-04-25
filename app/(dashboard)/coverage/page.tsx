import Link from "next/link"
import { ShieldCheckIcon } from "lucide-react"

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
import { DEFAULT_THRESHOLD_PCT, getCoverageRows } from "@/lib/coverage/queries"
import { formatPct } from "@/lib/format"

export const metadata = {
  title: "Coverage",
  description: "Detailed coverage breakdown by repository and service.",
}

export const dynamic = "force-dynamic"

export default async function CoveragePage() {
  const rows = await getCoverageRows()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Coverage"
        description={`Per-service coverage, scored against a ${DEFAULT_THRESHOLD_PCT}% threshold.`}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No coverage runs ingested yet"
          description="Once your CI posts to /api/ingest/coverage, services will show up here."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Latest coverage per service across all tracked repositories.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Repository
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Service
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Lang</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Coverage
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Mutation
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
                  {rows.map((row, idx) => (
                    <tr
                      key={`${row.fullName}:${row.name}:${idx}`}
                      className="hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-foreground">
                        <Link
                          href={`/repositories/${row.fullName
                            .split("/")
                            .map(encodeURIComponent)
                            .join("/")}`}
                          className="font-medium hover:underline"
                        >
                          {row.repo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.lang}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {formatPct(row.pct)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {formatPct(row.mutationScore)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {row.covered.toLocaleString()} /{" "}
                        {row.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant={row.passing ? "secondary" : "destructive"}
                        >
                          {row.passing ? "Passing" : "Below threshold"}
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
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"

export const metadata = {
  title: "Coverage",
  description: "Detailed coverage breakdown by repository.",
}

const repositories = [
  { name: "web-platform", coverage: 87.4, threshold: 80, trend: "+1.2" },
  { name: "payments-service", coverage: 79.1, threshold: 85, trend: "-0.4" },
  { name: "mobile-ios", coverage: 91.6, threshold: 80, trend: "+0.8" },
  { name: "data-pipelines", coverage: 62.3, threshold: 75, trend: "+3.1" },
  { name: "internal-tools", coverage: 88.9, threshold: 80, trend: "0.0" },
]

export default function CoveragePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Coverage"
        description="Drill into coverage by repository, service, and branch."
      />

      <Card>
        <CardHeader>
          <CardTitle>Repositories</CardTitle>
          <CardDescription>
            Current coverage against configured thresholds.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Repository</th>
                  <th className="px-4 py-2.5 text-right font-medium">Coverage</th>
                  <th className="px-4 py-2.5 text-right font-medium">Threshold</th>
                  <th className="px-4 py-2.5 text-right font-medium">7d trend</th>
                  <th className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {repositories.map((repo) => {
                  const passing = repo.coverage >= repo.threshold
                  return (
                    <tr key={repo.name} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {repo.name}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {repo.coverage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {repo.threshold.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {repo.trend}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={passing ? "secondary" : "destructive"}>
                          {passing ? "Passing" : "Below threshold"}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

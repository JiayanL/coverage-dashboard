import Link from "next/link"
import { FolderGit2Icon } from "lucide-react"

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
import { DEFAULT_THRESHOLD_PCT, listRepositorySummaries } from "@/lib/coverage/queries"
import { formatPct, formatRelativeTime, shortSha } from "@/lib/format"

export const metadata = {
  title: "Repositories",
  description: "Repositories ingesting coverage into this dashboard.",
}

export const dynamic = "force-dynamic"

export default async function RepositoriesPage() {
  const repos = await listRepositorySummaries()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Repositories"
        description={`Repositories pushing coverage into this dashboard. Threshold is ${DEFAULT_THRESHOLD_PCT}%.`}
      />

      {repos.length === 0 ? (
        <EmptyState
          icon={FolderGit2Icon}
          title="No repositories connected"
          description="Add a coverage ingest step to your CI to start tracking. POST to /api/ingest/coverage with the standard payload."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Connected repositories</CardTitle>
            <CardDescription>
              Click a repository to see per-service coverage.
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
                    <th className="px-4 py-2.5 text-left font-medium">Kind</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Coverage
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      7d delta
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Last run
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {repos.map((repo) => {
                    const threshold = DEFAULT_THRESHOLD_PCT / 100
                    const passing =
                      repo.latestPct !== null && repo.latestPct >= threshold
                    return (
                      <tr key={repo.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Link
                            href={`/repositories/${repo.fullName
                              .split("/")
                              .map(encodeURIComponent)
                              .join("/")}`}
                            className="flex flex-col gap-0.5 hover:underline"
                          >
                            <span className="font-medium text-foreground">
                              {repo.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {repo.fullName} · {shortSha(repo.latestSha)}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {repo.kind}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">
                          {formatPct(repo.latestPct)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {repo.weekDelta === null
                            ? "—"
                            : `${repo.weekDelta >= 0 ? "+" : ""}${(repo.weekDelta * 100).toFixed(2)}%`}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatRelativeTime(repo.latestRunAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {repo.latestPct === null ? (
                            <Badge variant="outline">No data</Badge>
                          ) : (
                            <Badge
                              variant={passing ? "secondary" : "destructive"}
                            >
                              {passing ? "Passing" : "Below threshold"}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

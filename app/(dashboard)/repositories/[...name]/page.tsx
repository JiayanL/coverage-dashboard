import { notFound } from "next/navigation"

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
import { getServicesForRepo } from "@/lib/coverage/queries"
import { formatPct, formatRelativeTime, shortSha } from "@/lib/format"

export const dynamic = "force-dynamic"

type Params = { name: string[] }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}) {
  const { name } = await params
  return { title: name.map(decodeURIComponent).join("/") }
}

export default async function RepositoryDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { name } = await params
  // Catch-all segment so owner/repo paths render without manual encoding.
  const fullName = name.map(decodeURIComponent).join("/")
  const result = await getServicesForRepo(fullName)
  if (!result.repo) notFound()

  const { repo, services, runAt, sha } = result

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={repo.displayName}
        description={`${repo.fullName} · ${repo.kind} · last run ${formatRelativeTime(runAt)} (${shortSha(sha)})`}
      />

      {services.length === 0 ? (
        <EmptyState
          title="No coverage data yet"
          description="Waiting for the first ingest from CI."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Coverage for each service in the latest ingested run.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                  <tr>
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
                      Tests
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {services.map((s) => (
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
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {formatPct(s.mutationScore)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {s.covered.toLocaleString()} /{" "}
                        {s.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {s.testsRun === null
                          ? "—"
                          : `${s.testsPassed ?? 0}/${s.testsRun}`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={s.passing ? "secondary" : "destructive"}>
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
    </div>
  )
}

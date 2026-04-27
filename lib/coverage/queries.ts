import { and, asc, desc, eq, gte, sql } from "drizzle-orm"

import { db } from "@/lib/db/client"
import {
  coverageFile,
  coverageRun,
  coverageService,
  repository,
} from "@/lib/db/schema"

export const DEFAULT_THRESHOLD_PCT = (() => {
  const raw = process.env.COVERAGE_DEFAULT_THRESHOLD
  const parsed = raw ? Number(raw) : 70
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) return 70
  return parsed
})()

export type RepoSummary = {
  id: number
  fullName: string
  displayName: string
  kind: "single" | "monorepo"
  latestSha: string | null
  latestRef: string | null
  latestRunAt: Date | null
  latestPct: number | null
  latestMutationScore: number | null
  // delta vs the most recent run that is at least 7 days older.
  weekDelta: number | null
}

export async function listRepositorySummaries(): Promise<RepoSummary[]> {
  const repos = await db
    .select()
    .from(repository)
    .orderBy(asc(repository.displayName))

  const out: RepoSummary[] = []
  for (const r of repos) {
    const latestRows = await db
      .select()
      .from(coverageRun)
      .where(eq(coverageRun.repositoryId, r.id))
      .orderBy(desc(coverageRun.runAt))
      .limit(1)
    const latest = latestRows[0]

    let weekDelta: number | null = null
    if (latest) {
      const sevenDaysAgo = new Date(latest.runAt.getTime() - 7 * 24 * 3600 * 1000)
      const baselineRows = await db
        .select()
        .from(coverageRun)
        .where(
          and(
            eq(coverageRun.repositoryId, r.id),
            sql`${coverageRun.runAt} <= ${sevenDaysAgo.toISOString()}`,
          ),
        )
        .orderBy(desc(coverageRun.runAt))
        .limit(1)
      const baseline = baselineRows[0]
      if (baseline) {
        weekDelta = latest.pct - baseline.pct
      }
    }

    out.push({
      id: r.id,
      fullName: r.fullName,
      displayName: r.displayName,
      kind: r.kind,
      latestSha: latest?.sha ?? null,
      latestRef: latest?.ref ?? null,
      latestRunAt: latest?.runAt ?? null,
      latestPct: latest?.pct ?? null,
      latestMutationScore: latest?.mutationScore ?? null,
      weekDelta,
    })
  }
  return out
}

export async function getOverviewMetrics() {
  const repos = await listRepositorySummaries()
  const reposWithData = repos.filter((r) => r.latestPct !== null)

  let weightedCovered = 0
  let weightedTotal = 0
  for (const r of reposWithData) {
    const latest = await db
      .select()
      .from(coverageRun)
      .where(eq(coverageRun.repositoryId, r.id))
      .orderBy(desc(coverageRun.runAt))
      .limit(1)
    if (latest[0]) {
      weightedCovered += latest[0].coveredInstructions
      weightedTotal += latest[0].totalInstructions
    }
  }
  const averagePct = weightedTotal > 0 ? weightedCovered / weightedTotal : null
  const mutationScore = await getWeightedMutationScore(
    reposWithData.map((r) => r.id),
  )

  // Files below threshold across the latest run of each repo.
  const threshold = DEFAULT_THRESHOLD_PCT / 100
  let filesBelowThreshold = 0
  for (const r of reposWithData) {
    const latest = await db
      .select({ id: coverageRun.id })
      .from(coverageRun)
      .where(eq(coverageRun.repositoryId, r.id))
      .orderBy(desc(coverageRun.runAt))
      .limit(1)
    if (!latest[0]) continue
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(coverageFile)
      .where(
        and(
          eq(coverageFile.runId, latest[0].id),
          sql`${coverageFile.pct} < ${threshold}`,
        ),
      )
    filesBelowThreshold += Number(result[0]?.count ?? 0)
  }

  // Passing runs: latest run per repo whose overall pct >= threshold.
  const passingRepos = reposWithData.filter(
    (r) => (r.latestPct ?? 0) >= threshold,
  ).length
  const passingPct =
    reposWithData.length > 0 ? passingRepos / reposWithData.length : null

  return {
    averagePct,
    mutationScore,
    reposTracked: repos.length,
    reposWithData: reposWithData.length,
    filesBelowThreshold,
    passingPct,
    threshold,
  }
}

async function getWeightedMutationScore(repoIds: number[]) {
  let killed = 0
  let total = 0
  for (const id of repoIds) {
    const latest = await db
      .select()
      .from(coverageRun)
      .where(eq(coverageRun.repositoryId, id))
      .orderBy(desc(coverageRun.runAt))
      .limit(1)
    const run = latest[0]
    if (!run || run.mutationKilled === null || run.mutationTotal === null) {
      continue
    }
    killed += run.mutationKilled
    total += run.mutationTotal
  }
  return total > 0 ? killed / total : null
}

export async function getCoverageTrend(days = 30) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000)
  const rows = await db
    .select({
      repositoryId: coverageRun.repositoryId,
      runAt: coverageRun.runAt,
      covered: coverageRun.coveredInstructions,
      total: coverageRun.totalInstructions,
      mutationKilled: coverageRun.mutationKilled,
      mutationTotal: coverageRun.mutationTotal,
    })
    .from(coverageRun)
    .where(gte(coverageRun.runAt, since))
    .orderBy(asc(coverageRun.runAt))

  // For each (repo, day) keep only the latest run, then sum across repos per
  // day. Without this dedupe, repos that ingest multiple times on the same
  // day would be double-counted, inflating the day's overall coverage.
  type LatestPerRepoDay = {
    runAt: Date
    covered: number
    total: number
    mutationKilled: number | null
    mutationTotal: number | null
  }
  const latestByRepoDay = new Map<string, LatestPerRepoDay>()
  for (const row of rows) {
    const day = row.runAt.toISOString().slice(0, 10)
    const key = `${row.repositoryId}:${day}`
    const existing = latestByRepoDay.get(key)
    if (!existing || row.runAt > existing.runAt) {
      latestByRepoDay.set(key, {
        runAt: row.runAt,
        covered: row.covered,
        total: row.total,
        mutationKilled: row.mutationKilled,
        mutationTotal: row.mutationTotal,
      })
    }
  }

  type Bucket = {
    date: string
    covered: number
    total: number
    mutationKilled: number
    mutationTotal: number
  }
  const byDay = new Map<string, Bucket>()
  for (const [key, run] of latestByRepoDay) {
    const day = key.split(":")[1]
    const bucket =
      byDay.get(day) ??
      { date: day, covered: 0, total: 0, mutationKilled: 0, mutationTotal: 0 }
    bucket.covered += run.covered
    bucket.total += run.total
    if (run.mutationKilled !== null && run.mutationTotal !== null) {
      bucket.mutationKilled += run.mutationKilled
      bucket.mutationTotal += run.mutationTotal
    }
    byDay.set(day, bucket)
  }
  return Array.from(byDay.values())
    .map((b) => ({
      date: b.date,
      pct: b.total > 0 ? b.covered / b.total : 0,
      mutationScore:
        b.mutationTotal > 0 ? b.mutationKilled / b.mutationTotal : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export type RecentActivityItem = {
  id: number
  repo: string
  sha: string
  ref: string
  pct: number
  mutationScore: number | null
  threshold: number
  runAt: Date
  status: "passed" | "warning" | "failed"
}

export async function getRecentActivity(
  limit = 6,
): Promise<RecentActivityItem[]> {
  const rows = await db
    .select({
      id: coverageRun.id,
      repo: repository.displayName,
      sha: coverageRun.sha,
      ref: coverageRun.ref,
      pct: coverageRun.pct,
      mutationScore: coverageRun.mutationScore,
      runAt: coverageRun.runAt,
    })
    .from(coverageRun)
    .innerJoin(repository, eq(repository.id, coverageRun.repositoryId))
    .orderBy(desc(coverageRun.runAt))
    .limit(limit)

  const threshold = DEFAULT_THRESHOLD_PCT / 100
  return rows.map((row) => ({
    id: row.id,
    repo: row.repo,
    sha: row.sha,
    ref: row.ref,
    pct: row.pct,
    mutationScore: row.mutationScore,
    threshold,
    runAt: row.runAt,
    status:
      row.pct >= threshold
        ? "passed"
        : row.pct >= threshold * 0.9
          ? "warning"
          : "failed",
  }))
}

export type ServiceRow = {
  name: string
  lang: string
  description: string | null
  covered: number
  total: number
  pct: number
  mutationScore: number | null
  mutationKilled: number | null
  mutationTotal: number | null
  testsRun: number | null
  testsPassed: number | null
  testsFailed: number | null
  testsErrors: number | null
  testsSkipped: number | null
  threshold: number
  passing: boolean
}

export async function getServicesForRepo(
  repoFullName: string,
): Promise<{
  repo: { fullName: string; displayName: string; kind: string } | null
  services: ServiceRow[]
  runAt: Date | null
  sha: string | null
}> {
  const repo = await db
    .select()
    .from(repository)
    .where(eq(repository.fullName, repoFullName))
    .limit(1)
  if (!repo[0]) {
    return { repo: null, services: [], runAt: null, sha: null }
  }
  const latest = await db
    .select()
    .from(coverageRun)
    .where(eq(coverageRun.repositoryId, repo[0].id))
    .orderBy(desc(coverageRun.runAt))
    .limit(1)
  if (!latest[0]) {
    return {
      repo: {
        fullName: repo[0].fullName,
        displayName: repo[0].displayName,
        kind: repo[0].kind,
      },
      services: [],
      runAt: null,
      sha: null,
    }
  }
  const services = await db
    .select()
    .from(coverageService)
    .where(eq(coverageService.runId, latest[0].id))
    .orderBy(asc(coverageService.name))

  const threshold = DEFAULT_THRESHOLD_PCT / 100
  return {
    repo: {
      fullName: repo[0].fullName,
      displayName: repo[0].displayName,
      kind: repo[0].kind,
    },
    services: services.map((s) => ({
      name: s.name,
      lang: s.lang,
      description: s.description,
      covered: s.covered,
      total: s.total,
      pct: s.pct,
      mutationScore: s.mutationScore,
      mutationKilled: s.mutationKilled,
      mutationTotal: s.mutationTotal,
      testsRun: s.testsRun,
      testsPassed: s.testsPassed,
      testsFailed: s.testsFailed,
      testsErrors: s.testsErrors,
      testsSkipped: s.testsSkipped,
      threshold,
      passing: s.pct >= threshold,
    })),
    runAt: latest[0].runAt,
    sha: latest[0].sha,
  }
}

export async function getCoverageRows(): Promise<
  Array<{
    repo: string
    fullName: string
    name: string
    lang: string
    description: string | null
    covered: number
    total: number
    pct: number
    mutationScore: number | null
    mutationKilled: number | null
    mutationTotal: number | null
    testsRun: number | null
    testsPassed: number | null
    testsFailed: number | null
    testsErrors: number | null
    testsSkipped: number | null
    threshold: number
    passing: boolean
  }>
> {
  const repos = await db.select().from(repository).orderBy(asc(repository.displayName))
  const out: Array<{
    repo: string
    fullName: string
    name: string
    lang: string
    description: string | null
    covered: number
    total: number
    pct: number
    mutationScore: number | null
    mutationKilled: number | null
    mutationTotal: number | null
    testsRun: number | null
    testsPassed: number | null
    testsFailed: number | null
    testsErrors: number | null
    testsSkipped: number | null
    threshold: number
    passing: boolean
  }> = []
  const threshold = DEFAULT_THRESHOLD_PCT / 100
  for (const r of repos) {
    const latest = await db
      .select()
      .from(coverageRun)
      .where(eq(coverageRun.repositoryId, r.id))
      .orderBy(desc(coverageRun.runAt))
      .limit(1)
    if (!latest[0]) continue
    const services = await db
      .select()
      .from(coverageService)
      .where(eq(coverageService.runId, latest[0].id))
      .orderBy(asc(coverageService.name))
    if (services.length === 0) {
      out.push({
        repo: r.displayName,
        fullName: r.fullName,
        name: r.displayName,
        lang: "—",
        description: null,
        covered: latest[0].coveredInstructions,
        total: latest[0].totalInstructions,
        pct: latest[0].pct,
        mutationScore: latest[0].mutationScore,
        mutationKilled: latest[0].mutationKilled,
        mutationTotal: latest[0].mutationTotal,
        testsRun: null,
        testsPassed: null,
        testsFailed: null,
        testsErrors: null,
        testsSkipped: null,
        threshold,
        passing: latest[0].pct >= threshold,
      })
      continue
    }
    for (const s of services) {
      out.push({
        repo: r.displayName,
        fullName: r.fullName,
        name: s.name,
        lang: s.lang,
        description: s.description,
        covered: s.covered,
        total: s.total,
        pct: s.pct,
        mutationScore: s.mutationScore,
        mutationKilled: s.mutationKilled,
        mutationTotal: s.mutationTotal,
        testsRun: s.testsRun,
        testsPassed: s.testsPassed,
        testsFailed: s.testsFailed,
        testsErrors: s.testsErrors,
        testsSkipped: s.testsSkipped,
        threshold,
        passing: s.pct >= threshold,
      })
    }
  }
  return out
}

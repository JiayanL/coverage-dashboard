import { eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import {
  coverageFile,
  coverageRun,
  coverageService,
  repository,
} from "@/lib/db/schema"
import { type IngestPayload, parseTimestamp } from "@/lib/coverage/schema"

export type IngestResult = {
  repoId: number
  runId: number
  sha: string
  pct: number
  servicesIngested: number
  filesIngested: number
}

// Shared ingest core. Used by:
//   - /api/ingest/coverage    (CI POSTs here with a Bearer token)
//   - /api/demo/coverage-step (Act 2 Beat 4 staged ticks)
//
// Both paths must use the same transactional contract: a single
// coverage_run is upserted on (repo, sha) and dependent coverage_service
// / coverage_file rows are replaced for that run inside one tx, so a
// partial failure can't leave a run stripped of its rows.
export async function ingestCoveragePayload(
  payload: IngestPayload,
): Promise<IngestResult> {
  const serviceCount = Object.keys(payload.services).length
  const inferredKind: "single" | "monorepo" =
    payload.kind ?? (serviceCount > 1 ? "monorepo" : "single")
  const displayName =
    payload.display_name ?? payload.repo.split("/").pop() ?? payload.repo
  const runAt = parseTimestamp(payload.timestamp)

  const serviceRowsBase = Object.entries(payload.services).map(
    ([name, svc]) => {
      const ts = payload.test_summary?.services?.[name]
      return {
        name,
        lang: svc.lang,
        description: svc.description ?? null,
        covered: svc.covered,
        total: svc.total,
        pct: svc.pct,
        mutationKilled: svc.mutation?.killed ?? null,
        mutationTotal: svc.mutation?.total ?? null,
        mutationScore: svc.mutation?.score ?? null,
        testsRun: ts?.run ?? null,
        testsPassed: ts?.passed ?? null,
        testsFailed: ts?.failed ?? null,
        testsErrors: ts?.errors ?? null,
        testsSkipped: ts?.skipped ?? null,
      }
    },
  )

  const result = await db.transaction(async (tx) => {
    const repoRow = await tx
      .insert(repository)
      .values({
        fullName: payload.repo,
        displayName,
        kind: inferredKind,
        defaultBranch: "main",
      })
      .onConflictDoUpdate({
        target: repository.fullName,
        set: { displayName, kind: inferredKind },
      })
      .returning({ id: repository.id })
    const repoId = repoRow[0].id

    const runRow = await tx
      .insert(coverageRun)
      .values({
        repositoryId: repoId,
        sha: payload.sha,
        ref: payload.ref,
        runId: payload.run_id ?? null,
        coveredInstructions: payload.overall.covered,
        totalInstructions: payload.overall.total,
        pct: payload.overall.pct,
        mutationKilled: payload.overall.mutation?.killed ?? null,
        mutationTotal: payload.overall.mutation?.total ?? null,
        mutationScore: payload.overall.mutation?.score ?? null,
        runAt,
      })
      .onConflictDoUpdate({
        target: [coverageRun.repositoryId, coverageRun.sha],
        set: {
          ref: payload.ref,
          runId: payload.run_id ?? null,
          coveredInstructions: payload.overall.covered,
          totalInstructions: payload.overall.total,
          pct: payload.overall.pct,
          mutationKilled: payload.overall.mutation?.killed ?? null,
          mutationTotal: payload.overall.mutation?.total ?? null,
          mutationScore: payload.overall.mutation?.score ?? null,
          runAt,
        },
      })
      .returning({ id: coverageRun.id })
    const runRowId = runRow[0].id

    await tx.delete(coverageService).where(eq(coverageService.runId, runRowId))
    await tx.delete(coverageFile).where(eq(coverageFile.runId, runRowId))

    if (serviceRowsBase.length > 0) {
      await tx
        .insert(coverageService)
        .values(serviceRowsBase.map((s) => ({ ...s, runId: runRowId })))
    }

    if (payload.files && payload.files.length > 0) {
      const CHUNK = 500
      for (let i = 0; i < payload.files.length; i += CHUNK) {
        const slice = payload.files.slice(i, i + CHUNK)
        await tx.insert(coverageFile).values(
          slice.map((f) => ({
            runId: runRowId,
            serviceName: f.service,
            path: f.path,
            lang: f.lang,
            covered: f.covered,
            total: f.total,
            pct: f.pct,
          })),
        )
      }
    }

    return { repoId, runRowId }
  })

  return {
    repoId: result.repoId,
    runId: result.runRowId,
    sha: payload.sha,
    pct: payload.overall.pct,
    servicesIngested: serviceRowsBase.length,
    filesIngested: payload.files?.length ?? 0,
  }
}

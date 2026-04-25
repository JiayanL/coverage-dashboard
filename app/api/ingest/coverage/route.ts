import { NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import {
  coverageFile,
  coverageRun,
  coverageService,
  repository,
} from "@/lib/db/schema"
import { ingestPayload, parseTimestamp } from "@/lib/coverage/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest): NextResponse | null {
  const expected = process.env.INGEST_TOKEN
  if (!expected) {
    return NextResponse.json(
      { error: "INGEST_TOKEN not configured" },
      { status: 500 },
    )
  }
  const header = request.headers.get("authorization") ?? ""
  const provided = header.startsWith("Bearer ") ? header.slice(7) : ""
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = ingestPayload.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const payload = parsed.data

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
        covered: svc.covered,
        total: svc.total,
        pct: svc.pct,
        testsRun: ts?.run ?? null,
        testsPassed: ts?.passed ?? null,
        testsFailed: ts?.failed ?? null,
        testsErrors: ts?.errors ?? null,
        testsSkipped: ts?.skipped ?? null,
      }
    },
  )

  // The whole ingest runs inside a single transaction so a partial failure
  // (e.g. function timeout between deletes and inserts on re-ingest) cannot
  // leave a coverage_run stripped of its dependent service/file rows. Both
  // upserts use ON CONFLICT to remain race-safe under concurrent CI runs.
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
          runAt,
        },
      })
      .returning({ id: coverageRun.id })
    const runRowId = runRow[0].id

    // Replace dependent rows for this run. Both deletes are scoped to the
    // run id and both inserts happen inside the same transaction; if anything
    // fails the deletes are rolled back.
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

  return NextResponse.json({
    success: true,
    repository: { id: result.repoId, full_name: payload.repo },
    run: {
      id: result.runRowId,
      sha: payload.sha,
      ref: payload.ref,
      pct: payload.overall.pct,
    },
    services_ingested: serviceRowsBase.length,
    files_ingested: payload.files?.length ?? 0,
  })
}

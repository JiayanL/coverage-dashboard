import { NextResponse, type NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"

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

  // Upsert repository row.
  const existingRepo = await db
    .select()
    .from(repository)
    .where(eq(repository.fullName, payload.repo))
    .limit(1)

  let repoId: number
  if (existingRepo.length === 0) {
    const inserted = await db
      .insert(repository)
      .values({
        fullName: payload.repo,
        displayName,
        kind: inferredKind,
        defaultBranch: "main",
      })
      .returning({ id: repository.id })
    repoId = inserted[0].id
  } else {
    repoId = existingRepo[0].id
    await db
      .update(repository)
      .set({ displayName, kind: inferredKind })
      .where(eq(repository.id, repoId))
  }

  // Upsert coverage_run by (repo, sha). Replace dependent rows on re-ingest.
  const existingRun = await db
    .select()
    .from(coverageRun)
    .where(and(eq(coverageRun.repositoryId, repoId), eq(coverageRun.sha, payload.sha)))
    .limit(1)

  let runRowId: number
  if (existingRun.length > 0) {
    runRowId = existingRun[0].id
    await db
      .update(coverageRun)
      .set({
        ref: payload.ref,
        runId: payload.run_id ?? null,
        coveredInstructions: payload.overall.covered,
        totalInstructions: payload.overall.total,
        pct: payload.overall.pct,
        runAt,
      })
      .where(eq(coverageRun.id, runRowId))
    await db.delete(coverageService).where(eq(coverageService.runId, runRowId))
    await db.delete(coverageFile).where(eq(coverageFile.runId, runRowId))
  } else {
    const inserted = await db
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
      .returning({ id: coverageRun.id })
    runRowId = inserted[0].id
  }

  const testSummary = payload.test_summary?.services ?? {}
  const serviceRows = Object.entries(payload.services).map(([name, svc]) => {
    const ts = testSummary[name]
    return {
      runId: runRowId,
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
  })

  if (serviceRows.length > 0) {
    await db.insert(coverageService).values(serviceRows)
  }

  if (payload.files && payload.files.length > 0) {
    // Insert in chunks to keep statements small for serverless drivers.
    const CHUNK = 500
    for (let i = 0; i < payload.files.length; i += CHUNK) {
      const slice = payload.files.slice(i, i + CHUNK)
      await db.insert(coverageFile).values(
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

  return NextResponse.json({
    success: true,
    repository: { id: repoId, full_name: payload.repo },
    run: { id: runRowId, sha: payload.sha, ref: payload.ref, pct: payload.overall.pct },
    services_ingested: serviceRows.length,
    files_ingested: payload.files?.length ?? 0,
  })
}

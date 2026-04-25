import { NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import {
  coverageFile,
  coverageRun,
  coverageService,
  repository,
} from "@/lib/db/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const services = [
  {
    name: "account-service",
    lang: "java",
    total: 842,
    pct: [0.56, 0.58, 0.59],
    mutation: [0.48, 0.49, 0.51],
  },
  {
    name: "ledger-service",
    lang: "java",
    total: 916,
    pct: [0.52, 0.55, 0.57],
    mutation: [0.46, 0.49, 0.51],
  },
  {
    name: "wire-transfer-service",
    lang: "java",
    total: 1032,
    pct: [0.41, 0.45, 0.49],
    mutation: [0.34, 0.38, 0.42],
  },
  {
    name: "customer-profile-api",
    lang: "ts",
    total: 731,
    pct: [0.44, 0.46, 0.48],
    mutation: [0.31, 0.34, 0.36],
  },
  {
    name: "kyc-enrichment",
    lang: "py",
    total: 688,
    pct: [0.48, 0.51, 0.53],
    mutation: [0.39, 0.42, 0.45],
  },
  {
    name: "reporting-aggregator",
    lang: "py",
    total: 512,
    pct: [0.39, 0.41, 0.43],
    mutation: [0.33, 0.35, 0.37],
  },
]

const belowThresholdFiles = [
  "src/main/java/com/cbp/wire/SanctionsScreener.java",
  "src/main/java/com/cbp/ledger/DoubleEntryValidator.java",
  "src/kyc_enrichment/risk_scoring.py",
  "src/piiMasking.ts",
  "src/reporting_aggregator/exporters.py",
  "src/main/java/com/cbp/audit/ForwardingSink.java",
]

export async function POST(request: NextRequest) {
  if (!demoEnabled()) {
    return NextResponse.json(
      { error: "Demo ingest is disabled. Set DEMO_MODE=1 to enable it." },
      { status: 403 },
    )
  }

  const step = readStep(request)
  const index = Math.max(0, Math.min(step, 2))
  const runAt = new Date()

  const result = await db.transaction(async (tx) => {
    const repoRows = await tx
      .insert(repository)
      .values({
        fullName: "JiayanL/consumer-banking-platform",
        displayName: "consumer-banking-platform",
        kind: "monorepo",
        defaultBranch: "main",
      })
      .onConflictDoUpdate({
        target: repository.fullName,
        set: {
          displayName: "consumer-banking-platform",
          kind: "monorepo",
        },
      })
      .returning({ id: repository.id })

    const serviceRows = services.map((service) => {
      const pct = service.pct[index]
      const mutationScore = service.mutation[index]
      return {
        name: service.name,
        lang: service.lang,
        covered: Math.round(service.total * pct),
        total: service.total,
        pct,
        mutationKilled: Math.round(120 * mutationScore),
        mutationTotal: 120,
        mutationScore,
        testsRun: 24 + index * 3,
        testsPassed: 24 + index * 3,
        testsFailed: 0,
        testsErrors: 0,
        testsSkipped: index === 0 ? 2 : 0,
      }
    })

    const covered = serviceRows.reduce((sum, service) => sum + service.covered, 0)
    const total = serviceRows.reduce((sum, service) => sum + service.total, 0)
    const mutationKilled = serviceRows.reduce(
      (sum, service) => sum + service.mutationKilled,
      0,
    )
    const mutationTotal = serviceRows.reduce(
      (sum, service) => sum + service.mutationTotal,
      0,
    )
    const repoId = repoRows[0].id
    const runRows = await tx
      .insert(coverageRun)
      .values({
        repositoryId: repoId,
        sha: `demoact2${index}`,
        ref: "demo/act-2-fleet",
        runId: `demo-act-2-step-${index}`,
        coveredInstructions: covered,
        totalInstructions: total,
        pct: covered / total,
        mutationKilled,
        mutationTotal,
        mutationScore: mutationKilled / mutationTotal,
        runAt,
      })
      .onConflictDoUpdate({
        target: [coverageRun.repositoryId, coverageRun.sha],
        set: {
          ref: "demo/act-2-fleet",
          runId: `demo-act-2-step-${index}`,
          coveredInstructions: covered,
          totalInstructions: total,
          pct: covered / total,
          mutationKilled,
          mutationTotal,
          mutationScore: mutationKilled / mutationTotal,
          runAt,
        },
      })
      .returning({ id: coverageRun.id })
    const runId = runRows[0].id

    await tx.delete(coverageService).where(eq(coverageService.runId, runId))
    await tx.delete(coverageFile).where(eq(coverageFile.runId, runId))

    await tx.insert(coverageService).values(
      serviceRows.map((service) => ({
        ...service,
        runId,
      })),
    )
    await tx.insert(coverageFile).values(
      belowThresholdFiles.map((path, fileIndex) => {
        const service = serviceRows[fileIndex % serviceRows.length]
        const pct = Math.min(0.69, service.pct - 0.08 + index * 0.02)
        const totalLines = 80 + fileIndex * 7
        return {
          runId,
          serviceName: service.name,
          path,
          lang: service.lang,
          covered: Math.round(totalLines * pct),
          total: totalLines,
          pct,
        }
      }),
    )

    return {
      runId,
      pct: covered / total,
      mutationScore: mutationKilled / mutationTotal,
    }
  })

  return NextResponse.json({
    success: true,
    step: index,
    run: result,
  })
}

function demoEnabled() {
  return process.env.DEMO_MODE === "1"
}

function readStep(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("step") ?? "1"
  const parsed = Number.parseInt(raw, 10)
  return Number.isNaN(parsed) ? 1 : parsed
}

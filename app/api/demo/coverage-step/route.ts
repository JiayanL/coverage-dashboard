import { NextResponse, type NextRequest } from "next/server"

import { ingestCoveragePayload } from "@/lib/coverage/ingest"
import {
  DEMO_REPO,
  DEMO_STEP_COUNT,
  buildAllDemoStepPayloads,
  buildDemoStepPayload,
} from "@/lib/demo/coverage-step"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Act 2 Beat 4 stage tick. Each call writes one (or all) staged
// `coverage_run` rows for `consumer-banking-platform`, so the live demo
// can advance the coverage + mutation lines visibly without reaching for
// the CI ingest payload.
//
// Auth is intentionally relaxed for ergonomic stage use, but the route is
// hard-disabled outside DEMO_MODE. If a Bearer matching INGEST_TOKEN is
// present it is also accepted (so CI / scripts can drive it the same way
// they drive /api/ingest/coverage).
//
// Examples:
//   curl -X POST 'http://localhost:3000/api/demo/coverage-step?step=0'
//   curl -X POST 'http://localhost:3000/api/demo/coverage-step?step=1'
//   curl -X POST 'http://localhost:3000/api/demo/coverage-step?all=1'
function checkDemoEnabled(request: NextRequest): NextResponse | null {
  if (process.env.DEMO_MODE === "1" || process.env.DEMO_MODE === "true") {
    return null
  }
  const expected = process.env.INGEST_TOKEN
  if (expected) {
    const header = request.headers.get("authorization") ?? ""
    const provided = header.startsWith("Bearer ") ? header.slice(7) : ""
    if (provided && provided === expected) return null
  }
  return NextResponse.json(
    {
      error:
        "Demo coverage stepping is disabled. Set DEMO_MODE=1 or send a valid Bearer INGEST_TOKEN.",
    },
    { status: 403 },
  )
}

export async function POST(request: NextRequest) {
  const guard = checkDemoEnabled(request)
  if (guard) return guard

  const url = request.nextUrl
  const wantsAll =
    url.searchParams.get("all") === "1" ||
    url.searchParams.get("all") === "true"

  if (wantsAll) {
    const payloads = buildAllDemoStepPayloads()
    const results = []
    for (const payload of payloads) {
      results.push(await ingestCoveragePayload(payload))
    }
    return NextResponse.json({
      success: true,
      mode: "all",
      repo: DEMO_REPO,
      runs: results.map((r, i) => ({
        step: i,
        sha: r.sha,
        run_id: r.runId,
        pct: r.pct,
      })),
    })
  }

  const stepParam = url.searchParams.get("step") ?? "0"
  const step = Number.parseInt(stepParam, 10)
  if (Number.isNaN(step) || step < 0 || step >= DEMO_STEP_COUNT) {
    return NextResponse.json(
      {
        error: `step must be an integer in [0, ${DEMO_STEP_COUNT - 1}]`,
      },
      { status: 400 },
    )
  }

  const payload = buildDemoStepPayload(step)
  const result = await ingestCoveragePayload(payload)

  return NextResponse.json({
    success: true,
    mode: "step",
    repo: DEMO_REPO,
    step,
    sha: result.sha,
    run_id: result.runId,
    pct: result.pct,
    services_ingested: result.servicesIngested,
    files_ingested: result.filesIngested,
  })
}

export async function GET() {
  return NextResponse.json({
    repo: DEMO_REPO,
    step_count: DEMO_STEP_COUNT,
    usage: {
      single_step: "POST /api/demo/coverage-step?step=N (N in [0, 3])",
      all_steps: "POST /api/demo/coverage-step?all=1",
      enable: "Set DEMO_MODE=1 or send Authorization: Bearer $INGEST_TOKEN",
    },
  })
}

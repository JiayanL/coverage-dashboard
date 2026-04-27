import { NextResponse, type NextRequest } from "next/server"

import { ingestCoveragePayload } from "@/lib/coverage/ingest"
import { ingestPayload } from "@/lib/coverage/schema"

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
  const result = await ingestCoveragePayload(payload)

  return NextResponse.json({
    success: true,
    repository: { id: result.repoId, full_name: payload.repo },
    run: {
      id: result.runId,
      sha: result.sha,
      ref: payload.ref,
      pct: result.pct,
    },
    services_ingested: result.servicesIngested,
    files_ingested: result.filesIngested,
  })
}

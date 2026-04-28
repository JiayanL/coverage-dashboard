import { NextResponse, type NextRequest } from "next/server"

import { demoRecommendations } from "@/lib/demo/data"
import { SlackTriageNotifier } from "@/lib/notifications/slack"
import type { TriageSummary } from "@/lib/notifications/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DEFAULT_REPO = "JiayanL/consumer-banking-platform"

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

  const slackUrl = process.env.SLACK_WEBHOOK_DEVIN_TRIAGE
  if (!slackUrl) {
    return NextResponse.json(
      { error: "SLACK_WEBHOOK_DEVIN_TRIAGE not configured" },
      { status: 500 },
    )
  }

  let body: { repo?: string; dashboardUrl?: string; channel?: string } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    // allow empty body — defaults are fine
  }

  const dashboardUrl =
    body.dashboardUrl ??
    request.headers.get("x-dashboard-url") ??
    process.env.NEXT_PUBLIC_DASHBOARD_URL ??
    "https://coverage-dashboard.vercel.app"

  const summary: TriageSummary = {
    candidates: demoRecommendations,
    repo: body.repo ?? DEFAULT_REPO,
    dashboardUrl,
  }

  const channel = body.channel ?? "slack"

  if (channel === "slack") {
    const notifier = new SlackTriageNotifier(slackUrl)
    const result = await notifier.send(summary)
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, channel: result.channel },
        { status: 502 },
      )
    }
    return NextResponse.json({ ok: true, channel: result.channel })
  }

  return NextResponse.json(
    { error: `Unsupported channel: ${channel}. Supported: slack` },
    { status: 400 },
  )
}

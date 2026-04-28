import type { DemoRecommendation } from "@/lib/demo/data"

export type TriageSummary = {
  candidates: DemoRecommendation[]
  repo: string
  dashboardUrl: string
}

export type NotifyResult = {
  ok: boolean
  channel: string
  error?: string
}

export interface TriageNotifier {
  channel: string
  send(summary: TriageSummary): Promise<NotifyResult>
}

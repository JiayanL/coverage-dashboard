import type { DemoRecommendation } from "@/lib/demo/data"
import type { NotifyResult, TriageNotifier, TriageSummary } from "./types"

type SlackBlock =
  | { type: "header"; text: { type: "plain_text"; text: string } }
  | { type: "section"; text: { type: "mrkdwn"; text: string }; accessory?: SlackAccessory }
  | { type: "divider" }
  | { type: "context"; elements: Array<{ type: "mrkdwn"; text: string }> }
  | { type: "actions"; elements: SlackButton[] }

type SlackAccessory = {
  type: "button"
  text: { type: "plain_text"; text: string }
  url: string
  style?: "primary" | "danger"
}

type SlackButton = {
  type: "button"
  text: { type: "plain_text"; text: string }
  url: string
  style?: "primary" | "danger"
}

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`
}

function candidateBlock(item: DemoRecommendation, dashboardUrl: string): SlackBlock[] {
  const emoji = item.status === "approved" ? ":white_check_mark:" : ":no_entry_sign:"
  const statusLabel = item.status === "approved" ? "Approved" : "Rejected"

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `${emoji} *#${item.rank} — ${item.path}*`,
          `*Service:* ${item.service}  |  *Owner:* ${item.owner}  |  *Status:* ${statusLabel}`,
          `*Coverage:* ${pct(item.coverage)}  |  *Mutation:* ${pct(item.mutationScore)}  |  *Impact:* ${item.impact.toFixed(1)}`,
          `> ${item.reason}`,
        ].join("\n"),
      },
    },
  ]

  if (item.status === "approved") {
    const sessionUrl = `${dashboardUrl}/fleet`
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View in Fleet" },
          url: sessionUrl,
          style: "primary",
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Kick off Devin" },
          url: `https://app.devin.ai/sessions/new?prompt=${encodeURIComponent(`Write tests for ${item.path} in JiayanL/consumer-banking-platform to improve coverage from ${pct(item.coverage)} toward 80%. Follow the existing test patterns for the ${item.service} service.`)}`,
        },
      ],
    })
  }

  return blocks
}

function buildBlocks(summary: TriageSummary): SlackBlock[] {
  const approved = summary.candidates.filter((c) => c.status === "approved")
  const rejected = summary.candidates.filter((c) => c.status === "rejected")
  const totalImpact = approved.reduce((sum, c) => sum + c.impact, 0)
  const projectedLift = approved.reduce((sum, c) => sum + c.deltaCoverage, 0)

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Coverage Triage Summary",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `*Repo:* \`${summary.repo}\``,
          `*Candidates:* ${summary.candidates.length}  |  *Approved:* ${approved.length}  |  *Rejected:* ${rejected.length}`,
          `*Total impact:* ${totalImpact.toFixed(1)}  |  *Projected lift:* +${(projectedLift * 100).toFixed(1)}pp`,
        ].join("\n"),
      },
    },
    { type: "divider" },
  ]

  for (const item of approved) {
    blocks.push(...candidateBlock(item, summary.dashboardUrl))
    blocks.push({ type: "divider" })
  }

  if (rejected.length > 0) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: "*Rejected candidates*" }],
    })
    for (const item of rejected) {
      blocks.push(...candidateBlock(item, summary.dashboardUrl))
    }
    blocks.push({ type: "divider" })
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<${summary.dashboardUrl}/fleet|View full fleet> · <${summary.dashboardUrl}/reports|View reports>`,
      },
    ],
  })

  return blocks
}

export class SlackTriageNotifier implements TriageNotifier {
  channel = "slack"
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async send(summary: TriageSummary): Promise<NotifyResult> {
    const blocks = buildBlocks(summary)

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Coverage Triage Summary — ${summary.candidates.length} candidates for ${summary.repo}`,
        blocks,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error")
      return { ok: false, channel: this.channel, error: `${response.status}: ${text}` }
    }

    return { ok: true, channel: this.channel }
  }
}

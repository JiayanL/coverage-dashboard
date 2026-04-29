import "server-only"

import type {
  CreatedSession,
  Knowledge,
  KnowledgeFolder,
  Playbook,
  Schedule,
} from "@/lib/devin/types"

const DEFAULT_BASE_URL = "https://api.devin.ai"

export class DevinApiError extends Error {
  status: number
  body: string

  constructor(status: number, body: string, message?: string) {
    super(message ?? `Devin API error ${status}: ${body}`)
    this.status = status
    this.body = body
    this.name = "DevinApiError"
  }
}

export class DevinConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DevinConfigError"
  }
}

function getApiKey(): string {
  const key = process.env.DEVIN_API_KEY
  if (!key) {
    throw new DevinConfigError(
      "DEVIN_API_KEY is not set. Add a personal API key (apk_*) or service user token (cog_*) to enable the control plane.",
    )
  }
  return key
}

/**
 * Devin API keys (`apk_*` and `cog_*`) embed the organization id as base64("org-<uuid>:<secret>").
 * Decode that prefix so callers don't need a separate DEVIN_ORG_ID variable.
 */
export function deriveOrgIdFromKey(key: string): string | null {
  const match = key.match(/^(?:apk|cog)(?:_user)?_(.+)$/)
  const payload = match ? match[1] : key
  const candidates = [payload]
  // Some keys may use base64url; normalize before attempting decode.
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
  if (normalized !== payload) candidates.push(normalized)
  for (const candidate of candidates) {
    try {
      const decoded = Buffer.from(candidate, "base64").toString("utf-8")
      const orgMatch = decoded.match(/org-[a-f0-9]{32}/i)
      if (orgMatch) return orgMatch[0]
    } catch {
      // ignore and try next candidate
    }
  }
  return null
}

function getOrgId(): string {
  const explicit = process.env.DEVIN_ORG_ID
  if (explicit) return explicit
  const apiKey = process.env.DEVIN_API_KEY
  if (apiKey) {
    const derived = deriveOrgIdFromKey(apiKey)
    if (derived) return derived
  }
  throw new DevinConfigError(
    "Could not determine Devin organization id. Set DEVIN_ORG_ID, or use an apk_*/cog_* API key that embeds the org id.",
  )
}

function getBaseUrl(): string {
  return process.env.DEVIN_API_BASE_URL ?? DEFAULT_BASE_URL
}

export function isDevinConfigured(): {
  base: boolean
  schedules: boolean
} {
  const key = process.env.DEVIN_API_KEY
  const hasKey = Boolean(key)
  const hasOrg = Boolean(
    process.env.DEVIN_ORG_ID || (key && deriveOrgIdFromKey(key)),
  )
  return {
    base: hasKey,
    schedules: hasKey && hasOrg,
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  signal?: AbortSignal
  // Cache for read-heavy paths is opt-in. Default is no-store so server pages
  // see fresh data on each load.
  revalidate?: number
}

async function devinFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const apiKey = getApiKey()
  const url = `${getBaseUrl()}${path}`
  const init: RequestInit & { next?: { revalidate: number } } = {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: options.revalidate === undefined ? "no-store" : undefined,
    signal: options.signal,
  }
  if (options.revalidate !== undefined) {
    init.next = { revalidate: options.revalidate }
  }
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }

  const res = await fetch(url, init)
  const text = await res.text()
  if (!res.ok) {
    throw new DevinApiError(res.status, text)
  }
  if (res.status === 204 || text.length === 0) {
    return undefined as T
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new DevinApiError(res.status, text, "Devin API returned non-JSON response")
  }
}

// ---------- Playbooks (v1) ----------

export async function listPlaybooks(): Promise<Playbook[]> {
  return devinFetch<Playbook[]>("/v1/playbooks")
}

export async function getPlaybook(playbookId: string): Promise<Playbook> {
  return devinFetch<Playbook>(`/v1/playbooks/${encodeURIComponent(playbookId)}`)
}

export async function createPlaybook(input: {
  title: string
  body: string
  macro?: string | null
}): Promise<Playbook> {
  return devinFetch<Playbook>("/v1/playbooks", {
    method: "POST",
    body: input,
  })
}

export async function updatePlaybook(
  playbookId: string,
  input: { title: string; body: string; macro?: string | null },
): Promise<Playbook> {
  return devinFetch<Playbook>(`/v1/playbooks/${encodeURIComponent(playbookId)}`, {
    method: "PUT",
    body: input,
  })
}

export async function deletePlaybook(playbookId: string): Promise<void> {
  await devinFetch<void>(`/v1/playbooks/${encodeURIComponent(playbookId)}`, {
    method: "DELETE",
  })
}

// ---------- Knowledge (v1) ----------

type AllKnowledgeResponse = {
  knowledge: Knowledge[]
  folders: KnowledgeFolder[]
}

export async function listKnowledge(): Promise<AllKnowledgeResponse> {
  return devinFetch<AllKnowledgeResponse>("/v1/knowledge")
}

export async function createKnowledge(input: {
  name: string
  body: string
  trigger_description: string
  parent_folder_id?: string | null
  pinned_repo?: string | null
  macro?: string | null
}): Promise<Knowledge> {
  return devinFetch<Knowledge>("/v1/knowledge", {
    method: "POST",
    body: input,
  })
}

export async function updateKnowledge(
  knowledgeId: string,
  input: {
    name: string
    body: string
    trigger_description: string
    parent_folder_id?: string | null
    pinned_repo?: string | null
    macro?: string | null
  },
): Promise<Knowledge> {
  return devinFetch<Knowledge>(
    `/v1/knowledge/${encodeURIComponent(knowledgeId)}`,
    {
      method: "PUT",
      body: input,
    },
  )
}

export async function deleteKnowledge(knowledgeId: string): Promise<void> {
  await devinFetch<void>(`/v1/knowledge/${encodeURIComponent(knowledgeId)}`, {
    method: "DELETE",
  })
}

// ---------- Schedules (v3) ----------

export async function listSchedules(): Promise<Schedule[]> {
  const orgId = getOrgId()
  const data = await devinFetch<{ schedules?: Schedule[] } | Schedule[]>(
    `/v3/organizations/${encodeURIComponent(orgId)}/schedules`,
  )
  if (Array.isArray(data)) return data
  return data.schedules ?? []
}

export async function getSchedule(scheduleId: string): Promise<Schedule> {
  const orgId = getOrgId()
  return devinFetch<Schedule>(
    `/v3/organizations/${encodeURIComponent(orgId)}/schedules/${encodeURIComponent(scheduleId)}`,
  )
}

export type CreateScheduleInput = {
  name: string
  prompt: string
  schedule_type: "recurring" | "one_time"
  frequency?: string | null
  scheduled_at?: string | null
  playbook_id?: string | null
  notify_on?: "always" | "failure" | "never"
  agent?: "devin" | "data_analyst" | "advanced"
  tags?: string[] | null
  bypass_approval?: boolean
}

export async function createSchedule(
  input: CreateScheduleInput,
): Promise<Schedule> {
  const orgId = getOrgId()
  return devinFetch<Schedule>(
    `/v3/organizations/${encodeURIComponent(orgId)}/schedules`,
    {
      method: "POST",
      body: input,
    },
  )
}

export async function updateSchedule(
  scheduleId: string,
  input: Partial<CreateScheduleInput> & { enabled?: boolean },
): Promise<Schedule> {
  const orgId = getOrgId()
  return devinFetch<Schedule>(
    `/v3/organizations/${encodeURIComponent(orgId)}/schedules/${encodeURIComponent(scheduleId)}`,
    {
      method: "PATCH",
      body: input,
    },
  )
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  const orgId = getOrgId()
  await devinFetch<void>(
    `/v3/organizations/${encodeURIComponent(orgId)}/schedules/${encodeURIComponent(scheduleId)}`,
    { method: "DELETE" },
  )
}

// ---------- Sessions (v1) — execute a playbook ----------

export async function createSession(input: {
  prompt: string
  playbook_id?: string | null
  knowledge_ids?: string[] | null
  title?: string | null
  tags?: string[] | null
}): Promise<CreatedSession> {
  return devinFetch<CreatedSession>("/v1/sessions", {
    method: "POST",
    body: input,
  })
}

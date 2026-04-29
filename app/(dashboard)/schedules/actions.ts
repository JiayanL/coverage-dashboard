"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  createSchedule,
  deleteSchedule,
  DevinApiError,
  DevinConfigError,
  updateSchedule,
} from "@/lib/devin/client"

export type ActionResult<T = unknown> =
  | { status: "success"; data?: T }
  | { status: "error"; message: string }

const baseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  prompt: z.string().trim().min(1, "Prompt is required"),
  schedule_type: z.enum(["recurring", "one_time"]),
  frequency: z.string().trim().optional(),
  scheduled_at: z.string().trim().optional(),
  playbook_id: z.string().trim().optional(),
  notify_on: z.enum(["always", "failure", "never"]).default("failure"),
  agent: z.enum(["devin", "data_analyst", "advanced"]).default("devin"),
  tags: z.string().trim().optional(),
})

const createSchema = baseSchema.superRefine((value, ctx) => {
  if (value.schedule_type === "recurring") {
    if (!value.frequency) {
      ctx.addIssue({
        code: "custom",
        path: ["frequency"],
        message: "Cron expression required for recurring schedules",
      })
    }
  } else {
    if (!value.scheduled_at) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduled_at"],
        message: "Datetime required for one-time schedules",
      })
    }
  }
})

function toErrorMessage(err: unknown): string {
  if (err instanceof DevinConfigError) return err.message
  if (err instanceof DevinApiError) {
    if (err.status === 401 || err.status === 403) {
      return "Devin API rejected the request (auth). Check that DEVIN_API_KEY has ManageOrgSchedules permission and DEVIN_ORG_ID is correct."
    }
    if (err.status === 422) {
      return `Validation error: ${err.body}`
    }
    return `Devin API ${err.status}: ${err.body.slice(0, 240)}`
  }
  return err instanceof Error ? err.message : "Unknown error"
}

function buildPayload(values: z.infer<typeof baseSchema>) {
  const tags = values.tags
    ? values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined
  return {
    name: values.name,
    prompt: values.prompt,
    schedule_type: values.schedule_type,
    frequency:
      values.schedule_type === "recurring" ? (values.frequency ?? null) : null,
    scheduled_at:
      values.schedule_type === "one_time" ? (values.scheduled_at ?? null) : null,
    playbook_id: values.playbook_id ? values.playbook_id : null,
    notify_on: values.notify_on,
    agent: values.agent,
    tags: tags && tags.length > 0 ? tags : null,
  }
}

export async function createScheduleAction(
  input: unknown,
): Promise<ActionResult<{ scheduled_session_id: string }>> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    const schedule = await createSchedule(buildPayload(parsed.data))
    revalidatePath("/schedules")
    revalidatePath(`/schedules/${schedule.scheduled_session_id}`)
    return {
      status: "success",
      data: { scheduled_session_id: schedule.scheduled_session_id },
    }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function updateScheduleAction(
  scheduleId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    await updateSchedule(scheduleId, buildPayload(parsed.data))
    revalidatePath("/schedules")
    revalidatePath(`/schedules/${scheduleId}`)
    return { status: "success" }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function toggleScheduleAction(
  scheduleId: string,
  enabled: boolean,
): Promise<ActionResult> {
  try {
    await updateSchedule(scheduleId, { enabled })
    revalidatePath("/schedules")
    revalidatePath(`/schedules/${scheduleId}`)
    return { status: "success" }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function deleteScheduleAction(
  scheduleId: string,
): Promise<ActionResult> {
  try {
    await deleteSchedule(scheduleId)
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
  revalidatePath("/schedules")
  redirect("/schedules")
}

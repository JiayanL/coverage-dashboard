"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  createKnowledge,
  deleteKnowledge,
  DevinApiError,
  DevinConfigError,
  updateKnowledge,
} from "@/lib/devin/client"

export type ActionResult<T = unknown> =
  | { status: "success"; data?: T }
  | { status: "error"; message: string }

const knowledgeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  body: z.string().trim().min(1, "Body is required"),
  trigger_description: z
    .string()
    .trim()
    .min(1, "Trigger description is required"),
  pinned_repo: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null)),
  parent_folder_id: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  macro: z
    .string()
    .trim()
    .max(64, "Macro must be 64 characters or less")
    .optional()
    .transform((v) => (v ? v : null)),
})

function toErrorMessage(err: unknown): string {
  if (err instanceof DevinConfigError) return err.message
  if (err instanceof DevinApiError) {
    if (err.status === 401 || err.status === 403) {
      return "Devin API rejected the request (auth). The /v1/knowledge endpoint needs a personal apk_* token with knowledge scopes \u2014 cog_* service-user tokens don't carry v1 scopes. Set DEVIN_API_KEY_V1 to an apk_* token (DEVIN_API_KEY_V3 / DEVIN_API_KEY can stay as your cog_* token for v3 schedules)."
    }
    if (err.status === 422) {
      return `Validation error: ${err.body}`
    }
    return `Devin API ${err.status}: ${err.body.slice(0, 240)}`
  }
  return err instanceof Error ? err.message : "Unknown error"
}

export async function createKnowledgeAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = knowledgeSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    const note = await createKnowledge(parsed.data)
    revalidatePath("/knowledge")
    revalidatePath(`/knowledge/${note.id}`)
    return { status: "success", data: { id: note.id } }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function updateKnowledgeAction(
  knowledgeId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = knowledgeSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    await updateKnowledge(knowledgeId, parsed.data)
    revalidatePath("/knowledge")
    revalidatePath(`/knowledge/${knowledgeId}`)
    return { status: "success" }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function deleteKnowledgeAction(
  knowledgeId: string,
): Promise<ActionResult> {
  try {
    await deleteKnowledge(knowledgeId)
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
  revalidatePath("/knowledge")
  redirect("/knowledge")
}

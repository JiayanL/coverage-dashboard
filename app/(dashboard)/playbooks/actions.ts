"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  createPlaybook,
  createSession,
  deletePlaybook,
  DevinApiError,
  DevinConfigError,
  updatePlaybook,
} from "@/lib/devin/client"

export type ActionResult<T = unknown> =
  | { status: "success"; data?: T }
  | { status: "error"; message: string }

const playbookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().min(1, "Body is required"),
  macro: z
    .string()
    .trim()
    .max(64, "Macro must be 64 characters or less")
    .optional()
    .transform((v) => (v ? v : null)),
})

export type PlaybookFormInput = z.infer<typeof playbookSchema>

function toErrorMessage(err: unknown): string {
  if (err instanceof DevinConfigError) return err.message
  if (err instanceof DevinApiError) {
    if (err.status === 401 || err.status === 403) {
      return "Devin API rejected the request (auth). Check that DEVIN_API_KEY has playbook permissions."
    }
    if (err.status === 422) {
      return `Validation error: ${err.body}`
    }
    return `Devin API ${err.status}: ${err.body.slice(0, 240)}`
  }
  return err instanceof Error ? err.message : "Unknown error"
}

export async function createPlaybookAction(
  input: unknown,
): Promise<ActionResult<{ playbook_id: string }>> {
  const parsed = playbookSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    const playbook = await createPlaybook(parsed.data)
    revalidatePath("/playbooks")
    revalidatePath(`/playbooks/${playbook.playbook_id}`)
    return { status: "success", data: { playbook_id: playbook.playbook_id } }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function updatePlaybookAction(
  playbookId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = playbookSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    await updatePlaybook(playbookId, parsed.data)
    revalidatePath("/playbooks")
    revalidatePath(`/playbooks/${playbookId}`)
    return { status: "success" }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

export async function deletePlaybookAction(
  playbookId: string,
): Promise<ActionResult> {
  try {
    await deletePlaybook(playbookId)
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
  revalidatePath("/playbooks")
  redirect("/playbooks")
}

const executeSchema = z.object({
  playbook_id: z.string().min(1),
  prompt: z.string().trim().min(1, "Prompt is required"),
  title: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null)),
})

export async function executePlaybookAction(
  input: unknown,
): Promise<ActionResult<{ session_id: string; url: string }>> {
  const parsed = executeSchema.safeParse(input)
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    const session = await createSession({
      prompt: parsed.data.prompt,
      playbook_id: parsed.data.playbook_id,
      title: parsed.data.title ?? undefined,
    })
    return {
      status: "success",
      data: { session_id: session.session_id, url: session.url },
    }
  } catch (err) {
    return { status: "error", message: toErrorMessage(err) }
  }
}

"use server"

import { settingsSchema, type SettingsInput } from "@/app/(dashboard)/settings/schema"

export type SettingsActionResult =
  | { status: "success" }
  | { status: "error"; message: string }

export async function updateSettings(
  input: SettingsInput,
): Promise<SettingsActionResult> {
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 400))
  return { status: "success" }
}

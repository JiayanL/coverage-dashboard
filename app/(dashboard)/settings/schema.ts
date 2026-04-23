import { z } from "zod"

export const settingsSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(64, "Workspace name must be 64 characters or less"),
  notificationEmail: z.string().email("Enter a valid email address"),
  coverageThreshold: z
    .number({ message: "Enter a number between 0 and 100" })
    .min(0, "Threshold must be at least 0")
    .max(100, "Threshold must be at most 100"),
})

export type SettingsInput = z.infer<typeof settingsSchema>

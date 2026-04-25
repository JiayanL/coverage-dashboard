import { z } from "zod"

const serviceCoverage = z.object({
  lang: z.string().min(1),
  covered: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  pct: z.number().min(0).max(1),
  mutation: z
    .object({
      killed: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
      score: z.number().min(0).max(1),
    })
    .optional(),
})

const overall = z.object({
  covered: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  pct: z.number().min(0).max(1),
  mutation: z
    .object({
      killed: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
      score: z.number().min(0).max(1),
    })
    .optional(),
})

const fileCoverage = z.object({
  service: z.string().min(1),
  path: z.string().min(1),
  lang: z.string().min(1),
  covered: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  pct: z.number().min(0).max(1),
})

const testSummaryService = z.object({
  lang: z.string().min(1).optional(),
  run: z.number().int().nonnegative(),
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
})

export const ingestPayload = z.object({
  // e.g. "JiayanL/consumer-banking-platform"
  repo: z
    .string()
    .min(3)
    .regex(/^[\w.-]+\/[\w.-]+$/, "repo must be 'owner/name'"),
  // Optional friendlier name shown in the UI; defaults to the repo "name" segment.
  display_name: z.string().min(1).optional(),
  // Whether the repo is a monorepo (services array non-empty implies monorepo).
  kind: z.enum(["single", "monorepo"]).optional(),
  sha: z.string().min(7),
  ref: z.string().min(1),
  run_id: z.string().min(1).optional(),
  // Unix seconds OR ISO8601 string. Accept both.
  timestamp: z.union([z.number(), z.string()]).optional(),
  services: z.record(z.string(), serviceCoverage),
  overall,
  files: z.array(fileCoverage).optional(),
  test_summary: z
    .object({
      services: z.record(z.string(), testSummaryService),
    })
    .optional(),
})

export type IngestPayload = z.infer<typeof ingestPayload>

export function parseTimestamp(
  value: string | number | undefined,
): Date {
  if (value === undefined) return new Date()
  if (typeof value === "number") {
    // Treat values that look like seconds as seconds, otherwise milliseconds.
    return new Date(value < 1e12 ? value * 1000 : value)
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return new Date()
  return d
}

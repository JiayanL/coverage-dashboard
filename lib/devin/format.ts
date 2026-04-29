import { formatRelativeTime } from "@/lib/format"

export function formatRelativeFromString(
  value: string | null | undefined,
): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return formatRelativeTime(d)
}

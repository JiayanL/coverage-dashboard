import { AlertTriangleIcon } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"

export function ApiErrorState({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <EmptyState
      icon={AlertTriangleIcon}
      title={title}
      description={message}
    />
  )
}

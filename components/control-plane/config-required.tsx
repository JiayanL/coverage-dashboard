import { KeyRoundIcon } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"

type ConfigRequiredProps = {
  missing: string[]
  resource: string
}

export function ConfigRequired({ missing, resource }: ConfigRequiredProps) {
  return (
    <EmptyState
      icon={KeyRoundIcon}
      title={`Set ${missing.join(" and ")} to manage ${resource}`}
      description={`The control plane talks directly to api.devin.ai. Set ${missing.join(", ")} in your environment (e.g. .env.local) and reload the page.`}
    />
  )
}

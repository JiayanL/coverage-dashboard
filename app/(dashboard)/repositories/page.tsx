import { FolderGit2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"

export const metadata = {
  title: "Repositories",
  description: "Connect and manage tracked repositories.",
}

export default function RepositoriesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Repositories"
        description="Connect GitHub, GitLab, or Bitbucket to start tracking coverage."
        actions={<Button>Connect repository</Button>}
      />
      <EmptyState
        icon={FolderGit2Icon}
        title="No repositories connected"
        description="Install the app on your git provider to start ingesting coverage reports."
        action={<Button variant="outline">View setup guide</Button>}
      />
    </div>
  )
}

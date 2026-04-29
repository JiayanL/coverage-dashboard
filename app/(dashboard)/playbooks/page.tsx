import Link from "next/link"
import { PlayIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApiErrorState } from "@/components/control-plane/api-error"
import { ConfigRequired } from "@/components/control-plane/config-required"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  DevinApiError,
  DevinConfigError,
  isDevinConfigured,
  listPlaybooks,
} from "@/lib/devin/client"
import { formatRelativeFromString } from "@/lib/devin/format"

export const metadata = {
  title: "Playbooks",
  description: "Manage reusable Devin playbooks.",
}

export const dynamic = "force-dynamic"

export default async function PlaybooksPage() {
  const config = isDevinConfigured()
  if (!config.base) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Playbooks"
          description="Reusable Devin prompts the team can attach to sessions."
        />
        <ConfigRequired missing={["DEVIN_API_KEY"]} resource="playbooks" />
      </div>
    )
  }

  let playbooks: Awaited<ReturnType<typeof listPlaybooks>>
  try {
    playbooks = await listPlaybooks()
  } catch (err) {
    if (err instanceof DevinConfigError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Playbooks" />
          <ApiErrorState title="Devin API not configured" message={err.message} />
        </div>
      )
    }
    if (err instanceof DevinApiError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Playbooks" />
          <ApiErrorState
            title={`Devin API error ${err.status}`}
            message={err.body.slice(0, 320) || "No body returned."}
          />
        </div>
      )
    }
    throw err
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Playbooks"
        description="Reusable Devin prompts the team can attach to sessions."
        actions={
          <Button render={<Link href="/playbooks/new" />}>
            <PlusIcon className="size-4" aria-hidden="true" />
            New playbook
          </Button>
        }
      />

      {playbooks.length === 0 ? (
        <EmptyState
          icon={PlayIcon}
          title="No playbooks yet"
          description="Create a playbook to capture a reusable prompt that any teammate can attach when starting a Devin session."
          action={
            <Button render={<Link href="/playbooks/new" />}>
              <PlusIcon className="size-4" aria-hidden="true" />
              Create playbook
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Team playbooks ({playbooks.length})</CardTitle>
            <CardDescription>
              Click a playbook to edit, execute, or delete it.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-y border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Title</th>
                    <th className="px-4 py-2.5 text-left font-medium">Macro</th>
                    <th className="px-4 py-2.5 text-left font-medium">Updated by</th>
                    <th className="px-4 py-2.5 text-right font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {playbooks.map((playbook) => (
                    <tr key={playbook.playbook_id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/playbooks/${encodeURIComponent(playbook.playbook_id)}`}
                          className="flex flex-col gap-0.5 hover:underline"
                        >
                          <span className="font-medium text-foreground">
                            {playbook.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {playbook.playbook_id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {playbook.macro ? (
                          <Badge variant="secondary" className="font-mono">
                            /{playbook.macro}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {playbook.updated_by_user_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatRelativeFromString(playbook.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import Link from "next/link"
import { BookOpenTextIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiErrorState } from "@/components/control-plane/api-error"
import { ConfigRequired } from "@/components/control-plane/config-required"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  DevinApiError,
  DevinConfigError,
  isDevinConfigured,
  listKnowledge,
} from "@/lib/devin/client"
import { formatRelativeFromString } from "@/lib/devin/format"

export const metadata = {
  title: "Knowledge",
  description: "Manage Devin knowledge notes.",
}

export const dynamic = "force-dynamic"

export default async function KnowledgePage() {
  const config = isDevinConfigured()
  if (!config.base) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Knowledge"
          description="Trigger-based notes that Devin retrieves automatically."
        />
        <ConfigRequired missing={["DEVIN_API_KEY"]} resource="knowledge" />
      </div>
    )
  }

  let data: Awaited<ReturnType<typeof listKnowledge>>
  try {
    data = await listKnowledge()
  } catch (err) {
    if (err instanceof DevinConfigError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Knowledge" />
          <ApiErrorState title="Devin API not configured" message={err.message} />
        </div>
      )
    }
    if (err instanceof DevinApiError) {
      const isAuthError = err.status === 401 || err.status === 403
      const message = isAuthError
        ? "The /v1/knowledge endpoint needs a personal apk_* token with knowledge scopes — cog_* service-user tokens don't carry v1 scopes. Set DEVIN_API_KEY_V1 to an apk_* token (DEVIN_API_KEY_V3 / DEVIN_API_KEY can stay as your cog_* token for v3 schedules) and reload."
        : err.body.slice(0, 320) || "No body returned."
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Knowledge" />
          <ApiErrorState
            title={`Devin API error ${err.status}`}
            message={message}
          />
        </div>
      )
    }
    throw err
  }

  const notes = data.knowledge ?? []
  const folders = data.folders ?? []
  const folderById = new Map(folders.map((f) => [f.id, f]))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Knowledge"
        description="Trigger-based notes that Devin retrieves automatically when relevant."
        actions={
          <Button render={<Link href="/knowledge/new" />}>
            <PlusIcon className="size-4" aria-hidden="true" />
            New note
          </Button>
        }
      />

      {notes.length === 0 ? (
        <EmptyState
          icon={BookOpenTextIcon}
          title="No knowledge notes yet"
          description="Capture project-specific context once and let Devin pull it in automatically based on the trigger description."
          action={
            <Button render={<Link href="/knowledge/new" />}>
              <PlusIcon className="size-4" aria-hidden="true" />
              Create note
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Notes ({notes.length})</CardTitle>
            <CardDescription>
              Click a note to view, edit, or delete it.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-y border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Trigger
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Pinned repo
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Folder
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notes.map((note) => (
                    <tr key={note.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/knowledge/${encodeURIComponent(note.id)}`}
                          className="flex flex-col gap-0.5 hover:underline"
                        >
                          <span className="font-medium text-foreground">
                            {note.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {note.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="line-clamp-2">
                          {note.trigger_description}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {note.pinned_repo ? (
                          <Badge variant="secondary" className="font-mono">
                            {note.pinned_repo}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {note.parent_folder_id
                          ? (folderById.get(note.parent_folder_id)?.name ??
                            note.parent_folder_id)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatRelativeFromString(note.created_at)}
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

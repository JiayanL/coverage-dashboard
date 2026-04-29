import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

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
import { PageHeader } from "@/components/dashboard/page-header"
import { KnowledgeForm } from "@/app/(dashboard)/knowledge/knowledge-form"
import { KnowledgeActions } from "@/app/(dashboard)/knowledge/[id]/knowledge-actions"
import {
  DevinApiError,
  DevinConfigError,
  isDevinConfigured,
  listKnowledge,
} from "@/lib/devin/client"
import { formatRelativeFromString } from "@/lib/devin/format"

export const dynamic = "force-dynamic"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `Knowledge · ${id.slice(0, 8)}` }
}

export default async function KnowledgeDetailPage({ params }: PageProps) {
  const { id } = await params
  const knowledgeId = decodeURIComponent(id)
  const config = isDevinConfigured()
  if (!config.base) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Knowledge" />
        <ConfigRequired missing={["DEVIN_API_KEY"]} resource="knowledge" />
      </div>
    )
  }

  // The v1 list endpoint is the canonical read; there's no per-id GET.
  let data
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
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Knowledge" />
          <ApiErrorState
            title={`Devin API error ${err.status}`}
            message={err.body.slice(0, 320) || "No body returned."}
          />
        </div>
      )
    }
    throw err
  }

  const note = data.knowledge.find((n) => n.id === knowledgeId)
  if (!note) notFound()

  const folder = note.parent_folder_id
    ? data.folders.find((f) => f.id === note.parent_folder_id)
    : null

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={note.name}
        description={`Knowledge note ${note.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/knowledge" />}>
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              Back
            </Button>
            <KnowledgeActions knowledgeId={note.id} />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Pinned repo
              </dt>
              <dd>
                {note.pinned_repo ? (
                  <Badge variant="secondary" className="font-mono">
                    {note.pinned_repo}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Folder
              </dt>
              <dd className="text-foreground">
                {folder ? folder.name : note.parent_folder_id ?? "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Created
              </dt>
              <dd className="text-foreground">
                {formatRelativeFromString(note.created_at)}
                {note.created_by?.full_name
                  ? ` · by ${note.created_by.full_name}`
                  : ""}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Trigger description
              </dt>
              <dd className="text-foreground">{note.trigger_description}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
          <CardDescription>
            Update the note inline. Saved immediately via the Devin API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeForm
            mode="edit"
            knowledgeId={note.id}
            defaultValues={{
              name: note.name,
              body: note.body,
              trigger_description: note.trigger_description,
              pinned_repo: note.pinned_repo ?? "",
              parent_folder_id: note.parent_folder_id ?? "",
              macro: note.macro ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

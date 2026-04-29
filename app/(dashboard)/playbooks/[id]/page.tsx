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
import { PlaybookActions } from "@/app/(dashboard)/playbooks/[id]/playbook-actions"
import { PlaybookExecuteForm } from "@/app/(dashboard)/playbooks/[id]/execute-form"
import { PlaybookForm } from "@/app/(dashboard)/playbooks/playbook-form"
import {
  DevinApiError,
  DevinConfigError,
  getPlaybook,
  isDevinConfigured,
} from "@/lib/devin/client"
import { formatRelativeFromString } from "@/lib/devin/format"

export const dynamic = "force-dynamic"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `Playbook · ${id.slice(0, 8)}` }
}

export default async function PlaybookDetailPage({ params }: PageProps) {
  const { id } = await params
  const playbookId = decodeURIComponent(id)
  const config = isDevinConfigured()
  if (!config.base) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Playbook" />
        <ConfigRequired missing={["DEVIN_API_KEY_V1"]} resource="playbooks" />
      </div>
    )
  }

  let playbook
  try {
    playbook = await getPlaybook(playbookId)
  } catch (err) {
    if (err instanceof DevinApiError && err.status === 404) {
      notFound()
    }
    if (err instanceof DevinConfigError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Playbook" />
          <ApiErrorState title="Devin API not configured" message={err.message} />
        </div>
      )
    }
    if (err instanceof DevinApiError) {
      return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Playbook" />
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
        title={playbook.title}
        description={`Playbook ${playbook.playbook_id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/playbooks" />}>
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              Back
            </Button>
            <PlaybookActions playbookId={playbook.playbook_id} />
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
                Macro
              </dt>
              <dd>
                {playbook.macro ? (
                  <Badge variant="secondary" className="font-mono">
                    /{playbook.macro}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </dt>
              <dd className="text-foreground">{playbook.status}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Created
              </dt>
              <dd className="text-foreground">
                {formatRelativeFromString(playbook.created_at)}
                {playbook.created_by_user_name
                  ? ` · by ${playbook.created_by_user_name}`
                  : ""}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Updated
              </dt>
              <dd className="text-foreground">
                {formatRelativeFromString(playbook.updated_at)}
                {playbook.updated_by_user_name
                  ? ` · by ${playbook.updated_by_user_name}`
                  : ""}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execute</CardTitle>
          <CardDescription>
            Start a Devin session with this playbook attached. The session URL
            will open in a new tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaybookExecuteForm
            playbookId={playbook.playbook_id}
            playbookTitle={playbook.title}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
          <CardDescription>
            Update the title, body, or macro. Saved immediately via the Devin
            API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaybookForm
            mode="edit"
            playbookId={playbook.playbook_id}
            defaultValues={{
              title: playbook.title,
              body: playbook.body,
              macro: playbook.macro ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

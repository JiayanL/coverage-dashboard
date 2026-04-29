"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ExternalLinkIcon, PlayIcon } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { executePlaybookAction } from "@/app/(dashboard)/playbooks/actions"

const formSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  title: z.string().trim().max(200),
})

type FormValues = z.infer<typeof formSchema>

export function PlaybookExecuteForm({
  playbookId,
  playbookTitle,
}: {
  playbookId: string
  playbookTitle: string
}) {
  const [isPending, startTransition] = React.useTransition()
  const [lastSession, setLastSession] = React.useState<{
    sessionId: string
    url: string
  } | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      title: `Run: ${playbookTitle}`,
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await executePlaybookAction({
        playbook_id: playbookId,
        prompt: values.prompt,
        title: values.title || undefined,
      })
      if (result.status === "error") {
        toast.error("Could not start session", { description: result.message })
        return
      }
      setLastSession({
        sessionId: result.data!.session_id,
        url: result.data!.url,
      })
      const opened = window.open(
        result.data!.url,
        "_blank",
        "noopener,noreferrer",
      )
      if (opened) {
        toast.success("Session started", {
          description: `Devin session ${result.data!.session_id} opened in a new tab.`,
        })
      } else {
        toast.info("Session started", {
          description:
            "Popup blocked — use the \"Open session\" button below to open it.",
        })
      }
      form.reset({ prompt: "", title: values.title })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="What should Devin do? The playbook body is appended automatically."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Required. Devin combines this with the playbook body when the
                session starts.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session title (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            <PlayIcon className="size-4" aria-hidden="true" />
            {isPending ? "Starting session..." : "Execute playbook"}
          </Button>
          {lastSession ? (
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                window.open(lastSession.url, "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLinkIcon className="size-4" aria-hidden="true" />
              Open session
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  )
}

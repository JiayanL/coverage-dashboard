"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import {
  createPlaybookAction,
  updatePlaybookAction,
} from "@/app/(dashboard)/playbooks/actions"

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  body: z.string().trim().min(1, "Body is required"),
  macro: z.string().trim().max(64, "Macro must be 64 characters or less"),
})

type FormValues = z.infer<typeof formSchema>

type PlaybookFormProps =
  | { mode: "create" }
  | { mode: "edit"; playbookId: string; defaultValues: FormValues }

export function PlaybookForm(props: PlaybookFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : { title: "", body: "", macro: "" },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const payload = {
        title: values.title,
        body: values.body,
        macro: values.macro || null,
      }
      if (props.mode === "create") {
        const result = await createPlaybookAction(payload)
        if (result.status === "error") {
          toast.error("Could not create playbook", {
            description: result.message,
          })
          return
        }
        toast.success("Playbook created")
        if (result.data?.playbook_id) {
          router.push(
            `/playbooks/${encodeURIComponent(result.data.playbook_id)}`,
          )
        }
      } else {
        const result = await updatePlaybookAction(props.playbookId, payload)
        if (result.status === "error") {
          toast.error("Could not update playbook", {
            description: result.message,
          })
          return
        }
        toast.success("Playbook updated")
        router.refresh()
        form.reset(values)
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Triage failing CI" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea
                  rows={14}
                  placeholder={`# Goal\nDescribe the playbook step-by-step.\n\n## Inputs\n- ...`}
                  className="font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Markdown is supported. Devin reads this verbatim when the
                playbook is attached.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="macro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Macro (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="triage-ci"
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Slash command shortcut (e.g. /triage-ci). Leave blank for
                manual-attach playbooks.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? props.mode === "create"
                ? "Creating..."
                : "Saving..."
              : props.mode === "create"
                ? "Create playbook"
                : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

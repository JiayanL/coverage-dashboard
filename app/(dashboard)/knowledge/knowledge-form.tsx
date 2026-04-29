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
  createKnowledgeAction,
  updateKnowledgeAction,
} from "@/app/(dashboard)/knowledge/actions"

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  body: z.string().trim().min(1, "Body is required"),
  trigger_description: z
    .string()
    .trim()
    .min(1, "Trigger description is required"),
  pinned_repo: z.string().trim(),
  parent_folder_id: z.string().trim(),
})

type FormValues = z.infer<typeof formSchema>

type KnowledgeFormProps =
  | { mode: "create" }
  | { mode: "edit"; knowledgeId: string; defaultValues: FormValues }

export function KnowledgeForm(props: KnowledgeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : {
            name: "",
            body: "",
            trigger_description: "",
            pinned_repo: "",
            parent_folder_id: "",
          },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const payload = {
        name: values.name,
        body: values.body,
        trigger_description: values.trigger_description,
        pinned_repo: values.pinned_repo || undefined,
        parent_folder_id: values.parent_folder_id || undefined,
      }
      if (props.mode === "create") {
        const result = await createKnowledgeAction(payload)
        if (result.status === "error") {
          toast.error("Could not create knowledge", {
            description: result.message,
          })
          return
        }
        toast.success("Knowledge created")
        if (result.data?.id) {
          router.push(`/knowledge/${encodeURIComponent(result.data.id)}`)
        }
      } else {
        const result = await updateKnowledgeAction(props.knowledgeId, payload)
        if (result.status === "error") {
          toast.error("Could not update knowledge", {
            description: result.message,
          })
          return
        }
        toast.success("Knowledge updated")
        router.refresh()
        form.reset(values)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="CBP rollup pipeline" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trigger_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="When this note should be retrieved (e.g. 'Working on CBP coverage rollup or aggregator')."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Devin uses this short description to decide when to surface
                this note in a session.
              </FormDescription>
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
                  rows={16}
                  className="font-mono text-sm"
                  placeholder="# Title\n\nMarkdown body shown verbatim to Devin when triggered."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="pinned_repo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pinned repo (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="JiayanL/coverage-dashboard"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Restrict the note to a single repo (full slug).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parent_folder_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent folder id (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="folder-..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? props.mode === "create"
                ? "Creating..."
                : "Saving..."
              : props.mode === "create"
                ? "Create knowledge"
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

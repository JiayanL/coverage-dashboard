"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { PlayIcon } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
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

export function PlaybookQuickExecuteDialog({
  playbookId,
  playbookTitle,
}: {
  playbookId: string
  playbookTitle: string
}) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

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
        toast.info("Session started — popup blocked", {
          description: result.data!.url,
        })
      }
      form.reset({ prompt: "", title: `Run: ${playbookTitle}` })
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Run ${playbookTitle}`}
          />
        }
      >
        <PlayIcon className="size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run: {playbookTitle}</DialogTitle>
          <DialogDescription>
            Start a Devin session with this playbook.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="What should Devin do? The playbook body is appended automatically."
                      {...field}
                    />
                  </FormControl>
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
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                <PlayIcon className="size-4" aria-hidden="true" />
                {isPending ? "Starting..." : "Execute"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

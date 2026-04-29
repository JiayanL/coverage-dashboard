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
  createScheduleAction,
  updateScheduleAction,
} from "@/app/(dashboard)/schedules/actions"
import type { Playbook } from "@/lib/devin/types"

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  prompt: z.string().trim().min(1, "Prompt is required"),
  schedule_type: z.enum(["recurring", "one_time"]),
  frequency: z.string().trim(),
  scheduled_at: z.string().trim(),
  playbook_id: z.string().trim(),
  notify_on: z.enum(["always", "failure", "never"]),
  agent: z.enum(["devin", "data_analyst", "advanced"]),
  tags: z.string().trim(),
})

type FormValues = z.infer<typeof formSchema>

type ScheduleFormProps =
  | { mode: "create"; playbooks: Playbook[] }
  | {
      mode: "edit"
      scheduleId: string
      playbooks: Playbook[]
      defaultValues: FormValues
    }

const baseSelectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"

export function ScheduleForm(props: ScheduleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : {
            name: "",
            prompt: "",
            schedule_type: "recurring",
            frequency: "0 9 * * 1-5",
            scheduled_at: "",
            playbook_id: "",
            notify_on: "failure",
            agent: "devin",
            tags: "",
          },
  })

  const scheduleType = form.watch("schedule_type")

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      if (props.mode === "create") {
        const result = await createScheduleAction(values)
        if (result.status === "error") {
          toast.error("Could not create schedule", {
            description: result.message,
          })
          return
        }
        toast.success("Schedule created")
        if (result.data?.scheduled_session_id) {
          router.push(
            `/schedules/${encodeURIComponent(result.data.scheduled_session_id)}`,
          )
        }
      } else {
        const result = await updateScheduleAction(props.scheduleId, values)
        if (result.status === "error") {
          toast.error("Could not update schedule", {
            description: result.message,
          })
          return
        }
        toast.success("Schedule updated")
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
                <Input placeholder="Daily coverage triage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="What should Devin do every time this schedule runs?"
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
            name="schedule_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className={baseSelectClass}
                  >
                    <option value="recurring">Recurring (cron)</option>
                    <option value="one_time">One-time</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {scheduleType === "recurring" ? (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron expression</FormLabel>
                  <FormControl>
                    <Input
                      className="font-mono"
                      placeholder="0 9 * * 1-5"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Standard 5-field cron (UTC). e.g. weekdays 9am UTC.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled at (ISO 8601, UTC)</FormLabel>
                  <FormControl>
                    <Input
                      className="font-mono"
                      placeholder="2026-05-01T09:00:00Z"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="playbook_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Playbook (optional)</FormLabel>
                <FormControl>
                  <select {...field} className={baseSelectClass}>
                    <option value="">— None —</option>
                    {props.playbooks.map((p) => (
                      <option key={p.playbook_id} value={p.playbook_id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent</FormLabel>
                <FormControl>
                  <select {...field} className={baseSelectClass}>
                    <option value="devin">Devin</option>
                    <option value="data_analyst">Data analyst</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="notify_on"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notify on</FormLabel>
                <FormControl>
                  <select {...field} className={baseSelectClass}>
                    <option value="failure">Failure</option>
                    <option value="always">Always</option>
                    <option value="never">Never</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="comma,separated,tags"
                    {...field}
                  />
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
                ? "Create schedule"
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

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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
import { updateSettings } from "@/app/(dashboard)/settings/actions"
import {
  settingsSchema,
  type SettingsInput,
} from "@/app/(dashboard)/settings/schema"

interface SettingsFormProps {
  defaultValues: SettingsInput
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  })

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const result = await updateSettings(values)
      if (result.status === "success") {
        toast.success("Settings updated")
        form.reset(values)
        return
      }
      toast.error("Could not update settings", {
        description: result.message,
      })
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
          name="workspaceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormDescription>
                Shown in the sidebar and on shared reports.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="alerts@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Coverage regressions and report digests are sent here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverageThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default coverage threshold (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber)
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Repositories without an explicit threshold fall back to this
                value.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending || !form.formState.isDirty}
            onClick={() => form.reset(defaultValues)}
          >
            Discard
          </Button>
        </div>
      </form>
    </Form>
  )
}

import type { LucideIcon } from "lucide-react"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TrendDirection = "up" | "down" | "neutral"
type TrendSentiment = "positive" | "negative" | "neutral"

interface StatCardProps {
  title: string
  value: string
  description?: string
  delta?: {
    value: string
    direction: TrendDirection
    /**
     * Controls the color treatment independently from the arrow direction.
     * Defaults to treating "up" as positive and "down" as negative.
     */
    sentiment?: TrendSentiment
  }
  icon?: LucideIcon
}

function defaultSentiment(direction: TrendDirection): TrendSentiment {
  if (direction === "up") return "positive"
  if (direction === "down") return "negative"
  return "neutral"
}

export function StatCard({ title, value, description, delta, icon: Icon }: StatCardProps) {
  const sentiment = delta ? (delta.sentiment ?? defaultSentiment(delta.direction)) : "neutral"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        <div className="flex items-center gap-2 text-xs">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                sentiment === "positive" &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                sentiment === "negative" &&
                  "bg-destructive/10 text-destructive",
                sentiment === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {delta.direction === "up" ? (
                <ArrowUpRightIcon className="size-3" aria-hidden="true" />
              ) : delta.direction === "down" ? (
                <ArrowDownRightIcon className="size-3" aria-hidden="true" />
              ) : null}
              {delta.value}
            </span>
          ) : null}
          {description ? (
            <CardDescription className="text-xs">{description}</CardDescription>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

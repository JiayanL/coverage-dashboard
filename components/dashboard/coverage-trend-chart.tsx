"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Point = { date: string; pct: number }

export function CoverageTrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        No coverage data ingested yet.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data.map((d) => ({ ...d, pct: Number((d.pct * 100).toFixed(2)) }))}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="cov" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
            minTickGap={24}
            tickFormatter={(d: string) => d.slice(5)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "var(--popover, white)",
              color: "var(--popover-foreground, black)",
              fontSize: 12,
            }}
            formatter={(value) => [
              `${typeof value === "number" ? value.toFixed(1) : value}%`,
              "Coverage",
            ]}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="currentColor"
            strokeWidth={2}
            fill="url(#cov)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

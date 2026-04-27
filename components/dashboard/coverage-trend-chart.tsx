"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Point = { date: string; pct: number; mutationScore: number | null }

// Coverage + mutation on one chart. The user-facing demo brief calls out
// "two numbers moving together" — coverage as the filled area, mutation
// as a dashed line on the same percentage axis.
export function CoverageTrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        No coverage data ingested yet.
      </div>
    )
  }

  const series = data.map((d) => ({
    date: d.date,
    coverage: Number((d.pct * 100).toFixed(2)),
    mutation:
      d.mutationScore === null
        ? null
        : Number((d.mutationScore * 100).toFixed(2)),
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={series}
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
            formatter={(value, name) => [
              typeof value === "number" ? `${value.toFixed(1)}%` : value,
              name === "coverage" ? "Coverage" : "Mutation",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            iconType="plainline"
          />
          <Area
            type="monotone"
            dataKey="coverage"
            name="Coverage"
            stroke="currentColor"
            strokeWidth={2}
            fill="url(#cov)"
          />
          <Line
            type="monotone"
            dataKey="mutation"
            name="Mutation"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            opacity={0.65}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

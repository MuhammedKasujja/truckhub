import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { formatCompact } from "../format"
import type { ChartConfig } from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { WidgetEmpty } from "@/features/dashboard/components/widget-empty"
import { formatDate } from "@/lib/format"

export type TrendSeries<T> = {
  key: Extract<keyof T, string>
  label: string
  color: string
  /** Area charts only: dashed line with no fill, for a secondary/target series */
  dashed?: boolean
}

type ReportTrendChartProps<T extends { date: string }> = {
  title: string
  description?: React.ReactNode
  data: T[]
  series: TrendSeries<T>[]
  kind?: "area" | "bar"
  /** Bar charts only: stack the series instead of grouping them */
  stacked?: boolean
  formatValue?: (value: number) => string
  emptyText?: string
}

export function ReportTrendChart<T extends { date: string }>({
  title,
  description,
  data,
  series,
  kind = "area",
  stacked,
  formatValue = (v) => String(v),
  emptyText = "No activity in this period",
}: ReportTrendChartProps<T>) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  ) satisfies ChartConfig

  const hasValues = data.some((point) =>
    series.some((s) => Number(point[s.key]) !== 0)
  )

  const axes = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="date"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={24}
        tickFormatter={(v) =>
          formatDate(v, {
            dateStyle: undefined,
            day: "numeric",
            month: "short",
          })
        }
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={48}
        tickFormatter={(v) => formatCompact(Number(v))}
      />
      <ChartTooltip
        cursor={kind === "bar"}
        content={
          <ChartTooltipContent
            indicator="line"
            labelFormatter={(v) => formatDate(v)}
            formatter={(value, name) => (
              <div className="flex w-full justify-between gap-4">
                <span className="text-muted-foreground">
                  {series.find((s) => s.key === name)?.label ?? name}
                </span>
                <span className="font-mono font-medium tabular-nums">
                  {formatValue(Number(value))}
                </span>
              </div>
            )}
          />
        }
      />
      <ChartLegend content={<ChartLegendContent />} />
    </>
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {hasValues ? (
          <ChartContainer config={config} className="aspect-auto h-64 w-full">
            {kind === "bar" ? (
              <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
                {axes}
                {series.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    fill={`var(--color-${s.key})`}
                    stackId={stacked ? "stack" : undefined}
                    radius={
                      !stacked || i === series.length - 1 ? [3, 3, 0, 0] : 0
                    }
                    maxBarSize={28}
                  />
                ))}
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  {series.map((s) => (
                    <linearGradient
                      key={s.key}
                      id={`report-fill-${s.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`var(--color-${s.key})`}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={`var(--color-${s.key})`}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  ))}
                </defs>
                {axes}
                {series.map((s) => (
                  <Area
                    key={s.key}
                    dataKey={s.key}
                    type="monotone"
                    stroke={`var(--color-${s.key})`}
                    strokeWidth={s.dashed ? 1.5 : 2}
                    strokeDasharray={s.dashed ? "4 4" : undefined}
                    fill={s.dashed ? "none" : `url(#report-fill-${s.key})`}
                  />
                ))}
              </AreaChart>
            )}
          </ChartContainer>
        ) : (
          <WidgetEmpty className="h-64">{emptyText}</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}

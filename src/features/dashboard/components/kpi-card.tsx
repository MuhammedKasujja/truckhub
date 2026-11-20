import { Link } from "@tanstack/react-router"
import { Line, LineChart } from "recharts"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import type { LinkProps } from "@tanstack/react-router"
import type { DashboardKpi } from "../types"
import type { ChartConfig } from "@/components/ui/chart"
import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat"
import { ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
  kpi?: DashboardKpi
  /** e.g. "vs previous 30 days" */
  comparisonLabel?: string
  /** Shown instead of the trend when there's no previous value */
  description?: React.ReactNode
  /** When true, a decrease is good (e.g. outstanding balance) */
  invertTrend?: boolean
  to?: LinkProps["to"]
  search?: LinkProps["search"]
  className?: string
}

const sparklineConfig = {
  value: { label: "Value", color: "var(--primary)" },
} satisfies ChartConfig

function getChange(kpi?: DashboardKpi) {
  if (!kpi || kpi.previous === undefined || kpi.previous === null) return null
  if (kpi.previous === 0) return kpi.value === 0 ? 0 : null
  return ((kpi.value - kpi.previous) / Math.abs(kpi.previous)) * 100
}

export function KpiCard({
  label,
  value,
  icon,
  kpi,
  comparisonLabel,
  description,
  invertTrend = false,
  to,
  search,
  className,
}: KpiCardProps) {
  const change = getChange(kpi)
  const direction =
    change === null || Math.abs(change) < 0.5
      ? "neutral"
      : change > 0
        ? "up"
        : "down"
  const isGood = invertTrend ? direction === "down" : direction === "up"
  const trend = direction === "neutral" ? "neutral" : isGood ? "up" : "down"
  const TrendIcon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : Minus

  const series = kpi?.series?.map((v, i) => ({ i, value: v })) ?? []

  const content = (
    <Stat
      className={cn(
        "h-full gap-y-2 transition-colors",
        to && "hover:border-primary/40 hover:bg-accent/40",
        className
      )}
    >
      <StatLabel>{label}</StatLabel>
      <StatIndicator variant="icon" color="default">
        {icon}
      </StatIndicator>
      <StatValue className="tabular-nums">{value}</StatValue>
      <div className="col-span-2 flex items-end justify-between gap-2">
        {change !== null ? (
          <StatTrend trend={trend}>
            <TrendIcon />
            {Math.abs(change).toFixed(
              change !== 0 && Math.abs(change) < 10 ? 1 : 0
            )}
            %
            {comparisonLabel && (
              <span className="font-normal text-muted-foreground">
                {comparisonLabel}
              </span>
            )}
          </StatTrend>
        ) : (
          <StatDescription>{description ?? " "}</StatDescription>
        )}
        {series.length > 1 && (
          <ChartContainer
            config={sparklineConfig}
            className="aspect-auto h-8 w-20 shrink-0"
            aria-hidden
          >
            <LineChart data={series}>
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </Stat>
  )

  if (!to) return content

  return (
    <Link
      to={to}
      search={search}
      className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {content}
    </Link>
  )
}

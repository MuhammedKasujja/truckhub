import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Link } from "@tanstack/react-router"
import { WidgetEmpty } from "./widget-empty"
import type { DashboardRevenuePoint } from "../types"
import type { ChartConfig } from "@/components/ui/chart"
import {
  Card,
  CardAction,
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
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { formatDate, formatMoney } from "@/lib/format"

const chartConfig = {
  invoiced: { label: "Invoiced", color: "var(--chart-2)" },
  paid: { label: "Collected", color: "var(--primary)" },
} satisfies ChartConfig

const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function RevenueChart({
  data,
  periodLabel,
}: {
  data: DashboardRevenuePoint[]
  periodLabel: string
}) {
  const totalInvoiced = data.reduce((s, p) => s + Number(p.invoiced), 0)
  const totalPaid = data.reduce((s, p) => s + Number(p.paid), 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue vs collected</CardTitle>
        <CardDescription>
          {formatMoney(totalPaid)} collected of {formatMoney(totalInvoiced)}{" "}
          invoiced · {periodLabel}
        </CardDescription>
        <CardAction>
          <Can permission="reports:view">
            <Button variant="link" size="sm" asChild>
              <Link to="/reports/invoices">Report</Link>
            </Button>
          </Can>
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full"
          >
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fill-paid" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-paid)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-paid)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => compact.format(Number(v))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(v) => formatDate(v)}
                    formatter={(value, name) => (
                      <div className="flex w-full justify-between gap-4">
                        <span className="text-muted-foreground">
                          {name === "invoiced" || name === "paid"
                            ? chartConfig[name].label
                            : name}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatMoney(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey="invoiced"
                type="monotone"
                stroke="var(--color-invoiced)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fill="none"
              />
              <Area
                dataKey="paid"
                type="monotone"
                stroke="var(--color-paid)"
                strokeWidth={2}
                fill="url(#fill-paid)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <WidgetEmpty>No invoices or payments in this period</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}

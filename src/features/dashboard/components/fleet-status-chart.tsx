import { Label, Pie, PieChart } from "recharts"
import { Link } from "@tanstack/react-router"
import { WidgetEmpty } from "./widget-empty"
import type { VehicleStatus } from "@/features/vehicles/enums"
import type { DashboardStatistics } from "../types"
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

const chartConfig = {
  on_trip: { label: "On trip", color: "var(--primary)" },
  available: { label: "Available", color: "var(--success)" },
  reserved: { label: "Reserved", color: "var(--info)" },
  rented: { label: "Rented", color: "var(--chart-2)" },
  in_maintenance: { label: "In maintenance", color: "var(--warning)" },
} satisfies ChartConfig & Record<VehicleStatus, unknown>

const order = Object.keys(chartConfig) as VehicleStatus[]

export function FleetStatusChart({
  counts,
}: {
  counts: NonNullable<DashboardStatistics["vehicles_by_status"]>
}) {
  const data = order
    .map((status) => ({
      status,
      count: counts[status] ?? 0,
      fill: `var(--color-${status})`,
    }))
    .filter((d) => d.count > 0)
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet status</CardTitle>
        <CardDescription>{total} vehicles</CardDescription>
        <CardAction>
          <Button variant="link" size="sm" asChild>
            <Link to="/vehicles">View</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {total ? (
          <div className="flex items-center gap-4">
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-40 shrink-0"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="status" />}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={48}
                  outerRadius={70}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-semibold"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={Number(viewBox.cy) + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            Trucks
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
              {data.map((d) => (
                <li key={d.status}>
                  <Link
                    to="/vehicles"
                    search={{ status: d.status }}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: chartConfig[d.status].color }}
                    />
                    <span className="truncate text-muted-foreground">
                      {chartConfig[d.status].label}
                    </span>
                    <span className="ms-auto font-medium tabular-nums">
                      {d.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <WidgetEmpty>No vehicles registered</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}
